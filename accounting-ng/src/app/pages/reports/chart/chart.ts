import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts as AccountsService, AccountListItem } from '../../../services/accounts';
import { JournalEntries, JournalEntryDto } from '../../../services/journal-entries';
import { AuthService } from '../../../services/auth.service';

type ReportRow = {
  accountId: number;
  accountCode: string;
  name: string;
  type: number;
  totalDebit: number;
  totalCredit: number;
  net: number;
};

type TrendRow = {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
};

type Granularity = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
type ChartView = 'Both' | 'Income' | 'Expense';

@Component({
  selector: 'app-reports-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class ReportsChart implements OnInit {
  error = '';
  isLoading = false;

  title = 'Chart Report';
  generatedAt = '';

  startDate = this.firstDayOfMonth();
  endDate = this.today();

  granularity: Granularity = 'Monthly';
  chartView: ChartView = 'Both';

  accounts: AccountListItem[] = [];
  journalEntries: JournalEntryDto[] = [];

  accountSummaryRows: ReportRow[] = [];

  trendRows: TrendRow[] = [];
  private trendMax = 0;

  constructor(
    private accountsApi: AccountsService,
    private journal: JournalEntries,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goReports(): void {
    this.router.navigateByUrl('/reports');
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  setThisWeek(): void {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    this.startDate = this.toYmd(monday);
    this.endDate = this.toYmd(today);
    this.runReport();
  }

  setThisMonth(): void {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDate = this.toYmd(first);
    this.endDate = this.toYmd(today);
    this.runReport();
  }

  setThisYear(): void {
    const today = new Date();
    const first = new Date(today.getFullYear(), 0, 1);
    this.startDate = this.toYmd(first);
    this.endDate = this.toYmd(today);
    this.runReport();
  }

  onGranularityChanged(): void {
    this.runReport();
  }

  onChartViewChanged(): void {
    this.buildTrendBuckets();
    this.cdr.detectChanges();
  }

  runReport(): void {
    this.generatedAt = this.nowStamp();
    this.buildAccountSummary();
    this.buildTrendBuckets();
    this.cdr.detectChanges();
  }

  refresh(): void {
    this.error = '';
    this.isLoading = true;
    this.generatedAt = this.nowStamp();
    this.cdr.detectChanges();

    this.accountsApi.getAll().subscribe({
      next: (accounts) => {
        this.accounts = accounts ?? [];

        this.journal.getAll().subscribe({
          next: (entries) => {
            this.journalEntries = entries ?? [];
            this.buildAccountSummary();
            this.buildTrendBuckets();
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.isLoading = false;
            this.error = (typeof err?.error === 'string' ? err.error : (err?.message ||  'Failed to load journal entries'));
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to load accounts'));
        this.cdr.detectChanges();
      }
    });
  }

  typeLabel(type: number): string {
    if (type === 1) return 'Asset';
    if (type === 2) return 'Liability';
    if (type === 3) return 'Equity';
    if (type === 4) return 'Revenue';
    if (type === 5) return 'Expense';
    return String(type);
  }

  private buildAccountSummary(): void {
    const start = (this.startDate ?? '').trim();
    const end = (this.endDate ?? '').trim();

    const inRange = (occurredOn: string): boolean => {
      const dateOnly = (occurredOn ?? '').substring(0, 10);
      if (start && dateOnly < start) return false;
      if (end && dateOnly > end) return false;
      return true;
    };

    const map = new Map<number, ReportRow>();

    for (const a of this.accounts) {
      map.set(a.id, {
        accountId: a.id,
        accountCode: a.accountCode,
        name: a.name,
        type: Number(a.type),
        totalDebit: 0,
        totalCredit: 0,
        net: 0,
      });
    }

    for (const je of this.journalEntries) {
      if (!inRange(je.occurredOn)) continue;

      for (const line of (je.lines ?? [])) {
        const accountId = Number(line.accountId);
        const row = map.get(accountId);
        if (!row) continue;

        row.totalDebit += Number(line.debit) || 0;
        row.totalCredit += Number(line.credit) || 0;
      }
    }

    const arr = Array.from(map.values()).map(r => ({
      ...r,
      net: (Number(r.totalDebit) || 0) - (Number(r.totalCredit) || 0)
    }));

    arr.sort((a, b) => (a.accountCode ?? '').localeCompare(b.accountCode ?? ''));

    this.accountSummaryRows = arr;
  }

  private buildTrendBuckets(): void {
    const start = (this.startDate ?? '').trim();
    const end = (this.endDate ?? '').trim();

    const inRange = (occurredOn: string): boolean => {
      const dateOnly = (occurredOn ?? '').substring(0, 10);
      if (start && dateOnly < start) return false;
      if (end && dateOnly > end) return false;
      return true;
    };

    const revIds = new Set<number>((this.accounts ?? []).filter(a => Number(a.type) === 4).map(a => a.id));
    const expIds = new Set<number>((this.accounts ?? []).filter(a => Number(a.type) === 5).map(a => a.id));

    const buckets = new Map<string, TrendRow>();

    const add = (key: string, label: string, income: number, expense: number) => {
      const row = buckets.get(key) ?? { key, label, income: 0, expense: 0, net: 0 };
      row.income += income;
      row.expense += expense;
      row.net = row.income - row.expense;
      buckets.set(key, row);
    };

    for (const je of this.journalEntries) {
      if (!inRange(je.occurredOn)) continue;

      const dateOnly = (je.occurredOn ?? '').substring(0, 10);
      const { key, label } = this.bucketKey(dateOnly, this.granularity);

      const lines = je.lines ?? [];

      const income = lines
        .filter(l => revIds.has(Number(l.accountId)))
        .reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

      const expense = lines
        .filter(l => expIds.has(Number(l.accountId)))
        .reduce((sum, l) => sum + (Number(l.debit) || 0), 0);

      if (income === 0 && expense === 0) continue;

      add(key, label, income, expense);
    }

    const arr = Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));

    let max = 0;
    for (const r of arr) {
      if (this.chartView === 'Income') max = Math.max(max, r.income);
      else if (this.chartView === 'Expense') max = Math.max(max, r.expense);
      else max = Math.max(max, r.income, r.expense);
    }
    this.trendMax = max || 1;

    this.trendRows = arr;
  }

  private bucketKey(dateOnly: string, granularity: Granularity): { key: string; label: string } {
    const y = Number(dateOnly.substring(0, 4));
    const m = Number(dateOnly.substring(5, 7));
    const d = Number(dateOnly.substring(8, 10));

    if (granularity === 'Daily') {
      return { key: dateOnly, label: dateOnly.substring(5) };
    }

    if (granularity === 'Monthly') {
      const key = `${y}-${String(m).padStart(2, '0')}`;
      return { key, label: key };
    }

    if (granularity === 'Quarterly') {
      const q = Math.floor((m - 1) / 3) + 1;
      const key = `${y}-Q${q}`;
      return { key, label: key };
    }

    if (granularity === 'Yearly') {
      const key = String(y);
      return { key, label: key };
    }

    const dt = new Date(Date.UTC(y, m - 1, d));
    const day = dt.getUTCDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    dt.setUTCDate(dt.getUTCDate() + diffToMonday);

    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');

    const key = `${yyyy}-${mm}-${dd}`;
    const label = `${mm}-${dd}`;
    return { key, label };
  }

  chartHeight(value: number): number {
    const v = Number(value) || 0;
    const max = this.trendMax || 1;
    const maxPx = 140;
    return Math.round((v / max) * maxPx);
  }

  showIncome(): boolean {
    return this.chartView === 'Both' || this.chartView === 'Income';
  }

  showExpense(): boolean {
    return this.chartView === 'Both' || this.chartView === 'Expense';
  }

  totalIncome(): number {
    return (this.trendRows ?? []).reduce((sum, r) => sum + (Number(r.income) || 0), 0);
  }

  totalExpense(): number {
    return (this.trendRows ?? []).reduce((sum, r) => sum + (Number(r.expense) || 0), 0);
  }

  totalNet(): number {
    return this.totalIncome() - this.totalExpense();
  }

  private today(): string {
    return this.toYmd(new Date());
  }

  private firstDayOfMonth(): string {
    const d = new Date();
    return this.toYmd(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  private toYmd(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private nowStamp(): string {
    return new Date().toLocaleString();
  }
}

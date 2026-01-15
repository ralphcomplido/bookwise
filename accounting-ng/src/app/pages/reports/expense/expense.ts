import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts as AccountsService, AccountListItem } from '../../../services/accounts';
import { JournalEntries, JournalEntryDto } from '../../../services/journal-entries';
import { AuthService } from '../../../services/auth.service';

type ExpenseRow = {
  accountId: number;
  accountCode: string;
  name: string;
  total: number;
};

@Component({
  selector: 'app-expense-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense.html',
  styleUrl: './expense.scss',
})
export class ExpenseReport implements OnInit {
  error = '';
  isLoading = false;
  generatedAt = '';

  startDate = this.firstDayOfMonth(); // yyyy-MM-dd
  endDate = this.today();             // yyyy-MM-dd

  // Optional filters
  accountId: number | null = null; // expense account only dropdown
  refContains = '';
  descContains = '';

  accounts: AccountListItem[] = [];
  journalEntries: JournalEntryDto[] = [];

  expenseAccounts: AccountListItem[] = [];
  rows: ExpenseRow[] = [];

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

  runReport(): void {
    this.generatedAt = this.nowStamp();
    this.buildExpenseByAccount();
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
        this.expenseAccounts = this.accounts.filter(a => Number(a.type) === 5);

        this.journal.getAll().subscribe({
          next: (entries) => {
            this.journalEntries = entries ?? [];
            this.buildExpenseByAccount();
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.isLoading = false;
            this.error = JSON.stringify(err?.error) || err?.message || 'Failed to load journal entries';
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to load accounts';
        this.cdr.detectChanges();
      }
    });
  }

  private buildExpenseByAccount(): void {
    const start = (this.startDate ?? '').trim();
    const end = (this.endDate ?? '').trim();

    const ref = (this.refContains ?? '').trim().toLowerCase();
    const desc = (this.descContains ?? '').trim().toLowerCase();
    const selectedAccountId = this.accountId ? Number(this.accountId) : null;

    const inRange = (occurredOn: string): boolean => {
      const dateOnly = (occurredOn ?? '').substring(0, 10);
      if (start && dateOnly < start) return false;
      if (end && dateOnly > end) return false;
      return true;
    };

    const expenseIds = new Set<number>(this.expenseAccounts.map(a => a.id));

    const totals = new Map<number, number>();
    for (const a of this.expenseAccounts) totals.set(a.id, 0);

    for (const je of (this.journalEntries ?? [])) {
      if (!inRange(je.occurredOn)) continue;

      if (ref && !(je.referenceNo ?? '').toLowerCase().includes(ref)) continue;
      if (desc && !(je.description ?? '').toLowerCase().includes(desc)) continue;

      const lines = je.lines ?? [];
      for (const line of lines) {
        const acctId = Number(line.accountId);
        if (!expenseIds.has(acctId)) continue;
        if (selectedAccountId && acctId !== selectedAccountId) continue;

        const debit = Number(line.debit) || 0;
        if (debit > 0) totals.set(acctId, (totals.get(acctId) || 0) + debit);
      }
    }

    const rows: ExpenseRow[] = this.expenseAccounts
      .map(a => ({
        accountId: a.id,
        accountCode: a.accountCode,
        name: a.name,
        total: totals.get(a.id) || 0
      }))
      .filter(r => r.total !== 0)
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    this.rows = rows;
  }

  totalExpense(): number {
    return (this.rows ?? []).reduce((sum, r) => sum + (Number(r.total) || 0), 0);
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

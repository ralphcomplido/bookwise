import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts as AccountsService, AccountListItem } from '../../../services/accounts';
import { JournalEntries, JournalEntryDto } from '../../../services/journal-entries';
import { AuthService } from '../../../services/auth.service';

type EntryType = '' | 'Income' | 'Expense' | 'Transfer' | 'Journal' | 'Mixed';

@Component({
  selector: 'app-custom-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom.html',
  styleUrl: './custom.scss',
})
export class CustomReport implements OnInit {
  error = '';
  isLoading = false;
  generatedAt = '';

  startDate = this.firstDayOfMonth();
  endDate = this.today();

  // Filters
  accountId: number | null = null;
  type: EntryType = '';
  refContains = '';
  descContains = '';

  accounts: AccountListItem[] = [];
  journalEntries: JournalEntryDto[] = [];

  rows: JournalEntryDto[] = [];

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
            this.applyFilters();
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

  runReport(): void {
    this.generatedAt = this.nowStamp();
    this.applyFilters();
    this.cdr.detectChanges();
  }

  private applyFilters(): void {
    const start = (this.startDate ?? '').trim();
    const end = (this.endDate ?? '').trim();

    const ref = (this.refContains ?? '').trim().toLowerCase();
    const desc = (this.descContains ?? '').trim().toLowerCase();

    const selectedAccountId = this.accountId ? Number(this.accountId) : null;
    const selectedType = this.type;

    const inRange = (occurredOn: string): boolean => {
      const dateOnly = (occurredOn ?? '').substring(0, 10);
      if (start && dateOnly < start) return false;
      if (end && dateOnly > end) return false;
      return true;
    };

    this.rows = (this.journalEntries ?? [])
      .filter(e => inRange(e.occurredOn))
      .filter(e => {
        if (ref && !(e.referenceNo ?? '').toLowerCase().includes(ref)) return false;
        if (desc && !(e.description ?? '').toLowerCase().includes(desc)) return false;
        return true;
      })
      .filter(e => {
        if (!selectedAccountId) return true;
        return (e.lines ?? []).some(l => Number(l.accountId) === selectedAccountId);
      })
      .filter(e => {
        if (!selectedType) return true;
        return this.entryType(e) === selectedType;
      })
      .sort((a, b) => (b.occurredOn ?? '').localeCompare(a.occurredOn ?? ''));
  }

  occurredOnDateOnly(entry: JournalEntryDto): string {
    const s = entry?.occurredOn ?? '';
    if (s.length >= 10) return s.substring(0, 10);
    return s;
  }

  entryTotalDebit(entry: JournalEntryDto): number {
    return (entry?.lines ?? []).reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  }

  entryTotalCredit(entry: JournalEntryDto): number {
    return (entry?.lines ?? []).reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  }

  private accountTypeById(accountId: number): number | null {
    const a = (this.accounts ?? []).find(x => x.id === accountId);
    return a ? Number(a.type) : null;
  }

  entryType(entry: JournalEntryDto): 'Income' | 'Expense' | 'Transfer' | 'Journal' | 'Mixed' {
    const lines = entry?.lines ?? [];
    if (lines.length === 0 || (this.accounts ?? []).length === 0) return 'Journal';

    let hasRevenueCredit = false;
    let hasExpenseDebit = false;

    for (const l of lines) {
      const t = this.accountTypeById(Number(l.accountId));
      const debit = Number(l.debit) || 0;
      const credit = Number(l.credit) || 0;

      if (t === 4 && credit > 0) hasRevenueCredit = true;
      if (t === 5 && debit > 0) hasExpenseDebit = true;
    }

    if (hasRevenueCredit && !hasExpenseDebit) return 'Income';
    if (hasExpenseDebit && !hasRevenueCredit) return 'Expense';
    if (hasRevenueCredit && hasExpenseDebit) return 'Mixed';

    if (lines.length === 2) {
      const debitLine = lines.find(x => (Number(x.debit) || 0) > 0);
      const creditLine = lines.find(x => (Number(x.credit) || 0) > 0);

      if (debitLine && creditLine) {
        const debitType = this.accountTypeById(Number(debitLine.accountId));
        const creditType = this.accountTypeById(Number(creditLine.accountId));
        if (debitType === 1 && creditType === 1) return 'Transfer';
      }
    }

    return 'Journal';
  }

  totalRows(): number {
    return (this.rows ?? []).length;
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

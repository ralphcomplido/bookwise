import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JournalEntries, JournalEntryDto } from '../../services/journal-entries';
import { Accounts as AccountsService, AccountListItem } from '../../services/accounts';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  error = '';

  // Search filters
  searchText = '';
  startDate = ''; // yyyy-MM-dd
  endDate = '';   // yyyy-MM-dd

  journalEntries: JournalEntryDto[] = [];
  accounts: AccountListItem[] = [];

  private isLoadingEntries = false;
  private isLoadingAccounts = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private journal: JournalEntries,
    private accountsApi: AccountsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadJournalEntries();
  }

  get isLoading(): boolean {
    return this.isLoadingEntries || this.isLoadingAccounts;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  goExpense(): void {
    this.router.navigateByUrl('/enter-expense');
  }

  goIncome(): void {
    this.router.navigateByUrl('/enter-income');
  }

  goTransfer(): void {
    this.router.navigateByUrl('/transfer-funds');
  }

  goJournal(): void {
    this.router.navigateByUrl('/journal-entry');
  }

  refresh(): void {
    this.loadAccounts();
    this.loadJournalEntries();
  }

  private loadAccounts(): void {
    this.error = '';
    this.isLoadingAccounts = true;
    this.cdr.detectChanges();

    this.accountsApi.getAll().subscribe({
      next: (rows) => {
        this.accounts = rows ?? [];
        this.isLoadingAccounts = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingAccounts = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to load accounts';
        this.cdr.detectChanges();
      }
    });
  }

  private loadJournalEntries(): void {
    this.error = '';
    this.isLoadingEntries = true;
    this.cdr.detectChanges();

    this.journal.getAll().subscribe({
      next: (rows) => {
        this.journalEntries = rows ?? [];
        this.isLoadingEntries = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingEntries = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to load journal entries';
        this.cdr.detectChanges();
      }
    });
  }

  occurredOnDateOnly(entry: JournalEntryDto): string {
    const s = entry?.occurredOn ?? '';
    if (s.length >= 10) return s.substring(0, 10);
    return s;
  }

  totalDebit(entry: JournalEntryDto): number {
    const lines = entry?.lines ?? [];
    return lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  }

  totalCredit(entry: JournalEntryDto): number {
    const lines = entry?.lines ?? [];
    return lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  }

  // AccountType values:
  // Asset=1, Liability=2, Equity=3, Revenue=4, Expense=5
  private accountTypeById(accountId: number): number | null {
    const a = (this.accounts ?? []).find(x => x.id === accountId);
    return a ? Number(a.type) : null;
  }

  entryType(entry: JournalEntryDto): string {
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

  filteredEntries(): JournalEntryDto[] {
    const text = (this.searchText ?? '').trim().toLowerCase();
    const start = (this.startDate ?? '').trim();
    const end = (this.endDate ?? '').trim();

    return (this.journalEntries ?? []).filter(e => {
      const dateOnly = this.occurredOnDateOnly(e);

      if (start && dateOnly && dateOnly < start) return false;
      if (end && dateOnly && dateOnly > end) return false;

      if (!text) return true;

      const desc = (e.description ?? '').toLowerCase();
      const ref = (e.referenceNo ?? '').toLowerCase();
      const type = this.entryType(e).toLowerCase();

      return desc.includes(text) || ref.includes(text) || type.includes(text);
    });
  }
}

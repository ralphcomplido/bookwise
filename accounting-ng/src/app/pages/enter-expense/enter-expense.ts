import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts as AccountsService, AccountListItem } from '../../services/accounts';
import { JournalEntries, JournalEntryCreate } from '../../services/journal-entries';

@Component({
  selector: 'app-enter-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enter-expense.html',
  styleUrl: './enter-expense.scss',
})
export class EnterExpense implements OnInit {
  error = '';
  isSubmitting = false;

  accounts: AccountListItem[] = [];
  isLoadingAccounts = false;

  expenseAccountId: number | null = null; // Debit
  paymentAccountId: number | null = null; // Credit

  occurredOn = this.today();
  description = '';
  amount = 0;
  referenceNo = '';

  constructor(
    private accountsApi: AccountsService,
    private journal: JournalEntries,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  typeLabel(type: number): string {
    if (type === 1) return 'Asset';
    if (type === 2) return 'Liability';
    if (type === 3) return 'Equity';
    if (type === 4) return 'Revenue';
    if (type === 5) return 'Expense';
    return String(type);
  }

  private loadAccounts(): void {
    this.error = '';
    this.isLoadingAccounts = true;
    this.cdr.detectChanges();

    this.accountsApi.getAll().subscribe({
      next: (rows) => {
        this.accounts = rows ?? [];
        this.isLoadingAccounts = false;

        if (this.accounts.length > 0) {
          const firstExpense = this.accounts.find(a => a.type === 5);
          const firstAssetOrLiab = this.accounts.find(a => a.type === 1) ?? this.accounts.find(a => a.type === 2);

          this.expenseAccountId = firstExpense ? firstExpense.id : this.accounts[0].id;
          this.paymentAccountId = firstAssetOrLiab ? firstAssetOrLiab.id : this.accounts[0].id;
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingAccounts = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to load accounts'));
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    this.error = '';

    const debitId = Number(this.expenseAccountId);
    const creditId = Number(this.paymentAccountId);
    const date = (this.occurredOn ?? '').trim();
    const desc = (this.description ?? '').trim();
    const amt = Number(this.amount);
    const ref = (this.referenceNo ?? '').trim() || null;

    if (!debitId || debitId <= 0) {
      this.error = 'Expense account is required.';
      return;
    }
    if (!creditId || creditId <= 0) {
      this.error = 'Payment account is required.';
      return;
    }
    if (debitId === creditId) {
      this.error = 'Expense and Payment account must be different.';
      return;
    }
    if (!date) {
      this.error = 'Date is required.';
      return;
    }
    if (!desc) {
      this.error = 'Description is required.';
      return;
    }
    if (!amt || amt <= 0) {
      this.error = 'Amount must be greater than 0.';
      return;
    }

    const payload: JournalEntryCreate = {
      occurredOn: `${date}T00:00:00`,
      description: desc,
      referenceNo: ref,
      lines: [
        { accountId: debitId, debit: amt, credit: 0, memo: 'Expense' },
        { accountId: creditId, debit: 0, credit: amt, memo: 'Payment' }
      ]
    };

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.journal.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        this.router.navigateByUrl('/transactions');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to save expense'));
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/transactions');
  }
}

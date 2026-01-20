import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts as AccountsService, AccountListItem } from '../../services/accounts';
import { JournalEntries, JournalEntryCreate } from '../../services/journal-entries';

@Component({
  selector: 'app-transfer-funds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-funds.html',
  styleUrl: './transfer-funds.scss',
})
export class TransferFunds implements OnInit {
  error = '';
  isSubmitting = false;

  accounts: AccountListItem[] = [];
  isLoadingAccounts = false;

  fromAccountId: number | null = null; // Credit
  toAccountId: number | null = null;   // Debit

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
          const assets = this.accounts.filter(a => a.type === 1);
          const firstAsset = assets[0];
          const secondAsset = assets.find(a => a.id !== firstAsset?.id);

          const fromDefault = firstAsset?.id ?? this.accounts[0].id;
          const toDefault =
            secondAsset?.id ??
            this.accounts.find(a => a.type === 2)?.id ??
            this.accounts[0].id;

          this.fromAccountId = fromDefault;
          this.toAccountId = toDefault;

          if (this.fromAccountId === this.toAccountId && this.accounts.length > 1) {
            this.toAccountId = this.accounts.find(a => a.id !== this.fromAccountId)?.id ?? this.toAccountId;
          }
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingAccounts = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message ||  'Failed to load accounts'));
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    this.error = '';

    const fromId = Number(this.fromAccountId); // Credit
    const toId = Number(this.toAccountId);     // Debit
    const date = (this.occurredOn ?? '').trim();
    const desc = (this.description ?? '').trim();
    const amt = Number(this.amount);
    const ref = (this.referenceNo ?? '').trim() || null;

    if (!fromId || fromId <= 0) {
      this.error = 'From account is required.';
      return;
    }
    if (!toId || toId <= 0) {
      this.error = 'To account is required.';
      return;
    }
    if (fromId === toId) {
      this.error = 'From and To accounts must be different.';
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
        { accountId: toId, debit: amt, credit: 0, memo: 'Transfer In' },
        { accountId: fromId, debit: 0, credit: amt, memo: 'Transfer Out' }
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
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message ||  'Failed to save transfer'));
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/transactions');
  }
}

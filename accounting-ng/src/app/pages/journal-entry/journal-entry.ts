import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts as AccountsService, AccountListItem } from '../../services/accounts';
import { JournalEntries, JournalEntryCreate } from '../../services/journal-entries';

type JournalLineVm = {
  accountId: number | null;
  debit: number;
  credit: number;
  memo: string;
};

@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-entry.html',
  styleUrl: './journal-entry.scss',
})
export class JournalEntry implements OnInit {
  error = '';
  isSubmitting = false;

  accounts: AccountListItem[] = [];
  isLoadingAccounts = false;

  occurredOn = this.today();
  description = '';
  referenceNo = '';

  lines: JournalLineVm[] = [
    { accountId: null, debit: 0, credit: 0, memo: '' },
    { accountId: null, debit: 0, credit: 0, memo: '' },
  ];

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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoadingAccounts = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to load accounts';
        this.cdr.detectChanges();
      },
    });
  }

  addLine(): void {
    this.lines.push({ accountId: null, debit: 0, credit: 0, memo: '' });
  }

  removeLine(index: number): void {
    if (this.lines.length <= 2) return;
    this.lines.splice(index, 1);
  }

  onDebitChange(line: JournalLineVm): void {
    const d = Number(line.debit);
    if (d > 0) {
      line.credit = 0;
    }
  }

  onCreditChange(line: JournalLineVm): void {
    const c = Number(line.credit);
    if (c > 0) {
      line.debit = 0;
    }
  }

  totalDebit(): number {
    return this.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  }

  totalCredit(): number {
    return this.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  }

  isBalanced(): boolean {
    const d = this.totalDebit();
    const c = this.totalCredit();
    return Math.abs(d - c) < 0.00001 && d > 0 && c > 0;
  }

  private validate(): boolean {
    this.error = '';

    const date = (this.occurredOn ?? '').trim();
    const desc = (this.description ?? '').trim();

    if (!date) {
      this.error = 'Date is required.';
      return false;
    }
    if (!desc) {
      this.error = 'Description is required.';
      return false;
    }
    if (!this.lines || this.lines.length < 2) {
      this.error = 'At least two lines are required.';
      return false;
    }

    for (let i = 0; i < this.lines.length; i++) {
      const l = this.lines[i];
      const accountId = Number(l.accountId);
      const debit = Number(l.debit) || 0;
      const credit = Number(l.credit) || 0;

      if (!accountId || accountId <= 0) {
        this.error = `Line ${i + 1}: Account is required.`;
        return false;
      }
      if ((debit > 0 && credit > 0) || (debit <= 0 && credit <= 0)) {
        this.error = `Line ${i + 1}: Enter either Debit or Credit (one only).`;
        return false;
      }
      if (debit < 0 || credit < 0) {
        this.error = `Line ${i + 1}: Amount cannot be negative.`;
        return false;
      }
    }

    if (!this.isBalanced()) {
      this.error = 'Journal entry must be balanced (Total Debit must equal Total Credit).';
      return false;
    }

    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    const date = (this.occurredOn ?? '').trim();
    const desc = (this.description ?? '').trim();
    const ref = (this.referenceNo ?? '').trim() || null;

    const payload: JournalEntryCreate = {
      occurredOn: `${date}T00:00:00`,
      description: desc,
      referenceNo: ref,
      lines: this.lines.map(l => ({
        accountId: Number(l.accountId),
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: (l.memo ?? '').trim() || null
      }))
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
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to save journal entry';
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/transactions');
  }
}

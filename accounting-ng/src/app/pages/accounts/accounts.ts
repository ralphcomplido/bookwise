import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Accounts as AccountsService, AccountCreateDto, AccountListItem } from '../../services/accounts';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.scss',
})
export class Accounts implements OnInit {
  isLoading = false;
  error = '';

  rows: AccountListItem[] = [];

  // create form
  accountCode = '';
  name = '';
  type = 1; // Asset default

  isSubmitting = false;
  deleting: Record<number, boolean> = {};

  typeOptions = [
    { value: 1, label: 'Asset' },
    { value: 2, label: 'Liability' },
    { value: 3, label: 'Equity' },
    { value: 4, label: 'Revenue' },
    { value: 5, label: 'Expense' },
  ];

  constructor(
    private accounts: AccountsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.accounts.getAll().subscribe({
      next: (data) => {
        this.rows = data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to load accounts';
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    this.error = '';

    const code = (this.accountCode ?? '').trim();
    const nm = (this.name ?? '').trim();
    const tp = Number(this.type);

    if (!code) {
      this.error = 'Account Code is required.';
      return;
    }
    if (!nm) {
      this.error = 'Account Name is required.';
      return;
    }
    if (![1,2,3,4,5].includes(tp)) {
      this.error = 'Account Type is required.';
      return;
    }

    const payload: AccountCreateDto = {
      accountCode: code,
      name: nm,
      type: tp
    };

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.accounts.create(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;

        // add to list and keep sorted by code
        this.rows = [...this.rows, created].sort((a, b) => a.accountCode.localeCompare(b.accountCode));

        // reset form
        this.accountCode = '';
        this.name = '';
        this.type = 1;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to create account';
        this.cdr.detectChanges();
      }
    });
  }

  delete(id: number): void {
    this.error = '';
    this.deleting[id] = true;
    this.cdr.detectChanges();

    this.accounts.delete(id).subscribe({
      next: () => {
        this.deleting[id] = false;
        this.rows = this.rows.filter(a => a.id !== id);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.deleting[id] = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to delete account';
        this.cdr.detectChanges();
      }
    });
  }

  typeLabel(type: number): string {
    const found = this.typeOptions.find(x => x.value === type);
    return found ? found.label : String(type);
  }

  trackById(_: number, a: AccountListItem): number {
    return a.id;
  }
}

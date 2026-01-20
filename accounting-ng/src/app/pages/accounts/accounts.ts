import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Accounts as AccountsService,
  AccountCreateDto,
  AccountListItem,
  AccountUpdateDto
} from '../../services/accounts';
import { AuthService } from '../../services/auth.service';

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

  // edit state
  editingId: number | null = null;
  editAccountCode = '';
  editName = '';
  editType = 1;
  isSavingEdit = false;

  typeOptions = [
    { value: 1, label: 'Asset' },
    { value: 2, label: 'Liability' },
    { value: 3, label: 'Equity' },
    { value: 4, label: 'Revenue' },
    { value: 5, label: 'Expense' },
  ];

  constructor(
    private accounts: AccountsService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
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
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message ||  'Failed to load accounts'));
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
    if (![1, 2, 3, 4, 5].includes(tp)) {
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

        this.rows = [...this.rows, created].sort((a, b) => a.accountCode.localeCompare(b.accountCode));

        this.accountCode = '';
        this.name = '';
        this.type = 1;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to create account'));
        this.cdr.detectChanges();
      }
    });
  }

  // --------- EDIT FLOW ---------

  startEdit(a: AccountListItem): void {
    this.error = '';
    this.editingId = a.id;
    this.editAccountCode = a.accountCode;
    this.editName = a.name;
    this.editType = Number(a.type) || 1;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editAccountCode = '';
    this.editName = '';
    this.editType = 1;
    this.isSavingEdit = false;
    this.cdr.detectChanges();
  }

  saveEdit(a: AccountListItem): void {
    if (this.editingId !== a.id) return;

    this.error = '';

    const code = (this.editAccountCode ?? '').trim();
    const nm = (this.editName ?? '').trim();
    const tp = Number(this.editType);

    if (!code) {
      this.error = 'Account Code is required.';
      return;
    }
    if (!nm) {
      this.error = 'Account Name is required.';
      return;
    }
    if (![1, 2, 3, 4, 5].includes(tp)) {
      this.error = 'Account Type is required.';
      return;
    }

    const payload: AccountUpdateDto = {
      accountCode: code,
      name: nm,
      type: tp
    };

    this.isSavingEdit = true;
    this.cdr.detectChanges();

    this.accounts.update(a.id, payload).subscribe({
      next: () => {
        this.isSavingEdit = false;

        // API returns 204 No Content, so update the row locally using the payload
        this.rows = this.rows
          .map(r => (r.id === a.id ? { ...r, accountCode: code, name: nm, type: tp } : r))
          .sort((x, y) => x.accountCode.localeCompare(y.accountCode));

        this.cancelEdit();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isSavingEdit = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to update account'));
        this.cdr.detectChanges();
      }
    });
  }

  // --------- DELETE ---------

  delete(id: number): void {
    this.error = '';
    this.deleting[id] = true;
    this.cdr.detectChanges();

    this.accounts.delete(id).subscribe({
      next: () => {
        this.deleting[id] = false;
        this.rows = this.rows.filter(a => a.id !== id);

        if (this.editingId === id) {
          this.cancelEdit();
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.deleting[id] = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to delete account'));
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Transactions, TransactionCreate } from '../../services/transactions';

@Component({
  selector: 'app-enter-expense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enter-expense.html',
  styleUrl: './enter-expense.scss',
})
export class EnterExpense {
  error = '';
  isSubmitting = false;

  occurredOn = this.today();
  description = '';
  amount = 0;
  category = '';
  referenceNo = '';

  constructor(
    private tx: Transactions,
    private router: Router
  ) {}

  private today(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  submit(): void {
    this.error = '';

    const desc = (this.description ?? '').trim();
    const date = (this.occurredOn ?? '').trim();
    const amt = Number(this.amount);

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

    const payload: TransactionCreate = {
      transactionType: 'Expense',
      occurredOn: `${date}T00:00:00`,
      description: desc,
      amount: amt,
      category: (this.category ?? '').trim() || null,
      referenceNo: (this.referenceNo ?? '').trim() || null
    };

    this.isSubmitting = true;

    this.tx.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/transactions');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = JSON.stringify(err?.error) || err?.message || 'Failed to save expense';
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/transactions');
  }
}

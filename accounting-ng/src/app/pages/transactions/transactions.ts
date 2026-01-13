import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  constructor(private router: Router) {}

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
}

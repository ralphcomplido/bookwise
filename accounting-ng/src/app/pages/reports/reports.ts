import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  goIncome(): void {
    this.router.navigateByUrl('/reports/income');
  }

  goExpense(): void {
    this.router.navigateByUrl('/reports/expense');
  }

  goChart(): void {
    this.router.navigateByUrl('/reports/chart');
  }

  goCustom(): void {
    this.router.navigateByUrl('/reports/custom');
  }
}

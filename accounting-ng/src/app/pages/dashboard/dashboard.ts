import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AccessLevel = 'Admin' | 'Registered' | 'Bookkeeper' | 'ReportViewer';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  accessLevel: AccessLevel | '' = '';
  error = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccessLevel();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private loadAccessLevel(): void {
    this.error = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.auth.getAccessLevel().subscribe({
      next: (res: any) => {
        this.accessLevel = (res?.accessLevel ?? '') as AccessLevel;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message ||  'Failed to load access level'));
        this.cdr.detectChanges();
      }
    });
  }

  canManageTransactions(): boolean {
    return this.accessLevel === 'Bookkeeper' || this.accessLevel === 'Admin';
  }

  canViewReports(): boolean {
    return this.accessLevel === 'Bookkeeper' || this.accessLevel === 'ReportViewer' || this.accessLevel === 'Admin';
  }
}

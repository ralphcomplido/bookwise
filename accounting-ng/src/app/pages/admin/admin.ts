import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminUsers } from '../../services/admin-users';
import { AuthService } from '../../services/auth.service';

export interface AdminUserRow {
  id: string;
  email: string;
  accessLevel: string; // Admin | Registered | Bookkeeper | ReportViewer
}

type AccessLevelOption = 'Registered' | 'Bookkeeper' | 'ReportViewer';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  users: AdminUserRow[] = [];
  error = '';
  isLoading = false;

  accessLevels: AccessLevelOption[] = ['Registered', 'Bookkeeper', 'ReportViewer'];
  selected: Record<string, AccessLevelOption> = {};
  saving: Record<string, boolean> = {};

  constructor(
    private adminUsers: AdminUsers,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  private normalizeRow(raw: any): AdminUserRow {
    return {
      id: String(raw?.id ?? raw?.Id ?? ''),
      email: String(raw?.email ?? raw?.Email ?? ''),
      accessLevel: String(raw?.accessLevel ?? raw?.AccessLevel ?? 'Registered')
    };
  }

  loadUsers(): void {
    this.error = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.adminUsers.getUsers().subscribe({
      next: (rows: any) => {
        try {
          const arr = Array.isArray(rows) ? rows : [];
          this.users = arr.map((r: any) => this.normalizeRow(r));

          this.selected = {};
          for (const u of this.users) {
            const level: AccessLevelOption =
              u.accessLevel === 'Bookkeeper' || u.accessLevel === 'ReportViewer'
                ? (u.accessLevel as AccessLevelOption)
                : 'Registered';

            this.selected[u.id] = level;
          }
        } catch (e: any) {
          this.error = e?.message || 'Failed to process users response';
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message || 'Failed to load users'));
        this.cdr.detectChanges();
      }
    });
  }

  isAdminRow(u: AdminUserRow): boolean {
    return (u.email ?? '').trim().toLowerCase() === 'admin@local.test';
  }

  canSave(u: AdminUserRow): boolean {
    if (this.isAdminRow(u)) return false;

    const current: AccessLevelOption =
      u.accessLevel === 'Bookkeeper' || u.accessLevel === 'ReportViewer'
        ? (u.accessLevel as AccessLevelOption)
        : 'Registered';

    return this.selected[u.id] !== current;
  }

  save(u: AdminUserRow): void {
    if (!this.canSave(u)) return;

    const newLevel = this.selected[u.id];

    this.error = '';
    this.saving[u.id] = true;
    this.cdr.detectChanges();

    this.adminUsers.setAccessLevel(u.id, newLevel).subscribe({
      next: () => {
        u.accessLevel = newLevel;
        this.saving[u.id] = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.saving[u.id] = false;
        this.error = (typeof err?.error === 'string' ? err.error : (err?.message ||  'Failed to save access level'));
        this.cdr.detectChanges();
      }
    });
  }

  trackById(_: number, u: AdminUserRow): string {
    return u.id;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { AppConfigService } from './app-config';

@Injectable({
  providedIn: 'root',
})
export class AdminUsers {
  private get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private config: AppConfigService
  ) {}

  getUsers(): Observable<any> {
    const token = this.auth.getToken();

    if (!token) {
      return throwError(() => new Error('Missing access_token in localStorage. Please login again.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiBaseUrl}/api/admin/users`, { headers });
  }

  setAccessLevel(userId: string, accessLevel: 'Registered' | 'Bookkeeper' | 'ReportViewer'): Observable<void> {
    const token = this.auth.getToken();

    if (!token) {
      return throwError(() => new Error('Missing access_token in localStorage. Please login again.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put<void>(
      `${this.apiBaseUrl}/api/admin/users/${userId}/access-level`,
      { accessLevel },
      { headers }
    );
  }
}

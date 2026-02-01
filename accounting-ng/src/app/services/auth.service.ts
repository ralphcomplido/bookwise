import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from './app-config';

export interface LoginResponse {
  tokenType?: string;
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;

  token_type?: string;
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  constructor(private http: HttpClient, private config: AppConfigService) {}

  register(email: string, password: string): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/register`, { email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/login`, {
      email,
      password,
      twoFactorCode: '',
      twoFactorRecoveryCode: ''
    }).pipe(
      tap(res => {
        const token =
          res.accessToken ??
          (res as any).access_token ??
          null;

        if (token) {
          localStorage.setItem('access_token', token);
        } else {
          localStorage.removeItem('access_token');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getAccessLevel(): Observable<{ accessLevel: string }> {
    const token = this.getToken();
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    return this.http.get<{ accessLevel: string }>(
      `${this.apiBaseUrl}/api/access-level`,
      { headers }
    );
  }
}

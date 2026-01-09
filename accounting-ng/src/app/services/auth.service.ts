import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = 'https://localhost:7119';

  constructor(private http: HttpClient) {}

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
      tap(res => localStorage.setItem('access_token', res.accessToken))
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

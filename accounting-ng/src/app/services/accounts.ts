import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AccountListItem {
  id: number;
  accountCode: string;
  name: string;
  type: number; // 1 Asset, 2 Liability, 3 Equity, 4 Revenue, 5 Expense
}

export interface AccountCreateDto {
  accountCode: string;
  name: string;
  type: number;
}

@Injectable({
  providedIn: 'root',
})
export class Accounts {
  private apiBaseUrl = 'https://localhost:7119';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  getAll(): Observable<AccountListItem[]> {
    return this.http.get<AccountListItem[]>(
      `${this.apiBaseUrl}/api/accounts`,
      { headers: this.headers() }
    );
  }

  create(dto: AccountCreateDto): Observable<AccountListItem> {
    return this.http.post<AccountListItem>(
      `${this.apiBaseUrl}/api/accounts`,
      dto,
      { headers: this.headers() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/api/accounts/${id}`,
      { headers: this.headers() }
    );
  }
}

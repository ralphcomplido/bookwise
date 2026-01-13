import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface TransactionListItem {
  id: number;
  accountId: number;
  transactionType: string;   // Income / Expense
  occurredOn: string;        // ISO string
  description: string;
  amount: number;
  signedAmount: number;
  category?: string | null;
  referenceNo?: string | null;
  createdAtUtc: string;
}

export interface TransactionCreate {
  accountId: number;
  transactionType: 'Income' | 'Expense';
  occurredOn: string;
  description: string;
  amount: number;
  category?: string | null;
  referenceNo?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Transactions {
  private apiBaseUrl = 'https://localhost:7119';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  getAll(): Observable<TransactionListItem[]> {
    return this.http.get<TransactionListItem[]>(
      `${this.apiBaseUrl}/api/transactions`,
      { headers: this.headers() }
    );
  }

  create(dto: TransactionCreate): Observable<TransactionListItem> {
    return this.http.post<TransactionListItem>(
      `${this.apiBaseUrl}/api/transactions`,
      dto,
      { headers: this.headers() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/api/transactions/${id}`,
      { headers: this.headers() }
    );
  }
}

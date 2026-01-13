import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface JournalEntryLineCreate {
  accountId: number;
  debit: number;
  credit: number;
  memo?: string | null;
}

export interface JournalEntryCreate {
  occurredOn: string;
  description: string;
  referenceNo?: string | null;
  lines: JournalEntryLineCreate[];
}

@Injectable({
  providedIn: 'root',
})
export class JournalEntries {
  private apiBaseUrl = 'https://localhost:7119';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  create(dto: JournalEntryCreate): Observable<any> {
    return this.http.post<any>(
      `${this.apiBaseUrl}/api/journal-entries`,
      dto,
      { headers: this.headers() }
    );
  }
}

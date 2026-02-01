import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AppConfigService } from './app-config';

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

export interface JournalEntryLineDto {
  id: number;
  accountId: number;
  debit: number;
  credit: number;
  memo?: string | null;
}

export interface JournalEntryDto {
  id: number;
  occurredOn: string;
  description: string;
  referenceNo?: string | null;
  createdAtUtc: string;
  lines: JournalEntryLineDto[];
}

@Injectable({
  providedIn: 'root',
})
export class JournalEntries {
  private get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private config: AppConfigService
  ) {}

  private headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  getAll(): Observable<JournalEntryDto[]> {
    return this.http.get<JournalEntryDto[]>(
      `${this.apiBaseUrl}/api/journal-entries`,
      { headers: this.headers() }
    );
  }

  create(dto: JournalEntryCreate): Observable<any> {
    return this.http.post<any>(
      `${this.apiBaseUrl}/api/journal-entries`,
      dto,
      { headers: this.headers() }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private _config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  /** Loads configuration from /assets/app-config.json before app bootstrap. */
  async load(): Promise<void> {
    // This file is served by the Angular app (and later by nginx in the container)
    const cfg = await firstValueFrom(this.http.get<AppConfig>('app-config.json'));

    if (!cfg || !cfg.apiBaseUrl || !cfg.apiBaseUrl.trim()) {
      throw new Error('app-config.json is missing a valid "apiBaseUrl".');
    }

    // Normalize: remove trailing slash if provided
    const normalized = cfg.apiBaseUrl.trim().replace(/\/+$/, '');

    this._config = { apiBaseUrl: normalized };
  }

  /** The configured API base URL (e.g., https://your-api.azurecontainerapps.io). */
  get apiBaseUrl(): string {
    if (!this._config) {
      throw new Error('AppConfigService not initialized. Ensure APP_INITIALIZER calls load().');
    }
    return this._config.apiBaseUrl;
  }
}

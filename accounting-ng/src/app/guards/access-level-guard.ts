import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

type AccessLevel = 'Admin' | 'Registered' | 'Bookkeeper' | 'ReportViewer';

export function requireAccessLevel(allowed: AccessLevel[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.getToken();
    if (!token) {
      router.navigateByUrl('/login');
      return of(false);
    }

    return auth.getAccessLevel().pipe(
      map((res: any) => {
        const level = (res?.accessLevel ?? '') as AccessLevel;

        if (allowed.includes(level)) {
          return true;
        }

        if (level === 'Admin') return router.parseUrl('/admin');
        if (level === 'Bookkeeper') return router.parseUrl('/dashboard');
        if (level === 'ReportViewer') return router.parseUrl('/dashboard');
        return router.parseUrl('/registered');
      }),
      catchError(() => {
        router.navigateByUrl('/login');
        return of(false);
      })
    );
  };
}

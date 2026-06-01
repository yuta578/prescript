import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Pregunta al backend si la cookie es válida
    return this.auth.checkSession().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/start']);
        return of(false);
      })
    );
  }
}

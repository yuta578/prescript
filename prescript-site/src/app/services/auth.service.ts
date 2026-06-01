import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _username: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${API}/register`, { username, password });
  }

  login(username: string, password: string): Observable<{ username: string }> {
    return this.http.post<{ username: string }>(
      `${API}/login`,
      { username, password },
      { withCredentials: true } // envía y recibe cookies
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${API}/logout`, {}, { withCredentials: true });
  }

  // Verifica sesión activa consultando al backend
  checkSession(): Observable<{ id: number; username: string }> {
    return this.http.get<{ id: number; username: string }>(
      `${API}/me`,
      { withCredentials: true }
    );
  }
}

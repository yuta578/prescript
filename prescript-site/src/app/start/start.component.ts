import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="scene">
      <div class="corner tl"></div>
      <div class="corner tr"></div>
      <div class="corner bl"></div>
      <div class="corner br"></div>

      <div class="start-wrap">
        <div class="start-box">
          <div class="mode-toggle">
            <span [class.active]="mode === 'login'" (click)="mode = 'login'; error = ''">entrar</span>
            <span class="sep">·</span>
            <span [class.active]="mode === 'register'" (click)="mode = 'register'; error = ''">registrarse</span>
          </div>

          <div class="field-group">
            <input
              class="start-input"
              type="text"
              placeholder="usuario"
              [(ngModel)]="username"
              (keydown.enter)="submit()"
              autocomplete="off"
            />
            <input
              class="start-input"
              type="password"
              placeholder="contraseña"
              [(ngModel)]="password"
              (keydown.enter)="submit()"
            />
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>
          <div class="success-msg" *ngIf="success">{{ success }}</div>

          <button class="start-btn" [disabled]="loading" (click)="submit()">
            {{ loading ? '...' : (mode === 'login' ? 'entrar' : 'registrarse') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scene {
      background: #000;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Georgia', serif;
      position: relative;
    }

    .corner { position: fixed; width: 22px; height: 22px; border-color: #1a1a1a; border-style: solid; }
    .corner.tl { top: 16px; left: 16px; border-width: 1px 0 0 1px; }
    .corner.tr { top: 16px; right: 16px; border-width: 1px 1px 0 0; }
    .corner.bl { bottom: 16px; left: 16px; border-width: 0 0 1px 1px; }
    .corner.br { bottom: 16px; right: 16px; border-width: 0 1px 1px 0; }

    .start-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .start-box {
      border: 1px solid #1e1e1e;
      padding: 2.5rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      width: 300px;
    }

    .mode-toggle {
      display: flex;
      gap: 10px;
      justify-content: center;
      font-size: 9px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #333;
    }

    .mode-toggle span { cursor: pointer; transition: color 0.2s; }
    .mode-toggle span.active { color: #888; }
    .mode-toggle .sep { cursor: default; }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .start-input {
      background: transparent;
      border: none;
      border-bottom: 1px solid #1e1e1e;
      color: #c8c0b0;
      font-family: 'Georgia', serif;
      font-size: 13px;
      font-style: italic;
      padding: 6px 2px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .start-input::placeholder { color: #333; }
    .start-input:focus { border-color: #3a3a3a; }

    .start-btn {
      background: transparent;
      border: 1px solid #2a2a2a;
      color: #666;
      font-size: 9px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      padding: 9px 0;
      cursor: pointer;
      font-family: 'Georgia', serif;
      transition: border-color 0.2s, color 0.2s;
      width: 100%;
    }
    .start-btn:hover:not(:disabled) { border-color: #555; color: #bbb; }
    .start-btn:disabled { opacity: 0.3; cursor: default; }

    .error-msg {
      font-size: 9px;
      letter-spacing: 0.15em;
      color: #8a3a3a;
      text-transform: uppercase;
      text-align: center;
    }

    .success-msg {
      font-size: 9px;
      letter-spacing: 0.15em;
      color: #5a8a5a;
      text-transform: uppercase;
      text-align: center;
    }
  `]
})
export class StartComponent {
  mode: 'login' | 'register' = 'login';
  username = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.success = '';
    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'completa los campos.';
      return;
    }
    this.loading = true;

    if (this.mode === 'login') {
      this.auth.login(this.username, this.password).subscribe({
        next: () => this.router.navigate(['/menu']),
        error: (e) => {
          this.error = e.error?.message || 'algo salió mal.';
          this.loading = false;
        },
      });
    } else {
      this.auth.register(this.username, this.password).subscribe({
        next: () => {
          this.success = 'registro exitoso. ahora entra.';
          this.mode = 'login';
          this.password = '';
          this.loading = false;
        },
        error: (e) => {
          this.error = e.error?.message || 'algo salió mal.';
          this.loading = false;
        },
      });
    }
  }
}

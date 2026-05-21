import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BarberService } from '../../services/barber.service';

@Component({
  selector: 'app-barber-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="material-icons logo-icon">face</span>
          <h1>Panel <span class="gold">Barbero</span></h1>
          <p>Acepta o rechaza solicitudes de cita</p>
        </div>
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="tu@email.com" required autofocus>
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña" required>
          </div>
          @if (error()) {
            <div class="error-msg">
              <span class="material-icons">error</span>
              Email o contraseña incorrectos
            </div>
          }
          <button type="submit" class="btn-login" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        <a routerLink="/" class="back-link">← Volver al sitio</a>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-dark);
    }
    .login-card {
      background: var(--secondary-dark);
      padding: 50px 40px;
      border-radius: 12px;
      width: 100%;
      max-width: 420px;
      border: 1px solid rgba(200, 169, 126, 0.15);
    }
    .login-header { text-align: center; margin-bottom: 35px; }
    .logo-icon { font-size: 48px; color: var(--gold); }
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      margin: 10px 0 5px;
    }
    .gold { color: var(--gold); }
    .login-header p { color: var(--text-muted); font-size: 0.9rem; }
    .form-group { margin-bottom: 20px; }
    label {
      display: block;
      font-size: 0.85rem;
      color: var(--gold);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      background: var(--tertiary-dark);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px;
      color: var(--text-light);
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus { outline: none; border-color: var(--gold); }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--danger);
      font-size: 0.9rem;
      margin-bottom: 15px;
    }
    .btn-login {
      width: 100%;
      padding: 14px;
      background: var(--gold);
      color: var(--primary-dark);
      border: none;
      border-radius: 6px;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
    .back-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: var(--text-muted);
      font-size: 0.85rem;
      text-decoration: none;
    }
    .back-link:hover { color: var(--gold); }
  `]
})
export class BarberLoginComponent {
  private barber = inject(BarberService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal(false);

  onLogin() {
    this.error.set(false);
    this.loading.set(true);
    this.barber.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/barber/citas']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }
}

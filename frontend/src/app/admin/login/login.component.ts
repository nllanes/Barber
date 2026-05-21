import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="material-icons logo-icon">content_cut</span>
          <h1>BarberShop <span class="gold">Elite</span></h1>
          <p>Panel de Administración</p>
        </div>
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="password" name="password"
                   placeholder="Ingresa la contraseña" required autofocus>
          </div>
          @if (error()) {
            <div class="error-msg">
              <span class="material-icons">error</span>
              Contraseña incorrecta
            </div>
          }
          @if (networkError()) {
            <div class="network-hint">
              <span class="material-icons">cloud_off</span>
              <div class="hint-body">
                <p><strong>El servidor no contestó bien al navegador</strong> (CORS o URL mal). Suele pasar después de GitHub Pages. Copia una de estas parejas en Railway → Variables:</p>
                <pre class="hint-pre">{{ railwayVarsCopy }}</pre>
                <p class="hint-foot">Entre «Cors» y «Allowed» deben ir <strong>dos</strong> caracteres _. Luego espera redeploy · En GitHub, secreto BACKEND_ORIGIN = tu URL Railway sin /api</p>
              </div>
            </div>
          }
          <button type="submit" class="btn-login" [disabled]="loading()">
            {{ loading() ? 'Verificando...' : 'Ingresar' }}
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

    .login-header {
      text-align: center;
      margin-bottom: 35px;
    }

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

    .error-msg .material-icons { font-size: 18px; }

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
      transition: all 0.3s ease;
    }

    .btn-login:hover { background: var(--gold-light); }
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

    .network-hint {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 12px;
      margin-bottom: 18px;
      border: 1px solid rgba(200,169,126,0.35);
      border-radius: 8px;
      background: rgba(200,169,126,0.06);
      color: var(--text-muted);
      font-size: 0.8rem;
      line-height: 1.45;
      text-align: left;
    }
    .network-hint .material-icons { color: var(--gold); flex-shrink: 0; font-size: 22px; }
    .hint-body p { margin: 0 0 8px; }
    .hint-pre {
      margin: 0 0 8px;
      padding: 10px 12px;
      background: rgba(0,0,0,0.35);
      border-radius: 6px;
      font-family: ui-monospace, Consolas, monospace;
      font-size: 0.72rem;
      white-space: pre-wrap;
      word-break: break-all;
      color: #e8dcb8;
    }
    .hint-foot { font-size: 0.72rem; opacity: .9; margin: 0 !important; }
  `]
})
export class AdminLoginComponent {
  private admin = inject(AdminService);
  private router = inject(Router);

  /** Bloque literal para pegar en Railway (evita que __ se «coma» la fuente en pantalla). */
  readonly railwayVarsCopy =
    ['OPCIÓN A (nombre estándar .NET)',
     'Nombre:    Cors__AllowedOrigins',
     'Valor:     https://nllanes.github.io',
     '',
     'OPCIÓN B (más simple)',
     'Nombre:    FrontendOrigin',
     'Valor:     https://nllanes.github.io',
    ].join('\n');

  password = '';
  loading = signal(false);
  /** Solo credenciales inválidas (401/403). */
  error = signal(false);
  /** Red, CORS, URL mal, servidor caído, etc. */
  networkError = signal(false);

  onLogin() {
    this.error.set(false);
    this.networkError.set(false);
    this.loading.set(true);
    this.admin.login(this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 401 || status === 403)
          this.error.set(true);
        else
          this.networkError.set(true);
      }
    });
  }
}

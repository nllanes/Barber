import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { BarberService } from '../../services/barber.service';

@Component({
  selector: 'app-barber-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="barber-shell">
      <header class="barber-header">
        <div>
          <h1>Panel barbero</h1>
          <p class="sub">{{ barber.barberName() }}</p>
        </div>
        <button type="button" class="btn-out" (click)="logout()">Salir</button>
      </header>

      <nav class="barber-nav">
        <a routerLink="/barber/citas" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Citas
          @if (barber.pendingApprovalCount() > 0) {
            <span class="nav-badge">{{ barber.pendingApprovalCount() }}</span>
          }
        </a>
        <a routerLink="/barber/trabajos" routerLinkActive="active">Mis trabajos</a>
        <a routerLink="/barber/disponibilidad" routerLinkActive="active">Disponibilidad</a>
      </nav>

      <router-outlet />
    </div>
  `,
  styles: [`
    .barber-shell { max-width: 1000px; margin: 0 auto; padding: 28px 20px 48px; min-height: 100vh; background: var(--primary-dark); }
    .barber-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
    h1 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--text-light); margin: 0 0 4px; }
    .sub { color: var(--gold); margin: 0; font-size: 0.95rem; }
    .btn-out {
      padding: 10px 20px;
      background: transparent;
      border: 1px solid rgba(200,169,126,0.35);
      color: var(--gold);
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
    }
    .barber-nav {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 28px;
      border-bottom: 1px solid rgba(200,169,126,0.12);
      padding-bottom: 12px;
    }
    .barber-nav a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .barber-nav a:hover { color: var(--gold); background: rgba(200,169,126,0.06); }
    .barber-nav a.active {
      color: var(--primary-dark);
      background: var(--gold);
    }
    .nav-badge {
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 6px;
      border-radius: 999px;
      background: #e74c3c;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1.25rem;
      text-align: center;
    }
    .barber-nav a.active .nav-badge { background: var(--primary-dark); color: var(--gold); }
  `]
})
export class BarberLayoutComponent implements OnInit {
  barber = inject(BarberService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    interval(45_000)
      .pipe(
        startWith(0),
        switchMap(() => this.barber.getAppointments()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(list => this.barber.syncPendingApprovalBadge(list));
  }

  logout() {
    this.barber.logout();
    this.router.navigate(['/barber/login']);
  }
}

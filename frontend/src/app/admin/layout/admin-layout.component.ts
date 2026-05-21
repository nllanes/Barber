import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-wrapper">
      <aside class="sidebar" [class.collapsed]="collapsed()">
        <div class="sidebar-header">
          <span class="material-icons">content_cut</span>
          @if (!collapsed()) {
            <span class="brand">Admin Panel</span>
          }
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="material-icons">dashboard</span>
            @if (!collapsed()) { <span>Dashboard</span> }
          </a>
          <a routerLink="/admin/services" routerLinkActive="active">
            <span class="material-icons">content_cut</span>
            @if (!collapsed()) { <span>Servicios</span> }
          </a>
          <a routerLink="/admin/barbers" routerLinkActive="active">
            <span class="material-icons">people</span>
            @if (!collapsed()) { <span>Barberos</span> }
          </a>
          <a routerLink="/admin/gallery" routerLinkActive="active">
            <span class="material-icons">photo_library</span>
            @if (!collapsed()) { <span>Galería</span> }
          </a>
          <a routerLink="/admin/appointments" routerLinkActive="active">
            <span class="material-icons">event</span>
            @if (!collapsed()) { <span>Citas</span> }
          </a>
          <a routerLink="/admin/messages" routerLinkActive="active">
            <span class="material-icons">mail</span>
            @if (!collapsed()) { <span>Mensajes</span> }
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="nav-link">
            <span class="material-icons">language</span>
            @if (!collapsed()) { <span>Ver Sitio</span> }
          </a>
          <button (click)="logout()" class="nav-link logout-btn">
            <span class="material-icons">logout</span>
            @if (!collapsed()) { <span>Salir</span> }
          </button>
        </div>
      </aside>

      <div class="main-area">
        <header class="top-bar">
          <button class="toggle-btn" (click)="toggleSidebar()">
            <span class="material-icons">menu</span>
          </button>
          <span class="page-title">BarberShop Elite - Administración</span>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--primary-dark);
    }

    .sidebar {
      width: 250px;
      background: var(--secondary-dark);
      border-right: 1px solid rgba(200,169,126,0.1);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 100;
    }

    .sidebar.collapsed { width: 70px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid rgba(200,169,126,0.1);
    }

    .sidebar-header .material-icons { color: var(--gold); font-size: 28px; }

    .brand {
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
      color: var(--gold);
      white-space: nowrap;
    }

    .sidebar-nav {
      flex: 1;
      padding: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .sidebar-nav a, .nav-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 20px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      white-space: nowrap;
      border: none;
      background: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      font-family: 'Poppins', sans-serif;
    }

    .sidebar-nav a:hover, .nav-link:hover { color: var(--gold); background: rgba(200,169,126,0.05); }
    .sidebar-nav a.active { color: var(--gold); background: rgba(200,169,126,0.1); border-right: 3px solid var(--gold); }
    .sidebar-nav a .material-icons, .nav-link .material-icons { font-size: 20px; min-width: 20px; }

    .sidebar-footer {
      padding: 10px 0;
      border-top: 1px solid rgba(200,169,126,0.1);
    }

    .logout-btn { color: var(--danger) !important; }

    .main-area {
      flex: 1;
      margin-left: 250px;
      transition: margin-left 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .sidebar.collapsed + .main-area { margin-left: 70px; }

    .top-bar {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 30px;
      background: var(--secondary-dark);
      border-bottom: 1px solid rgba(200,169,126,0.1);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .toggle-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
    }

    .toggle-btn .material-icons { color: var(--text-muted); font-size: 24px; }

    .page-title {
      color: var(--text-light);
      font-size: 0.95rem;
      font-weight: 500;
    }

    .content {
      flex: 1;
      padding: 30px;
    }

    @media (max-width: 768px) {
      .sidebar { width: 70px; }
      .sidebar .brand, .sidebar-nav span:not(.material-icons), .sidebar-footer span:not(.material-icons) { display: none; }
      .main-area { margin-left: 70px; }
      .content { padding: 15px; }
    }
  `]
})
export class AdminLayoutComponent {
  private admin = inject(AdminService);
  private router = inject(Router);
  collapsed = signal(false);

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }

  logout() {
    this.admin.logout();
    this.router.navigate(['/admin/login']);
  }
}

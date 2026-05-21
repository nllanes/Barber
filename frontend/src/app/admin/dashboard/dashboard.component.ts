import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { DashboardStats } from '../../models/interfaces';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <h2>Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card" routerLink="/admin/services">
        <span class="material-icons">content_cut</span>
        <div class="stat-info">
          <span class="stat-number">{{ stats()?.totalServices ?? 0 }}</span>
          <span class="stat-label">Servicios</span>
        </div>
      </div>
      <div class="stat-card" routerLink="/admin/barbers">
        <span class="material-icons">people</span>
        <div class="stat-info">
          <span class="stat-number">{{ stats()?.totalBarbers ?? 0 }}</span>
          <span class="stat-label">Barberos</span>
        </div>
      </div>
      <div class="stat-card" routerLink="/admin/gallery">
        <span class="material-icons">photo_library</span>
        <div class="stat-info">
          <span class="stat-number">{{ stats()?.totalGalleryImages ?? 0 }}</span>
          <span class="stat-label">Imágenes</span>
        </div>
      </div>
      <div class="stat-card" routerLink="/admin/appointments">
        <span class="material-icons">event</span>
        <div class="stat-info">
          <span class="stat-number">{{ stats()?.pendingAppointments ?? 0 }}</span>
          <span class="stat-label">Citas Pendientes</span>
        </div>
      </div>
      <div class="stat-card" routerLink="/admin/appointments">
        <span class="material-icons">calendar_month</span>
        <div class="stat-info">
          <span class="stat-number">{{ stats()?.totalAppointments ?? 0 }}</span>
          <span class="stat-label">Total Citas</span>
        </div>
      </div>
      <div class="stat-card" routerLink="/admin/messages">
        <span class="material-icons">mark_email_unread</span>
        <div class="stat-info">
          <span class="stat-number">{{ stats()?.unreadMessages ?? 0 }}</span>
          <span class="stat-label">Mensajes sin leer</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h2 {
      font-size: 1.8rem;
      margin-bottom: 30px;
      color: var(--text-light);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: var(--secondary-dark);
      border: 1px solid rgba(200,169,126,0.1);
      border-radius: 10px;
      padding: 25px;
      display: flex;
      align-items: center;
      gap: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      border-color: var(--gold);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }

    .stat-card .material-icons {
      font-size: 40px;
      color: var(--gold);
      opacity: 0.8;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-light);
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private admin = inject(AdminService);
  stats = signal<DashboardStats | null>(null);

  ngOnInit() {
    this.admin.getStats().subscribe(s => this.stats.set(s));
  }
}

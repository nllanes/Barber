import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { Service } from '../../models/interfaces';

@Component({
  selector: 'app-services',
  imports: [CurrencyPipe],
  template: `
    <section id="services" class="section services-section">
      <div class="container">
        <div class="section-title">
          <h2>{{ i18n.t('services.title') }}</h2>
          <div class="accent-line"></div>
          <p>{{ i18n.t('services.subtitle') }}</p>
        </div>

        <div class="services-grid">
          @for (service of services(); track service.id) {
            <div class="service-card">
              <div class="service-icon">
                <span class="material-icons">{{ service.icon }}</span>
              </div>
              <h3>{{ i18n.t('service.' + service.id + '.name') }}</h3>
              <p>{{ i18n.t('service.' + service.id + '.desc') }}</p>
              <div class="service-meta">
                <span class="price">{{ service.price | currency:'USD' }}</span>
                <span class="duration">{{ service.durationMinutes }} {{ i18n.t('services.min') }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .services-section { background: var(--secondary-dark); }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
    }

    .service-card {
      background: var(--tertiary-dark);
      padding: 40px 30px;
      border-radius: 8px;
      text-align: center;
      transition: all 0.4s ease;
      border: 1px solid transparent;
    }

    .service-card:hover {
      transform: translateY(-8px);
      border-color: var(--gold);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .service-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: rgba(200, 169, 126, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      transition: all 0.3s ease;
    }

    .service-card:hover .service-icon { background: var(--gold); }

    .service-icon .material-icons {
      font-size: 30px;
      color: var(--gold);
      transition: color 0.3s ease;
    }

    .service-card:hover .service-icon .material-icons { color: var(--primary-dark); }

    h3 {
      font-size: 1.3rem;
      margin-bottom: 12px;
      color: var(--text-light);
    }

    p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .service-meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .price {
      font-family: 'Playfair Display', serif;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--gold);
    }

    .duration {
      display: flex;
      align-items: center;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .services-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ServicesComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(TranslationService);
  services = signal<Service[]>([]);

  ngOnInit() {
    this.api.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: () => {
        this.services.set([
          { id: 1, name: 'Corte Clásico', description: '', price: 15, durationMinutes: 30, icon: 'content_cut', isActive: true },
          { id: 2, name: 'Corte + Barba', description: '', price: 25, durationMinutes: 45, icon: 'face', isActive: true },
          { id: 3, name: 'Afeitado Clásico', description: '', price: 12, durationMinutes: 25, icon: 'spa', isActive: true },
          { id: 4, name: 'Diseño de Barba', description: '', price: 18, durationMinutes: 30, icon: 'design_services', isActive: true },
          { id: 5, name: 'Corte Infantil', description: '', price: 10, durationMinutes: 20, icon: 'child_care', isActive: true },
          { id: 6, name: 'Tratamiento Capilar', description: '', price: 30, durationMinutes: 40, icon: 'auto_awesome', isActive: true }
        ]);
      }
    });
  }
}

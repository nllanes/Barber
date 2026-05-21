import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { Barber, BarberPortfolioImage } from '../../models/interfaces';
import { AssetUrlPipe } from '../../shared/asset-url.pipe';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [AssetUrlPipe],
  template: `
    <section id="team" class="section team-section">
      <div class="container">
        <div class="section-title">
          <h2>{{ i18n.t('team.title') }}</h2>
          <div class="accent-line"></div>
          <p>{{ i18n.t('team.subtitle') }}</p>
        </div>

        <div class="team-grid">
          @for (barber of barbers(); track barber.id) {
            <div class="team-card">
              <div class="team-image">
                @if (barber.imageUrl) {
                  <img [src]="barber.imageUrl | assetUrl" [alt]="barber.name" class="team-photo">
                } @else {
                  <div class="team-avatar">
                    <span class="material-icons">person</span>
                  </div>
                }
              </div>
              <div class="team-info">
                <h3>{{ barber.name }}</h3>
                <span class="specialty">{{ i18n.t('barber.' + barber.id + '.specialty') }}</span>
                <div class="team-social">
                  <a href="#"><span class="material-icons">tag</span></a>
                  <a href="#"><span class="material-icons">alternate_email</span></a>
                </div>
                @if (portfolioFor(barber.id).length) {
                  <div class="barber-portfolio">
                    <span class="portfolio-label">{{ i18n.t('team.portfolio') }}</span>
                    <div class="portfolio-strip">
                      @for (img of portfolioFor(barber.id).slice(0, 4); track img.id) {
                        <img [src]="img.imageUrl | assetUrl" [alt]="img.caption || ''" [title]="img.caption || ''">
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .team-section { background: var(--secondary-dark); }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      max-width: 960px;
      margin: 0 auto;
    }

    .team-card {
      background: var(--tertiary-dark);
      border-radius: 8px;
      overflow: hidden;
      text-align: center;
      transition: transform 0.3s ease;
    }

    .team-card:hover { transform: translateY(-8px); }

    .team-image { padding: 40px 0 20px; }

    .team-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(200, 169, 126, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      border: 3px solid var(--gold);
    }

    .team-avatar .material-icons { font-size: 50px; color: var(--gold); }

    .team-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--gold);
      margin: 0 auto;
      display: block;
    }

    .team-info { padding: 20px 30px 30px; }

    h3 { font-size: 1.3rem; margin-bottom: 8px; color: var(--text-light); }

    .specialty {
      color: var(--gold);
      font-size: 0.9rem;
      display: block;
      margin-bottom: 15px;
    }

    .team-social { display: flex; justify-content: center; gap: 15px; }

    .team-social a {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(200, 169, 126, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .team-social a:hover { background: var(--gold); }

    .team-social .material-icons {
      font-size: 18px;
      color: var(--gold);
      transition: color 0.3s ease;
    }

    .team-social a:hover .material-icons { color: var(--primary-dark); }

    .barber-portfolio { margin-top: 18px; text-align: left; padding: 0 12px 16px; }
    .portfolio-label { font-size: 0.7rem; color: var(--gold); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
    .portfolio-strip { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .portfolio-strip img {
      width: 56px; height: 56px; object-fit: cover; border-radius: 6px;
      border: 1px solid rgba(200,169,126,0.25);
    }
  `]
})
export class TeamComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(TranslationService);
  barbers = signal<Barber[]>([]);
  portfolios = signal<Record<number, BarberPortfolioImage[]>>({});

  portfolioFor(id: number): BarberPortfolioImage[] {
    return this.portfolios()[id] ?? [];
  }

  ngOnInit() {
    this.api.getBarbers().subscribe({
      next: (data) => {
        this.barbers.set(data);
        if (!data.length) return;
        forkJoin(
          data.map(b =>
            this.api.getBarberPortfolio(b.id).pipe(
              catchError(() => of([] as BarberPortfolioImage[])),
              map(imgs => ({ id: b.id, imgs }))
            )
          )
        ).subscribe(rows => {
          const m: Record<number, BarberPortfolioImage[]> = {};
          rows.forEach(r => { m[r.id] = r.imgs; });
          this.portfolios.set(m);
        });
      },
      error: () => {
        this.barbers.set([
          { id: 1, name: 'Carlos Méndez', specialty: 'Cortes Modernos', imageUrl: '', phone: '', email: '', cutDurationMinutes: 30, isActive: true },
          { id: 2, name: 'Miguel Torres', specialty: 'Barbas y Afeitados', imageUrl: '', phone: '', email: '', cutDurationMinutes: 40, isActive: true },
          { id: 3, name: 'Andrés López', specialty: 'Cortes Clásicos', imageUrl: '', phone: '', email: '', cutDurationMinutes: 35, isActive: true }
        ]);
      }
    });
  }
}

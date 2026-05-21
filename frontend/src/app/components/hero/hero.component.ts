import { Component, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-hero',
  template: `
    <section id="hero" class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-badge">{{ i18n.t('hero.welcome') }}</span>
        <h1>BarberShop <span class="gold">Elite</span></h1>
        <p>{{ i18n.t('hero.subtitle') }}</p>
        <div class="hero-actions">
          <a href="#booking" class="btn btn-primary">{{ i18n.t('hero.cta') }}</a>
          <a href="#services" class="btn btn-outline">{{ i18n.t('hero.cta2') }}</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{{ i18n.t('hero.stat1.number') }}</span>
            <span class="stat-label">{{ i18n.t('hero.stat1.label') }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ i18n.t('hero.stat2.number') }}</span>
            <span class="stat-label">{{ i18n.t('hero.stat2.label') }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ i18n.t('hero.stat3.number') }}</span>
            <span class="stat-label">{{ i18n.t('hero.stat3.label') }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        linear-gradient(135deg, rgba(15,15,15,0.9) 0%, rgba(26,26,26,0.85) 100%),
        url('https://images.unsplash.com/photo-1585747860019-8e8ef2b6bc8b?w=1920&q=80') center/cover no-repeat;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 30% 50%, rgba(200,169,126,0.08) 0%, transparent 60%);
    }

    .hero-content {
      position: relative;
      text-align: center;
      max-width: 800px;
      padding: 0 20px;
    }

    .hero-badge {
      display: inline-block;
      font-size: 0.85rem;
      letter-spacing: 4px;
      color: var(--gold);
      margin-bottom: 20px;
      font-weight: 500;
    }

    h1 {
      font-size: 4.5rem;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 25px;
    }

    .gold { color: var(--gold); }

    p {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 550px;
      margin: 0 auto 40px;
      line-height: 1.8;
    }

    .hero-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 60px;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 60px;
      padding-top: 40px;
      border-top: 1px solid rgba(200, 169, 126, 0.2);
    }

    .stat { text-align: center; }

    .stat-number {
      display: block;
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gold);
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      h1 { font-size: 2.8rem; }
      .hero-stats { gap: 30px; }
      .stat-number { font-size: 1.8rem; }
    }
  `]
})
export class HeroComponent {
  i18n = inject(TranslationService);
}

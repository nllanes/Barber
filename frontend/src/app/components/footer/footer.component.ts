import { Component, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="material-icons">content_cut</span>
              <span class="logo-text">BarberShop <span class="gold">Elite</span></span>
            </div>
            <p>{{ i18n.t('footer.desc') }}</p>
          </div>

          <div class="footer-links">
            <h4>{{ i18n.t('footer.links') }}</h4>
            <a href="#hero">{{ i18n.t('nav.home') }}</a>
            <a href="#services">{{ i18n.t('nav.services') }}</a>
            <a href="#gallery">{{ i18n.t('nav.gallery') }}</a>
            <a href="#booking">{{ i18n.t('nav.booking') }}</a>
          </div>

          <div class="footer-links">
            <h4>{{ i18n.t('footer.schedule') }}</h4>
            <p>{{ i18n.t('footer.weekdays') }}</p>
            <p class="gold-text">{{ i18n.t('footer.weekdays.hours') }}</p>
            <p>{{ i18n.t('footer.saturday') }}</p>
            <p class="gold-text">{{ i18n.t('footer.saturday.hours') }}</p>
          </div>

          <div class="footer-links">
            <h4>{{ i18n.t('footer.follow') }}</h4>
            <div class="social-links">
              <a href="#" aria-label="Instagram"><span class="material-icons">photo_camera</span></a>
              <a href="#" aria-label="Facebook"><span class="material-icons">thumb_up</span></a>
              <a href="#" aria-label="WhatsApp"><span class="material-icons">chat</span></a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} BarberShop Elite. {{ i18n.t('footer.rights') }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--secondary-dark);
      padding: 60px 0 0;
      border-top: 1px solid rgba(200, 169, 126, 0.15);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
      padding-bottom: 40px;
    }

    .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
    .footer-logo .material-icons { color: var(--gold); font-size: 24px; }

    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      color: var(--text-light);
    }

    .gold { color: var(--gold); }

    .footer-brand p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.7; }

    .footer-links h4 {
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-light);
      margin-bottom: 20px;
    }

    .footer-links a, .footer-links p {
      display: block;
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 10px;
      transition: color 0.3s ease;
    }

    .footer-links a:hover { color: var(--gold); }
    .gold-text { color: var(--gold) !important; }

    .social-links { display: flex; gap: 12px; }

    .social-links a {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(200, 169, 126, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .social-links a:hover { background: var(--gold); }
    .social-links .material-icons { font-size: 18px; color: var(--gold); transition: color 0.3s ease; }
    .social-links a:hover .material-icons { color: var(--primary-dark); }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 20px 0;
      text-align: center;
    }

    .footer-bottom p { color: var(--text-dim); font-size: 0.85rem; }

    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 30px; }
    }

    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {
  i18n = inject(TranslationService);
  currentYear = new Date().getFullYear();
}

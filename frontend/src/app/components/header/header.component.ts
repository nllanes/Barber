import { Component, HostListener, signal, inject } from '@angular/core';
import { TranslationService, Lang } from '../../services/translation.service';

@Component({
  selector: 'app-header',
  template: `
    <header [class.scrolled]="isScrolled()">
      <div class="header-container">
        <a href="#hero" class="logo">
          <span class="logo-icon material-icons">content_cut</span>
          <span class="logo-text">BarberShop <span class="gold">Elite</span></span>
        </a>

        <nav [class.active]="menuOpen()">
          <a href="#hero" (click)="closeMenu()">{{ i18n.t('nav.home') }}</a>
          <a href="#services" (click)="closeMenu()">{{ i18n.t('nav.services') }}</a>
          <a href="#gallery" (click)="closeMenu()">{{ i18n.t('nav.gallery') }}</a>
          <a href="#team" (click)="closeMenu()">{{ i18n.t('nav.team') }}</a>
          <a href="#booking" (click)="closeMenu()">{{ i18n.t('nav.booking') }}</a>
          <a href="#contact" (click)="closeMenu()">{{ i18n.t('nav.contact') }}</a>
          <a href="/barber/login" (click)="closeMenu()">{{ i18n.t('nav.barber') }}</a>
        </nav>

        <div class="header-right">
          <button class="lang-toggle" (click)="toggleLang()" [attr.aria-label]="'Switch language'">
            {{ i18n.lang() === 'es' ? 'EN' : 'ES' }}
          </button>
          <button class="menu-toggle" (click)="toggleMenu()" [attr.aria-label]="'Menú'">
            <span class="material-icons">{{ menuOpen() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      padding: 20px 0;
      transition: all 0.3s ease;
      background: transparent;
    }

    header.scrolled {
      background: rgba(15, 15, 15, 0.95);
      backdrop-filter: blur(10px);
      padding: 12px 0;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }

    .logo-icon {
      color: var(--gold);
      font-size: 28px;
    }

    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      color: var(--text-light);
      font-weight: 600;
    }

    .gold { color: var(--gold); }

    nav {
      display: flex;
      gap: 30px;
    }

    nav a {
      color: var(--text-light);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      transition: color 0.3s ease;
      position: relative;
    }

    nav a::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--gold);
      transition: width 0.3s ease;
    }

    nav a:hover { color: var(--gold); }
    nav a:hover::after { width: 100%; }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .lang-toggle {
      background: rgba(200, 169, 126, 0.15);
      border: 1px solid var(--gold);
      color: var(--gold);
      padding: 6px 14px;
      border-radius: 4px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 1px;
      transition: all 0.3s ease;
    }

    .lang-toggle:hover {
      background: var(--gold);
      color: var(--primary-dark);
    }

    .menu-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
    }

    .menu-toggle .material-icons {
      color: var(--gold);
      font-size: 28px;
    }

    @media (max-width: 768px) {
      .menu-toggle { display: block; }

      nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 70%;
        height: 100vh;
        background: var(--secondary-dark);
        flex-direction: column;
        padding: 80px 40px;
        gap: 25px;
        transition: right 0.3s ease;
      }

      nav.active { right: 0; }
    }
  `]
})
export class HeaderComponent {
  i18n = inject(TranslationService);
  isScrolled = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  toggleLang() {
    this.i18n.setLang(this.i18n.lang() === 'es' ? 'en' : 'es');
  }
}

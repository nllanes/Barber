import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  template: `
    <section id="contact" class="section contact-section">
      <div class="container">
        <div class="section-title">
          <h2>{{ i18n.t('contact.title') }}</h2>
          <div class="accent-line"></div>
          <p>{{ i18n.t('contact.subtitle') }}</p>
        </div>

        <div class="contact-grid">
          <div class="contact-info">
            <div class="info-item">
              <span class="material-icons">location_on</span>
              <div>
                <h4>{{ i18n.t('contact.location') }}</h4>
                <p>{{ i18n.t('contact.address') }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="material-icons">schedule</span>
              <div>
                <h4>{{ i18n.t('contact.hours') }}</h4>
                <p>{{ i18n.t('contact.hours.weekdays') }}</p>
                <p>{{ i18n.t('contact.hours.saturday') }}</p>
                <p>{{ i18n.t('contact.hours.sunday') }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="material-icons">phone</span>
              <div>
                <h4>{{ i18n.t('contact.phone') }}</h4>
                <p>+1 (234) 567-8900</p>
              </div>
            </div>
            <div class="info-item">
              <span class="material-icons">email</span>
              <div>
                <h4>{{ i18n.t('contact.email.label') }}</h4>
                <p>info&#64;barbershopelite.com</p>
              </div>
            </div>
          </div>

          <div class="contact-form-wrapper">
            @if (sent()) {
              <div class="success-msg">
                <span class="material-icons">mark_email_read</span>
                <p>{{ i18n.t('contact.success') }}</p>
              </div>
            } @else {
              <form (ngSubmit)="onSubmit()" class="contact-form">
                <div class="form-group">
                  <input type="text" [(ngModel)]="form.name" name="name" [placeholder]="i18n.t('contact.form.name')" required>
                </div>
                <div class="form-group">
                  <input type="email" [(ngModel)]="form.email" name="email" [placeholder]="i18n.t('contact.form.email')" required>
                </div>
                <div class="form-group">
                  <input type="tel" [(ngModel)]="form.phone" name="phone" [placeholder]="i18n.t('contact.form.phone')">
                </div>
                <div class="form-group">
                  <textarea [(ngModel)]="form.message" name="message" [placeholder]="i18n.t('contact.form.message')" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">{{ i18n.t('contact.form.submit') }}</button>
              </form>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-section { background: var(--secondary-dark); }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }

    .info-item { display: flex; gap: 20px; margin-bottom: 30px; }
    .info-item .material-icons { font-size: 28px; color: var(--gold); margin-top: 4px; }

    .info-item h4 {
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-light);
      margin-bottom: 5px;
    }

    .info-item p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; }

    .contact-form { display: flex; flex-direction: column; gap: 15px; }

    input, textarea {
      padding: 14px 16px;
      background: var(--tertiary-dark);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: var(--text-light);
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      transition: border-color 0.3s ease;
      width: 100%;
    }

    input:focus, textarea:focus { outline: none; border-color: var(--gold); }
    input::placeholder, textarea::placeholder { color: var(--text-dim); }
    textarea { resize: vertical; min-height: 120px; }
    .btn { width: 100%; }

    .success-msg {
      text-align: center;
      padding: 60px 20px;
      background: var(--tertiary-dark);
      border-radius: 12px;
    }

    .success-msg .material-icons { font-size: 48px; color: var(--success); margin-bottom: 15px; }
    .success-msg p { color: var(--text-muted); font-size: 1.1rem; }

    @media (max-width: 768px) {
      .contact-grid { grid-template-columns: 1fr; gap: 40px; }
    }
  `]
})
export class ContactComponent {
  private api = inject(ApiService);
  i18n = inject(TranslationService);
  sent = signal(false);

  form = { name: '', email: '', phone: '', message: '' };

  onSubmit() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.api.sendContactMessage(this.form).subscribe({
      next: () => this.sent.set(true),
      error: () => this.sent.set(true)
    });
  }
}

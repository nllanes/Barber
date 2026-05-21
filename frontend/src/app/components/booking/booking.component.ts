import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { TranslationService } from '../../services/translation.service';
import { Service, Barber } from '../../models/interfaces';

@Component({
  selector: 'app-booking',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <section id="booking" class="section booking-section">
      <div class="container">
        <div class="section-title">
          <h2>{{ i18n.t('booking.title') }}</h2>
          <div class="accent-line"></div>
          <p>{{ i18n.t('booking.subtitle') }}</p>
        </div>

        <div class="booking-wrapper">
          @if (submitted()) {
            <div class="success-message">
              <span class="material-icons">check_circle</span>
              <h3>{{ i18n.t('booking.success.title') }}</h3>
              <p>{{ i18n.t('booking.success.msg') }}</p>
              <button class="btn btn-outline" (click)="resetForm()">{{ i18n.t('booking.success.btn') }}</button>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()" class="booking-form">
              <div class="form-row">
                <div class="form-group">
                  <label>{{ i18n.t('booking.name') }}</label>
                  <input type="text" [(ngModel)]="form.clientName" name="clientName" [placeholder]="i18n.t('booking.name.ph')" required>
                </div>
                <div class="form-group">
                  <label>{{ i18n.t('booking.phone') }}</label>
                  <input type="tel" [(ngModel)]="form.clientPhone" name="clientPhone" [placeholder]="i18n.t('booking.phone.ph')" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>{{ i18n.t('booking.email') }}</label>
                  <input type="email" [(ngModel)]="form.clientEmail" name="clientEmail" [placeholder]="i18n.t('booking.email.ph')" required>
                </div>
                <div class="form-group">
                  <label>{{ i18n.t('booking.date') }}</label>
                  <input type="datetime-local" [(ngModel)]="form.appointmentDate" name="appointmentDate" (ngModelChange)="onBookingFieldChange()" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>{{ i18n.t('booking.service') }}</label>
                  <select [(ngModel)]="form.serviceId" name="serviceId" (ngModelChange)="onBookingFieldChange()" required>
                    <option [ngValue]="0" disabled>{{ i18n.t('booking.service.ph') }}</option>
                    @for (service of services(); track service.id) {
                      <option [ngValue]="service.id">{{ i18n.t('service.' + service.id + '.name') }} - {{ service.price | currency:'USD' }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ i18n.t('booking.barber') }}</label>
                  <select [(ngModel)]="form.barberId" name="barberId" (ngModelChange)="onBookingFieldChange()" required>
                    <option [ngValue]="0" disabled>{{ i18n.t('booking.barber.ph') }}</option>
                    @for (barber of barbers(); track barber.id) {
                      <option [ngValue]="barber.id">{{ barber.name }} - {{ i18n.t('barber.' + barber.id + '.specialty') }}</option>
                    }
                  </select>
                </div>
              </div>

              @if (availabilityStatus() === 'unavailable') {
                <div class="availability-msg unavailable">
                  <span class="material-icons">error_outline</span>
                  {{ i18n.t('booking.unavailable') }}
                </div>
              }
              @if (availabilityStatus() === 'schedule') {
                <div class="availability-msg unavailable">
                  <span class="material-icons">event_busy</span>
                  {{ i18n.t('booking.scheduleBlock') }}
                </div>
              }
              @if (availabilityStatus() === 'available') {
                <div class="availability-msg available">
                  <span class="material-icons">check_circle</span>
                  {{ i18n.t('booking.available') }}
                </div>
              }
              @if (availabilityStatus() === 'checking') {
                <div class="availability-msg checking">
                  <span class="material-icons">hourglass_empty</span>
                  {{ i18n.t('booking.checking') }}
                </div>
              }

              @if (submitError()) {
                <div class="availability-msg error">
                  <span class="material-icons">error_outline</span>
                  {{ submitError() }}
                </div>
              }

              <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading() || availabilityStatus() !== 'available'">
                @if (loading()) {
                  {{ i18n.t('booking.loading') }}
                } @else {
                  {{ i18n.t('booking.submit') }}
                }
              </button>
            </form>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .booking-section {
      background:
        linear-gradient(135deg, rgba(15,15,15,0.95) 0%, rgba(26,26,26,0.95) 100%),
        url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1920&q=60') center/cover no-repeat;
    }

    .booking-wrapper { max-width: 700px; margin: 0 auto; }

    .booking-form {
      background: var(--secondary-dark);
      padding: 40px;
      border-radius: 12px;
      border: 1px solid rgba(200, 169, 126, 0.15);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group { display: flex; flex-direction: column; }

    label {
      font-size: 0.85rem;
      color: var(--gold);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 500;
    }

    input, select {
      padding: 14px 16px;
      background: var(--tertiary-dark);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: var(--text-light);
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      transition: border-color 0.3s ease;
    }

    input:focus, select:focus { outline: none; border-color: var(--gold); }
    input::placeholder { color: var(--text-dim); }

    select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c8a97e' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
    }

    select option { background: var(--secondary-dark); color: var(--text-light); }

    .submit-btn { width: 100%; margin-top: 10px; padding: 16px; font-size: 1rem; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .success-message {
      text-align: center;
      background: var(--secondary-dark);
      padding: 60px 40px;
      border-radius: 12px;
      border: 1px solid rgba(200, 169, 126, 0.2);
    }

    .success-message .material-icons { font-size: 64px; color: var(--success); margin-bottom: 20px; }
    .success-message h3 { font-size: 2rem; margin-bottom: 10px; }
    .success-message p { color: var(--text-muted); margin-bottom: 30px; }

    .availability-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .availability-msg .material-icons { font-size: 20px; }

    .availability-msg.available {
      background: rgba(76, 175, 80, 0.12);
      color: #66bb6a;
      border: 1px solid rgba(76, 175, 80, 0.25);
    }

    .availability-msg.unavailable {
      background: rgba(244, 67, 54, 0.12);
      color: #ef5350;
      border: 1px solid rgba(244, 67, 54, 0.25);
    }

    .availability-msg.checking {
      background: rgba(255, 193, 7, 0.12);
      color: #ffca28;
      border: 1px solid rgba(255, 193, 7, 0.25);
    }

    .availability-msg.error {
      background: rgba(244, 67, 54, 0.12);
      color: #ef5350;
      border: 1px solid rgba(244, 67, 54, 0.25);
    }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .booking-form { padding: 25px; }
    }
  `]
})
export class BookingComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(TranslationService);

  services = signal<Service[]>([]);
  barbers = signal<Barber[]>([]);
  loading = signal(false);
  submitted = signal(false);
  submitError = signal<string | null>(null);
  availabilityStatus = signal<'idle' | 'checking' | 'available' | 'unavailable' | 'schedule' | 'error'>('idle');

  private checkTimer: any;

  form = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: 0,
    barberId: 0,
    appointmentDate: ''
  };

  ngOnInit() {
    this.api.getServices().subscribe({
      next: (d) => this.services.set(d),
      error: () => this.services.set([
        { id: 1, name: '', description: '', price: 15, durationMinutes: 30, icon: '', isActive: true },
        { id: 2, name: '', description: '', price: 25, durationMinutes: 45, icon: '', isActive: true },
        { id: 3, name: '', description: '', price: 12, durationMinutes: 25, icon: '', isActive: true },
      ])
    });
    this.api.getBarbers().subscribe({
      next: (d) => this.barbers.set(d),
      error: () => this.barbers.set([
        { id: 1, name: 'Carlos Méndez', specialty: '', imageUrl: '', phone: '', email: '', cutDurationMinutes: 30, isActive: true },
        { id: 2, name: 'Miguel Torres', specialty: '', imageUrl: '', phone: '', email: '', cutDurationMinutes: 40, isActive: true },
        { id: 3, name: 'Andrés López', specialty: '', imageUrl: '', phone: '', email: '', cutDurationMinutes: 35, isActive: true },
      ])
    });
  }

  onBookingFieldChange() {
    clearTimeout(this.checkTimer);
    this.submitError.set(null);
    const { barberId, serviceId, appointmentDate } = this.form;
    if (!barberId || !serviceId || !appointmentDate) {
      this.availabilityStatus.set('idle');
      return;
    }
    this.availabilityStatus.set('checking');
    this.checkTimer = setTimeout(() => {
      this.api.checkAvailability(+barberId, appointmentDate, +serviceId).subscribe({
        next: (res) => {
          if (res.available) this.availabilityStatus.set('available');
          else if (res.reason === 'barber_schedule') this.availabilityStatus.set('schedule');
          else this.availabilityStatus.set('unavailable');
        },
        error: () => this.availabilityStatus.set('error')
      });
    }, 400);
  }

  onSubmit() {
    if (!this.form.clientName || !this.form.appointmentDate || !this.form.serviceId || !this.form.barberId) return;
    if (this.availabilityStatus() !== 'available') return;
    this.submitError.set(null);
    this.loading.set(true);
    const payload = {
      ...this.form,
      serviceId: Number(this.form.serviceId),
      barberId: Number(this.form.barberId)
    };
    this.api.createAppointment(payload).subscribe({
      next: () => {
        this.submitted.set(true);
        this.loading.set(false);
      },
      error: (err: { status?: number; error?: { error?: string } }) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.availabilityStatus.set('unavailable');
        } else if (err.status === 400 && typeof err.error?.error === 'string') {
          this.submitError.set(err.error.error);
        } else {
          this.submitError.set(this.i18n.t('booking.submitError'));
        }
      }
    });
  }

  resetForm() {
    this.form = { clientName: '', clientPhone: '', clientEmail: '', serviceId: 0, barberId: 0, appointmentDate: '' };
    this.submitted.set(false);
    this.submitError.set(null);
    this.availabilityStatus.set('idle');
  }
}

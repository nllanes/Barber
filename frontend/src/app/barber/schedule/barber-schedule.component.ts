import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../services/barber.service';
import { BarberUnavailableRule } from '../../models/interfaces';

@Component({
  selector: 'app-barber-schedule',
  imports: [FormsModule],
  template: `
    <p class="intro">
      Define días u horas en los que <strong>no</strong> aceptarás citas. Los clientes no podrán reservar en esos huecos.
    </p>

    <div class="form-card">
      <h3>Nueva regla</h3>
      <div class="form-row">
        <label>Tipo</label>
        <select [(ngModel)]="form.mode" name="mode">
          <option value="Weekly">Cada semana (mismo día)</option>
          <option value="SingleDate">Un día concreto</option>
          <option value="DateRange">Varios días seguidos (vacaciones)</option>
        </select>
      </div>

      @if (form.mode === 'Weekly') {
        <div class="form-row">
          <label>Día de la semana</label>
          <select [(ngModel)]="form.dayOfWeek" name="dow">
            @for (d of weekDays; track d.v) {
              <option [ngValue]="d.v">{{ d.label }}</option>
            }
          </select>
        </div>
      }

      @if (form.mode === 'SingleDate') {
        <div class="form-row">
          <label>Fecha</label>
          <input type="date" [(ngModel)]="form.singleDate" name="sd">
        </div>
      }

      @if (form.mode === 'DateRange') {
        <div class="form-row two">
          <div>
            <label>Desde</label>
            <input type="date" [(ngModel)]="form.rangeStart" name="rs">
          </div>
          <div>
            <label>Hasta</label>
            <input type="date" [(ngModel)]="form.rangeEnd" name="re">
          </div>
        </div>
      }

      <div class="form-row">
        <label>
          <input type="checkbox" [(ngModel)]="form.allDay" name="ad"> Todo el día
        </label>
      </div>

      @if (!form.allDay) {
        <div class="form-row two">
          <div>
            <label>Desde (hora)</label>
            <input type="time" [(ngModel)]="form.startTime" name="st">
          </div>
          <div>
            <label>Hasta (hora)</label>
            <input type="time" [(ngModel)]="form.endTime" name="et">
          </div>
        </div>
      }

      <button type="button" class="btn-save" (click)="save()">Guardar regla</button>
    </div>

    <h3>Tus reglas</h3>
    <ul class="rule-list">
      @for (r of rules(); track r.id) {
        <li>
          <span class="rule-text">{{ describeRule(r) }}</span>
          <button type="button" class="btn-del" (click)="remove(r.id)">Quitar</button>
        </li>
      } @empty {
        <li class="empty">No hay reglas. Aceptarás citas en cualquier horario (salvo solapes con otras citas).</li>
      }
    </ul>
  `,
  styles: [`
    .intro { color: var(--text-muted); margin: 0 0 20px; line-height: 1.55; max-width: 720px; }
    .form-card {
      background: var(--secondary-dark);
      border: 1px solid rgba(200,169,126,0.12);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 28px;
    }
    h3 { margin: 0 0 14px; color: var(--gold); font-size: 1rem; }
    .form-row { margin-bottom: 14px; }
    .form-row.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: block; font-size: 0.8rem; color: var(--gold); margin-bottom: 6px; text-transform: uppercase; }
    select, input[type="date"], input[type="time"] {
      width: 100%; max-width: 320px; padding: 10px 12px;
      background: var(--tertiary-dark); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px; color: var(--text-light); font-family: 'Poppins', sans-serif;
    }
    .btn-save {
      padding: 10px 22px; margin-top: 8px;
      background: var(--gold); color: var(--primary-dark); border: none; border-radius: 6px;
      font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
    }
    .rule-list { list-style: none; padding: 0; margin: 0; }
    .rule-list li {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 12px 14px; background: var(--secondary-dark);
      border: 1px solid rgba(200,169,126,0.08); border-radius: 8px; margin-bottom: 8px;
    }
    .rule-text { font-size: 0.9rem; color: var(--text-light); }
    .btn-del {
      flex-shrink: 0; padding: 6px 12px; font-size: 0.8rem;
      background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.35);
      border-radius: 6px; cursor: pointer;
    }
    .empty { color: var(--text-muted); font-style: italic; }
  `]
})
export class BarberScheduleComponent implements OnInit {
  private barber = inject(BarberService);
  rules = signal<BarberUnavailableRule[]>([]);

  weekDays = [
    { v: 0, label: 'Domingo' },
    { v: 1, label: 'Lunes' },
    { v: 2, label: 'Martes' },
    { v: 3, label: 'Miércoles' },
    { v: 4, label: 'Jueves' },
    { v: 5, label: 'Viernes' },
    { v: 6, label: 'Sábado' }
  ];

  form = {
    mode: 'Weekly' as 'Weekly' | 'SingleDate' | 'DateRange',
    dayOfWeek: 0,
    singleDate: '',
    rangeStart: '',
    rangeEnd: '',
    allDay: true,
    startTime: '09:00',
    endTime: '14:00'
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.barber.getUnavailableRules().subscribe(d => this.rules.set(d));
  }

  private timeToMin(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private minToLabel(m: number): string {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }

  describeRule(r: BarberUnavailableRule): string {
    const dayName = this.weekDays.find(x => x.v === r.dayOfWeek)?.label ?? '';
    if (r.mode === 'Weekly') {
      if (r.allDay) return `Cada ${dayName} — todo el día`;
      return `Cada ${dayName} — ${this.minToLabel(r.startTimeMinutes ?? 0)} a ${this.minToLabel(r.endTimeMinutes ?? 0)}`;
    }
    if (r.mode === 'SingleDate') {
      const d = r.date ? new Date(r.date).toLocaleDateString() : '';
      if (r.allDay) return `${d} — todo el día`;
      return `${d} — ${this.minToLabel(r.startTimeMinutes ?? 0)} a ${this.minToLabel(r.endTimeMinutes ?? 0)}`;
    }
    const a = r.date ? new Date(r.date).toLocaleDateString() : '';
    const b = r.rangeEnd ? new Date(r.rangeEnd).toLocaleDateString() : '';
    if (r.allDay) return `Del ${a} al ${b} — todo el día`;
    return `Del ${a} al ${b} — ${this.minToLabel(r.startTimeMinutes ?? 0)} a ${this.minToLabel(r.endTimeMinutes ?? 0)}`;
  }

  save() {
    const body: Record<string, unknown> = {
      mode: this.form.mode,
      allDay: this.form.allDay,
      dayOfWeek: null,
      date: null,
      rangeEnd: null,
      startTimeMinutes: null,
      endTimeMinutes: null
    };

    if (this.form.mode === 'Weekly') {
      body['dayOfWeek'] = +this.form.dayOfWeek;
    } else if (this.form.mode === 'SingleDate') {
      if (!this.form.singleDate) {
        alert('Elige una fecha');
        return;
      }
      body['date'] = new Date(this.form.singleDate + 'T12:00:00').toISOString();
    } else {
      if (!this.form.rangeStart || !this.form.rangeEnd) {
        alert('Indica inicio y fin del rango');
        return;
      }
      body['date'] = new Date(this.form.rangeStart + 'T12:00:00').toISOString();
      body['rangeEnd'] = new Date(this.form.rangeEnd + 'T12:00:00').toISOString();
    }

    if (!this.form.allDay) {
      body['startTimeMinutes'] = this.timeToMin(this.form.startTime);
      body['endTimeMinutes'] = this.timeToMin(this.form.endTime);
    }

    this.barber.createUnavailableRule(body).subscribe({
      next: () => this.load(),
      error: (e) => alert(e.error?.error ?? 'No se pudo guardar')
    });
  }

  remove(id: number) {
    if (confirm('¿Eliminar esta regla?'))
      this.barber.deleteUnavailableRule(id).subscribe(() => this.load());
  }
}

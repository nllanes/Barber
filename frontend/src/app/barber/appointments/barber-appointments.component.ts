import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { BarberService } from '../../services/barber.service';
import { Appointment } from '../../models/interfaces';

@Component({
  selector: 'app-barber-appointments',
  imports: [DatePipe, RouterLink],
  template: `
    <p class="refresh-hint">Las citas se actualizan solas cada 30 segundos. También puedes recargar la página si lo prefieres.</p>

    <section class="pending-block">
      <h2>Pendientes de tu respuesta</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (a of pending(); track a.id) {
              <tr>
                <td class="name-cell">{{ a.clientName }}</td>
                <td>
                  <div class="small">{{ a.clientPhone }}</div>
                  <div class="small dim">{{ a.clientEmail }}</div>
                </td>
                <td>{{ a.service?.name ?? '—' }}</td>
                <td>{{ a.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="actions">
                  <button type="button" class="btn ok" (click)="accept(a.id!)">Aceptar</button>
                  <button type="button" class="btn no" (click)="reject(a.id!)">Rechazar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty">No hay solicitudes pendientes</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2>Todas las citas</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of all(); track a.id) {
              <tr>
                <td>{{ a.clientName }}</td>
                <td>{{ a.service?.name ?? '—' }}</td>
                <td>{{ a.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</td>
                <td><span class="badge" [attr.data-s]="statusOf(a)">{{ statusOf(a) }}</span></td>
                <td class="actions">
                  @if (isPendingApproval(a)) {
                    <button type="button" class="btn ok" (click)="accept(a.id!)">Aceptar</button>
                    <button type="button" class="btn no" (click)="reject(a.id!)">Rechazar</button>
                  } @else {
                    <span class="dash">—</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="empty">Sin citas</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <a routerLink="/" class="back-site">← Volver al sitio web</a>
  `,
  styles: [`
    .refresh-hint { font-size: 0.82rem; color: var(--text-muted); margin: 0 0 18px; line-height: 1.45; }
    h2 { font-size: 1.1rem; color: var(--gold); margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px; }
    .pending-block { margin-bottom: 36px; }
    .table-wrap { background: var(--secondary-dark); border-radius: 10px; border: 1px solid rgba(200,169,126,0.1); overflow-x: auto; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 14px; font-size: 0.75rem; color: var(--gold); text-transform: uppercase; border-bottom: 1px solid rgba(200,169,126,0.12); }
    td { padding: 12px 14px; font-size: 0.88rem; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: top; }
    .name-cell { font-weight: 500; }
    .small { font-size: 0.82rem; }
    .dim { color: var(--text-muted); }
    .empty { text-align: center; color: var(--text-muted); padding: 28px !important; }
    .actions { white-space: nowrap; }
    .dash { color: var(--text-dim); font-size: 0.9rem; }
    .btn { padding: 8px 14px; border-radius: 6px; border: none; font-size: 0.8rem; cursor: pointer; margin-right: 8px; font-family: 'Poppins', sans-serif; }
    .btn.ok { background: rgba(46,204,113,0.2); color: #2ecc71; border: 1px solid rgba(46,204,113,0.35); }
    .btn.no { background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.3); }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; }
    .badge[data-s="EsperandoBarbero"] { background: rgba(241,196,15,0.15); color: #f1c40f; }
    .badge[data-s="Pendiente"] { background: rgba(241,196,15,0.15); color: #f1c40f; }
    .badge[data-s="Confirmada"] { background: rgba(52,152,219,0.15); color: #3498db; }
    .badge[data-s="Rechazada"] { background: rgba(231,76,60,0.15); color: #e74c3c; }
    .badge[data-s="Completada"] { background: rgba(46,204,113,0.15); color: #2ecc71; }
    .badge[data-s="Cancelada"] { background: rgba(149,165,166,0.15); color: #95a5a6; }
    .back-site { display: inline-block; margin-top: 28px; color: var(--text-muted); font-size: 0.9rem; text-decoration: none; }
    .back-site:hover { color: var(--gold); }
  `]
})
export class BarberAppointmentsComponent implements OnInit {
  private barber = inject(BarberService);
  private destroyRef = inject(DestroyRef);
  all = signal<Appointment[]>([]);

  /** Expuesto al template para data-s y texto */
  statusOf = BarberService.statusOf;
  isPendingApproval = BarberService.isPendingApproval;

  pending(): Appointment[] {
    return this.all().filter(a => BarberService.isPendingApproval(a));
  }

  ngOnInit() {
    interval(30_000)
      .pipe(
        startWith(0),
        switchMap(() => this.barber.getAppointments()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(d => this.applyList(d));
  }

  load() {
    this.barber.getAppointments().subscribe(d => this.applyList(d));
  }

  private applyList(d: Appointment[]) {
    this.all.set(d);
    this.barber.syncPendingApprovalBadge(d);
  }

  accept(id: number) {
    this.barber.accept(id).subscribe(() => this.load());
  }

  reject(id: number) {
    if (confirm('¿Rechazar esta cita? El horario quedará libre.'))
      this.barber.reject(id).subscribe(() => this.load());
  }
}

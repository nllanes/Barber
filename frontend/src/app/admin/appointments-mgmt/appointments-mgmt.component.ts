import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Appointment } from '../../models/interfaces';

@Component({
  selector: 'app-appointments-mgmt',
  imports: [DatePipe],
  template: `
    <div class="page-header">
      <h2>Gestión de Citas</h2>
      <div class="filter-bar">
        <button [class.active-filter]="filter() === 'all'" (click)="filter.set('all')">Todas</button>
        <button [class.active-filter]="filter() === 'EsperandoBarbero'" (click)="filter.set('EsperandoBarbero')">Esperando barbero</button>
        <button [class.active-filter]="filter() === 'Confirmada'" (click)="filter.set('Confirmada')">Confirmadas</button>
        <button [class.active-filter]="filter() === 'Completada'" (click)="filter.set('Completada')">Completadas</button>
        <button [class.active-filter]="filter() === 'Rechazada'" (click)="filter.set('Rechazada')">Rechazadas</button>
        <button [class.active-filter]="filter() === 'Cancelada'" (click)="filter.set('Cancelada')">Canceladas</button>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Servicio</th>
            <th>Barbero</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (a of filtered(); track a.id) {
            <tr>
              <td class="name-cell">{{ a.clientName }}</td>
              <td>{{ a.clientPhone }}</td>
              <td>{{ a.clientEmail }}</td>
              <td>{{ a.service?.name ?? 'N/A' }}</td>
              <td>{{ a.barber?.name ?? 'N/A' }}</td>
              <td>{{ a.appointmentDate | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <span class="badge" [attr.data-status]="a.status">{{ a.status }}</span>
              </td>
              <td class="actions">
                @if (a.status === 'EsperandoBarbero') {
                  <button class="icon-btn confirm" (click)="updateStatus(a.id!, 'Confirmada')" title="Confirmar (admin)">
                    <span class="material-icons">check_circle</span>
                  </button>
                }
                @if (a.status === 'Confirmada') {
                  <button class="icon-btn complete" (click)="updateStatus(a.id!, 'Completada')" title="Completar">
                    <span class="material-icons">done_all</span>
                  </button>
                }
                @if (a.status !== 'Cancelada' && a.status !== 'Completada' && a.status !== 'Rechazada') {
                  <button class="icon-btn cancel-action" (click)="updateStatus(a.id!, 'Cancelada')" title="Cancelar">
                    <span class="material-icons">cancel</span>
                  </button>
                }
                <button class="icon-btn danger" (click)="deleteAppointment(a.id!)" title="Eliminar">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="empty-msg">No hay citas para mostrar</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 25px; }
    h2 { font-size: 1.8rem; color: var(--text-light); margin-bottom: 15px; }

    .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-bar button {
      padding: 6px 16px; background: var(--tertiary-dark); border: 1px solid rgba(255,255,255,0.05);
      border-radius: 20px; color: var(--text-muted); font-family: 'Poppins', sans-serif;
      font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
    }
    .filter-bar button:hover { border-color: var(--gold); color: var(--gold); }
    .filter-bar .active-filter { background: var(--gold); color: var(--primary-dark); border-color: var(--gold); font-weight: 600; }

    .table-wrap { background: var(--secondary-dark); border-radius: 10px; border: 1px solid rgba(200,169,126,0.1); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 14px 16px; font-size: 0.8rem; color: var(--gold); text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(200,169,126,0.1); white-space: nowrap; }
    td { padding: 12px 16px; font-size: 0.85rem; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.03); white-space: nowrap; }
    tr:hover { background: rgba(200,169,126,0.03); }
    .name-cell { font-weight: 500; }
    .empty-msg { text-align: center; color: var(--text-muted); padding: 40px !important; }

    .badge {
      padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500;
    }
    .badge[data-status="EsperandoBarbero"] { background: rgba(241,196,15,0.15); color: #f1c40f; }
    .badge[data-status="Pendiente"] { background: rgba(241,196,15,0.15); color: #f1c40f; }
    .badge[data-status="Confirmada"] { background: rgba(52,152,219,0.15); color: #3498db; }
    .badge[data-status="Completada"] { background: rgba(46,204,113,0.15); color: #2ecc71; }
    .badge[data-status="Cancelada"] { background: rgba(231,76,60,0.15); color: #e74c3c; }
    .badge[data-status="Rechazada"] { background: rgba(155,89,182,0.15); color: #9b59b6; }

    .actions { display: flex; gap: 4px; }
    .icon-btn { padding: 5px; background: rgba(200,169,126,0.1); border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
    .icon-btn .material-icons { font-size: 18px; color: var(--text-muted); }
    .icon-btn:hover .material-icons { color: var(--gold); }
    .icon-btn.confirm:hover .material-icons { color: #2ecc71; }
    .icon-btn.complete:hover .material-icons { color: #3498db; }
    .icon-btn.cancel-action:hover .material-icons { color: #f39c12; }
    .icon-btn.danger:hover .material-icons { color: #e74c3c; }
  `]
})
export class AppointmentsMgmtComponent implements OnInit {
  private admin = inject(AdminService);
  appointments = signal<Appointment[]>([]);
  filter = signal<string>('all');

  filtered(): Appointment[] {
    const f = this.filter();
    return f === 'all' ? this.appointments() : this.appointments().filter(a => a.status === f);
  }

  ngOnInit() { this.load(); }
  load() { this.admin.getAppointments().subscribe(d => this.appointments.set(d)); }

  updateStatus(id: number, status: string) {
    this.admin.updateAppointmentStatus(id, status).subscribe(() => this.load());
  }

  deleteAppointment(id: number) {
    if (confirm('¿Eliminar esta cita permanentemente?'))
      this.admin.deleteAppointment(id).subscribe(() => this.load());
  }
}

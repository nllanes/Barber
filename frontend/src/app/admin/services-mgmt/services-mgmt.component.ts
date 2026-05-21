import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Service } from '../../models/interfaces';
import { ADMIN_STYLES } from '../admin-styles';

@Component({
  selector: 'app-services-mgmt',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="page-header">
      <h2>Gestión de Servicios</h2>
      <button class="btn-add" (click)="openForm()">
        <span class="material-icons">add</span> Nuevo Servicio
      </button>
    </div>

    @if (showForm()) {
      <div class="form-card">
        <h3>{{ editing() ? 'Editar' : 'Nuevo' }} Servicio</h3>
        <form (ngSubmit)="onSave()">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="form.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Icono (Material Icon)</label>
              <input type="text" [(ngModel)]="form.icon" name="icon" placeholder="content_cut">
            </div>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <input type="text" [(ngModel)]="form.description" name="description">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio (USD)</label>
              <input type="number" [(ngModel)]="form.price" name="price" step="0.01" min="0">
            </div>
            <div class="form-group">
              <label>Duración (minutos)</label>
              <input type="number" [(ngModel)]="form.durationMinutes" name="duration" min="1">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-save">Guardar</button>
            <button type="button" class="btn-cancel" (click)="showForm.set(false)">Cancelar</button>
          </div>
        </form>
      </div>
    }

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Icono</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (s of services(); track s.id) {
            <tr [class.inactive]="!s.isActive">
              <td><span class="material-icons icon-preview">{{ s.icon }}</span></td>
              <td>{{ s.name }}</td>
              <td class="desc-cell">{{ s.description }}</td>
              <td>{{ s.price | currency:'USD' }}</td>
              <td>{{ s.durationMinutes }} min</td>
              <td>
                <span class="badge" [class.active]="s.isActive">{{ s.isActive ? 'Activo' : 'Inactivo' }}</span>
              </td>
              <td class="actions">
                <button class="icon-btn" (click)="editService(s)" title="Editar">
                  <span class="material-icons">edit</span>
                </button>
                <button class="icon-btn" (click)="toggleActive(s)" [title]="s.isActive ? 'Desactivar' : 'Activar'">
                  <span class="material-icons">{{ s.isActive ? 'visibility_off' : 'visibility' }}</span>
                </button>
                <button class="icon-btn danger" (click)="deleteService(s.id)" title="Eliminar">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [ADMIN_STYLES]
})
export class ServicesMgmtComponent implements OnInit {
  private admin = inject(AdminService);
  services = signal<Service[]>([]);
  showForm = signal(false);
  editing = signal(false);
  editId = 0;
  form = { name: '', description: '', price: 0, durationMinutes: 30, icon: 'content_cut' };

  ngOnInit() { this.load(); }

  load() { this.admin.getServices().subscribe(d => this.services.set(d)); }

  openForm() {
    this.form = { name: '', description: '', price: 0, durationMinutes: 30, icon: 'content_cut' };
    this.editing.set(false);
    this.showForm.set(true);
  }

  editService(s: Service) {
    this.form = { name: s.name, description: s.description, price: s.price, durationMinutes: s.durationMinutes, icon: s.icon };
    this.editId = s.id;
    this.editing.set(true);
    this.showForm.set(true);
  }

  onSave() {
    if (this.editing()) {
      const current = this.services().find(s => s.id === this.editId);
      this.admin.updateService(this.editId, { ...this.form, isActive: current?.isActive ?? true }).subscribe(() => {
        this.showForm.set(false);
        this.load();
      });
    } else {
      this.admin.createService(this.form).subscribe(() => {
        this.showForm.set(false);
        this.load();
      });
    }
  }

  toggleActive(s: Service) {
    this.admin.updateService(s.id, { ...s, isActive: !s.isActive }).subscribe(() => this.load());
  }

  deleteService(id: number) {
    if (confirm('¿Eliminar este servicio permanentemente?'))
      this.admin.deleteService(id).subscribe(() => this.load());
  }
}

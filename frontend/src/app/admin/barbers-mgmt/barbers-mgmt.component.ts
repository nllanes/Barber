import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Barber } from '../../models/interfaces';
import { ADMIN_STYLES } from '../admin-styles';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { AssetUrlPipe } from '../../shared/asset-url.pipe';

@Component({
  selector: 'app-barbers-mgmt',
  imports: [FormsModule, ImageUploadComponent, AssetUrlPipe],
  template: `
    <div class="page-header">
      <h2>Gestión de Barberos</h2>
      <button class="btn-add" (click)="openForm()">
        <span class="material-icons">add</span> Nuevo Barbero
      </button>
    </div>

    @if (showForm()) {
      <div class="form-card">
        <h3>{{ editing() ? 'Editar' : 'Nuevo' }} Barbero</h3>
        <form (ngSubmit)="onSave()">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="form.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Especialidad</label>
              <input type="text" [(ngModel)]="form.specialty" name="specialty">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="+1 555-0100">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="form.email" name="email" placeholder="barbero@email.com">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Duración por corte (minutos)</label>
              <input type="number" [(ngModel)]="form.cutDurationMinutes" name="cutDurationMinutes" min="10" max="120" required>
              <small class="field-hint">Tiempo que el barbero dedica a cada turno/cliente</small>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Contraseña (panel barbero)</label>
              <input type="password" [(ngModel)]="form.password" name="password" [placeholder]="editing() ? 'Dejar vacío para no cambiar' : 'Mínimo para acceder a /barber'">
              <small class="field-hint">El barbero usa su email y esta contraseña para aceptar o rechazar citas</small>
            </div>
          </div>
          <div class="form-group">
            <label>Foto del Barbero</label>
            <app-image-upload
              [currentUrl]="form.imageUrl"
              (uploaded)="form.imageUrl = $event" />
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
            <th>Foto</th>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Duración</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (b of barbers(); track b.id) {
            <tr [class.inactive]="!b.isActive">
              <td>
                @if (b.imageUrl) {
                  <img [src]="b.imageUrl | assetUrl" class="avatar-img" alt="">
                } @else {
                  <div class="avatar-cell">
                    <span class="material-icons">person</span>
                  </div>
                }
              </td>
              <td>{{ b.name }}</td>
              <td>{{ b.specialty }}</td>
              <td>{{ b.cutDurationMinutes }} min</td>
              <td>{{ b.phone || '—' }}</td>
              <td class="desc-cell">{{ b.email || '—' }}</td>
              <td><span class="badge" [class.active]="b.isActive">{{ b.isActive ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="actions">
                <button class="icon-btn" (click)="editBarber(b)" title="Editar">
                  <span class="material-icons">edit</span>
                </button>
                <button class="icon-btn" (click)="toggleActive(b)" [title]="b.isActive ? 'Desactivar' : 'Activar'">
                  <span class="material-icons">{{ b.isActive ? 'visibility_off' : 'visibility' }}</span>
                </button>
                <button class="icon-btn danger" (click)="deleteBarber(b.id)" title="Eliminar">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [ADMIN_STYLES, `
    .avatar-img {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--gold);
    }
    .field-hint {
      display: block;
      margin-top: 4px;
      font-size: 0.75rem;
      color: #999;
    }
  `]
})
export class BarbersMgmtComponent implements OnInit {
  private admin = inject(AdminService);
  barbers = signal<Barber[]>([]);
  showForm = signal(false);
  editing = signal(false);
  editId = 0;
  form = { name: '', specialty: '', imageUrl: '', phone: '', email: '', cutDurationMinutes: 30, password: '' };

  ngOnInit() { this.load(); }
  load() { this.admin.getBarbers().subscribe(d => this.barbers.set(d)); }

  openForm() {
    this.form = { name: '', specialty: '', imageUrl: '', phone: '', email: '', cutDurationMinutes: 30, password: '' };
    this.editing.set(false);
    this.showForm.set(true);
  }

  editBarber(b: Barber) {
    this.form = { name: b.name, specialty: b.specialty, imageUrl: b.imageUrl, phone: b.phone, email: b.email, cutDurationMinutes: b.cutDurationMinutes, password: '' };
    this.editId = b.id;
    this.editing.set(true);
    this.showForm.set(true);
  }

  onSave() {
    const base: Record<string, string | number> = {
      name: this.form.name,
      specialty: this.form.specialty,
      imageUrl: this.form.imageUrl,
      phone: this.form.phone,
      email: this.form.email,
      cutDurationMinutes: this.form.cutDurationMinutes
    };
    if (this.form.password) base['password'] = this.form.password;
    if (this.editing()) {
      const current = this.barbers().find(b => b.id === this.editId);
      this.admin.updateBarber(this.editId, { ...base, isActive: current?.isActive ?? true }).subscribe(() => { this.showForm.set(false); this.load(); });
    } else {
      this.admin.createBarber(base).subscribe(() => { this.showForm.set(false); this.load(); });
    }
  }

  toggleActive(b: Barber) {
    this.admin.updateBarber(b.id, { ...b, isActive: !b.isActive }).subscribe(() => this.load());
  }

  deleteBarber(id: number) {
    if (confirm('¿Eliminar este barbero permanentemente?'))
      this.admin.deleteBarber(id).subscribe(() => this.load());
  }
}

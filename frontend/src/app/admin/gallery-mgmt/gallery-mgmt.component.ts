import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { GalleryImage } from '../../models/interfaces';
import { ADMIN_STYLES } from '../admin-styles';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { AssetUrlPipe } from '../../shared/asset-url.pipe';

@Component({
  selector: 'app-gallery-mgmt',
  imports: [FormsModule, ImageUploadComponent, AssetUrlPipe],
  template: `
    <div class="page-header">
      <h2>Gestión de Galería</h2>
      <button class="btn-add" (click)="openForm()">
        <span class="material-icons">add_photo_alternate</span> Nueva Imagen
      </button>
    </div>

    @if (showForm()) {
      <div class="form-card">
        <h3>{{ editing() ? 'Editar' : 'Nueva' }} Imagen</h3>
        <form (ngSubmit)="onSave()">
          <div class="form-row">
            <div class="form-group">
              <label>Título (Español)</label>
              <input type="text" [(ngModel)]="form.title" name="title" required>
            </div>
            <div class="form-group">
              <label>Título (Inglés)</label>
              <input type="text" [(ngModel)]="form.titleEn" name="titleEn">
            </div>
          </div>
          <div class="form-group">
            <label>Orden</label>
            <input type="number" [(ngModel)]="form.sortOrder" name="sortOrder" min="1" style="max-width: 120px">
          </div>
          <div class="form-group">
            <label>Imagen</label>
            <app-image-upload
              [currentUrl]="form.imageUrl"
              (uploaded)="form.imageUrl = $event" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-save" [disabled]="!form.imageUrl">Guardar</button>
            <button type="button" class="btn-cancel" (click)="showForm.set(false)">Cancelar</button>
          </div>
        </form>
      </div>
    }

    <div class="gallery-grid">
      @for (img of images(); track img.id) {
        <div class="gallery-card" [class.inactive]="!img.isActive">
          <img [src]="img.imageUrl | assetUrl" [alt]="img.title" loading="lazy">
          <div class="gallery-card-body">
            <h4>{{ img.title }}</h4>
            <p>{{ img.titleEn }} · <span class="order-badge">Orden: {{ img.sortOrder }}</span></p>
            <div class="gallery-card-actions">
              <button class="icon-btn" (click)="editImage(img)" title="Editar">
                <span class="material-icons">edit</span>
              </button>
              <button class="icon-btn" (click)="toggleActive(img)" [title]="img.isActive ? 'Ocultar' : 'Mostrar'">
                <span class="material-icons">{{ img.isActive ? 'visibility_off' : 'visibility' }}</span>
              </button>
              <button class="icon-btn danger" (click)="deleteImage(img.id)" title="Eliminar">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [ADMIN_STYLES]
})
export class GalleryMgmtComponent implements OnInit {
  private admin = inject(AdminService);
  images = signal<GalleryImage[]>([]);
  showForm = signal(false);
  editing = signal(false);
  editId = 0;
  form = { title: '', titleEn: '', imageUrl: '', sortOrder: 1 };

  ngOnInit() { this.load(); }
  load() { this.admin.getGallery().subscribe(d => this.images.set(d)); }

  openForm() {
    const nextOrder = this.images().length + 1;
    this.form = { title: '', titleEn: '', imageUrl: '', sortOrder: nextOrder };
    this.editing.set(false);
    this.showForm.set(true);
  }

  editImage(img: GalleryImage) {
    this.form = { title: img.title, titleEn: img.titleEn, imageUrl: img.imageUrl, sortOrder: img.sortOrder };
    this.editId = img.id;
    this.editing.set(true);
    this.showForm.set(true);
  }

  onSave() {
    if (this.editing()) {
      const current = this.images().find(i => i.id === this.editId);
      this.admin.updateGalleryImage(this.editId, { ...this.form, isActive: current?.isActive ?? true }).subscribe(() => { this.showForm.set(false); this.load(); });
    } else {
      this.admin.createGalleryImage(this.form).subscribe(() => { this.showForm.set(false); this.load(); });
    }
  }

  toggleActive(img: GalleryImage) {
    this.admin.updateGalleryImage(img.id, { ...img, isActive: !img.isActive }).subscribe(() => this.load());
  }

  deleteImage(id: number) {
    if (confirm('¿Eliminar esta imagen permanentemente?'))
      this.admin.deleteGalleryImage(id).subscribe(() => this.load());
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarberService } from '../../services/barber.service';
import { BarberPortfolioImage } from '../../models/interfaces';
import { ImageUploadComponent } from '../../admin/image-upload/image-upload.component';
import { AssetUrlPipe } from '../../shared/asset-url.pipe';

@Component({
  selector: 'app-barber-portfolio',
  imports: [FormsModule, ImageUploadComponent, AssetUrlPipe],
  template: `
    <p class="intro">Sube fotos de tus cortes para que los clientes las vean en la sección del equipo.</p>

    <div class="add-card">
      <h3>Nueva foto</h3>
      <div class="form-row">
        <label>Imagen</label>
        <app-image-upload [useBarberUpload]="true" [currentUrl]="draftUrl()" (uploaded)="draftUrl.set($event)" />
      </div>
      <div class="form-row">
        <label>Descripción</label>
        <input type="text" [(ngModel)]="draftCaption" name="cap" placeholder="Ej. Fade bajo">
      </div>
      <button type="button" class="btn-add" (click)="add()" [disabled]="!draftUrl()">Publicar</button>
    </div>

    <div class="grid">
      @for (p of items(); track p.id) {
        <div class="card">
          <img [src]="p.imageUrl | assetUrl" alt="">
          <p class="cap">{{ p.caption || 'Sin título' }}</p>
          <button type="button" class="btn-del" (click)="remove(p.id)">Eliminar</button>
        </div>
      } @empty {
        <p class="empty">Aún no hay fotos. Sube la primera arriba.</p>
      }
    </div>
  `,
  styles: [`
    .intro { color: var(--text-muted); margin: 0 0 24px; max-width: 640px; line-height: 1.5; }
    .add-card {
      background: var(--secondary-dark);
      border: 1px solid rgba(200,169,126,0.12);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 28px;
    }
    h3 { margin: 0 0 16px; color: var(--gold); font-size: 1rem; }
    .form-row { margin-bottom: 14px; }
    label { display: block; font-size: 0.8rem; color: var(--gold); margin-bottom: 6px; text-transform: uppercase; }
    input[type="text"] {
      width: 100%; max-width: 400px; padding: 10px 12px;
      background: var(--tertiary-dark); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 6px; color: var(--text-light); font-family: 'Poppins', sans-serif;
    }
    .btn-add {
      padding: 10px 22px; background: var(--gold); color: var(--primary-dark);
      border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
    }
    .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .card {
      background: var(--secondary-dark);
      border-radius: 10px; overflow: hidden;
      border: 1px solid rgba(200,169,126,0.1);
    }
    .card img { width: 100%; height: 160px; object-fit: cover; display: block; }
    .cap { padding: 10px 12px; margin: 0; font-size: 0.85rem; color: var(--text-light); }
    .btn-del {
      margin: 0 12px 12px; padding: 6px 12px; font-size: 0.8rem;
      background: rgba(231,76,60,0.15); color: #e74c3c; border: 1px solid rgba(231,76,60,0.35);
      border-radius: 6px; cursor: pointer;
    }
    .empty { color: var(--text-muted); grid-column: 1 / -1; }
  `]
})
export class BarberPortfolioComponent implements OnInit {
  private barber = inject(BarberService);
  items = signal<BarberPortfolioImage[]>([]);
  draftUrl = signal('');
  draftCaption = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.barber.getPortfolio().subscribe(d => this.items.set(d));
  }

  add() {
    const url = this.draftUrl();
    if (!url) return;
    this.barber.createPortfolio({
      imageUrl: url,
      caption: this.draftCaption,
      sortOrder: this.items().length
    }).subscribe(() => {
      this.draftUrl.set('');
      this.draftCaption = '';
      this.load();
    });
  }

  remove(id: number) {
    if (confirm('¿Eliminar esta foto?'))
      this.barber.deletePortfolio(id).subscribe(() => this.load());
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { GalleryImage } from '../../models/interfaces';
import { AssetUrlPipe } from '../../shared/asset-url.pipe';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [AssetUrlPipe],
  template: `
    <section id="gallery" class="section gallery-section">
      <div class="container">
        <div class="section-title">
          <h2>{{ i18n.t('gallery.title') }}</h2>
          <div class="accent-line"></div>
          <p>{{ i18n.t('gallery.subtitle') }}</p>
        </div>

        <div class="gallery-grid">
          @for (img of images(); track img.id) {
            <div class="gallery-item">
              <img [src]="img.imageUrl | assetUrl" [alt]="i18n.lang() === 'en' ? img.titleEn : img.title" loading="lazy">
              <div class="gallery-overlay">
                <span>{{ i18n.lang() === 'en' ? img.titleEn : img.title }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .gallery-item {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      aspect-ratio: 1;
      cursor: pointer;
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .gallery-item:hover img { transform: scale(1.1); }

    .gallery-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 15, 15, 0.9) 0%, transparent 60%);
      display: flex;
      align-items: flex-end;
      padding: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .gallery-item:hover .gallery-overlay { opacity: 1; }

    .gallery-overlay span {
      color: var(--gold);
      font-family: 'Playfair Display', serif;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .gallery-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 480px) {
      .gallery-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class GalleryComponent implements OnInit {
  i18n = inject(TranslationService);
  private api = inject(ApiService);
  images = signal<GalleryImage[]>([]);

  ngOnInit() {
    this.api.getGallery().subscribe({
      next: (data) => this.images.set(data),
      error: () => {
        this.images.set([
          { id: 1, title: 'Corte Moderno', titleEn: 'Modern Cut', imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80', sortOrder: 1, isActive: true },
          { id: 2, title: 'Diseño de Barba', titleEn: 'Beard Design', imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80', sortOrder: 2, isActive: true },
          { id: 3, title: 'Estilo Clásico', titleEn: 'Classic Style', imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', sortOrder: 3, isActive: true },
          { id: 4, title: 'Corte Fade', titleEn: 'Fade Cut', imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80', sortOrder: 4, isActive: true },
          { id: 5, title: 'Afeitado Premium', titleEn: 'Premium Shave', imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80', sortOrder: 5, isActive: true },
          { id: 6, title: 'Acabado Perfecto', titleEn: 'Perfect Finish', imageUrl: 'https://images.unsplash.com/photo-1596728325441-3b19c26f3fee?w=600&q=80', sortOrder: 6, isActive: true },
        ]);
      }
    });
  }
}

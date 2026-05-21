import { Component, inject, output, signal, input } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { BarberService } from '../../services/barber.service';
import { resolvePublicAssetUrl } from '../../shared/asset-url.pipe';

@Component({
  selector: 'app-image-upload',
  template: `
    <div class="upload-area">
      @if (previewUrl()) {
        <div class="preview-container">
          <img [src]="previewUrl()" alt="Preview">
          <button type="button" class="remove-btn" (click)="removeImage()">
            <span class="material-icons">close</span>
          </button>
        </div>
      } @else {
        <div class="upload-box" (click)="fileInput.click()"
             (dragover)="onDragOver($event)" (drop)="onDrop($event)">
          <span class="material-icons upload-icon">cloud_upload</span>
          <p class="upload-text">Arrastra una imagen aquí o haz clic para seleccionar</p>
          <div class="upload-buttons">
            <button type="button" class="upload-btn" (click)="$event.stopPropagation(); fileInput.click()">
              <span class="material-icons">folder_open</span> Archivo
            </button>
            <button type="button" class="upload-btn camera-btn" (click)="$event.stopPropagation(); cameraInput.click()">
              <span class="material-icons">photo_camera</span> Cámara
            </button>
          </div>
          <span class="upload-hint">JPG, PNG, WebP · Máx 5MB</span>
        </div>
      }

      @if (uploading()) {
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      }

      @if (error()) {
        <p class="error-text">{{ error() }}</p>
      }

      <input #fileInput type="file" accept="image/jpeg,image/png,image/webp,image/gif"
             (change)="onFileSelected($event)" hidden>
      <input #cameraInput type="file" accept="image/jpeg,image/png" capture="environment"
             (change)="onFileSelected($event)" hidden>
    </div>
  `,
  styles: [`
    .upload-area { margin-bottom: 15px; }

    .upload-box {
      border: 2px dashed rgba(200,169,126,0.3);
      border-radius: 10px;
      padding: 30px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(200,169,126,0.03);
    }

    .upload-box:hover, .upload-box.dragover {
      border-color: var(--gold);
      background: rgba(200,169,126,0.08);
    }

    .upload-icon { font-size: 40px; color: var(--gold); opacity: 0.6; }

    .upload-text {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin: 10px 0 15px;
    }

    .upload-buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 10px;
    }

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: rgba(200,169,126,0.15);
      border: 1px solid rgba(200,169,126,0.3);
      border-radius: 6px;
      color: var(--gold);
      font-family: 'Poppins', sans-serif;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-btn:hover { background: var(--gold); color: var(--primary-dark); }
    .upload-btn .material-icons { font-size: 18px; }

    .upload-hint { font-size: 0.75rem; color: var(--text-dim); }

    .preview-container {
      position: relative;
      display: inline-block;
      max-width: 100%;
    }

    .preview-container img {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid var(--gold);
    }

    .remove-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(231,76,60,0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-btn .material-icons { font-size: 18px; color: white; }

    .progress-bar {
      height: 4px;
      background: var(--tertiary-dark);
      border-radius: 2px;
      margin-top: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--gold);
      border-radius: 2px;
      animation: loading 1.5s ease-in-out infinite;
    }

    @keyframes loading {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 100%; }
    }

    .error-text { color: var(--danger); font-size: 0.85rem; margin-top: 8px; }
  `]
})
export class ImageUploadComponent {
  private admin = inject(AdminService);
  private barberSvc = inject(BarberService);

  /** Si es true, sube con token de barbero (panel barbero). */
  useBarberUpload = input(false);
  currentUrl = input<string>('');
  uploaded = output<string>();

  previewUrl = signal('');
  uploading = signal(false);
  error = signal('');

  ngOnInit() {
    const cur = this.currentUrl();
    if (cur) this.previewUrl.set(resolvePublicAssetUrl(cur));
  }

  ngOnChanges() {
    const cur = this.currentUrl();
    if (cur) this.previewUrl.set(resolvePublicAssetUrl(cur));
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files[0];
    if (file) this.upload(file);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
    input.value = '';
  }

  private upload(file: File) {
    this.error.set('');
    this.uploading.set(true);

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    const req = this.useBarberUpload()
      ? this.barberSvc.uploadImage(file)
      : this.admin.uploadImage(file);

    req.subscribe({
      next: (res) => {
        const rawUrl = res.url;
        this.previewUrl.set(resolvePublicAssetUrl(rawUrl));
        this.uploaded.emit(rawUrl);
        this.uploading.set(false);
      },
      error: () => {
        this.error.set('Error al subir la imagen. Intenta de nuevo.');
        this.previewUrl.set('');
        this.uploading.set(false);
      }
    });
  }

  removeImage() {
    this.previewUrl.set('');
    this.uploaded.emit('');
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

/** Rutas relativas del backend (/uploads/…) → URL absoluta cuando front y API están en dominios distintos. */
export function resolvePublicAssetUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  const base = environment.backendOrigin.replace(/\/$/, '');
  if (!base) return trimmed;
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

@Pipe({ name: 'assetUrl', standalone: true })
export class AssetUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    return resolvePublicAssetUrl(url);
  }
}

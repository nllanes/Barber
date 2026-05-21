/**
 * Sustituye por la URL pública del backend **sin barra final** (Railway, Render, Azure…).
 * Ejemplo: https://barberia-api-production-xxxx.up.railway.app
 */
const BACKEND_ORIGIN = 'https://TU-BACKEND.up.railway.app';

export const environment = {
  production: true,
  backendOrigin: BACKEND_ORIGIN,
  apiUrl: `${BACKEND_ORIGIN}/api`
};

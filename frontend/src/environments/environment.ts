export const environment = {
  production: false,
  /** Misma origen que `ng serve`: el proxy reenvía /api al backend (evita CORS con localhost vs 127.0.0.1). */
  apiUrl: '/api',
  /** Vacío en dev: `/uploads/…` sigue siendo relativo al mismo host que Angular (proxy). */
  backendOrigin: ''
};

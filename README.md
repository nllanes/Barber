# BarberShop Elite - Sitio Web de Barbería

Sitio web profesional para una barbería, construido con **Angular 19** (frontend) y **ASP.NET Core 9 Minimal API** (backend) con **SQLite** como base de datos — diseñado para costos de despliegue mínimos.

## Arquitectura

```
BarberiaPage/
├── frontend/          # Angular 19 (Standalone Components)
│   ├── src/app/
│   │   ├── components/   # Header, Hero, Services, Gallery, Team, Booking, Contact, Footer
│   │   ├── models/       # Interfaces TypeScript
│   │   └── services/     # Servicio HTTP para API
│   └── proxy.conf.json   # Proxy para desarrollo
├── backend/           # ASP.NET Core 9 Minimal API
│   ├── Models/           # Service, Barber, Appointment, ContactMessage
│   ├── Data/             # DbContext con EF Core + SQLite
│   └── Program.cs        # Endpoints API
└── README.md
```

## Requisitos Previos

- [Node.js 18+](https://nodejs.org/)
- [.NET 9 SDK](https://dotnet.microsoft.com/download)

## Desarrollo Local

### Backend (Terminal 1)

```bash
cd backend
dotnet run
```

La API estará en `http://localhost:5032`.

### Correo en local (SMTP con Gmail u otro)

En la carpeta `backend/` crea o edita el archivo **`smtp.local.json`** (está ignorado por Git — no lo subas al repositorio). Copia plantilla desde **`smtp.local.example.json`** y rellena `User`, `FromEmail` y `Password` (en Gmail usa una [contraseña de aplicación](https://support.google.com/accounts/answer/185833)).

Al arrancar, `Program.cs` carga ese JSON y sobrescribe valores respecto de `appsettings` (SMTP y, si lo añades, **Twilio**).

Si **no** usas ese archivo, en Development por defecto se usa Mailpit (`127.0.0.1:1025`); revisa mensajes capturados en `http://localhost:8025`.

### SMS con Twilio (aviso al barbero por nueva cita)

1. Cuenta en [Twilio](https://www.twilio.com/) y copia **Account SID**, **Auth Token** y alquila un **Phone Number**.
2. En **`smtp.local.json`** añade la sección `Twilio` como en **`smtp.local.example.json`**:
   - **`FromNumber`**: tu número Twilio en **E.164** con `+` (ej. `+18095551234`).
3. El **teléfono del barbero** (en admin / base de datos) debe ir en **E.164 con `+`**. Sin `+`, Twilio suele fallar; el backend deja una advertencia en consola.

**Cuenta trial:** solo pueden recibir SMS los **Verified Caller IDs** que des de alta en Twilio hasta que migres de plan.

En producción también puedes usar variables de entorno: `Twilio__AccountSid`, `Twilio__AuthToken`, `Twilio__FromNumber`.

### Frontend (Terminal 2)

```bash
cd frontend
npm start
```

El frontend estará en `http://localhost:4200` con proxy automático al backend.

### Desplegar gratis (GitHub Pages + Railway)

En el repo ya hay:

- **`Dockerfile`** en la raíz → backend (.NET 9) en **[Railway](https://railway.app)** u otro Docker.
- **`.github/workflows/deploy-pages.yml`** → compila Angular y publica en **[GitHub Pages](https://pages.github.com)**.

#### A) Backend en Railway

1. Entra en [Railway](https://railway.app) → **New project** → **Deploy from GitHub repo** ([nllanes/Barber](https://github.com/nllanes/Barber)).
2. Crea **un servicio** con el **`Dockerfile`** de la raíz del repo.
3. Variables de entorno del servicio:

   | Variable | Valor ejemplo (ajusta usuario/repo) |
   |----------|-------------------------------------|
   | `ASPNETCORE_URLS` | `http://0.0.0.0:$PORT` |
   | `BarberTokenSecret` | Una cadena larga y aleatoria |
   | `Cors__AllowedOrigins` | `https://nllanes.github.io` |
   | `PublicAppUrl` | `https://nllanes.github.io/Barber/` |
   | `AdminPassword` | Tu clave admin (no uses la de ejemplo en producción) |
   | *(opcional)* `Smtp__Host`, … / `Twilio__…` | Si quieres correo/SMS en producción |

4. Copia la URL pública del servicio, ej. **`https://barber-xxxx.up.railway.app`** (sin `/api`, sin `/` final).

> **SQLite gratis:** `barberia.db` puede **perderse al redeploy** (normal para una demo).

#### B) Frontend en GitHub Pages (automático)

1. En GitHub → **Settings** → **Pages** → **Source: GitHub Actions** (solo la primera vez).
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - Nombre: **`BACKEND_ORIGIN`**
   - Valor: la URL del punto A4 (ej. `https://barber-xxxx.up.railway.app`).
3. **Actions** → **Deploy frontend to GitHub Pages** → **Run workflow** .

Tu sitio quedará en **`https://nllanes.github.io/Barber/`**. Actions usa el nombre del repo para **`--base-href`**.

#### Build manual local (sin Actions)

```bash
cd frontend
npm ci
npx ng build --configuration production --base-href /Barber/
```

Copia `dist/frontend/browser` donde publiques Pages (y **`index.html` como `404.html`** en esa carpeta para rutas tipo `/admin`).

#### Opciones rápidas alternativas

| Frontend | Backend |
|----------|---------|
| Cloudflare Pages / Vercel / Netlify | Railway / Render / Fly.io |

Más opciones más abajo en **Opciones de Despliegue Económico**.

## Endpoints de la API

| Método | Ruta                | Descripción               |
|--------|---------------------|---------------------------|
| GET    | /api/services       | Lista de servicios        |
| GET    | /api/services/{id}  | Detalle de servicio       |
| GET    | /api/barbers        | Lista de barberos         |
| POST   | /api/appointments   | Crear cita                |
| GET    | /api/appointments   | Lista de citas            |
| POST   | /api/contact        | Enviar mensaje            |
| GET    | /api/health         | Estado del servidor       |

## Opciones de Despliegue Económico

### Opción 1: GitHub Pages + Railway (GRATIS - $0/mes)

**Frontend → GitHub Pages** (100% gratis):
```bash
cd frontend
npx ng build --base-href /tu-repo/
# Sube la carpeta dist/frontend/browser a la rama gh-pages
```

**Backend → Railway** (gratis con créditos mensuales de $5):
1. Crea cuenta en [railway.app](https://railway.app)
2. Conecta tu repositorio GitHub
3. Railway detecta automáticamente el proyecto .NET
4. Variables de entorno: `ASPNETCORE_URLS=http://0.0.0.0:$PORT`

### Opción 2: Vercel + Render (GRATIS - $0/mes)

**Frontend → Vercel**:
```bash
cd frontend
npm i -g vercel
vercel
```

**Backend → Render** (free tier):
1. Crea cuenta en [render.com](https://render.com)
2. New > Web Service > conecta tu repo
3. Build Command: `dotnet publish -c Release -o out`
4. Start Command: `dotnet out/BarberiaAPI.dll`

### Opción 3: Azure Static Web Apps + Azure App Service Free ($0/mes)

**Frontend → Azure Static Web Apps** (gratis):
```bash
npm install -g @azure/static-web-apps-cli
cd frontend && ng build
swa deploy dist/frontend/browser
```

**Backend → Azure App Service F1 Free**:
```bash
cd backend
dotnet publish -c Release
az webapp up --name barberia-api --runtime "DOTNETCORE:9.0" --sku F1
```

### Opción 4: VPS Económico (~$4-6/mes, todo incluido)

Proveedores: **Hetzner**, **Contabo**, **Oracle Cloud Free Tier** (gratis de por vida).

```bash
# En el VPS con Ubuntu/Debian
sudo apt install nginx dotnet-sdk-9.0 nodejs npm

# Backend como servicio systemd
cd backend && dotnet publish -c Release
sudo cp -r bin/Release/net9.0/publish /var/www/barberia-api

# Frontend
cd frontend && ng build
sudo cp -r dist/frontend/browser /var/www/barberia-web

# Nginx como reverse proxy
```

## Base de Datos

Se usa **SQLite** integrado — sin costo adicional de base de datos. El archivo `barberia.db` se crea automáticamente al iniciar el backend con datos de ejemplo pre-cargados (servicios y barberos).

## Características

- Diseño responsivo oscuro con acentos dorados
- Sección Hero con estadísticas
- Catálogo de servicios con precios
- Galería de trabajos
- Perfiles del equipo de barberos
- Sistema de reserva de citas
- Formulario de contacto
- Navegación fluida con scroll suave

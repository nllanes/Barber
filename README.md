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

### Desplegar gratis para mostrar el sitio (demo)

Necesitas **dos cosas**: la API (.NET) en la nube y el **sitio estático** (Angular). Son dominios distintos; por eso debes configurar **`frontend/src/environments/environment.prod.ts`** con la URL del backend y **CORS** en el servidor.

#### 1. Backend gratuito (Railway u otro)

1. Sube el proyecto a **GitHub**.
2. En **[Railway](https://railway.app)** crea un proyecto desde el repo y define la carpeta raíz **`backend`** (o el comando `dotnet publish` / Dockerfile si lo añades).
3. Variables de entorno típicas:
   - `ASPNETCORE_URLS` = `http://0.0.0.0:$PORT`
   - **`Cors__AllowedOrigins`** = Origen(es) del frontend separados por coma **sin espacios extra**. Ejemplos:
     - GitHub Pages (usuario): `https://TU-USUARIO.github.io`
     - Vercel: `https://tu-app.vercel.app`
   - **`PublicAppUrl`** = URL pública **del sitio web** (donde está Angular), para enlaces en correos; ej. `https://TU-USUARIO.github.io/NOMBRE-REPO/`
   - **`BarberTokenSecret`** = cadena larga y aleatoria (no uses la de ejemplo).
   - Opcional: correo **`Smtp__*`** / **`Twilio__*`** como en local.

4. Copia la URL pública del servicio (ej. `https://xxxx.up.railway.app`). **SQLite** en disco gratuito suele ser **efímero**: al redesplegar puede crearse una BD nueva (vale para demo).

#### 2. Frontend gratuito

1. Edita **`frontend/src/environments/environment.prod.ts`**: pon **`BACKEND_ORIGIN`** igual a la URL del API **sin barra final** (ej. `https://xxxx.up.railway.app`). Guarda y haz commit.

2. Genera el sitio estático:

```bash
cd frontend
npm ci
npx ng build --configuration production --base-href /NOMBRE-DEL-REPO/
```

Si usas **dominio propio en la raíz** (`https://midominio.com`), usa `--base-href /`.

3. Sube la carpeta **`frontend/dist/frontend/browser`** a **GitHub Pages**, **Cloudflare Pages**, **Vercel** o **Netlify** (como proyecto estático). En Vercel/Netlify suele bastar con indicar directorio de salida `dist/frontend/browser` y comando build anterior.

#### Opciones rápidas

| Frontend | Backend |
|----------|---------|
| GitHub Pages / Cloudflare Pages | Railway / Render |
| Vercel / Netlify | Railway / Fly.io |

La tabla anterior del README (`Opciones de Despliegue Económico`) amplía variantes (Azure, VPS).

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

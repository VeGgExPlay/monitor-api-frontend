# Frontend — API Monitor V2

Panel de monitoreo de APIs con gráficas, alertas en tiempo real (polling), dark mode y roles.

## Stack

- **Framework**: React 18 + Vite 6
- **Lenguaje**: JavaScript (ES modules)
- **Estilos**: Tailwind CSS 3.4 (mobile-first, dark mode por clase)
- **Gráficas**: Chart.js + react-chartjs-2
- **Animaciones**: Framer Motion
- **Routing**: React Router DOM 7
- **Tests**: Vitest + Testing Library

## Estructura

```
frontend/
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Rutas, providers, layout
│   ├── pages/
│   │   ├── Login.jsx       # Login con credenciales demo
│   │   ├── Dashboard.jsx   # Métricas globales, gráficas, últimos checks
│   │   ├── Monitors.jsx    # CRUD monitores, indicador de alertas
│   │   ├── MonitorDetail.jsx # Detalle, checks, historial, latencia en el tiempo
│   │   ├── Alerts.jsx      # Panel de alertas con filtros y acciones
│   │   └── Profile.jsx     # Perfil, tema
│   ├── components/
│   │   └── ui/
│   │       ├── Card.jsx, Badge.jsx, Button.jsx, Input.jsx, TextArea.jsx, Select.jsx
│   │       ├── Navbar.jsx  # Navegación responsive, menú móvil, AlertBadge
│   │       ├── AlertBadge.jsx # Badge de alertas abiertas en navbar
│   │       └── icons/       # Iconos SVG inline (Heroicons-style)
│   ├── context/
│   │   ├── AuthContext.jsx  # Estado de autenticación
│   │   └── ThemeContext.jsx # Dark/light mode con persistencia en localStorage
│   ├── services/
│   │   └── api.js           # Capa HTTP única (fetch centralizado)
│   ├── constants/
│   │   └── index.js         # Colores de status y métodos HTTP
│   ├── utils/
│   │   └── index.js         # Formateo de fechas, latencia, cn
│   └── test/
│       ├── setup.js
│       ├── api.test.js      # Tests del servicio API
│       └── components.test.jsx # Tests de AlertBadge y Alerts
├── public/
├── Dockerfile
├── nginx.conf
├── vite.config.js
└── package.json
```

## Scripts

```bash
npm run dev          # Servidor de desarrollo (Vite) en http://localhost:5173
npm run build        # Build de producción en /dist
npm run preview      # Preview del build
npm test             # Tests (Vitest)
npm run test:watch   # Tests en modo watch
```

## Variables de entorno

No requiere variables locales. En desarrollo, Vite proxy mapea `/api` a `http://localhost:3001`.

En producción (Docker/nginx), el frontend se sirve como archivos estáticos y nginx redirige `/api` al backend.

## Características

- **Dashboard**: métricas globales (monitores, checks, éxito, fallos, alertas, uptime), gráficas de latencia, distribución de status y checks por monitor
- **Monitores**: CRUD completo, búsqueda, paginación, pausar/activar, indicador de alertas activas por monitor
- **Detalle de monitor**: checks recientes, gráfica de latencia en el tiempo, historial de cambios
- **Alertas**: panel dedicado con filtros (todas/abiertas/leídas/cerradas), marcar como leída, cerrar, marcar todas como leídas, auto-marcar como leídas al abrir, polling cada 30s
- **Badge en navbar**: contador de alertas abiertas con polling cada 30s
- **Dark mode**: toggle con persistencia en localStorage
- **Responsive**: mobile-first, menú hamburguesa en navbar, tablas con overflow horizontal

## Testing

```bash
npm test
```

Cobertura actual:

- API service: endpoints disponibles
- Componentes: AlertBadge render, Alerts page render

## Build y despliegue

```bash
npm run build
```

El build genera archivos estáticos en `dist/`. En Docker, se sirven con nginx-alpine y `nginx.conf` incluye:

- SPA fallback (`try_files $uri /index.html`)
- Proxy de `/api` al backend en `http://backend:3001`

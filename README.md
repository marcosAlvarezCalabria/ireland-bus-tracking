# 🚌 IRELAND BUS TRACKING
**Informe Técnico del Proyecto — v3**
TFM · Master en Software Development con IA · BIG School
Marcos Álvarez Calabria · Abril 2026
Desarrollado con: OpenAI Codex (implementación) + Claude (arquitectura y validación)

## 1. Resumen Ejecutivo
Ireland Bus Tracking es una Progressive Web App (PWA) que predice los retrasos de los autobuses urbanos de Irlanda utilizando datos en tiempo real de la API de Transport for Ireland (TFI) y un modelo de machine learning entrenado con histórico propio.
El proyecto comienza con Galway como ciudad MVP y está diseñado para expandirse progresivamente a otras ciudades irlandesas (Dublin, Cork, etc.).
El problema es real y documentado: los autobuses en Galway llegan frecuentemente con 20-40 minutos de retraso, y las soluciones actuales (Google Maps, TFI Live) solo muestran datos instantáneos sin predicción inteligente.

| Aspecto | Detalle |
| --- | --- |
| Problema | Retrasos impredecibles de 20-40 min en buses de Galway city |
| Solución | PWA con predicción ML sobre datos GTFS-RT de TFI |
| Referente | OneBusAway (Seattle) — open source Apache 2.0 |
| Herramienta de desarrollo | OpenAI Codex (implementación) + Claude (arquitectura y validación) |
| Infraestructura | VPS Hostinger KVM2 existente — 2 vCPUs, 8GB RAM, 100GB NVMe |
| Viabilidad TFM | 90% |
| Viabilidad comercial | 35-40% — BusConnects Galway llega en 2027 |

## 2. Repositorio
GitHub: https://github.com/marcosAlvarezCalabria/ireland-bus-tracking

## 3. Arquitectura — Clean Architecture estricta
- **domain/** → Entidades puras e interfaces. Cero dependencias externas.
- **application/** → Casos de uso. Solo depende de interfaces del domain.
- **infrastructure/** → Implementaciones concretas (BD, APIs externas).
- **presentation/** → Controllers Express, componentes React.

## 4. Stack
| Capa | Tecnología |
| --- | --- |
| Scraper | Node.js + TypeScript → TimescaleDB |
| Backend API | Node.js + Express + TypeScript |
| ML Service | Python + FastAPI + XGBoost |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Leaflet.js |
| Tests | Vitest + Supertest + pytest |
| Base de datos | PostgreSQL 16 + TimescaleDB |

## 5. Fuente de Datos
API de Transport for Ireland (TFI) — developer.nationaltransport.ie

| Feed | Frecuencia TFI | Contenido |
| --- | --- | --- |
| GTFS estático | Cada pocos días | Rutas, paradas, horarios teóricos |
| GTFS-RT Vehicle Positions | Cada 30s | Posición GPS en tiempo real |
| GTFS-RT Trip Updates | Cada 30s | Retrasos en tiempo real |

Nota: TFI actualiza sus feeds cada 30 segundos. Nuestro scraper consulta esos feeds cada 60 segundos respetando el rate limit de la API.

## 6. Infraestructura VPS
Hostinger KVM2 — openclaw-user
DB: `postgresql://openclaw_admin:openclaw2026@localhost:5432/galway_bus`

| Proceso | RAM estimada | Gestor |
| --- | --- | --- |
| OpenClaw (existente) | ~200 MB | PM2 |
| PostgreSQL + TimescaleDB | ~300 MB | Systemd |
| GTFS Collector | ~100 MB | PM2 |
| Backend API | ~150 MB | PM2 |
| ML Service | ~300 MB | PM2 |
| Nginx | ~50 MB | Systemd |
| **TOTAL** | **~1.1 GB** | de 8GB disponibles |

## 7. Reglas críticas del servidor
- NUNCA añadir ON CONFLICT en inserts de TimescaleDB
- NUNCA insertar más de 9000 rows en una sola query
- NUNCA bajar POLL_INTERVAL_MS por debajo de 60000
- NUNCA tocar la base de datos metrics ni procesos de OpenClaw

## 8. Estado actual — 22 Abril 2026

✅ **Fase 1 — Recopilación de datos (COMPLETADA)**
- PostgreSQL 16 + TimescaleDB instalado y tuneado en VPS
- Base de datos `galway_bus` con 3 tablas: `stops`, `raw_positions`, `trip_updates`
- Scraper GTFS-RT funcionando en PM2, polling cada 60s
- ~275.000 posiciones y ~1.28M actualizaciones de retraso acumuladas
- 7 tests en verde

✅ **Fase 2 — Backend API (COMPLETADA)**
Estructura: `apps/backend/` — Node.js + Express + TypeScript + Clean Architecture
Endpoints implementados:
| Endpoint | Descripción | Estado |
| --- | --- | --- |
| `GET /health` | Health check | ✅ Real |
| `GET /stops?lat=&lng=&radius=` | Paradas cercanas (Haversine) | ✅ Real |
| `GET /arrivals/:stopId` | Llegadas en tiempo real desde TimescaleDB | ✅ Real |
| `GET /prediction/:stopId/:routeId` | Predicción de retraso ML | 🔶 Placeholder |

Tests: 11/11 en verde (Vitest + Supertest)
Seguridad: Helmet, CORS, validación Zod en env, fail-fast al arranque
Pendiente: Despliegue en VPS (PM2 + Nginx)

## 9. Plan de desarrollo — Fases pendientes

**Fase 3 — Despliegue backend en VPS**
- Configurar PM2 ecosystem.config.js
- Configurar Nginx como reverse proxy
- Variables de entorno en producción

**Fase 4 — Modelo ML**
- EDA sobre histórico acumulado
- Feature engineering (hora, día, ruta, parada)
- Entrenamiento XGBoost + evaluación MAE/RMSE
- FastAPI para inferencia
- Conectar con endpoint `/prediction`

**Fase 5 — Frontend React PWA**
- Scaffold React + TypeScript + Vite + Tailwind
- Mapa con Leaflet.js
- ArrivalBoard (tiempos reales vs predichos)
- Sistema de favoritos
- Service Worker + modo offline

## 10. Estructura del repositorio
```text
ireland-bus-tracking/
├── AGENTS.md
├── apps/
│   ├── frontend/          React + TypeScript + Vite (PWA) — pendiente
│   └── backend/           Node.js + Express + TypeScript ✅
│       ├── src/
│       │   ├── domain/         Stop, Arrival, Prediction
│       │   ├── application/    GetNearbyStops, GetArrivals, GetPrediction
│       │   ├── infrastructure/ PostgresStopRepo, PostgresArrivalRepo, StubPredictionRepo, db.ts
│       │   ├── presentation/   stops-router, arrivals-router, prediction-router
│       │   ├── config/         env.ts (Zod)
│       │   └── server.ts / index.ts
│       └── tests/
├── services/
│   ├── gtfs-collector/    Scraper TypeScript → TimescaleDB ✅
│   └── ml-service/        Python + FastAPI + XGBoost — pendiente
├── db/
├── docs/
└── deploy/
```

Ireland Bus Tracking · Marcos Álvarez Calabria · Abril 2026 · v3
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

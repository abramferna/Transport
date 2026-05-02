# PRD — TransGirBcn (Plataforma de Transportes Girona ⇄ Barcelona)

## Original problem statement
Construyeme una plataforma en la cual, se ofrecen transportes de mercancias (especializados en Girona-Barcelona y cercanias). Modelos: Cargas semanales con precio cerrado para profesionales (B2B) o cargas/descargas particulares (B2C) con variantes (puerta a puerta). Tarifas relacionadas con horario establecido; fuera de horario (a partir de las 18h) recargo, etc.

## User personas
- **Profesional / pyme (B2B):** envíos recurrentes, busca tarifa plana semanal y previsibilidad.
- **Particular (B2C):** envío puntual, valora calculadora rápida y opción puerta-a-puerta.
- **Admin operador:** revisa solicitudes y gestiona estados (pendiente → en ruta → entregado).

## Architecture
- Backend: FastAPI + Motor (MongoDB). Pricing engine determinista. Resend opcional vía env.
- Frontend: React (CRA) + Tailwind + Shadcn UI. Phosphor icons. Cabinet Grotesk + IBM Plex Sans.
- Sin autenticación en esta fase.

## Implemented (2026-02 MVP)
- ✅ Landing pública con Hero, modelos B2B/B2C, planes semanales, calculadora interactiva, mapa de cobertura, flota, FAQ, footer.
- ✅ Calculadora de tarifas en tiempo real con recargo nocturno (≥18h), sábado/domingo.
- ✅ Solicitud de presupuesto B2B/B2C → MongoDB con referencia única (TR + YYMMDD + 4 hex).
- ✅ Panel admin `/admin` con stats, tabla y modal de detalle + cambio de estado.
- ✅ Página `/seguimiento` con timeline de estado.
- ✅ Botón flotante de WhatsApp + Telegram.
- ✅ Email transaccional Resend (no-op si falta API key).

## Backlog (P0/P1/P2)
- P1: Configurar `RESEND_API_KEY` y `ADMIN_NOTIFY_EMAIL` para emails reales.
- P1: Calendario de disponibilidad (shadcn Calendar) para fecha preferida.
- P2: Autenticación admin (PIN o JWT) para proteger `/admin`.
- P2: Pasarela de pago con Stripe para reservar B2C.
- P2: Multi-idioma (CA/ES/EN).
- P2: Mapa interactivo (Mapbox/Leaflet) con ruta dinámica.
- P2: Subida de fotos de la mercancía en el formulario.
- P2: Importación masiva de cargas desde CSV (B2B).

## Notes
- Las imágenes se sirven desde Pexels/Unsplash CDN.
- Pricing: ver `calculate_price()` en `server.py`.

# Vianord - Transport de Mercancies Catalunya

A transport/logistics quote management app for Vianord, a Girona-based freight transport company operating routes between Girona, Barcelona, and La Jonquera.

## Architecture

- **Frontend**: React 19 + CRACO + Tailwind CSS + shadcn/ui, runs on port 5000
- **Backend**: FastAPI (Python), runs on port 8001
- **Database**: MongoDB 6.0.5, runs on port 27017 (local instance at `/tmp/mongodb/data`)

## Project Structure

```
/
├── frontend/          # React CRA + CRACO app
│   ├── src/
│   │   ├── pages/     # Landing, Admin, Tracking
│   │   ├── components/ # UI components + shadcn/ui
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # api.js, utils.js
│   └── craco.config.js  # Dev server config (port 5000, proxy /api → 8001)
├── backend/
│   ├── server.py      # FastAPI app with pricing engine + MongoDB
│   ├── towns.py       # Catalan towns data with distances
│   └── requirements.txt
└── start.sh           # Startup script (MongoDB + backend + frontend)
```

## Key Features

- **Pricing engine**: Calculates freight costs based on distance (km from Girona base), weight/volume, add-ons (plataforma, round_trip, urgente), time slots, and weekend surcharges
- **Quote management**: Create and track quotes with reference numbers; B2B and B2C workflows
- **Weekly plans**: Básico (199€/week), Estándar (449€/week), Premium (899€/week)
- **Email notifications**: Via Resend API (optional)
- **Admin panel**: `/admin` - list and manage quotes
- **Tracking**: `/seguimiento/:reference` - track quote status

## Dev Setup

The workflow `Start application` runs `bash start.sh` which:
1. Starts MongoDB 6.0.5 from nix store
2. Starts the FastAPI backend on port 8001
3. Starts the React frontend (CRACO) on port 5000

The CRACO dev server proxies `/api` requests to `http://localhost:8001`.

## Environment Variables

- `MONGO_URL` - MongoDB connection string (default: `mongodb://localhost:27017`)
- `DB_NAME` - MongoDB database name (default: `vianord`)
- `RESEND_API_KEY` - Resend API key for email notifications (optional)
- `SENDER_EMAIL` - From email address for notifications
- `ADMIN_NOTIFY_EMAIL` - Admin email for new quote notifications
- `CORS_ORIGINS` - Comma-separated allowed origins (default: `*`)
- `WHATSAPP_NUMBER` - WhatsApp contact number
- `TELEGRAM_USERNAME` - Telegram contact username

## Important Notes

- MongoDB binary path: `/nix/store/3z9iq2gr9ddb0ncmxjlv81ngn6b4nm70-mongodb-6.0.5/bin/mongod`
- MongoDB 3.4 (from nix package) crashes with segfault - must use the 6.0.5 binary directly from nix store
- The `emergentintegrations==0.1.0` package is not publicly available; install deps with `grep -v emergentintegrations requirements.txt | pip install -r /dev/stdin`
- `ajv` was upgraded to v8 in frontend to fix a webpack compatibility issue
- Frontend uses relative API URL (`""`) so CRACO proxy handles backend routing in dev

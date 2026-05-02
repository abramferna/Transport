from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import secrets
import resend
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_NOTIFY_EMAIL = os.environ.get('ADMIN_NOTIFY_EMAIL', '')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ----------------- Pricing engine -----------------
ROUTE_BASE = {
    "girona-barcelona": 35.0,
    "barcelona-girona": 35.0,
    "girona-cercanias": 22.0,
    "barcelona-cercanias": 22.0,
    "intra-girona": 18.0,
    "intra-barcelona": 18.0,
    "otros": 55.0,
}

WEIGHT_TIERS = [
    (50, 0.0),
    (200, 15.0),
    (500, 35.0),
    (1000, 80.0),
    (2000, 140.0),
    (10000, 220.0),
]

SERVICE_VARIANTS = {
    "estandar": {"label": "Estándar (muelle)", "surcharge": 0.0, "multiplier": 1.0},
    "puerta": {"label": "Puerta a puerta", "surcharge": 12.0, "multiplier": 1.0},
    "urgente": {"label": "Urgente (mismo día)", "surcharge": 25.0, "multiplier": 1.30},
}

WEEKLY_PLANS = [
    {
        "id": "basico",
        "name": "Plan Básico",
        "price_week": 119,
        "frequency": "1 día / semana",
        "weight_limit_kg": 200,
        "stops": 3,
        "highlights": ["Ruta fija Girona ⇄ Barcelona", "Hasta 200 kg / viaje", "3 paradas incluidas", "Aviso 24h antes"],
        "best_for": "Pymes y autónomos con envíos puntuales",
    },
    {
        "id": "estandar",
        "name": "Plan Estándar",
        "price_week": 289,
        "frequency": "2-3 días / semana",
        "weight_limit_kg": 500,
        "stops": 6,
        "highlights": ["Días pactados (L-X-V)", "Hasta 500 kg / viaje", "6 paradas incluidas", "Reporte semanal"],
        "best_for": "Tiendas y distribuidores recurrentes",
        "popular": True,
    },
    {
        "id": "premium",
        "name": "Plan Premium",
        "price_week": 599,
        "frequency": "Diario L-V",
        "weight_limit_kg": 1000,
        "stops": 12,
        "highlights": ["Servicio diario L-V", "Hasta 1.000 kg / viaje", "12 paradas incluidas", "Soporte prioritario"],
        "best_for": "Operadores logísticos y e-commerce",
    },
]


def weight_surcharge(weight_kg: float) -> float:
    for limit, charge in WEIGHT_TIERS:
        if weight_kg <= limit:
            return charge
    return WEIGHT_TIERS[-1][1] + 60.0


def calculate_price(route: str, weight_kg: float, service: str, hour: int, weekday: int, distance_km: Optional[float] = None) -> dict:
    base = ROUTE_BASE.get(route, ROUTE_BASE["otros"])
    w_charge = weight_surcharge(weight_kg)
    variant = SERVICE_VARIANTS.get(service, SERVICE_VARIANTS["estandar"])

    subtotal = base + w_charge + variant["surcharge"]
    if distance_km and distance_km > 80:
        subtotal += (distance_km - 80) * 0.55

    multiplier = variant["multiplier"]

    breakdown = {
        "base_route": round(base, 2),
        "weight_surcharge": round(w_charge, 2),
        "service_surcharge": round(variant["surcharge"], 2),
        "service_multiplier": multiplier,
    }

    nocturno_extra = 0.0
    if hour >= 18 or hour < 7:
        nocturno_extra = subtotal * 0.25
        breakdown["nocturno_recargo_25"] = round(nocturno_extra, 2)

    weekend_extra = 0.0
    if weekday == 5:  # sábado
        weekend_extra = 15.0
        breakdown["sabado"] = 15.0
    elif weekday == 6:  # domingo
        weekend_extra = 30.0
        breakdown["domingo_festivo"] = 30.0

    total = (subtotal + nocturno_extra + weekend_extra) * multiplier
    iva = total * 0.21
    total_iva = total + iva

    return {
        "currency": "EUR",
        "breakdown": breakdown,
        "subtotal": round(subtotal, 2),
        "total_sin_iva": round(total, 2),
        "iva_21": round(iva, 2),
        "total_con_iva": round(total_iva, 2),
        "service_label": variant["label"],
    }


# ----------------- Models -----------------
class CalculateRequest(BaseModel):
    route: str
    weight_kg: float = Field(ge=0, le=20000)
    service: Literal["estandar", "puerta", "urgente"] = "estandar"
    hour: int = Field(ge=0, le=23, default=10)
    weekday: int = Field(ge=0, le=6, default=2)
    distance_km: Optional[float] = None


class QuoteCreate(BaseModel):
    tipo: Literal["b2b", "b2c"]
    plan_id: Optional[str] = None
    nombre: str
    empresa: Optional[str] = None
    email: EmailStr
    telefono: str
    origen: str
    destino: str
    route: Optional[str] = None
    peso_kg: Optional[float] = None
    volumen_m3: Optional[float] = None
    servicio: Optional[str] = None  # estandar/puerta/urgente
    fecha_preferida: Optional[str] = None
    hora_preferida: Optional[int] = None
    weekday: Optional[int] = None
    descripcion: Optional[str] = None
    estimated_price: Optional[float] = None


class Quote(BaseModel):
    id: str
    reference: str
    tipo: str
    plan_id: Optional[str] = None
    nombre: str
    empresa: Optional[str] = None
    email: str
    telefono: str
    origen: str
    destino: str
    route: Optional[str] = None
    peso_kg: Optional[float] = None
    volumen_m3: Optional[float] = None
    servicio: Optional[str] = None
    fecha_preferida: Optional[str] = None
    hora_preferida: Optional[int] = None
    weekday: Optional[int] = None
    descripcion: Optional[str] = None
    estimated_price: Optional[float] = None
    status: str = "pendiente"
    created_at: datetime
    updated_at: datetime


class StatusUpdate(BaseModel):
    status: Literal["pendiente", "confirmado", "en_ruta", "entregado", "cancelado"]


# ----------------- Email helpers -----------------
def _build_admin_html(q: dict) -> str:
    rows = "".join(
        f"<tr><td style='padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px'>{k}</td><td style='padding:6px 10px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:600'>{v}</td></tr>"
        for k, v in q.items() if v not in (None, "", [])
    )
    return f"""
    <div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff'>
      <div style='background:#0F172A;padding:24px'>
        <div style='color:#FBBF24;font-size:11px;letter-spacing:3px;text-transform:uppercase'>Nueva solicitud</div>
        <div style='color:#fff;font-size:22px;font-weight:800;margin-top:6px'>Presupuesto #{q.get('reference')}</div>
      </div>
      <table style='width:100%;border-collapse:collapse;background:#fff'>{rows}</table>
    </div>
    """


def _build_client_html(q: dict) -> str:
    return f"""
    <div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff'>
      <div style='background:#1E3A8A;padding:28px'>
        <div style='color:#FBBF24;font-size:11px;letter-spacing:3px;text-transform:uppercase'>Solicitud recibida</div>
        <div style='color:#fff;font-size:24px;font-weight:800;margin-top:8px'>Hola {q.get('nombre')}, gracias.</div>
      </div>
      <div style='padding:24px;color:#0f172a'>
        <p>Hemos recibido tu solicitud de presupuesto. Te contactaremos en menos de 4 horas hábiles.</p>
        <p><strong>Referencia:</strong> {q.get('reference')}</p>
        <p><strong>Ruta:</strong> {q.get('origen')} → {q.get('destino')}</p>
        <p style='margin-top:24px;padding:16px;background:#FBBF24;color:#0F172A;font-weight:700'>Transportes Girona ⇄ Barcelona</p>
      </div>
    </div>
    """


async def send_email_safe(to: str, subject: str, html: str):
    if not RESEND_API_KEY or not to:
        return None
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        return await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return None


# ----------------- Routes -----------------
@api_router.get("/")
async def root():
    return {"status": "ok", "service": "Transportes Girona-Barcelona API"}


@api_router.get("/plans")
async def get_plans():
    return {"plans": WEEKLY_PLANS}


@api_router.get("/routes")
async def get_routes():
    return {
        "routes": [{"id": k, "label": k.replace("-", " ⇄ ").title()} for k in ROUTE_BASE.keys()],
        "services": [{"id": k, **v} for k, v in SERVICE_VARIANTS.items()],
    }


@api_router.post("/calculate")
async def calculate(req: CalculateRequest):
    return calculate_price(req.route, req.weight_kg, req.service, req.hour, req.weekday, req.distance_km)


def _gen_reference() -> str:
    return "TR" + datetime.now(timezone.utc).strftime("%y%m%d") + secrets.token_hex(2).upper()


@api_router.post("/quotes", response_model=Quote)
async def create_quote(payload: QuoteCreate):
    now = datetime.now(timezone.utc)
    quote = Quote(
        id=str(uuid.uuid4()),
        reference=_gen_reference(),
        status="pendiente",
        created_at=now,
        updated_at=now,
        **payload.model_dump(),
    )
    doc = quote.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.quotes.insert_one(doc)

    # Fire & forget emails
    asyncio.create_task(send_email_safe(
        ADMIN_NOTIFY_EMAIL,
        f"[Nuevo presupuesto] {quote.reference} · {quote.origen}→{quote.destino}",
        _build_admin_html(doc),
    ))
    asyncio.create_task(send_email_safe(
        quote.email,
        f"Hemos recibido tu solicitud · Ref. {quote.reference}",
        _build_client_html(doc),
    ))
    return quote


@api_router.get("/quotes", response_model=List[Quote])
async def list_quotes():
    items = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
        if isinstance(it.get("updated_at"), str):
            it["updated_at"] = datetime.fromisoformat(it["updated_at"])
    return items


@api_router.get("/quotes/{reference}", response_model=Quote)
async def get_quote(reference: str):
    item = await db.quotes.find_one({"reference": reference.upper()}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    if isinstance(item.get("created_at"), str):
        item["created_at"] = datetime.fromisoformat(item["created_at"])
    if isinstance(item.get("updated_at"), str):
        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
    return item


@api_router.patch("/quotes/{reference}/status", response_model=Quote)
async def update_status(reference: str, payload: StatusUpdate):
    now = datetime.now(timezone.utc).isoformat()
    res = await db.quotes.find_one_and_update(
        {"reference": reference.upper()},
        {"$set": {"status": payload.status, "updated_at": now}},
        return_document=True,
        projection={"_id": 0},
    )
    if not res:
        raise HTTPException(status_code=404, detail="No encontrado")
    if isinstance(res.get("created_at"), str):
        res["created_at"] = datetime.fromisoformat(res["created_at"])
    if isinstance(res.get("updated_at"), str):
        res["updated_at"] = datetime.fromisoformat(res["updated_at"])
    return res


@api_router.get("/stats")
async def stats():
    total = await db.quotes.count_documents({})
    b2b = await db.quotes.count_documents({"tipo": "b2b"})
    b2c = await db.quotes.count_documents({"tipo": "b2c"})
    pendientes = await db.quotes.count_documents({"status": "pendiente"})
    return {"total": total, "b2b": b2b, "b2c": b2c, "pendientes": pendientes}


@api_router.get("/contact-info")
async def contact_info():
    return {
        "whatsapp": os.environ.get("WHATSAPP_NUMBER", ""),
        "telegram": os.environ.get("TELEGRAM_USERNAME", ""),
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

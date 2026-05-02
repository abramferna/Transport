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
from towns import TOWNS, get_town


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
# Mínimo por salir de la base (Girona). Irrenunciable.
BASE_MINIMUM = 100.0
# Coste por km recorrido desde la base (Girona)
COST_PER_KM = 0.60
# Premium proximidad a Barcelona (zona alta demanda) — fade en 30 km
BCN_PREMIUM_MAX = 30.0
BCN_PREMIUM_FADE_KM = 30
# Premium proximidad a La Jonquera (frontera, retorno en vacío) — fade en 15 km
JQ_PREMIUM_MAX = 25.0
JQ_PREMIUM_FADE_KM = 15

# Tiers de peso facturable (max real, volumétrico). Camión 12T MMA con 6.000 kg payload.
WEIGHT_TIERS = [
    (200, 0.0),
    (500, 25.0),
    (1000, 60.0),
    (2000, 120.0),
    (3500, 200.0),
    (5000, 280.0),
    (6000, 360.0),
]

# Densidad volumétrica calibrada para nuestro 12T (6000 kg / 34 m³ ≈ 176 kg/m³).
VOLUMETRIC_FACTOR = 176

SERVICE_VARIANTS = {
    "estandar": {"label": "Estándar (muelle)", "surcharge": 0.0, "multiplier": 1.0},
    "puerta": {"label": "Puerta a puerta (con plataforma)", "surcharge": 35.0, "multiplier": 1.0},
    "urgente": {"label": "Urgente (mismo día)", "surcharge": 60.0, "multiplier": 1.30},
}

# Recargo fin de semana: base ×2 + extras ×1.15
WEEKEND_BASE_MULTIPLIER = 2.0
WEEKEND_EXTRAS_MULTIPLIER = 1.15

WEEKLY_PLANS = [
    {
        "id": "basico",
        "name": "Plan Básico",
        "price_week": 199,
        "frequency": "1 día / semana",
        "weight_limit_kg": 1500,
        "volume_limit_m3": 8,
        "stops": 3,
        "highlights": ["Ruta fija Girona ⇄ Barcelona", "Hasta 1.500 kg / 8 m³", "3 paradas en polígonos", "Aviso 24h antes"],
        "best_for": "Pymes y autónomos con envíos puntuales paletizados",
    },
    {
        "id": "estandar",
        "name": "Plan Estándar",
        "price_week": 449,
        "frequency": "2-3 días / semana",
        "weight_limit_kg": 3000,
        "volume_limit_m3": 18,
        "stops": 6,
        "highlights": ["Días pactados (L-X-V)", "Hasta 3.000 kg / 18 m³", "6 paradas en polígonos", "Reporte semanal"],
        "best_for": "Distribuidores y operadores recurrentes",
        "popular": True,
    },
    {
        "id": "premium",
        "name": "Plan Premium",
        "price_week": 899,
        "frequency": "Diario L-V",
        "weight_limit_kg": 6000,
        "volume_limit_m3": 34,
        "stops": 12,
        "highlights": ["Servicio diario L-V", "Camión 12T completo · 34 m³", "12 paradas en polígonos", "Soporte prioritario"],
        "best_for": "Cargas completas / operadores logísticos",
    },
]


def weight_surcharge(weight_kg: float) -> float:
    for limit, charge in WEIGHT_TIERS:
        if weight_kg <= limit:
            return charge
    return WEIGHT_TIERS[-1][1] + 60.0


def calculate_price(
    origin_town: str,
    destination_town: str,
    weight_kg: float,
    service: str,
    hour: int,
    weekday: int,
    volume_m3: float = 0,
) -> dict:
    origin = get_town(origin_town) or get_town("girona")
    dest = get_town(destination_town) or get_town("barcelona")

    # Ruta facturable basada en la pierna más larga desde la base (Girona).
    # Sale-y-vuelve desde Girona, así que cobramos sobre el punto más alejado.
    far_km_gi = max(origin["km_gi"], dest["km_gi"])
    near_km_bcn = min(origin["km_bcn"], dest["km_bcn"])
    near_km_jq = min(origin["km_jq"], dest["km_jq"])

    distance_charge = far_km_gi * COST_PER_KM
    bcn_premium = max(0.0, 1 - near_km_bcn / BCN_PREMIUM_FADE_KM) * BCN_PREMIUM_MAX
    jq_premium = max(0.0, 1 - near_km_jq / JQ_PREMIUM_FADE_KM) * JQ_PREMIUM_MAX

    route_base = BASE_MINIMUM + distance_charge + bcn_premium + jq_premium

    # Peso facturable
    vol = volume_m3 or 0
    volumetric_kg = vol * VOLUMETRIC_FACTOR
    chargeable_kg = max(weight_kg, volumetric_kg)
    w_charge = weight_surcharge(chargeable_kg)

    variant = SERVICE_VARIANTS.get(service, SERVICE_VARIANTS["estandar"])
    s_charge = variant["surcharge"]

    is_weekend = weekday in (5, 6)

    breakdown = {
        "origen": origin["name"],
        "destino": dest["name"],
        "km_recorridos_aprox": far_km_gi,
        "minimo_salida_base": BASE_MINIMUM,
        "coste_km": round(distance_charge, 2),
        "premium_barcelona": round(bcn_premium, 2),
        "premium_jonquera": round(jq_premium, 2),
        "ruta_base": round(route_base, 2),
        "chargeable_kg": round(chargeable_kg, 1),
        "volumetric_kg": round(volumetric_kg, 1),
        "weight_surcharge": round(w_charge, 2),
        "service_surcharge": round(s_charge, 2),
        "service_multiplier": variant["multiplier"],
    }

    if is_weekend:
        route_base = route_base * WEEKEND_BASE_MULTIPLIER
        breakdown["fin_de_semana_base_x2"] = round(route_base, 2)

    extras = w_charge + s_charge
    if is_weekend:
        extras = extras * WEEKEND_EXTRAS_MULTIPLIER
        breakdown["fin_de_semana_extras_x1_15"] = round(extras, 2)

    subtotal = route_base + extras

    nocturno_extra = 0.0
    if hour >= 18 or hour < 7:
        nocturno_extra = subtotal * 0.25
        breakdown["nocturno_recargo_25"] = round(nocturno_extra, 2)

    total = (subtotal + nocturno_extra) * variant["multiplier"]
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
        "is_weekend": is_weekend,
    }


# ----------------- Models -----------------
class CalculateRequest(BaseModel):
    origin_town: str = "girona"
    destination_town: str = "barcelona"
    weight_kg: float = Field(ge=0, le=6000)
    volume_m3: float = Field(ge=0, le=34, default=0)
    service: Literal["estandar", "puerta", "urgente"] = "estandar"
    hour: int = Field(ge=0, le=23, default=10)
    weekday: int = Field(ge=0, le=6, default=2)


class QuoteCreate(BaseModel):
    tipo: Literal["b2b", "b2c"]
    plan_id: Optional[str] = None
    nombre: str
    empresa: Optional[str] = None
    email: EmailStr
    telefono: str
    origen: str
    destino: str
    origin_town: Optional[str] = None
    destination_town: Optional[str] = None
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
    origin_town: Optional[str] = None
    destination_town: Optional[str] = None
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
        "services": [{"id": k, **v} for k, v in SERVICE_VARIANTS.items()],
    }


@api_router.post("/calculate")
async def calculate(req: CalculateRequest):
    return calculate_price(req.origin_town, req.destination_town, req.weight_kg, req.service, req.hour, req.weekday, req.volume_m3)


@api_router.get("/towns")
async def get_towns():
    # Agrupado por comarca
    comarcas = {}
    for t in TOWNS:
        comarcas.setdefault(t["comarca"], []).append(t)
    grouped = [{"comarca": c, "towns": v} for c, v in comarcas.items()]
    return {"towns": TOWNS, "grouped": grouped}


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

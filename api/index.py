from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import os
import uuid
import secrets
import resend
from datetime import datetime, timezone
from supabase import create_client, Client

from towns import TOWNS, get_town


# ── Supabase ───────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_KEY", "")
)
_sb: Optional[Client] = (
    create_client(SUPABASE_URL, SUPABASE_KEY)
    if SUPABASE_URL and SUPABASE_KEY
    else None
)


# ── Resend ─────────────────────────────────────────────────────────────────────
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL   = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_EMAIL    = os.environ.get("ADMIN_NOTIFY_EMAIL", "")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


# ── FastAPI app ────────────────────────────────────────────────────────────────
app = FastAPI(title="ViaNordTrans API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


# ═══════════════════════════════════════════════════════════════════════════════
#  PRICING ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

BASE_MINIMUM   = 85.0
COST_PER_KM    = 0.60
BCN_PREMIUM_MAX = 0.0
BCN_PREMIUM_FADE_KM = 30
JQ_PREMIUM_MAX  = 0.0
JQ_PREMIUM_FADE_KM  = 15
VOLUMETRIC_FACTOR   = 176

WEIGHT_TIERS = [
    (200,  0.0),
    (500,  15.0),
    (1000, 36.0),
    (2000, 72.0),
    (3500, 120.0),
    (5000, 168.0),
    (6000, 216.0),
]

ADDONS = {
    "plataforma": {
        "label": "Plataforma elevadora",
        "flat": 35.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "tauliner": {
        "label": "Tauliner",
        "flat": 35.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "descarga_small": {
        "label": "Descarga con plataforma 1–3 palets",
        "flat": 35.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "descarga_media": {
        "label": "Descarga con plataforma hasta 8 palets",
        "flat": 70.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "full_truck": {
        "label": "Descarga camión completo con plataforma",
        "flat": 110.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "descarga_extra": {
        "label": "Descarga extra misma población",
        "flat": 25.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "descarga_muelle": {
        "label": "Descarga muelle · conductor",
        "flat": 40.0, "route_pct": 0.0, "multiplier": 1.0,
    },
    "urgente": {
        "label": "Urgente · sin planificar (<24h)",
        "flat": 0.0, "route_pct": 0.0, "multiplier": 1.20,
    },
}

TIME_SLOTS = {
    "manana":   {"label": "Mañana · 8-11h",        "hour": 9},
    "mediodia": {"label": "Mediodía · 12-15h",      "hour": 13},
    "tarde":    {"label": "Tarde · 15-17h",          "hour": 16},
    "nocturno": {"label": "Nocturno · 18h+ (+25%)", "hour": 19},
}

WEEKLY_PLANS = [
    {
        "id": "basico",
        "name": "Plan Básico",
        "price_week": 199,
        "frequency": "1 día / semana",
        "weight_limit_kg": 2500,
        "volume_limit_m3": 8,
        "stops": 2,
        "highlights": [
            "1 día semanal pactado",
            "Hasta 2 paradas · radio ~10 km",
            "Todo el Gironès + punta BCN o Jonquera",
            "Con o sin plataforma · hasta 2.500 kg",
        ],
        "best_for": "Pymes y autónomos con necesidad semanal puntual",
    },
    {
        "id": "estandar",
        "name": "Plan Estándar",
        "price_week": 449,
        "frequency": "2-3 días / semana",
        "weight_limit_kg": 4000,
        "volume_limit_m3": 18,
        "stops": 4,
        "highlights": [
            "2-3 días pactados (ej. L-X-V)",
            "Hasta 4 paradas · radio ~20 km",
            "Todo el Gironès + puntas BCN y Jonquera",
            "Con o sin plataforma · hasta 4.000 kg",
        ],
        "best_for": "Distribuidores y empresas con reparto regular",
        "popular": True,
    },
    {
        "id": "premium",
        "name": "Plan Premium",
        "price_week": 899,
        "frequency": "Diario L-V",
        "weight_limit_kg": 6000,
        "volume_limit_m3": 34,
        "stops": 6,
        "highlights": [
            "Servicio diario de lunes a viernes",
            "Hasta 6 paradas · radio ~20 km",
            "Todo el Gironès + BCN y Jonquera",
            "Con o sin plataforma · hasta 6.000 kg",
        ],
        "best_for": "Operadores logísticos y cargas completas diarias",
    },
]


def big_load_discount(chargeable_kg: float) -> float:
    if chargeable_kg < 1000:  return 0.0
    if chargeable_kg < 2500:  return 0.10
    if chargeable_kg < 5000:  return 0.20
    return 0.30


def weight_surcharge(weight_kg: float) -> float:
    for limit, charge in WEIGHT_TIERS:
        if weight_kg <= limit:
            return charge
    return WEIGHT_TIERS[-1][1] + 60.0


WEEKEND_BASE_MULTIPLIER   = 2.0
WEEKEND_EXTRAS_MULTIPLIER = 1.15


def calculate_price(
    origin_town: str,
    destination_town: str,
    weight_kg: float,
    addons: List[str],
    hour: int,
    weekday: int,
    volume_m3: float = 0,
) -> dict:
    origin = get_town(origin_town) or get_town("girona")
    dest   = get_town(destination_town) or get_town("barcelona")

    far_km_gi    = max(origin["km_gi"], dest["km_gi"])
    near_km_bcn  = min(origin["km_bcn"], dest["km_bcn"])
    near_km_jq   = min(origin["km_jq"], dest["km_jq"])

    distance_charge = far_km_gi * COST_PER_KM
    bcn_premium = max(0.0, 1 - near_km_bcn / BCN_PREMIUM_FADE_KM) * BCN_PREMIUM_MAX
    jq_premium  = max(0.0, 1 - near_km_jq  / JQ_PREMIUM_FADE_KM)  * JQ_PREMIUM_MAX

    route_base = BASE_MINIMUM + distance_charge + bcn_premium + jq_premium

    vol           = volume_m3 or 0
    volumetric_kg = vol * VOLUMETRIC_FACTOR
    chargeable_kg = max(weight_kg, volumetric_kg)
    w_charge_full = weight_surcharge(chargeable_kg)
    big_disc      = big_load_discount(chargeable_kg)
    w_discount    = w_charge_full * big_disc
    w_charge      = w_charge_full - w_discount

    addons_clean    = [a for a in (addons or []) if a in ADDONS]
    addon_flat      = sum(ADDONS[a]["flat"]      for a in addons_clean)
    addon_route_pct = sum(ADDONS[a]["route_pct"] for a in addons_clean)
    addon_multiplier = 1.0
    for a in addons_clean:
        addon_multiplier *= ADDONS[a]["multiplier"]

    route_pct_charge = route_base * addon_route_pct
    is_weekend       = weekday in (5, 6)

    breakdown = {
        "origen":                  origin["name"],
        "destino":                 dest["name"],
        "km_recorridos_aprox":     far_km_gi,
        "minimo_salida_base":      BASE_MINIMUM,
        "coste_km":                round(distance_charge, 2),
        "premium_barcelona":       round(bcn_premium, 2),
        "premium_jonquera":        round(jq_premium, 2),
        "ruta_base":               round(route_base, 2),
        "chargeable_kg":           round(chargeable_kg, 1),
        "volumetric_kg":           round(volumetric_kg, 1),
        "weight_surcharge":        round(w_charge, 2),
        "weight_full":             round(w_charge_full, 2),
        "big_load_discount_pct":   round(big_disc * 100),
        "big_load_discount_amount":round(w_discount, 2),
        "addons":                  [{"id": a, "label": ADDONS[a]["label"]} for a in addons_clean],
        "addons_flat":             round(addon_flat, 2),
        "addons_route_pct_charge": round(route_pct_charge, 2),
        "addons_multiplier":       addon_multiplier,
    }

    if is_weekend:
        route_base = route_base * WEEKEND_BASE_MULTIPLIER
        breakdown["fin_de_semana_base_x2"] = round(route_base, 2)

    extras = w_charge + addon_flat + route_pct_charge
    if is_weekend:
        extras = extras * WEEKEND_EXTRAS_MULTIPLIER
        breakdown["fin_de_semana_extras_x1_15"] = round(extras, 2)

    subtotal     = route_base + extras
    nocturno_extra = 0.0
    if hour >= 18 or hour < 7:
        nocturno_extra = subtotal * 0.25
        breakdown["nocturno_recargo_25"] = round(nocturno_extra, 2)

    total     = (subtotal + nocturno_extra) * addon_multiplier
    iva       = total * 0.21
    total_iva = total + iva

    service_label = (
        " + ".join(ADDONS[a]["label"] for a in addons_clean)
        if addons_clean else "Estándar (muelle)"
    )

    return {
        "currency":       "EUR",
        "breakdown":      breakdown,
        "subtotal":       round(subtotal, 2),
        "total_sin_iva":  round(total, 2),
        "iva_21":         round(iva, 2),
        "total_con_iva":  round(total_iva, 2),
        "service_label":  service_label,
        "is_weekend":     is_weekend,
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class CalculateRequest(BaseModel):
    origin_town:      str   = "girona"
    destination_town: str   = "barcelona"
    weight_kg:        float = Field(ge=0, le=6000)
    volume_m3:        float = Field(ge=0, le=34, default=0)
    addons:           List[str] = []
    time_slot:        Optional[str] = None
    hour:             int   = Field(ge=0, le=23, default=10)
    weekday:          int   = Field(ge=0, le=6,  default=2)


class QuoteCreate(BaseModel):
    tipo:             Literal["b2b", "b2c"]
    plan_id:          Optional[str]   = None
    nombre:           str
    empresa:          Optional[str]   = None
    email:            EmailStr
    telefono:         str
    origen:           str
    destino:          str
    origin_town:      Optional[str]   = None
    destination_town: Optional[str]   = None
    peso_kg:          Optional[float] = None
    volumen_m3:       Optional[float] = None
    addons:           Optional[List[str]] = None
    time_slot:        Optional[str]   = None
    servicio:         Optional[str]   = None
    fecha_preferida:  Optional[str]   = None
    hora_preferida:   Optional[int]   = None
    weekday:          Optional[int]   = None
    descripcion:      Optional[str]   = None
    estimated_price:  Optional[float] = None


class Quote(BaseModel):
    id:               str
    reference:        str
    tipo:             str
    plan_id:          Optional[str]   = None
    nombre:           str
    empresa:          Optional[str]   = None
    email:            str
    telefono:         str
    origen:           str
    destino:          str
    origin_town:      Optional[str]   = None
    destination_town: Optional[str]   = None
    peso_kg:          Optional[float] = None
    volumen_m3:       Optional[float] = None
    addons:           Optional[List[str]] = None
    time_slot:        Optional[str]   = None
    servicio:         Optional[str]   = None
    fecha_preferida:  Optional[str]   = None
    hora_preferida:   Optional[int]   = None
    weekday:          Optional[int]   = None
    descripcion:      Optional[str]   = None
    estimated_price:  Optional[float] = None
    status:           str = "pendiente"
    created_at:       datetime
    updated_at:       Optional[datetime] = None


class StatusUpdate(BaseModel):
    status: Literal["pendiente", "confirmado", "en_ruta", "entregado", "cancelado"]


# ═══════════════════════════════════════════════════════════════════════════════
#  EMAIL HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _row(label: str, value) -> str:
    if value in (None, "", [], 0):
        return ""
    return (
        f"<tr>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#64748B;"
        f"font-size:12px;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;width:38%'>{label}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#0F172A;font-weight:600'>{value}</td>"
        f"</tr>"
    )


def _build_admin_html(q: dict) -> str:
    addons_str  = ", ".join(q.get("addons") or []) or "—"
    precio      = (
        f"{q.get('estimated_price', 0):.2f} € (IVA incl.)"
        if q.get("estimated_price") else "—"
    )
    tipo_label  = "Plan B2B semanal" if q.get("tipo") == "b2b" else "Servicio puntual B2C"
    telefono_clean = (q.get("telefono") or "").replace(" ", "").replace("+34", "")

    return f"""
    <div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #E2E8F0'>
      <div style='background:#0F172A;padding:24px 28px'>
        <div style='color:#FBBF24;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px'>
          Nueva solicitud de presupuesto
        </div>
        <div style='color:#fff;font-size:22px;font-weight:800'>Ref. {q.get('reference')}</div>
        <div style='color:#94A3B8;font-size:13px;margin-top:4px'>{tipo_label}</div>
      </div>

      <div style='padding:20px 28px 0'>
        <div style='font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:8px'>Cliente</div>
      </div>
      <table style='width:100%;border-collapse:collapse'>
        {_row("Nombre",   q.get("nombre"))}
        {_row("Empresa",  q.get("empresa"))}
        {_row("Email",    q.get("email"))}
        {_row("Teléfono", q.get("telefono"))}
      </table>

      <div style='padding:20px 28px 0'>
        <div style='font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:8px'>Envío</div>
      </div>
      <table style='width:100%;border-collapse:collapse'>
        {_row("Origen",         q.get("origen"))}
        {_row("Destino",        q.get("destino"))}
        {_row("Peso",           f"{q.get('peso_kg')} kg" if q.get('peso_kg') else None)}
        {_row("Volumen",        f"{q.get('volumen_m3')} m³" if q.get('volumen_m3') else None)}
        {_row("Franja recogida",q.get("time_slot"))}
        {_row("Fecha preferida",q.get("fecha_preferida"))}
        {_row("Extras",         addons_str)}
        {_row("Descripción",    q.get("descripcion"))}
      </table>

      <div style='padding:20px 28px 0'>
        <div style='font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:8px'>Precio estimado</div>
      </div>
      <table style='width:100%;border-collapse:collapse'>
        {_row("Estimación", precio)}
        {_row("Plan",       q.get("plan_id"))}
      </table>

      <div style='padding:20px 28px 24px'>
        <a href='mailto:{q.get("email")}'
           style='display:inline-block;background:#FBBF24;color:#0F172A;font-weight:700;
                  padding:10px 20px;text-decoration:none;font-size:14px'>
          Responder al cliente
        </a>
        <a href='https://wa.me/34{telefono_clean}'
           style='display:inline-block;background:#25D366;color:#fff;font-weight:700;
                  padding:10px 20px;text-decoration:none;font-size:14px;margin-left:8px'>
          WhatsApp
        </a>
      </div>

      <div style='background:#F8FAFC;padding:12px 28px;border-top:1px solid #E2E8F0'>
        <span style='color:#94A3B8;font-size:11px'>
          ViaNordTrans · Transporte Catalunya · abramferna@gmail.com
        </span>
      </div>
    </div>
    """


def _build_client_html(q: dict) -> str:
    precio = (
        f"{q.get('estimated_price', 0):.2f} € (IVA incl.)"
        if q.get("estimated_price") else "pendiente de confirmar"
    )
    return f"""
    <div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #E2E8F0'>
      <div style='background:#1E3A8A;padding:28px'>
        <div style='color:#FBBF24;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px'>
          Solicitud recibida
        </div>
        <div style='color:#fff;font-size:22px;font-weight:800'>Hola {q.get('nombre')}, gracias.</div>
      </div>
      <div style='padding:28px;color:#0f172a'>
        <p style='margin:0 0 16px;color:#475569'>
          Hemos recibido tu solicitud. Te contactaremos en menos de 4 horas hábiles
          para confirmar el presupuesto.
        </p>
        <table style='width:100%;border-collapse:collapse;background:#F8FAFC;border:1px solid #E2E8F0'>
          {_row("Referencia", q.get("reference"))}
          {_row("Ruta",       f"{q.get('origen')} → {q.get('destino')}")}
          {_row("Estimación", precio)}
        </table>
        <p style='margin:24px 0 0;color:#94A3B8;font-size:12px'>
          ViaNordTrans · Transporte de mercancías · Catalunya<br>
          Tel: +34 673 392 259 · ViaNord@gmail.com
        </p>
      </div>
    </div>
    """


def _send_email(to: str, subject: str, html: str) -> None:
    if not RESEND_API_KEY or not to:
        return
    try:
        resend.Emails.send({"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html})
    except Exception as e:
        print(f"[Email] Error sending to {to}: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _gen_reference() -> str:
    return "TR" + datetime.now(timezone.utc).strftime("%y%m%d") + secrets.token_hex(2).upper()


def _sb_check():
    if not _sb:
        raise HTTPException(status_code=503, detail="Base de datos no configurada")


def _parse_quote(row: dict) -> dict:
    for field in ("created_at", "updated_at"):
        val = row.get(field)
        if isinstance(val, str):
            try:
                row[field] = datetime.fromisoformat(val.replace("Z", "+00:00"))
            except Exception:
                row[field] = datetime.now(timezone.utc)
    if row.get("updated_at") is None:
        row["updated_at"] = row.get("created_at") or datetime.now(timezone.utc)
    return row


# ═══════════════════════════════════════════════════════════════════════════════
#  ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@api.get("/")
def root():
    return {"status": "ok", "service": "ViaNordTrans API"}


@api.get("/plans")
def get_plans():
    return {"plans": WEEKLY_PLANS}


@api.get("/routes")
def get_routes():
    return {"addons": [{"id": k, **v} for k, v in ADDONS.items()]}


@api.get("/addons")
def get_addons():
    return {"addons": [{"id": k, **v} for k, v in ADDONS.items()]}


@api.get("/time-slots")
def get_time_slots():
    return {"slots": [{"id": k, **v} for k, v in TIME_SLOTS.items()]}


@api.get("/towns")
def get_towns():
    comarcas: dict = {}
    for t in TOWNS:
        comarcas.setdefault(t["comarca"], []).append(t)
    grouped = [{"comarca": c, "towns": v} for c, v in comarcas.items()]
    return {"towns": TOWNS, "grouped": grouped}


@api.post("/calculate")
def calculate(req: CalculateRequest):
    hour = req.hour
    if req.time_slot and req.time_slot in TIME_SLOTS:
        hour = TIME_SLOTS[req.time_slot]["hour"]
    return calculate_price(
        req.origin_town, req.destination_town,
        req.weight_kg, req.addons, hour, req.weekday, req.volume_m3,
    )


@api.post("/quotes", response_model=Quote)
def create_quote(payload: QuoteCreate):
    _sb_check()
    now = datetime.now(timezone.utc)
    quote_id  = str(uuid.uuid4())
    reference = _gen_reference()

    # Only include columns that exist in the current Supabase schema.
    # Extra fields (origin_town, destination_town, etc.) are stored only
    # after running supabase_migration_vercel.sql in the Supabase dashboard.
    row = {
        "id":               quote_id,
        "reference":        reference,
        "tipo":             payload.tipo,
        "plan_id":          payload.plan_id,
        "nombre":           payload.nombre,
        "empresa":          payload.empresa,
        "email":            str(payload.email),
        "telefono":         payload.telefono,
        "origen":           payload.origen,
        "destino":          payload.destino,
        "peso_kg":          payload.peso_kg,
        "volumen_m3":       payload.volumen_m3,
        "addons":           payload.addons or [],
        "time_slot":        payload.time_slot,
        "fecha_preferida":  payload.fecha_preferida,
        "descripcion":      payload.descripcion,
        "estimated_price":  payload.estimated_price,
        "status":           "pendiente",
        "created_at":       now.isoformat(),
    }

    # Include extended columns if available (after migration)
    extended = {
        "updated_at":       now.isoformat(),
        "origin_town":      payload.origin_town,
        "destination_town": payload.destination_town,
        "servicio":         payload.servicio,
        "hora_preferida":   payload.hora_preferida,
        "weekday":          payload.weekday,
    }
    # Try inserting with extended columns; fall back to base columns if needed
    try:
        result = _sb.table("quotes").insert({**row, **extended}).execute()
    except Exception:
        result = _sb.table("quotes").insert(row).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Error al guardar el presupuesto")

    # Send emails (sync, fast)
    _send_email(
        ADMIN_EMAIL,
        f"[Nuevo presupuesto] {reference} · {payload.origen}→{payload.destino}",
        _build_admin_html(row),
    )
    _send_email(
        str(payload.email),
        f"Hemos recibido tu solicitud · Ref. {reference}",
        _build_client_html(row),
    )

    row["created_at"] = now
    row["updated_at"] = now
    return row


@api.get("/quotes", response_model=List[Quote])
def list_quotes():
    _sb_check()
    result = (
        _sb.table("quotes")
        .select("*")
        .order("created_at", desc=True)
        .limit(500)
        .execute()
    )
    return [_parse_quote(r) for r in (result.data or [])]


@api.get("/quotes/{reference}", response_model=Quote)
def get_quote(reference: str):
    _sb_check()
    result = (
        _sb.table("quotes")
        .select("*")
        .eq("reference", reference.upper())
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No encontrado")
    return _parse_quote(result.data[0])


@api.patch("/quotes/{reference}/status", response_model=Quote)
def update_status(reference: str, payload: StatusUpdate):
    _sb_check()
    now = datetime.now(timezone.utc).isoformat()
    result = (
        _sb.table("quotes")
        .update({"status": payload.status, "updated_at": now})
        .eq("reference", reference.upper())
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No encontrado")
    return _parse_quote(result.data[0])


@api.get("/stats")
def stats():
    _sb_check()
    rows = _sb.table("quotes").select("tipo,status").execute().data or []
    total     = len(rows)
    b2b       = sum(1 for r in rows if r.get("tipo") == "b2b")
    b2c       = sum(1 for r in rows if r.get("tipo") == "b2c")
    pendientes = sum(1 for r in rows if r.get("status") == "pendiente")
    return {"total": total, "b2b": b2b, "b2c": b2c, "pendientes": pendientes}


@api.get("/contact-info")
def contact_info():
    return {
        "whatsapp": os.environ.get("WHATSAPP_NUMBER", ""),
        "telegram": os.environ.get("TELEGRAM_USERNAME", ""),
    }


# ── Mount router & export ASGI app ───────────────────────────────────────────
app.include_router(api)

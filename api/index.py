"""
ViaNordTrans API — Vercel Serverless Function (lightweight)
Uses only httpx for HTTP calls to Supabase REST API and Resend.
No FastAPI, no supabase-py — stays well under the 250 MB limit.
"""
import json
import os
import secrets
import uuid
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

import httpx

from towns import TOWNS, get_town

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL        = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY        = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY", "")
RESEND_API_KEY      = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL        = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
ADMIN_EMAIL         = os.environ.get("ADMIN_NOTIFY_EMAIL", "")

SB_HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}

# ═══════════════════════════════════════════════════════════════════════════════
#  PRICING ENGINE  (identical logic to backend/server.py)
# ═══════════════════════════════════════════════════════════════════════════════

BASE_MINIMUM        = 85.0
COST_PER_KM         = 0.60
BCN_PREMIUM_MAX     = 0.0
BCN_PREMIUM_FADE_KM = 30
JQ_PREMIUM_MAX      = 0.0
JQ_PREMIUM_FADE_KM  = 15
VOLUMETRIC_FACTOR   = 176

WEIGHT_TIERS = [
    (200,  0.0), (500, 15.0), (1000, 36.0),
    (2000, 72.0), (3500, 120.0), (5000, 168.0), (6000, 216.0),
]

ADDONS = {
    "plataforma":      {"label": "Plataforma elevadora",                    "flat": 35.0,  "route_pct": 0.0, "multiplier": 1.0},
    "tauliner":        {"label": "Tauliner",                                "flat": 35.0,  "route_pct": 0.0, "multiplier": 1.0},
    "descarga_small":  {"label": "Descarga con plataforma 1–3 palets",      "flat": 35.0,  "route_pct": 0.0, "multiplier": 1.0},
    "descarga_media":  {"label": "Descarga con plataforma hasta 8 palets",  "flat": 70.0,  "route_pct": 0.0, "multiplier": 1.0},
    "full_truck":      {"label": "Descarga camión completo con plataforma",  "flat": 110.0, "route_pct": 0.0, "multiplier": 1.0},
    "descarga_extra":  {"label": "Descarga extra misma población",           "flat": 25.0,  "route_pct": 0.0, "multiplier": 1.0},
    "descarga_muelle": {"label": "Descarga muelle · conductor",              "flat": 40.0,  "route_pct": 0.0, "multiplier": 1.0},
    "urgente":         {"label": "Urgente · sin planificar (<24h)",          "flat": 0.0,   "route_pct": 0.0, "multiplier": 1.20},
}

TIME_SLOTS = {
    "manana":   {"label": "Mañana · 8-11h",        "hour": 9},
    "mediodia": {"label": "Mediodía · 12-15h",      "hour": 13},
    "tarde":    {"label": "Tarde · 15-17h",          "hour": 16},
    "nocturno": {"label": "Nocturno · 18h+ (+25%)", "hour": 19},
}

WEEKLY_PLANS = [
    {"id": "basico",   "name": "Plan Básico",    "price_week": 199, "frequency": "1 día / semana",  "weight_limit_kg": 2500, "volume_limit_m3": 8,  "stops": 2,
     "highlights": ["1 día semanal pactado", "Hasta 2 paradas · radio ~10 km", "Todo el Gironès + punta BCN o Jonquera", "Con o sin plataforma · hasta 2.500 kg"],
     "best_for": "Pymes y autónomos con necesidad semanal puntual"},
    {"id": "estandar", "name": "Plan Estándar",  "price_week": 449, "frequency": "2-3 días / semana", "weight_limit_kg": 4000, "volume_limit_m3": 18, "stops": 4,
     "highlights": ["2-3 días pactados (ej. L-X-V)", "Hasta 4 paradas · radio ~20 km", "Todo el Gironès + puntas BCN y Jonquera", "Con o sin plataforma · hasta 4.000 kg"],
     "best_for": "Distribuidores y empresas con reparto regular", "popular": True},
    {"id": "premium",  "name": "Plan Premium",   "price_week": 899, "frequency": "Diario L-V",     "weight_limit_kg": 6000, "volume_limit_m3": 34, "stops": 6,
     "highlights": ["Servicio diario de lunes a viernes", "Hasta 6 paradas · radio ~20 km", "Todo el Gironès + BCN y Jonquera", "Con o sin plataforma · hasta 6.000 kg"],
     "best_for": "Operadores logísticos y cargas completas diarias"},
]


def _weight_surcharge(kg):
    for limit, charge in WEIGHT_TIERS:
        if kg <= limit:
            return charge
    return WEIGHT_TIERS[-1][1] + 60.0


def _big_load_discount(kg):
    if kg < 1000: return 0.0
    if kg < 2500: return 0.10
    if kg < 5000: return 0.20
    return 0.30


def calculate_price(origin_id, dest_id, weight_kg, addons, hour, weekday, volume_m3=0):
    origin = get_town(origin_id) or get_town("girona")
    dest   = get_town(dest_id)   or get_town("barcelona")

    far_km_gi   = max(origin["km_gi"], dest["km_gi"])
    near_km_bcn = min(origin["km_bcn"], dest["km_bcn"])
    near_km_jq  = min(origin["km_jq"], dest["km_jq"])

    dist_charge = far_km_gi * COST_PER_KM
    bcn_premium = max(0.0, 1 - near_km_bcn / BCN_PREMIUM_FADE_KM) * BCN_PREMIUM_MAX
    jq_premium  = max(0.0, 1 - near_km_jq  / JQ_PREMIUM_FADE_KM)  * JQ_PREMIUM_MAX
    route_base  = BASE_MINIMUM + dist_charge + bcn_premium + jq_premium

    vol_kg        = (volume_m3 or 0) * VOLUMETRIC_FACTOR
    chargeable_kg = max(weight_kg, vol_kg)
    w_full        = _weight_surcharge(chargeable_kg)
    big_disc      = _big_load_discount(chargeable_kg)
    w_charge      = w_full * (1 - big_disc)

    addons_clean    = [a for a in (addons or []) if a in ADDONS]
    addon_flat      = sum(ADDONS[a]["flat"]      for a in addons_clean)
    addon_route_pct = sum(ADDONS[a]["route_pct"] for a in addons_clean)
    addon_mult      = 1.0
    for a in addons_clean:
        addon_mult *= ADDONS[a]["multiplier"]

    route_pct_charge = route_base * addon_route_pct
    is_weekend       = weekday in (5, 6)

    if is_weekend:
        route_base = route_base * 2.0

    extras = w_charge + addon_flat + route_pct_charge
    if is_weekend:
        extras = extras * 1.15

    subtotal       = route_base + extras
    nocturno_extra = subtotal * 0.25 if (hour >= 18 or hour < 7) else 0.0
    total          = (subtotal + nocturno_extra) * addon_mult
    iva            = total * 0.21

    service_label = (
        " + ".join(ADDONS[a]["label"] for a in addons_clean)
        if addons_clean else "Estándar (muelle)"
    )
    return {
        "currency":      "EUR",
        "subtotal":      round(subtotal, 2),
        "total_sin_iva": round(total, 2),
        "iva_21":        round(iva, 2),
        "total_con_iva": round(total + iva, 2),
        "service_label": service_label,
        "is_weekend":    is_weekend,
        "breakdown": {
            "origen":                   origin["name"],
            "destino":                  dest["name"],
            "km_recorridos_aprox":      far_km_gi,
            "minimo_salida_base":       BASE_MINIMUM,
            "coste_km":                 round(dist_charge, 2),
            "ruta_base":                round(route_base, 2),
            "chargeable_kg":            round(chargeable_kg, 1),
            "volumetric_kg":            round(vol_kg, 1),
            "weight_surcharge":         round(w_charge, 2),
            "big_load_discount_pct":    round(big_disc * 100),
            "addons":                   [{"id": a, "label": ADDONS[a]["label"]} for a in addons_clean],
            "addons_flat":              round(addon_flat, 2),
            "addons_multiplier":        addon_mult,
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
#  SUPABASE HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def sb_get(table, filters=None, order=None, limit=500):
    params = {}
    if filters:
        params.update(filters)
    if order:
        params["order"] = order
    if limit:
        params["limit"] = str(limit)
    r = httpx.get(f"{SUPABASE_URL}/rest/v1/{table}", headers=SB_HEADERS, params=params)
    r.raise_for_status()
    return r.json()


def sb_insert(table, row):
    r = httpx.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=SB_HEADERS, json=row)
    r.raise_for_status()
    return r.json()


def sb_update(table, filters, data):
    r = httpx.patch(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=SB_HEADERS,
        params=filters,
        json=data,
    )
    r.raise_for_status()
    return r.json()


# ═══════════════════════════════════════════════════════════════════════════════
#  EMAIL HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _row(label, value):
    if value in (None, "", [], 0):
        return ""
    return (
        f"<tr>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;width:38%'>{label}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #E2E8F0;color:#0F172A;font-weight:600'>{value}</td>"
        f"</tr>"
    )


def _admin_html(q):
    addons_str = ", ".join(q.get("addons") or []) or "—"
    precio     = f"{q.get('estimated_price', 0):.2f} € (IVA incl.)" if q.get("estimated_price") else "—"
    tipo_label = "Plan B2B semanal" if q.get("tipo") == "b2b" else "Servicio puntual B2C"
    tel        = (q.get("telefono") or "").replace(" ", "").replace("+34", "")
    return f"""
    <div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #E2E8F0'>
      <div style='background:#0F172A;padding:24px 28px'>
        <div style='color:#FBBF24;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px'>Nueva solicitud de presupuesto</div>
        <div style='color:#fff;font-size:22px;font-weight:800'>Ref. {q.get('reference')}</div>
        <div style='color:#94A3B8;font-size:13px;margin-top:4px'>{tipo_label}</div>
      </div>
      <div style='padding:20px 28px 0'><div style='font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:8px'>Cliente</div></div>
      <table style='width:100%;border-collapse:collapse'>
        {_row("Nombre", q.get("nombre"))}{_row("Empresa", q.get("empresa"))}{_row("Email", q.get("email"))}{_row("Teléfono", q.get("telefono"))}
      </table>
      <div style='padding:20px 28px 0'><div style='font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:8px'>Envío</div></div>
      <table style='width:100%;border-collapse:collapse'>
        {_row("Origen", q.get("origen"))}{_row("Destino", q.get("destino"))}
        {_row("Peso", f"{q.get('peso_kg')} kg" if q.get('peso_kg') else None)}
        {_row("Volumen", f"{q.get('volumen_m3')} m³" if q.get('volumen_m3') else None)}
        {_row("Franja recogida", q.get("time_slot"))}{_row("Fecha preferida", q.get("fecha_preferida"))}
        {_row("Extras", addons_str)}{_row("Descripción", q.get("descripcion"))}
      </table>
      <div style='padding:20px 28px 0'><div style='font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-bottom:8px'>Precio estimado</div></div>
      <table style='width:100%;border-collapse:collapse'>
        {_row("Estimación", precio)}{_row("Plan", q.get("plan_id"))}
      </table>
      <div style='padding:20px 28px 24px'>
        <a href='mailto:{q.get("email")}' style='display:inline-block;background:#FBBF24;color:#0F172A;font-weight:700;padding:10px 20px;text-decoration:none;font-size:14px'>Responder al cliente</a>
        <a href='https://wa.me/34{tel}' style='display:inline-block;background:#25D366;color:#fff;font-weight:700;padding:10px 20px;text-decoration:none;font-size:14px;margin-left:8px'>WhatsApp</a>
      </div>
      <div style='background:#F8FAFC;padding:12px 28px;border-top:1px solid #E2E8F0'>
        <span style='color:#94A3B8;font-size:11px'>ViaNordTrans · Transporte Catalunya · abramferna@gmail.com</span>
      </div>
    </div>"""


def _client_html(q):
    precio = f"{q.get('estimated_price', 0):.2f} € (IVA incl.)" if q.get("estimated_price") else "pendiente de confirmar"
    return f"""
    <div style='font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;border:1px solid #E2E8F0'>
      <div style='background:#1E3A8A;padding:28px'>
        <div style='color:#FBBF24;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px'>Solicitud recibida</div>
        <div style='color:#fff;font-size:22px;font-weight:800'>Hola {q.get('nombre')}, gracias.</div>
      </div>
      <div style='padding:28px;color:#0f172a'>
        <p style='margin:0 0 16px;color:#475569'>Hemos recibido tu solicitud. Te contactaremos en menos de 4 horas hábiles para confirmar el presupuesto.</p>
        <table style='width:100%;border-collapse:collapse;background:#F8FAFC;border:1px solid #E2E8F0'>
          {_row("Referencia", q.get("reference"))}{_row("Ruta", f"{q.get('origen')} → {q.get('destino')}")}{_row("Estimación", precio)}
        </table>
        <p style='margin:24px 0 0;color:#94A3B8;font-size:12px'>ViaNordTrans · Transporte de mercancías · Catalunya<br>Tel: +34 673 392 259 · ViaNord@gmail.com</p>
      </div>
    </div>"""


def send_email(to, subject, html):
    if not RESEND_API_KEY or not to:
        return
    try:
        httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json={"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html},
            timeout=10,
        )
    except Exception as e:
        print(f"[Email error] {e}")


# ═══════════════════════════════════════════════════════════════════════════════
#  REQUEST HANDLER
# ═══════════════════════════════════════════════════════════════════════════════

def _gen_reference():
    return "TR" + datetime.now(timezone.utc).strftime("%y%m%d") + secrets.token_hex(2).upper()


def _json_response(data, status=200):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(data, default=str),
    }


def _err(msg, status=400):
    return _json_response({"error": msg}, status)


def handler(request, context=None):
    method  = request.get("method", "GET").upper()
    path    = request.get("path", "/")
    body_raw = request.get("body", "") or ""

    # Strip /api prefix so routes are clean
    route = path.removeprefix("/api").rstrip("/") or "/"

    # CORS preflight
    if method == "OPTIONS":
        return _json_response({})

    # Parse body
    body = {}
    if body_raw:
        try:
            body = json.loads(body_raw)
        except Exception:
            pass

    # Parse query string
    parsed = urlparse(path)
    qs     = parse_qs(parsed.query)

    # ── Routes ────────────────────────────────────────────────────────────────

    if route == "/" or route == "":
        return _json_response({"status": "ok", "service": "ViaNordTrans API"})

    if route == "/plans":
        return _json_response({"plans": WEEKLY_PLANS})

    if route == "/addons":
        return _json_response({"addons": [{"id": k, **v} for k, v in ADDONS.items()]})

    if route == "/time-slots":
        return _json_response({"slots": [{"id": k, **v} for k, v in TIME_SLOTS.items()]})

    if route == "/routes":
        return _json_response({"addons": [{"id": k, **v} for k, v in ADDONS.items()]})

    if route == "/towns":
        comarcas = {}
        for t in TOWNS:
            comarcas.setdefault(t["comarca"], []).append(t)
        grouped = [{"comarca": c, "towns": v} for c, v in comarcas.items()]
        return _json_response({"towns": TOWNS, "grouped": grouped})

    if route == "/contact-info":
        return _json_response({
            "whatsapp": os.environ.get("WHATSAPP_NUMBER", ""),
            "telegram": os.environ.get("TELEGRAM_USERNAME", ""),
        })

    if route == "/calculate" and method == "POST":
        try:
            ts   = body.get("time_slot")
            hour = TIME_SLOTS[ts]["hour"] if ts in TIME_SLOTS else int(body.get("hour", 10))
            result = calculate_price(
                body.get("origin_town", "girona"),
                body.get("destination_town", "barcelona"),
                float(body.get("weight_kg", 0)),
                body.get("addons", []),
                hour,
                int(body.get("weekday", 2)),
                float(body.get("volume_m3", 0)),
            )
            return _json_response(result)
        except Exception as e:
            return _err(str(e))

    if route == "/quotes" and method == "GET":
        if not SUPABASE_URL:
            return _err("DB not configured", 503)
        try:
            rows = sb_get("quotes", order="created_at.desc", limit=500)
            return _json_response(rows)
        except Exception as e:
            return _err(str(e), 500)

    if route == "/quotes" and method == "POST":
        if not SUPABASE_URL:
            return _err("DB not configured", 503)
        try:
            now = datetime.now(timezone.utc).isoformat()
            row = {
                "id":              str(uuid.uuid4()),
                "reference":       _gen_reference(),
                "tipo":            body.get("tipo", "b2c"),
                "plan_id":         body.get("plan_id"),
                "nombre":          body.get("nombre", ""),
                "empresa":         body.get("empresa"),
                "email":           body.get("email", ""),
                "telefono":        body.get("telefono", ""),
                "origen":          body.get("origen", ""),
                "destino":         body.get("destino", ""),
                "peso_kg":         body.get("peso_kg"),
                "volumen_m3":      body.get("volumen_m3"),
                "addons":          body.get("addons") or [],
                "time_slot":       body.get("time_slot"),
                "fecha_preferida": body.get("fecha_preferida"),
                "descripcion":     body.get("descripcion"),
                "estimated_price": body.get("estimated_price"),
                "status":          "pendiente",
                "created_at":      now,
            }
            saved = sb_insert("quotes", row)
            result = saved[0] if isinstance(saved, list) and saved else row
            # Emails
            send_email(ADMIN_EMAIL,
                f"[Nuevo presupuesto] {row['reference']} · {row['origen']}→{row['destino']}",
                _admin_html(row))
            send_email(row["email"],
                f"Hemos recibido tu solicitud · Ref. {row['reference']}",
                _client_html(row))
            return _json_response(result, 201)
        except Exception as e:
            return _err(str(e), 500)

    if route == "/stats":
        if not SUPABASE_URL:
            return _err("DB not configured", 503)
        try:
            rows = sb_get("quotes", limit=2000)
            total      = len(rows)
            b2b        = sum(1 for r in rows if r.get("tipo") == "b2b")
            b2c        = sum(1 for r in rows if r.get("tipo") == "b2c")
            pendientes = sum(1 for r in rows if r.get("status") == "pendiente")
            return _json_response({"total": total, "b2b": b2b, "b2c": b2c, "pendientes": pendientes})
        except Exception as e:
            return _err(str(e), 500)

    # /quotes/{reference}
    if route.startswith("/quotes/") and "/" not in route[len("/quotes/"):]:
        reference = route[len("/quotes/"):].upper()

        if method == "GET":
            if not SUPABASE_URL:
                return _err("DB not configured", 503)
            try:
                rows = sb_get("quotes", filters={"reference": f"eq.{reference}"}, limit=1)
                if not rows:
                    return _err("No encontrado", 404)
                return _json_response(rows[0])
            except Exception as e:
                return _err(str(e), 500)

        if method == "PATCH" and route.endswith("/status"):
            # handled below
            pass

    # /quotes/{reference}/status
    if route.startswith("/quotes/") and route.endswith("/status") and method == "PATCH":
        parts     = route.split("/")
        reference = parts[2].upper() if len(parts) > 2 else ""
        if not SUPABASE_URL:
            return _err("DB not configured", 503)
        try:
            now    = datetime.now(timezone.utc).isoformat()
            status = body.get("status", "pendiente")
            rows   = sb_update("quotes",
                {"reference": f"eq.{reference}"},
                {"status": status, "updated_at": now},
            )
            if not rows:
                return _err("No encontrado", 404)
            return _json_response(rows[0] if isinstance(rows, list) else rows)
        except Exception as e:
            return _err(str(e), 500)

    return _err("Not found", 404)

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://logistics-pro-120.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- Basic endpoints -----
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_plans(client):
    r = client.get(f"{API}/plans")
    assert r.status_code == 200
    plans = r.json()["plans"]
    ids = {p["id"] for p in plans}
    assert ids == {"basico", "estandar", "premium"}


def test_routes(client):
    r = client.get(f"{API}/routes")
    assert r.status_code == 200
    data = r.json()
    assert "routes" in data and "services" in data
    assert any(rt["id"] == "girona-barcelona" for rt in data["routes"])
    sids = {s["id"] for s in data["services"]}
    assert {"estandar", "puerta", "urgente"} <= sids


def test_contact_info(client):
    r = client.get(f"{API}/contact-info")
    assert r.status_code == 200
    d = r.json()
    assert "whatsapp" in d and "telegram" in d


# ----- Calculate -----
def test_calculate_basic(client):
    r = client.post(f"{API}/calculate", json={
        "route": "girona-barcelona", "weight_kg": 150,
        "service": "puerta", "hour": 10, "weekday": 2
    })
    assert r.status_code == 200
    d = r.json()
    # base 35 + weight tier 200=>15 + puerta 12 = 62
    assert d["subtotal"] == 62.0
    assert "nocturno_recargo_25" not in d["breakdown"]
    assert "sabado" not in d["breakdown"]
    assert "domingo_festivo" not in d["breakdown"]
    # total no extras: 62 * 1.0 = 62, iva 13.02, total 75.02
    assert d["total_sin_iva"] == 62.0
    assert d["total_con_iva"] == round(62 * 1.21, 2)


def test_calculate_nocturno(client):
    r = client.post(f"{API}/calculate", json={
        "route": "girona-barcelona", "weight_kg": 150,
        "service": "puerta", "hour": 19, "weekday": 2
    })
    assert r.status_code == 200
    d = r.json()
    assert "nocturno_recargo_25" in d["breakdown"]
    # 62 * 0.25 = 15.5
    assert d["breakdown"]["nocturno_recargo_25"] == 15.5


def test_calculate_sabado(client):
    r = client.post(f"{API}/calculate", json={
        "route": "girona-barcelona", "weight_kg": 150,
        "service": "puerta", "hour": 10, "weekday": 5
    })
    assert r.status_code == 200
    d = r.json()
    assert d["breakdown"].get("sabado") == 15.0


def test_calculate_domingo(client):
    r = client.post(f"{API}/calculate", json={
        "route": "girona-barcelona", "weight_kg": 150,
        "service": "puerta", "hour": 10, "weekday": 6
    })
    assert r.status_code == 200
    d = r.json()
    assert d["breakdown"].get("domingo_festivo") == 30.0


# ----- Quotes (B2C/B2B) -----
@pytest.fixture(scope="module")
def b2c_ref(client):
    payload = {
        "tipo": "b2c", "nombre": "TEST_Cliente", "email": "test@example.com",
        "telefono": "600000001", "origen": "Girona", "destino": "Barcelona",
        "route": "girona-barcelona", "peso_kg": 150, "servicio": "puerta",
        "hora_preferida": 10, "weekday": 2, "estimated_price": 75.02
    }
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["reference"].startswith("TR")
    assert len(d["reference"]) == 12  # TR + YYMMDD(6) + 4hex
    assert "_id" not in d
    return d["reference"]


def test_create_b2c(b2c_ref):
    assert b2c_ref


def test_create_b2b(client):
    payload = {
        "tipo": "b2b", "plan_id": "estandar", "nombre": "TEST_Empresa",
        "empresa": "Acme", "email": "biz@example.com", "telefono": "600000002",
        "origen": "Girona", "destino": "Barcelona"
    }
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["tipo"] == "b2b"
    assert d["plan_id"] == "estandar"
    assert "_id" not in d


def test_list_quotes(client):
    r = client.get(f"{API}/quotes")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    for it in items[:5]:
        assert "_id" not in it
        assert "reference" in it


def test_get_quote(client, b2c_ref):
    r = client.get(f"{API}/quotes/{b2c_ref}")
    assert r.status_code == 200
    assert r.json()["reference"] == b2c_ref


def test_get_quote_404(client):
    r = client.get(f"{API}/quotes/TRZZZZZZZZZZ")
    assert r.status_code == 404


def test_status_flow(client, b2c_ref):
    for st in ["confirmado", "en_ruta", "entregado"]:
        r = client.patch(f"{API}/quotes/{b2c_ref}/status", json={"status": st})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == st
    # Verify persisted
    g = client.get(f"{API}/quotes/{b2c_ref}").json()
    assert g["status"] == "entregado"


def test_stats(client):
    r = client.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["total", "b2b", "b2c", "pendientes"]:
        assert k in d
        assert isinstance(d[k], int)

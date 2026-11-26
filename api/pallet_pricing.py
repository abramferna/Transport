"""Per-pallet destination tariff from the ViaNordTrans calculator supplied by the user."""

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import math
from unicodedata import normalize

ZONES = [
    {
        "id": 1,
        "name": "Girona y Costa Brava central",
        "coverage": "Gironès, Pla de l'Estany, Baix Empordà y Alt Empordà central / Selva central",
        "price": 44,
        "towns": """Aiguaviva|Avinyonet de Puigventós|Banyoles|Begur|Bescanó|Bordils|Borrassà|Cabanelles|Caldes de Malavella|Calonge i Sant Antoni|Campllong|Camós|Cassà de la Selva|Castell d'Aro|Celrà|Cornellà del Terri|Corçà|Crespià|Cruïlles|Esponellà|Figueres|Flaçà|Fontcoberta|Forallac|Fornells de la Selva|Girona|La Bisbal d'Empordà|Lladó|Llagostera|Maçanet de la Selva|Monells|Navata|Palafrugell|Palamós|Pals|Peralada|Platja d'Aro|Porqueres|Quart|Riudarenes|Riudellots de la Selva|Salt|Sant Feliu de Guíxols|Sant Gregori|Sant Julià de Ramis|Santa Coloma de Farners|Santa Cristina d'Aro|Santa Llogaia d'Àlguema|Sarrià de Ter|Serinyà|Sils|Torroella de Montgrí|Ullà|Verges|Vidreres|Vilablareix|Vilademuls|Vilafant|Vilamalla|Vilobí d'Onyar""",
    },
    {
        "id": 2,
        "name": "Resto de Girona y periferia",
        "coverage": "Alt Empordà norte, Garrotxa, Ripollès, Selva norte/costa y Cerdanya",
        "price": 50,
        "towns": """Agullana|Alp|Amer|Anglès|Arbúcies|Argelaguer|Bellver de Cerdanya|Besalú|Blanes|Breda|Cadaqués|Campdevànol|Camprodon|Capmany|Castellfollit de la Roca|Castelló d'Empúries|Colera|Empuriabrava|Ger|Guils de Cerdanya|Hostalric|L'Escala|La Cellera de Ter|La Jonquera|La Vajol|La Vall d'en Bas|Les Preses|Llanars|Llançà|Lloret de Mar|Llívia|Maçanet de Cabrenys|Molló|Montagut i Oix|Olot|Planoles|Portbou|Puigcerdà|Ribes de Freser|Ripoll|Roses|Sant Feliu de Pallerols|Sant Hilari Sacalm|Sant Joan de les Abadesses|Sant Joan les Fonts|Sant Pere Pescador|Santa Pau|Setcases|Tossa de Mar|Tortellà|Vallfogona de Ripollès""",
    },
    {
        "id": 3,
        "name": "Barcelona y área metropolitana",
        "coverage": "Barcelonès, Vallès Occidental, Vallès Oriental, Maresme, Baix Llobregat, Garraf y Alt Penedès",
        "price": 60,
        "towns": """Alella|Arenys de Mar|Argentona|Badalona|Barberà del Vallès|Barcelona|Calella|Canet de Mar|Cardedeu|Castellar del Vallès|Castelldefels|Cerdanyola del Vallès|Cornellà de Llobregat|Cubelles|El Masnou|El Prat de Llobregat|Esplugues de Llobregat|Gavà|Granollers|L'Hospitalet de Llobregat|La Garriga|La Llagosta|Les Franqueses del Vallès|Martorell|Martorelles|Mataró|Mollet del Vallès|Montcada i Reixac|Montmeló|Montornès del Vallès|Olesa de Montserrat|Parets del Vallès|Pineda de Mar|Premià de Dalt|Premià de Mar|Ripollet|Rubí|Sabadell|Sant Adrià de Besòs|Sant Andreu de la Barca|Sant Boi de Llobregat|Sant Celoni|Sant Cugat del Vallès|Sant Feliu de Llobregat|Sant Sadurní d'Anoia|Santa Coloma de Gramenet|Sitges|Teià|Terrassa|Viladecans|Vilafranca del Penedès|Vilanova i la Geltrú|Vilassar de Dalt|Vilassar de Mar""",
    },
    {
        "id": 4,
        "name": "Cataluña central y Lleida",
        "coverage": "Osona, Bages, Berguedà, Anoia, Solsonès, Segarra, Urgell, Pla d'Urgell, Noguera, Segrià y Pirineo de Lleida",
        "price": 80,
        "towns": """Agramunt|Alcarràs|Almacelles|Alpicat|Artesa de Segre|Artés|Bagà|Balaguer|Bellpuig|Bellvís|Berga|Capellades|Cardona|Centelles|Cervera|El Pont de Suert|Gironella|Golmés|Guardiola de Berguedà|Guissona|Igualada|La Seu d'Urgell|Les Borges Blanques|Linyola|Lleida|Manlleu|Manresa|Masquefa|Mollerussa|Navàs|Piera|Ponts|Puig-reig|Roda de Ter|Sallent|Sant Fruitós de Bages|Sant Hipòlit de Voltregà|Sant Joan de Vilatorrada|Sant Llorenç de Morunys|Solsona|Sort|Soses|Súria|Taradell|Tona|Torelló|Torrefarrera|Tremp|Tàrrega|Vic|Vielha|Vilanova del Camí|Òdena""",
    },
    {
        "id": 5,
        "name": "Tarragona y Terres de l'Ebre",
        "coverage": "Tarragonès, Baix Camp, Alt Camp, Baix Penedès, Conca de Barberà, Priorat, Terra Alta, Ribera d'Ebre, Baix Ebre y Montsià",
        "price": 90,
        "towns": """Alcanar|Alcover|Altafulla|Amposta|Batea|Calafell|Cambrils|Constantí|Cornudella de Montsant|Cunit|Deltebre|El Pla de Santa Maria|El Vendrell|Falset|Flix|Gandesa|Horta de Sant Joan|L'Aldea|L'Ampolla|L'Arboç|l'Espluga de Francolí|La Canonja|La Selva del Camp|La Sénia|Marçà|Mont-roig del Camp|Montblanc|Móra d'Ebre|Móra la Nova|Reus|Riudoms|Roquetes|Salou|Sant Carles de la Ràpita|Tarragona|Torredembarra|Tortosa|Ulldecona|Valls|Vila-seca""",
    },
]

WEIGHT_FACTORS = (
    (Decimal("500"), Decimal("1")),
    (Decimal("750"), Decimal("1.2")),
    (Decimal("1000"), Decimal("1.5")),
    (Decimal("1300"), Decimal("1.8")),
)
MAX_LINES = 20


def normalize_town(value):
    text = normalize("NFD", str(value or "").strip().casefold())
    text = "".join(char for char in text if not char.startswith("\u0300"))
    return "".join(char for char in text if char.isalnum())


TOWN_TO_ZONE = {
    normalize_town(town): zone["id"]
    for zone in ZONES
    for town in zone["towns"].split("|")
}


def public_zones():
    return [
        {key: value for key, value in zone.items() if key != "towns"}
        for zone in ZONES
    ]


def public_towns():
    return [
        {"name": town, "zone": zone["id"], "price": zone["price"]}
        for zone in ZONES
        for town in zone["towns"].split("|")
    ]


def decimal_value(value, label, minimum, maximum=None):
    try:
        result = Decimal(str(value).strip().replace(",", "."))
    except (InvalidOperation, AttributeError, ValueError):
        raise ValueError(f"{label}: introduce un número válido.")
    try:
        representable = math.isfinite(float(result))
    except (OverflowError, ValueError):
        representable = False
    if not result.is_finite() or not representable or result < minimum:
        raise ValueError(f"{label}: debe ser igual o superior a {minimum}.")
    if maximum is not None and result > maximum:
        raise ValueError(f"{label}: no puede superar {maximum}.")
    return result


def json_number(value, label):
    try:
        number = float(value)
    except (OverflowError, TypeError, ValueError):
        raise ValueError(f"{label}: la cantidad es demasiado grande para calcularla.")
    if not math.isfinite(number):
        raise ValueError(f"{label}: la cantidad es demasiado grande para calcularla.")
    return number


def _money(value):
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_pallet_quote(lines):
    if not isinstance(lines, list) or not 1 <= len(lines) <= MAX_LINES:
        raise ValueError(f"El presupuesto debe contener entre 1 y {MAX_LINES} líneas.")

    calculated = []
    input_pallets = Decimal("0")
    billable_pallets = Decimal("0")
    total = Decimal("0")
    consultation_required = False

    for index, line in enumerate(lines, start=1):
        if not isinstance(line, dict):
            raise ValueError(f"La línea {index} no es válida.")
        origin = str(line.get("origin", "")).strip()
        if len(origin) > 160:
            raise ValueError(f"El origen de la línea {index} es demasiado largo.")

        town_name = str(line.get("town", "")).strip()
        zone_id = TOWN_TO_ZONE.get(normalize_town(town_name))
        if zone_id is None:
            raise ValueError(f"El destino de la línea {index} no está en las zonas de reparto.")
        zone = ZONES[zone_id - 1]

        pallets = decimal_value(
            line.get("pallets"), f"Número de palés, línea {index}",
            Decimal("0.1"),
        )
        weight = decimal_value(
            line.get("weight_kg"), f"Peso por palé, línea {index}", Decimal("1"),
        )
        if weight > Decimal("1300"):
            consultation_required = True
            factor = None
            billed = None
            subtotal = None
        else:
            factor = next(multiplier for limit, multiplier in WEIGHT_FACTORS if weight <= limit)
            billed = pallets * factor
            try:
                subtotal = _money(billed * Decimal(str(zone["price"])))
            except InvalidOperation:
                raise ValueError(f"El importe de la línea {index} es demasiado grande para calcularlo.")
            billable_pallets += billed
            total += subtotal

        input_pallets += pallets
        calculated.append({
            "origin": origin,
            "destination": next(
                town for town in zone["towns"].split("|")
                if normalize_town(town) == normalize_town(town_name)
            ),
            "zone": zone["id"],
            "zone_name": zone["name"],
            "unit_price": zone["price"],
            "pallets": json_number(pallets, f"Número de palés, línea {index}"),
            "weight_kg_per_pallet": json_number(weight, f"Peso por palé, línea {index}"),
            "factor": json_number(factor, f"Factor de la línea {index}") if factor is not None else None,
            "billable_pallets": json_number(billed, f"Palés facturables, línea {index}") if billed is not None else None,
            "subtotal": json_number(subtotal, f"Subtotal de la línea {index}") if subtotal is not None else None,
            "consultation_required": weight > Decimal("1300"),
        })

    return {
        "lines": calculated,
        "line_count": len(calculated),
        "input_pallets": json_number(input_pallets, "Total de palés"),
        "billable_pallets": json_number(billable_pallets, "Total de palés facturables"),
        "total": json_number(_money(total), "Total"),
        "consultation_required": consultation_required,
        "currency": "EUR",
        "maximum_weight_kg_per_pallet": 1300,
    }


def describe_pallet_quote(quote, comments=""):
    details = ["Presupuesto calculado con la tarifa por palé y zonas."]
    for index, line in enumerate(quote["lines"], start=1):
        amount = (
            f"{line['subtotal']:.2f} €"
            if line["subtotal"] is not None
            else "CONSULTAR (>1.300 kg/palé)"
        )
        factor = line["factor"] if line["factor"] is not None else "consultar"
        billed = line["billable_pallets"] if line["billable_pallets"] is not None else "—"
        details.append(
            f"Línea {index}: {line['origin']} → {line['destination']} "
            f"(zona {line['zone']}, {line['unit_price']} €/palé), "
            f"{line['pallets']:g} palés × {line['weight_kg_per_pallet']:g} kg, "
            f"factor {factor}, {billed} palés facturables = {amount}"
        )
    if quote["consultation_required"]:
        details.append(
            "Incluye línea(s) pendientes de valoración manual; el total mostrado no las incluye."
        )
    details.append(
        f"Palés introducidos: {quote['input_pallets']:g}; "
        f"palés facturables: {quote['billable_pallets']:g}."
    )
    if comments:
        details.append(f"Comentarios: {comments}")
    return "\n".join(details)

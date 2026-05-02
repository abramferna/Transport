"""Catálogo de pueblos con distancias aproximadas (km) desde la base (Girona),
desde Barcelona y desde La Jonquera (frontera francesa).

Estructura: {id, name, comarca, km_gi, km_bcn, km_jq}
"""

TOWNS = [
    # Gironès / Pla de l'Estany (base)
    {"id": "girona", "name": "Girona", "comarca": "Gironès", "km_gi": 0, "km_bcn": 100, "km_jq": 60},
    {"id": "salt", "name": "Salt", "comarca": "Gironès", "km_gi": 3, "km_bcn": 103, "km_jq": 60},
    {"id": "sarria_ter", "name": "Sarrià de Ter", "comarca": "Gironès", "km_gi": 4, "km_bcn": 104, "km_jq": 58},
    {"id": "bescano", "name": "Bescanó", "comarca": "Gironès", "km_gi": 8, "km_bcn": 108, "km_jq": 65},
    {"id": "celra", "name": "Celrà", "comarca": "Gironès", "km_gi": 6, "km_bcn": 106, "km_jq": 55},
    {"id": "fornells", "name": "Fornells de la Selva", "comarca": "Gironès", "km_gi": 7, "km_bcn": 95, "km_jq": 65},
    {"id": "riudellots", "name": "Riudellots de la Selva", "comarca": "Selva", "km_gi": 10, "km_bcn": 90, "km_jq": 70},
    {"id": "cassa", "name": "Cassà de la Selva", "comarca": "Gironès", "km_gi": 14, "km_bcn": 95, "km_jq": 75},
    {"id": "llagostera", "name": "Llagostera", "comarca": "Gironès", "km_gi": 17, "km_bcn": 90, "km_jq": 80},
    {"id": "banyoles", "name": "Banyoles", "comarca": "Pla de l'Estany", "km_gi": 18, "km_bcn": 118, "km_jq": 50},

    # Alt Empordà (eje Girona → La Jonquera)
    {"id": "vilafant", "name": "Vilafant", "comarca": "Alt Empordà", "km_gi": 42, "km_bcn": 142, "km_jq": 20},
    {"id": "figueres", "name": "Figueres", "comarca": "Alt Empordà", "km_gi": 40, "km_bcn": 140, "km_jq": 22},
    {"id": "llers", "name": "Llers", "comarca": "Alt Empordà", "km_gi": 45, "km_bcn": 145, "km_jq": 15},
    {"id": "pont_molins", "name": "Pont de Molins", "comarca": "Alt Empordà", "km_gi": 43, "km_bcn": 143, "km_jq": 18},
    {"id": "biure", "name": "Biure d'Empordà", "comarca": "Alt Empordà", "km_gi": 50, "km_bcn": 150, "km_jq": 12},
    {"id": "capmany", "name": "Capmany", "comarca": "Alt Empordà", "km_gi": 53, "km_bcn": 153, "km_jq": 10},
    {"id": "agullana", "name": "Agullana", "comarca": "Alt Empordà", "km_gi": 55, "km_bcn": 155, "km_jq": 8},
    {"id": "la_jonquera", "name": "La Jonquera (frontera)", "comarca": "Alt Empordà", "km_gi": 60, "km_bcn": 160, "km_jq": 0},
    {"id": "castello_empuries", "name": "Castelló d'Empúries", "comarca": "Alt Empordà", "km_gi": 50, "km_bcn": 150, "km_jq": 25},
    {"id": "roses", "name": "Roses", "comarca": "Alt Empordà", "km_gi": 60, "km_bcn": 160, "km_jq": 30},
    {"id": "lescala", "name": "L'Escala", "comarca": "Alt Empordà", "km_gi": 35, "km_bcn": 135, "km_jq": 35},

    # Baix Empordà / Costa Brava
    {"id": "la_bisbal", "name": "La Bisbal d'Empordà", "comarca": "Baix Empordà", "km_gi": 30, "km_bcn": 130, "km_jq": 70},
    {"id": "palafrugell", "name": "Palafrugell", "comarca": "Baix Empordà", "km_gi": 35, "km_bcn": 135, "km_jq": 80},
    {"id": "begur", "name": "Begur", "comarca": "Baix Empordà", "km_gi": 40, "km_bcn": 140, "km_jq": 80},
    {"id": "pals", "name": "Pals", "comarca": "Baix Empordà", "km_gi": 38, "km_bcn": 138, "km_jq": 75},
    {"id": "torroella", "name": "Torroella de Montgrí", "comarca": "Baix Empordà", "km_gi": 32, "km_bcn": 132, "km_jq": 65},
    {"id": "sant_feliu", "name": "Sant Feliu de Guíxols", "comarca": "Baix Empordà", "km_gi": 33, "km_bcn": 105, "km_jq": 100},
    {"id": "platja_aro", "name": "Platja d'Aro", "comarca": "Baix Empordà", "km_gi": 30, "km_bcn": 105, "km_jq": 100},

    # Selva
    {"id": "santa_coloma_farners", "name": "Santa Coloma de Farners", "comarca": "Selva", "km_gi": 22, "km_bcn": 88, "km_jq": 85},
    {"id": "caldes_malavella", "name": "Caldes de Malavella", "comarca": "Selva", "km_gi": 20, "km_bcn": 80, "km_jq": 80},
    {"id": "sils", "name": "Sils", "comarca": "Selva", "km_gi": 24, "km_bcn": 76, "km_jq": 85},
    {"id": "macanet_selva", "name": "Maçanet de la Selva", "comarca": "Selva", "km_gi": 28, "km_bcn": 72, "km_jq": 90},
    {"id": "hostalric", "name": "Hostalric", "comarca": "Selva", "km_gi": 35, "km_bcn": 65, "km_jq": 95},
    {"id": "tossa", "name": "Tossa de Mar", "comarca": "Selva", "km_gi": 35, "km_bcn": 95, "km_jq": 95},
    {"id": "lloret", "name": "Lloret de Mar", "comarca": "Selva", "km_gi": 32, "km_bcn": 78, "km_jq": 95},
    {"id": "blanes", "name": "Blanes", "comarca": "Selva", "km_gi": 38, "km_bcn": 67, "km_jq": 100},

    # Maresme
    {"id": "malgrat", "name": "Malgrat de Mar", "comarca": "Maresme", "km_gi": 42, "km_bcn": 60, "km_jq": 105},
    {"id": "calella", "name": "Calella", "comarca": "Maresme", "km_gi": 50, "km_bcn": 52, "km_jq": 115},
    {"id": "pineda", "name": "Pineda de Mar", "comarca": "Maresme", "km_gi": 48, "km_bcn": 55, "km_jq": 110},
    {"id": "arenys", "name": "Arenys de Mar", "comarca": "Maresme", "km_gi": 60, "km_bcn": 38, "km_jq": 125},
    {"id": "mataro", "name": "Mataró", "comarca": "Maresme", "km_gi": 75, "km_bcn": 25, "km_jq": 140},
    {"id": "premia", "name": "Premià de Mar", "comarca": "Maresme", "km_gi": 80, "km_bcn": 18, "km_jq": 145},

    # Vallès Oriental
    {"id": "sant_celoni", "name": "Sant Celoni", "comarca": "Vallès Oriental", "km_gi": 50, "km_bcn": 50, "km_jq": 115},
    {"id": "llinars", "name": "Llinars del Vallès", "comarca": "Vallès Oriental", "km_gi": 60, "km_bcn": 40, "km_jq": 125},
    {"id": "cardedeu", "name": "Cardedeu", "comarca": "Vallès Oriental", "km_gi": 65, "km_bcn": 35, "km_jq": 130},
    {"id": "granollers", "name": "Granollers", "comarca": "Vallès Oriental", "km_gi": 70, "km_bcn": 30, "km_jq": 135},
    {"id": "mollet", "name": "Mollet del Vallès", "comarca": "Vallès Oriental", "km_gi": 80, "km_bcn": 20, "km_jq": 145},
    {"id": "parets", "name": "Parets del Vallès", "comarca": "Vallès Oriental", "km_gi": 78, "km_bcn": 22, "km_jq": 143},

    # Vallès Occidental
    {"id": "sabadell", "name": "Sabadell", "comarca": "Vallès Occidental", "km_gi": 88, "km_bcn": 22, "km_jq": 153},
    {"id": "terrassa", "name": "Terrassa", "comarca": "Vallès Occidental", "km_gi": 95, "km_bcn": 28, "km_jq": 160},
    {"id": "rubi", "name": "Rubí", "comarca": "Vallès Occidental", "km_gi": 95, "km_bcn": 22, "km_jq": 160},
    {"id": "cerdanyola", "name": "Cerdanyola del Vallès", "comarca": "Vallès Occidental", "km_gi": 85, "km_bcn": 15, "km_jq": 150},

    # Barcelonès
    {"id": "barcelona", "name": "Barcelona (polígonos)", "comarca": "Barcelonès", "km_gi": 100, "km_bcn": 0, "km_jq": 165},
    {"id": "hospitalet", "name": "L'Hospitalet de Llobregat", "comarca": "Barcelonès", "km_gi": 105, "km_bcn": 5, "km_jq": 170},
    {"id": "badalona", "name": "Badalona", "comarca": "Barcelonès", "km_gi": 90, "km_bcn": 10, "km_jq": 155},
    {"id": "santa_coloma_g", "name": "Santa Coloma de Gramenet", "comarca": "Barcelonès", "km_gi": 92, "km_bcn": 8, "km_jq": 157},

    # Baix Llobregat
    {"id": "cornella", "name": "Cornellà de Llobregat", "comarca": "Baix Llobregat", "km_gi": 105, "km_bcn": 7, "km_jq": 170},
    {"id": "esplugues", "name": "Esplugues de Llobregat", "comarca": "Baix Llobregat", "km_gi": 103, "km_bcn": 6, "km_jq": 168},
    {"id": "sant_boi", "name": "Sant Boi de Llobregat", "comarca": "Baix Llobregat", "km_gi": 108, "km_bcn": 12, "km_jq": 173},
    {"id": "el_prat", "name": "El Prat de Llobregat", "comarca": "Baix Llobregat", "km_gi": 110, "km_bcn": 12, "km_jq": 175},
    {"id": "viladecans", "name": "Viladecans", "comarca": "Baix Llobregat", "km_gi": 112, "km_bcn": 16, "km_jq": 177},
    {"id": "gava", "name": "Gavà", "comarca": "Baix Llobregat", "km_gi": 115, "km_bcn": 18, "km_jq": 180},
    {"id": "castelldefels", "name": "Castelldefels", "comarca": "Baix Llobregat", "km_gi": 118, "km_bcn": 22, "km_jq": 183},
]


def get_town(town_id: str):
    for t in TOWNS:
        if t["id"] == town_id:
            return t
    return None

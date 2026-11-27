import importlib.util
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("vnt_pallet_pricing", ROOT / "api" / "pallet_pricing.py")
PRICING = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PRICING)


def line(destination="Girona", pallets=1, weight_kg=500, origin="Girona", origin_manual=False):
    return {
        "origin": origin,
        "origin_manual": origin_manual,
        "town": destination,
        "pallets": pallets,
        "weight_kg": weight_kg,
    }


def price(destination="Girona", pallets=1, weight_kg=500, origin="Girona", origin_manual=False):
    return PRICING.calculate_pallet_quote([
        line(destination, pallets, weight_kg, origin, origin_manual)
    ])


def test_attached_tariff_has_five_zone_rates_and_258_towns():
    zones = PRICING.public_zones()
    assert [(zone["id"], zone["price"]) for zone in zones] == [
        (1, 44), (2, 50), (3, 60), (4, 80), (5, 90)
    ]
    assert len(PRICING.public_towns()) == 258
    assert len(PRICING.TOWN_TO_ZONE) == 258


def test_two_zone_one_palets_at_500kg_match_attached_example():
    result = price("Girona", pallets=2, weight_kg=500)
    assert result["lines"][0]["factor"] == 1
    assert result["lines"][0]["billable_pallets"] == 2
    assert result["total"] == 88


@pytest.mark.parametrize(
    ("weight_kg", "factor", "zone_one_total"),
    [
        (1, 1, 44),
        (500, 1, 44),
        (501, 1.2, 52.8),
        (750, 1.2, 52.8),
        (751, 1.5, 66),
        (1000, 1.5, 66),
        (1001, 1.8, 79.2),
        (1300, 1.8, 79.2),
    ],
)
def test_weight_factor_thresholds_match_attached_calculator(weight_kg, factor, zone_one_total):
    result = price(weight_kg=weight_kg)
    assert result["lines"][0]["factor"] == factor
    assert result["total"] == pytest.approx(zone_one_total)


def test_overweight_line_requires_review_and_is_not_added_to_total():
    result = price(weight_kg=1300.01)
    assert result["consultation_required"] is True
    assert result["lines"][0]["subtotal"] is None
    assert result["billable_pallets"] == 0
    assert result["total"] is None


def test_fractional_pallets_apply_weight_factor_and_round_to_cents():
    result = price(pallets="1,5", weight_kg=750)
    assert result["lines"][0]["billable_pallets"] == 1.8
    assert result["total"] == 79.2


def test_manually_entered_quantities_over_999_are_still_calculated():
    result = price(pallets=1001)
    assert result["lines"][0]["billable_pallets"] == 1001
    assert result["total"] == 44044


def test_zone_prices_are_used_for_matching_destination():
    assert price("Olot")["total"] == 50
    assert price("Barcelona")["total"] == 60
    assert price("Vic")["total"] == 80
    assert price("Tarragona")["total"] == 90


def test_accents_and_case_are_ignored_for_town_lookup():
    assert price("l'ESCALA")["lines"][0]["destination"] == "L'Escala"
    assert price("la bisbal d'emporda")["lines"][0]["unit_price"] == 44


def test_origins_inside_zones_one_to_three_use_automatic_price():
    assert price(origin="Girona")["total"] == price(origin="Barcelona")["total"]


def test_every_delivery_town_is_selectable_as_origin_and_outside_zones_are_manual():
    for town in PRICING.public_towns():
        result = price(origin=town["name"])
        requires_quote = town["zone"] > PRICING.MAX_AUTOMATIC_ORIGIN_ZONE
        assert result["lines"][0]["origin"] == town["name"]
        assert result["lines"][0]["origin_requires_consultation"] is requires_quote
        assert result["consultation_required"] is requires_quote


@pytest.mark.parametrize(("origin", "zone"), [("Lleida", 4), ("Tarragona", 5)])
def test_origins_outside_corridor_are_kept_as_manual_quotes(origin, zone):
    result = price(origin=origin, pallets=2)
    line_result = result["lines"][0]
    assert line_result["origin_zone"] == zone
    assert line_result["origin_requires_consultation"] is True
    assert line_result["subtotal"] is None
    assert result["consultation_required"] is True
    assert result["billable_pallets"] == 2
    assert result["total"] is None


def test_manual_origin_can_be_entered_but_never_gets_an_automatic_price():
    result = price(origin="Sant Jaume dels Domenys", origin_manual=True, pallets=2)
    assert result["consultation_required"] is True
    assert result["lines"][0]["origin"] == "Sant Jaume dels Domenys"
    assert result["lines"][0]["subtotal"] is None
    assert result["total"] is None


def test_unknown_origin_must_be_explicitly_marked_for_manual_quote():
    with pytest.raises(ValueError, match="elegirse de la lista"):
        price(origin="Sant Jaume dels Domenys")


def test_origin_is_required_for_a_corridor_price():
    with pytest.raises(ValueError, match="Selecciona el origen"):
        price(origin="")


def test_town_not_in_the_automatic_tariff_is_rejected_for_manual_quote():
    with pytest.raises(ValueError, match="no está en las zonas"):
        price("Sant Jaume dels Domenys")


def test_invalid_weight_pallet_count_and_line_count_are_rejected():
    with pytest.raises(ValueError, match="Peso por palé"):
        price(weight_kg=0)
    assert price(weight_kg=1301)["consultation_required"] is True
    with pytest.raises(ValueError, match="Número de palés"):
        price(pallets=0)
    with pytest.raises(ValueError, match="entre 1 y 20"):
        PRICING.calculate_pallet_quote([line()] * 21)


def test_multiple_lines_sum_and_consultation_flag_survives_mixed_quotes():
    result = PRICING.calculate_pallet_quote([
        line("Girona", pallets=2, weight_kg=500),
        line("Barcelona", pallets=1, weight_kg=1301),
        line("Tarragona", pallets="0,5", weight_kg=751),
    ])
    assert result["line_count"] == 3
    assert result["total"] == 155.5
    assert result["input_pallets"] == 3.5
    assert result["billable_pallets"] == 2.75
    assert result["consultation_required"] is True

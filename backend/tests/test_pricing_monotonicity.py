import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
API_INDEX = ROOT / "api" / "index.py"
SPEC = importlib.util.spec_from_file_location("vnt_vercel_api", API_INDEX)
VNT_API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VNT_API)


def _price(weight_kg, volume_m3=0):
    return VNT_API.calculate_price(
        "girona",
        "barcelona",
        weight_kg,
        [],
        hour=10,
        weekday=2,
        volume_m3=volume_m3,
    )["total_con_iva"]


def test_heavier_large_load_never_costs_less():
    assert _price(2600) > _price(1800)


def test_weight_price_is_monotonic_through_supported_range():
    prices = [_price(weight) for weight in range(50, 6001, 50)]
    assert all(next_price >= price for price, next_price in zip(prices, prices[1:]))


def test_weight_price_does_not_drop_at_discount_boundaries():
    for lower, higher in ((950, 1050), (2450, 2550), (4950, 5050), (5950, 6000)):
        assert _price(higher) > _price(lower)
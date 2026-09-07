import os
import json
import requests

# Load from backend/.env if present
env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_file):
    with open(env_file, "r") as ef:
        for line in ef:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

with open("supabase_ready_products.json", "r", encoding="utf-8") as f:
    products = json.load(f)

payload = []
for p in products:
    payload.append({
        "title": p["title"],
        "slug": p["slug"],
        "brand": p["brand"],
        "category": p["category"],
        "regular_price": p["regular_price"],
        "sale_price": p["sale_price"],
        "stock_quantity": p["stock_quantity"],
        "image_url": p.get("local_image") or "",
        "is_featured": p.get("is_featured", False)
    })

endpoint = f"{SUPABASE_URL}/rest/v1/products"
res = requests.post(endpoint, headers=HEADERS, json=payload)

if res.status_code in [200, 201]:
    print(f"\nঅভিনন্দন! মোট {len(res.json())} টি প্রোডাক্ট Supabase ডেটাবেজে সফলভাবে ইনসার্ট হয়েছে!")
else:
    print(f"\nError ({res.status_code}): {res.text}")

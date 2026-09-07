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

# 1. Clear any existing products
del_res = requests.delete(f"{SUPABASE_URL}/rest/v1/products?id=not.is.null", headers=HEADERS)
print(f"Clear existing products status: {del_res.status_code}")

# 2. Load clean real products
with open("backend/data/clean_real_products.json", "r", encoding="utf-8") as f:
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
        "image_url": p["image_url"],
        "is_featured": p.get("is_featured", False)
    })

endpoint = f"{SUPABASE_URL}/rest/v1/products"
res = requests.post(endpoint, headers=HEADERS, json=payload)

if res.status_code in [200, 201]:
    inserted = res.json()
    print(f"\nঅভিনন্দন! মোট {len(inserted)} টি রিয়েল প্রোডাক্ট Supabase ডেটাবেজে সফলভাবে আপলোড হয়েছে!")
    featured_count = sum(1 for item in inserted if item.get('is_featured'))
    print(f"হোমপেজে ফিচার্ড প্রোডাক্টের সংখ্যা: {featured_count}")
else:
    print(f"\nError ({res.status_code}): {res.text}")

import json
import re

with open("splashjet_products.json", "r", encoding="utf-8") as f:
    raw_items = json.load(f)

# ব্লগ বা অপ্রয়োজনীয় পোস্ট ফিল্টার করে আসল প্রোডাক্ট ক্যাটাগরি শনাক্ত করা
product_keywords = ["ink", "sublimation", "dtf", "pigment", "dye", "cleaning", "canon", "epson", "textile"]

clean_list = []
seen_slugs = set()

# বেস ডামি প্রাইস রেঞ্জ (টাকায়)
default_prices = {
    "dtf": 2200,
    "sublimation": 1800,
    "pigment": 1500,
    "cleaning": 850,
    "default": 1200
}

for item in raw_items:
    title = item.get("title", "")
    slug = item.get("slug", "")
    local_img = item.get("local_image")

    # HTML Entities ক্লিন করা (যেমন &#8211; বা &amp;)
    clean_title = re.sub(r'&#[0-9]+;', ' ', title)
    clean_title = re.sub(r'&[a-zA-Z]+;', ' ', clean_title).strip()

    title_lower = clean_title.lower()

    # কিওয়ার্ড ম্যাচিং
    if any(kw in title_lower for kw in product_keywords) and local_img:
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        # ক্যাটাগরি নির্ধারণ
        category = "General Ink"
        price = default_prices["default"]
        if "dtf" in title_lower:
            category = "DTF Inks"
            price = default_prices["dtf"]
        elif "sublimation" in title_lower:
            category = "Sublimation Inks"
            price = default_prices["sublimation"]
        elif "pigment" in title_lower:
            category = "Pigment Inks"
            price = default_prices["pigment"]
        elif "cleaning" in title_lower:
            category = "Maintenance & Cleaning"
            price = default_prices["cleaning"]

        clean_list.append({
            "title": clean_title,
            "slug": slug,
            "category": category,
            "brand": "Splashjet",
            "regular_price": price,
            "sale_price": price - 100,
            "stock_quantity": 25,
            "local_image": local_img,
            "is_featured": True if len(clean_list) < 8 else False
        })

with open("supabase_ready_products.json", "w", encoding="utf-8") as f:
    json.dump(clean_list, f, ensure_ascii=False, indent=2)

print(f"\nসফলভাবে {len(clean_list)} টি পিওর প্রোডাক্ট ডেটাবেজের জন্য রেডি করা হয়েছে!")

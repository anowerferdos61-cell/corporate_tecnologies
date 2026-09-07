import os
import csv
import json
import re
import urllib.request

# Load from backend/.env if present
env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(env_file):
    with open(env_file, "r") as ef:
        for line in ef:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

CSV_PATH = os.environ.get('CSV_PATH', 'backend/data/clean_real_products.json')
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://vhilsjzpmbcirijhhouc.supabase.co') + '/rest/v1'
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

CATEGORY_DEFAULT_IMAGES = {
    'Splashjet Inks': 'https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-003-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Splashjet-Epson-003.webp',
    'Printers': 'https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l3250-a4-wi-fi-multifunction-inktank-printer.Epson-L3250-1.webp',
    'Photocopy Machines': 'https://corporatetechbd.com/wp-content/uploads/2025/07/141_174056278894495.webp',
    'Machinery': 'https://corporatetechbd.com/wp-content/uploads/2025/08/DTFWithoutText.webp',
    'POS & Barcode': 'https://corporatetechbd.com/wp-content/uploads/2026/06/xprinter-xp-365b-thermal-barcode-label-printer-usb-bluetooth-80mm-203dpi-127mms-speed.PRINTER-XPRINTER-XP-365B-USBBT-web-said-Large-1.jpg',
    'Toner & Inks': 'https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-774-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Epson-774.webp',
    'Accessories & Parts': 'https://corporatetechbd.com/wp-content/uploads/2025/09/original-printhead-for-epson-ecotank-l8050-l18050-reliable-high-quality-solution.product-image.webp'
}

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = re.sub(r'&[a-zA-Z0-9#]+;', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def slugify(text):
    text = text.lower()
    text = re.sub(r'[\'\"\|\&\\/\(\)\+\,\–\—\:]+', ' ', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text).strip('-')
    return text[:80]

def get_standard_category(cat_str):
    c = cat_str.lower()
    if 'photocopy' in c or 'copier' in c:
        return 'Photocopy Machines'
    if 'splashjet' in c:
        return 'Splashjet Inks'
    if 'toner' in c or 'original' in c:
        return 'Toner & Inks'
    if 'pos' in c or 'barcode' in c or 'receipt' in c or 'scanner' in c or 'cash drawer' in c:
        return 'POS & Barcode'
    if 'machin' in c or 'dtf' in c or 'setup' in c or 'feeder' in c or 'combo package' in c:
        return 'Machinery'
    if 'access' in c or 'part' in c or 'gadget' in c:
        return 'Accessories & Parts'
    if 'printer' in c:
        return 'Printers'
    return 'Printers'

def get_sub_category(cat_str):
    parts = [p.strip() for p in cat_str.split(',') if p.strip()]
    for p in parts:
        if '>' in p:
            sub = p.split('>')[-1].strip()
            return sub
    if parts:
        return parts[0]
    return 'General'

def main():
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    simple_rows = [r for r in rows if r.get('Type') == 'simple']
    variable_rows = [r for r in rows if r.get('Type') == 'variable']
    variation_rows = [r for r in rows if r.get('Type') == 'variation']

    # Group variations by parent SKU
    var_by_sku = {}
    for vr in variation_rows:
        parent = vr.get('Parent', '').strip()
        if parent:
            if parent not in var_by_sku:
                var_by_sku[parent] = []
            var_by_sku[parent].append(vr)

    featured_skus = {
        '500101', '500105', '500106', '500107', '500108', '500109',
        '500110', '500112', '500114', '500115', '500118', '500119'
    }

    all_products = []
    
    # Process Variable products
    for r in variable_rows:
        pid_raw = r.get('\ufeffID') or r.get('ID')
        sku = r.get('SKU', '').strip() or f"SKU-{pid_raw}"
        title = r.get('Name', '').strip()
        cat_raw = r.get('Categories', '').strip()
        std_cat = get_standard_category(cat_raw)
        sub_cat = get_sub_category(cat_raw)
        brand = r.get('Brands', '').strip() or ('Splashjet' if 'Splashjet' in std_cat else 'Corporate Tech')
        
        # Images
        raw_imgs = [img.strip() for img in r.get('Images', '').split(',') if img.strip()]
        img_url = raw_imgs[0] if raw_imgs else CATEGORY_DEFAULT_IMAGES.get(std_cat, '')
        gallery_images = raw_imgs if raw_imgs else [img_url]

        # Variations
        v_list = var_by_sku.get(sku, [])
        parsed_variations = []
        prices = []
        regular_prices = []

        for v in v_list:
            v_id = v.get('\ufeffID') or v.get('ID')
            v_sku = v.get('SKU', '').strip()
            v_sale = v.get('Sale price', '').strip()
            v_reg = v.get('Regular price', '').strip()

            # Find variation name from attributes
            v_name = ""
            for i in range(1, 6):
                val = (v.get(f'Attribute {i} value(s)') or '').strip()
                if val:
                    if not v_name:
                        v_name = val
                    else:
                        v_name += f" - {val}"

            if not v_name:
                v_name = "Standard"

            try:
                sale_num = float(v_sale) if v_sale else (float(v_reg) if v_reg else 0)
            except:
                sale_num = 0

            try:
                reg_num = float(v_reg) if v_reg else sale_num
            except:
                reg_num = sale_num

            if sale_num > 0:
                prices.append(sale_num)
            if reg_num > 0:
                regular_prices.append(reg_num)

            v_img = v.get('Images', '').strip()
            parsed_variations.append({
                "id": v_id,
                "sku": v_sku,
                "name": v_name,
                "sale_price": int(sale_num),
                "regular_price": int(reg_num),
                "stock": int(v.get('Stock', 50) or 50),
                "image_url": v_img if v_img else img_url
            })

        min_sale = min(prices) if prices else 300
        max_sale = max(prices) if prices else 1200
        min_reg = min(regular_prices) if regular_prices else min_sale
        max_reg = max(regular_prices) if regular_prices else max_sale

        price_range_label = f"৳{int(min_sale):,} - ৳{int(max(max_sale, max_reg)):,}" if min_sale != max(max_sale, max_reg) else f"৳{int(min_sale):,}"

        # Attributes / Specs
        specs = {}
        for i in range(1, 6):
            attr_name = (r.get(f'Attribute {i} name') or '').strip()
            attr_val = (r.get(f'Attribute {i} value(s)') or '').strip()
            if attr_name and attr_val:
                specs[attr_name] = attr_val

        all_products.append({
            "id": int(pid_raw) if pid_raw.isdigit() else pid_raw,
            "sku": sku,
            "type": "variable",
            "title": title,
            "slug": slugify(title),
            "brand": brand,
            "category": std_cat,
            "sub_category": sub_cat,
            "raw_categories": [c.strip() for c in cat_raw.split(',') if c.strip()],
            "sale_price": int(min_sale),
            "regular_price": int(min_reg),
            "price_range_label": price_range_label,
            "stock_quantity": int(r.get('Stock', 100) or 100),
            "image_url": img_url,
            "gallery_images": gallery_images,
            "short_description": clean_html(r.get('Short description', '')),
            "description": clean_html(r.get('Description', '')),
            "specifications": specs,
            "variations": parsed_variations,
            "is_featured": sku in featured_skus,
            "rating": 4.9,
            "reviews_count": 16
        })

    # Process Simple products
    for r in simple_rows:
        pid_raw = r.get('\ufeffID') or r.get('ID')
        sku = r.get('SKU', '').strip() or f"SKU-{pid_raw}"
        title = r.get('Name', '').strip()
        cat_raw = r.get('Categories', '').strip()
        std_cat = get_standard_category(cat_raw)
        sub_cat = get_sub_category(cat_raw)
        brand = r.get('Brands', '').strip() or ('Splashjet' if 'Splashjet' in std_cat else 'Corporate Tech')

        raw_imgs = [img.strip() for img in r.get('Images', '').split(',') if img.strip()]
        img_url = raw_imgs[0] if raw_imgs else CATEGORY_DEFAULT_IMAGES.get(std_cat, '')
        gallery_images = raw_imgs if raw_imgs else [img_url]

        sale_str = r.get('Sale price', '').strip()
        reg_str = r.get('Regular price', '').strip()

        try:
            reg_num = float(reg_str) if reg_str else 0
        except:
            reg_num = 0

        try:
            sale_num = float(sale_str) if sale_str else reg_num
        except:
            sale_num = reg_num

        if reg_num == 0 and sale_num > 0:
            reg_num = sale_num
        elif sale_num == 0 and reg_num > 0:
            sale_num = reg_num
        elif sale_num == 0 and reg_num == 0:
            sale_num = 1200
            reg_num = 1400

        specs = {}
        for i in range(1, 6):
            attr_name = (r.get(f'Attribute {i} name') or '').strip()
            attr_val = (r.get(f'Attribute {i} value(s)') or '').strip()
            if attr_name and attr_val:
                specs[attr_name] = attr_val

        stock_val = r.get('Stock', '').strip()
        stock_num = int(stock_val) if stock_val.isdigit() else 25

        all_products.append({
            "id": int(pid_raw) if pid_raw.isdigit() else pid_raw,
            "sku": sku,
            "type": "simple",
            "title": title,
            "slug": slugify(title),
            "brand": brand,
            "category": std_cat,
            "sub_category": sub_cat,
            "raw_categories": [c.strip() for c in cat_raw.split(',') if c.strip()],
            "sale_price": int(sale_num),
            "regular_price": int(reg_num),
            "price_range_label": None,
            "stock_quantity": stock_num,
            "image_url": img_url,
            "gallery_images": gallery_images,
            "short_description": clean_html(r.get('Short description', '')),
            "description": clean_html(r.get('Description', '')),
            "specifications": specs,
            "variations": [],
            "is_featured": sku in featured_skus or len([p for p in all_products if p.get('is_featured')]) < 12,
            "rating": 4.8,
            "reviews_count": 12
        })

    # Ensure exactly 12 featured products for homepage
    featured_count = 0
    for p in all_products:
        if p["is_featured"]:
            featured_count += 1
            if featured_count > 12:
                p["is_featured"] = False

    print(f"Total master products parsed: {len(all_products)}")
    print(f"Total featured products: {sum(1 for p in all_products if p['is_featured'])}")
    print(f"Total variable products: {sum(1 for p in all_products if p['type'] == 'variable')}")
    print(f"Total variations attached: {sum(len(p['variations']) for p in all_products)}")

    # Write to backend and frontend fallback files
    with open('/Users/mac/Desktop/corporate_tech/backend/data/clean_real_products.json', 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    with open('/Users/mac/Desktop/corporate_tech/frontend/src/data/fallbackProducts.json', 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print("Saved clean_real_products.json and fallbackProducts.json!")

    # Now upload all 125 products to Supabase
    print("Uploading all products to Supabase...")
    # Delete existing rows
    del_req = urllib.request.Request(
        f"{SUPABASE_URL}/products?id=neq.00000000-0000-0000-0000-000000000000",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
        },
        method='DELETE'
    )
    try:
        with urllib.request.urlopen(del_req) as resp:
            print("Deleted old products from Supabase")
    except Exception as e:
        print("Delete error (continuing):", e)

    # Insert in batches of 30
    db_rows = []
    for p in all_products:
        db_rows.append({
            "title": p["title"],
            "slug": p["slug"],
            "brand": p["brand"],
            "category": p["category"],
            "regular_price": p["regular_price"],
            "sale_price": p["sale_price"],
            "stock_quantity": p["stock_quantity"],
            "image_url": p["image_url"],
            "is_featured": p["is_featured"]
        })

    batch_size = 30
    for i in range(0, len(db_rows), batch_size):
        batch = db_rows[i:i+batch_size]
        ins_req = urllib.request.Request(
            f"{SUPABASE_URL}/products",
            data=json.dumps(batch).encode('utf-8'),
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            method='POST'
        )
        try:
            with urllib.request.urlopen(ins_req) as resp:
                print(f"Uploaded batch {i // batch_size + 1} ({len(batch)} products)")
        except Exception as e:
            print(f"Error inserting batch {i // batch_size + 1}:", e)

    print("Finished uploading to Supabase!")

if __name__ == '__main__':
    main()

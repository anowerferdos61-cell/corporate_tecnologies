import os
import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://corporatetechbd.com"
SHOP_URL = f"{BASE_URL}/shop/"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

IMAGE_DIR = "downloaded_images"
os.makedirs(IMAGE_DIR, exist_ok=True)

def download_image(img_url, sku_or_id):
    try:
        if not img_url:
            return None
        parsed = urlparse(img_url)
        ext = os.path.splitext(parsed.path)[1]
        if not ext or len(ext) > 5:
            ext = ".jpg"
        clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', str(sku_or_id))
        filename = f"{clean_name}{ext}"
        filepath = os.path.join(IMAGE_DIR, filename)

        if os.path.exists(filepath):
            return filepath

        res = requests.get(img_url, headers=HEADERS, timeout=15)
        if res.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(res.content)
            return filepath
    except Exception as e:
        print(f"Error downloading image {img_url}: {e}")
    return None

def scrape_products():
    page = 1
    all_products = []

    while True:
        url = f"{SHOP_URL}page/{page}/" if page > 1 else SHOP_URL
        print(f"\n--- Scraping Page: {page} ({url}) ---")
        try:
            resp = requests.get(url, headers=HEADERS, timeout=20)
        except Exception as e:
            print(f"Network error: {e}")
            break

        if resp.status_code == 404:
            print("আর কোনো পেজ নেই। স্ক্র্যাপিং সম্পন্ন!")
            break
        elif resp.status_code != 200:
            print(f"Failed to fetch page. Status: {resp.status_code}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        products = soup.select("ul.products li.product")
        if not products:
            print("এই পেজে কোনো প্রোডাক্ট পাওয়া যায়নি।")
            break

        for item in products:
            title_elem = item.select_one(".woocommerce-loop-product__title, h2, h3")
            title = title_elem.get_text(strip=True) if title_elem else "Unknown Product"

            link_elem = item.select_one("a.woocommerce-LoopProduct-link, a")
            product_url = link_elem["href"] if link_elem and "href" in link_elem.attrs else ""

            price_elem = item.select_one("span.price")
            price = price_elem.get_text(strip=True) if price_elem else "0"

            img_elem = item.select_one("img")
            img_url = ""
            if img_elem:
                img_url = img_elem.get("src") or img_elem.get("data-src") or ""
                img_url = re.sub(r'-\d+x\d+(\.[a-zA-Z]+)$', r'\1', img_url)

            slug = product_url.rstrip("/").split("/")[-1] if product_url else title.lower().replace(" ", "-")
            local_image_path = download_image(img_url, slug)

            product_data = {
                "title": title,
                "slug": slug,
                "price_raw": price,
                "product_url": product_url,
                "original_image_url": img_url,
                "local_image_path": local_image_path
            }

            all_products.append(product_data)
            print(f"Saved: {title} | Image: {local_image_path}")

        page += 1

    with open("scraped_products.json", "w", encoding="utf-8") as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)

    print(f"\nমোট {len(all_products)} টি প্রোডাক্ট এবং ছবি সফলভাবে সংরক্ষণ করা হয়েছে!")

if __name__ == "__main__":
    scrape_products()

import os
import json
import requests
import re
from urllib.parse import urlparse

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
}

IMAGE_DIR = "splashjet_images"
os.makedirs(IMAGE_DIR, exist_ok=True)

def download_img(url, name):
    try:
        if not url:
            return None
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1]
        if not ext or len(ext) > 5:
            ext = ".jpg"
        clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', str(name))
        filepath = os.path.join(IMAGE_DIR, f"{clean_name}{ext}")

        if os.path.exists(filepath):
            return filepath

        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(r.content)
            return filepath
    except Exception as e:
        print(f"Image error: {e}")
    return None

def fetch_all():
    items = []
    # Fetch posts & pages from WP REST API
    endpoints = [
        "https://splashjet-ink.com/wp-json/wp/v2/pages?per_page=100",
        "https://splashjet-ink.com/wp-json/wp/v2/posts?per_page=100"
    ]

    for ep in endpoints:
        print(f"Fetching from {ep}...")
        try:
            res = requests.get(ep, headers=HEADERS, timeout=20)
            if res.status_code != 200:
                continue
            data = res.json()
            for obj in data:
                title = obj.get("title", {}).get("rendered", "")
                link = obj.get("link", "")
                slug = obj.get("slug", "")
                
                # Image fetch from content or yoast/og tags
                content = obj.get("content", {}).get("rendered", "")
                img_match = re.search(r'<img[^>]+src="([^">]+)"', content)
                img_url = img_match.group(1) if img_match else ""

                local_img = download_img(img_url, slug) if img_url else None

                items.append({
                    "title": title,
                    "slug": slug,
                    "link": link,
                    "image_url": img_url,
                    "local_image": local_img,
                    "brand": "Splashjet"
                })
                print(f"Saved: {title}")
        except Exception as e:
            print(f"Error: {e}")

    with open("splashjet_products.json", "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"\nমোট {len(items)} টি আইটেম সংরক্ষিত হয়েছে!")

if __name__ == "__main__":
    fetch_all()

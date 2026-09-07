import os
import re
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse

BASE_URL = "https://splashjet-ink.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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

def fetch_products():
    # Splashjet inks category page
    target_urls = [
        f"{BASE_URL}/inks/",
        f"{BASE_URL}/sublimation-inks/",
        f"{BASE_URL}/dtf-inks/",
        f"{BASE_URL}/pigment-inks/"
    ]
    
    collected = []
    seen_links = set()

    for t_url in target_urls:
        print(f"\nChecking: {t_url}")
        try:
            res = requests.get(t_url, headers=HEADERS, timeout=15)
            if res.status_code != 200:
                continue
            soup = BeautifulSoup(res.text, "html.parser")

            # Find product cards / links
            cards = soup.select(".elementor-widget-wrap, .product, .entry-content a, .wp-block-columns")
            for c in soup.find_all(['h2', 'h3', 'h4']):
                title = c.get_text(strip=True)
                parent_a = c.find_parent('a') or c.find('a')
                img = c.find_previous('img') or c.find_next('img')

                if len(title) > 4 and parent_a and parent_a.get('href', '').startswith('http'):
                    link = parent_a['href']
                    if link in seen_links or "splashjet-ink.com" not in link:
                        continue
                    seen_links.add(link)

                    img_url = ""
                    if img:
                        img_url = img.get('src') or img.get('data-src') or ""

                    slug = link.rstrip('/').split('/')[-1]
                    local_img = download_img(img_url, slug)

                    collected.append({
                        "title": title,
                        "slug": slug,
                        "url": link,
                        "original_image": img_url,
                        "local_image": local_img,
                        "brand": "Splashjet"
                    })
                    print(f"Found: {title}")
        except Exception as e:
            print(f"Error on {t_url}: {e}")

    with open("splashjet_data.json", "w", encoding="utf-8") as f:
        json.dump(collected, f, ensure_ascii=False, indent=2)

    print(f"\nমোট {len(collected)} টি Splashjet আইটেম সংরক্ষিত হয়েছে!")

if __name__ == "__main__":
    fetch_products()

# Corporate Technologies - Backend & Data Pipelines

This directory contains data collection, scraping, cleaning, and Supabase database synchronization scripts.

## Directory Structure
- `scrapers/`: Scripts for scraping Splashjet and printing products.
  - `splashjet_scraper.py`: Scrapes product listings and specifications.
  - `scraper.py`: General scraper utility.
  - `get_splashjet_api.py`: REST API data fetcher.
- `database/`: Data cleaning and Supabase synchronization.
  - `clean_products.py`: Cleans and filters product categories (DTF, Sublimation, Pigment, etc.).
  - `upload_to_supabase.py`: Uploads sanitized products directly into the Supabase database.
- `data/`: Extracted and cleaned JSON datasets.
  - `splashjet_products.json`: Raw scraped products.
  - `supabase_ready_products.json`: Processed, price-assigned products ready for Supabase.
- `images/`: Downloaded original images archive.

## How to Run
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Scrape raw products
python scrapers/splashjet_scraper.py

# 3. Clean and format products
python database/clean_products.py

# 4. Upload to Supabase
python database/upload_to_supabase.py
```

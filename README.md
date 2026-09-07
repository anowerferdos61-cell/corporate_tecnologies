# Corporate Technologies (https://corporatetechbd.com/)

An authorized e-commerce and catalog platform for **Corporate Technologies** — featuring Photocopiers, Printers, Splashjet Certified Inks, DTF, Sublimation, and Large Format Printing Solutions.

---

## 📁 Repository Structure

```
corporate_tech/
├── frontend/                     # React + Vite + Tailwind CSS Frontend
│   ├── public/                   # Static assets, brand logos & images
│   ├── src/
│   │   ├── components/           # UI components (Navbar, HeroBanner, ShopByCategories, etc.)
│   │   ├── context/              # CartContext state management
│   │   ├── data/                 # Local fallback products data
│   │   ├── lib/                  # Supabase client integration
│   │   ├── App.jsx               # Main application component
│   │   ├── main.jsx              # Application entry point
│   │   └── index.css             # Tailwind base styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                      # Python Data & Scraping Pipelines
│   ├── scrapers/                 # Web scraping scripts
│   ├── database/                 # Supabase sync & data cleaning scripts
│   ├── data/                     # Scraped & cleaned product JSON files
│   ├── images/                   # Product image archives
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend instructions
│
├── .gitignore
├── package.json                  # Root runner script (delegates to frontend)
└── README.md
```

---

## 🚀 Quick Start

### 1. Run the Frontend Web Application
From the project root:
```bash
# Start development server
npm run dev

# Or directly in frontend/
cd frontend && npm run dev
```
Preview at `http://localhost:5173/`.

### 2. Build for Production
```bash
npm run build
```

### 3. Run Backend Data Pipeline
```bash
cd backend
pip install -r requirements.txt
python database/clean_products.py
python database/upload_to_supabase.py
```

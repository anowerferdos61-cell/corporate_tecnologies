import json
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[\'\"\|\&\\/\(\)\+\,\–\—\:]+', ' ', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text).strip('-')
    return text[:80]

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = re.sub(r'&[a-zA-Z0-9#]+;', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

# Definition of the real products extracted from WooCommerce CSV
products_raw = [
    {
        "id": 5764, "sku": "500101", "type": "variable", "is_featured": True,
        "name": "Splashjet Premium 003 CMYBK Compatible Refill Ink for Epson L3210-L3250 Printer",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Epson Inks",
        "sale_price": 300, "regular_price": 350, "price_range": "৳300 - ৳1,400",
        "stock": 100,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-003-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Splashjet-Epson-003.webp",
            "https://corporatetechbd.com/wp-content/uploads/2025/07/50_172691957835331-1.jpg"
        ],
        "short_desc": "4-color set refill ink compatible with Epson L3100, L3110, L3210, L3250, L5190 and all Epson 003 models. 70% cost savings with printhead-friendly formulation.",
        "specs": {"Ink Code": "Epson 003", "Colors": "Cyan, Magenta, Yellow, Black", "Bottle Size": "70ml", "Compatibility": "Epson L3210, L3250, L3110, L3150"},
        "variations": [
            {"name": "Black", "sale_price": 300, "regular_price": 350},
            {"name": "Cyan", "sale_price": 300, "regular_price": 350},
            {"name": "Magenta", "sale_price": 300, "regular_price": 350},
            {"name": "Yellow", "sale_price": 300, "regular_price": 350},
            {"name": "Full Set (4 Colors)", "sale_price": 1200, "regular_price": 1400}
        ]
    },
    {
        "id": 5765, "sku": "500103", "type": "simple", "is_featured": False,
        "name": "Splashjet Premium 774 BK Compatible Refill Ink for Epson M200, L655",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Epson Inks",
        "sale_price": 500, "regular_price": 550, "price_range": "৳500",
        "stock": 50,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-774-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Epson-774.webp"
        ],
        "short_desc": "High-yield pigment black compatible ink for Epson M200, M100, M105, M205, L655 printers. Cost-effective, smudge-free professional output.",
        "specs": {"Ink Code": "Epson 774", "Color": "Pigment Black", "Bottle Size": "140ml", "Compatibility": "Epson M200, M100, M205, L655"}
    },
    {
        "id": 5766, "sku": "500106", "type": "simple", "is_featured": True,
        "name": "Toshiba e-Studio 2021AC A3 Multifunction Digital Color Photocopier",
        "brand": "Toshiba", "category": "Photocopy Machines", "sub_category": "Color Copiers",
        "sale_price": 125000, "regular_price": 130000, "price_range": "৳1,25,000",
        "stock": 10,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/toshiba-2523a-photocopy-machine.toshiba-e-studio-2020ac-multifunction-digital-color-photocopier-machine.202-b9196ab5.png"
        ],
        "short_desc": "Copy, Print, Scan functionality with 4 GB RAM, 20 CPM speed, 600 x 600 dpi resolution, auto duplex printing and 1-Year or 70,000 copies parts warranty.",
        "specs": {"Speed": "20 ppm / cpm", "Paper Size": "A5-R to A3", "RAM": "4 GB", "Warm-Up": "15 seconds", "Warranty": "1 Year or 70,000 copies"}
    },
    {
        "id": 5767, "sku": "500104", "type": "simple", "is_featured": False,
        "name": "Splashjet Premium 005 Compatible Refill Ink for Epson M1050-M2050",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Epson Inks",
        "sale_price": 500, "regular_price": 550, "price_range": "৳500",
        "stock": 60,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-005-compatible-refill-ink-for-epson-m1050-m2050.Daraz_.webp"
        ],
        "short_desc": "Specifically engineered for Epson M1100, M1120, M2140, M3140, M3170, M3180 series printers. Clog-free pigment formulation.",
        "specs": {"Ink Code": "Epson 005", "Color": "Black", "Weight": "120g", "Compatibility": "Epson EcoTank Mono Series"}
    },
    {
        "id": 5768, "sku": "500105", "type": "variable", "is_featured": True,
        "name": "Splashjet Premium 673 6-Color Set Compatible Refill Ink for Epson L805-L1800 Photo Printer",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Photo Inks",
        "sale_price": 500, "regular_price": 550, "price_range": "৳500 - ৳3,000",
        "stock": 80,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-673-c-m-y-lc-lm-bk-compatible-refill-ink-for-epson-l805-l1800-printer.61CRllp7-3L.SX679.webp"
        ],
        "short_desc": "6-color set (Black, Cyan, Magenta, Yellow, Light Cyan, Light Magenta) for studio-grade photography prints. Resistant to fading, smudging, and water.",
        "specs": {"Ink Code": "Epson 673", "Colors": "6 Colors", "Compatibility": "Epson L800, L805, L850, L1800", "Volume": "70ml each"},
        "variations": [
            {"name": "Cyan", "sale_price": 500, "regular_price": 550},
            {"name": "Magenta", "sale_price": 500, "regular_price": 550},
            {"name": "Yellow", "sale_price": 500, "regular_price": 550},
            {"name": "Black", "sale_price": 500, "regular_price": 550},
            {"name": "Light Cyan", "sale_price": 500, "regular_price": 550},
            {"name": "Light Magenta", "sale_price": 500, "regular_price": 550},
            {"name": "Full Set (6 Colors)", "sale_price": 3000, "regular_price": 3300}
        ]
    },
    {
        "id": 5769, "sku": "500107", "type": "variable", "is_featured": False,
        "name": "Splashjet Premium 001 CMYBK Compatible Refill Ink for Epson L4260-6270 Printer",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Epson Inks",
        "sale_price": 350, "regular_price": 400, "price_range": "৳350 - ৳1,500",
        "stock": 70,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-001-cmybk-compatible-refill-ink-for-epson-l4260-6270-printer.61Q8AFeI4hL.SX679.webp"
        ],
        "short_desc": "Engineered for Epson L4150, L4160, L4260, L6160, L6170, L6190, L6270. Superior color matching, anti-clogging formula.",
        "specs": {"Ink Code": "Epson 001", "Colors": "CMYK", "Black Size": "127ml", "Color Size": "70ml"},
        "variations": [
            {"name": "Cyan", "sale_price": 350, "regular_price": 400},
            {"name": "Magenta", "sale_price": 350, "regular_price": 400},
            {"name": "Yellow", "sale_price": 350, "regular_price": 400},
            {"name": "Black (Pigment 127g)", "sale_price": 500, "regular_price": 550},
            {"name": "Full Set (4 Colors)", "sale_price": 1500, "regular_price": 1700}
        ]
    },
    {
        "id": 5770, "sku": "500108", "type": "variable", "is_featured": False,
        "name": "Splashjet Premium 057 6-Color Compatible Refill Ink for Epson L8050-L18050",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Photo Inks",
        "sale_price": 500, "regular_price": 550, "price_range": "৳500 - ৳3,000",
        "stock": 75,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-057-c-m-y-bk-lc-lm-compatible-refill-ink-for-epson-l8050-l18050-printer.51CUSiAQcDL.SX679.webp"
        ],
        "short_desc": "6-color set for next-generation Epson EcoTank L8050 and L18050 A3 photo printers. Ultra-high definition color gamut.",
        "specs": {"Ink Code": "Epson 057", "Colors": "C, M, Y, BK, LC, LM", "Yield": "Up to 7,200 pages"},
        "variations": [
            {"name": "Single Color (Any)", "sale_price": 500, "regular_price": 550},
            {"name": "Full Set (6 Colors)", "sale_price": 3000, "regular_price": 3300}
        ]
    },
    {
        "id": 5771, "sku": "500109", "type": "variable", "is_featured": False,
        "name": "Splashjet Premium 790 Compatible Refill Ink for Canon Pixma G2010-G3010 Printer",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Canon Inks",
        "sale_price": 300, "regular_price": 350, "price_range": "৳300 - ৳1,300",
        "stock": 90,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/Splashjet-Premium-790-Compatible-Refill-Ink-for-Canon-Pixma-G2010-G3010-Printer.webp"
        ],
        "short_desc": "Compatible with Canon G1010, G2000, G2010, G3000, G3010, G4010 MegaTank printers. Up to 70% cost savings with clog-free flow.",
        "specs": {"Ink Code": "Canon GI-790", "Compatibility": "Canon G Series", "Black Bottle": "135ml", "Color Bottle": "70ml"},
        "variations": [
            {"name": "Cyan", "sale_price": 300, "regular_price": 350},
            {"name": "Magenta", "sale_price": 300, "regular_price": 350},
            {"name": "Yellow", "sale_price": 300, "regular_price": 350},
            {"name": "Black", "sale_price": 400, "regular_price": 450},
            {"name": "Full Set (4 Colors)", "sale_price": 1300, "regular_price": 1500}
        ]
    },
    {
        "id": 5772, "sku": "500110", "type": "variable", "is_featured": False,
        "name": "Splashjet 73 Compatible Refill Ink for Canon Pixma G570 / G670 6-Color Printer",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Canon Inks",
        "sale_price": 500, "regular_price": 550, "price_range": "৳500 - ৳3,000",
        "stock": 40,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-73-compatible-refill-ink-for-canon-g570-g670-printer.Splashjet-Canon-G73-1-1.jpg"
        ],
        "short_desc": "6-color set (Black, Grey, Red, Cyan, Magenta, Yellow) specially formulated for Canon G570 and G670 photo printers.",
        "specs": {"Ink Code": "Canon GI-73", "Colors": "BK, GY, R, C, M, Y", "Yield": "High Volume Photo"},
        "variations": [
            {"name": "Single Color (Any)", "sale_price": 500, "regular_price": 550},
            {"name": "Full Set (6 Colors)", "sale_price": 3000, "regular_price": 3300}
        ]
    },
    {
        "id": 5773, "sku": "500111", "type": "variable", "is_featured": False,
        "name": "Splashjet Premium Inks Full Set for Brother DCP-T220, T420W, T720DW, T820DW, T920DW",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Brother Inks",
        "sale_price": 300, "regular_price": 350, "price_range": "৳300 - ৳1,300",
        "stock": 85,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/brother-d60-ink-b5000-ink-splashjet-premium-inks-full-set-c-m-y-bk-for-brother-dcp-t220-t420w-t720dw-t820d-6be54b08.webp"
        ],
        "short_desc": "OEM-matching refill bottles BTD60BK & BT5000 CMY for Brother Ink Tank series. Delivers true-to-life colors and 6,500+ page yield.",
        "specs": {"Ink Codes": "BTD60BK, BT5000", "Compatibility": "Brother T-Series", "Page Yield": "Black 6,500 / Color 5,000 pages"},
        "variations": [
            {"name": "Cyan", "sale_price": 300, "regular_price": 350},
            {"name": "Magenta", "sale_price": 300, "regular_price": 350},
            {"name": "Yellow", "sale_price": 300, "regular_price": 350},
            {"name": "Black (108g)", "sale_price": 400, "regular_price": 450},
            {"name": "Full Set (4 Colors)", "sale_price": 1300, "regular_price": 1500}
        ]
    },
    {
        "id": 5774, "sku": "500112", "type": "variable", "is_featured": False,
        "name": "HP 51 Splashjet Premium Compatible Refill Ink for HP GT 5810, 5820, Ink Tank 315, 415",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "HP Inks",
        "sale_price": 300, "regular_price": 350, "price_range": "৳300 - ৳1,200",
        "stock": 50,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/hp-51-splashjet-premium-compatible-refill-ink-for-hp-gt-5810-5820-5821-310-315-319-415-419-410-printers.Daraz-4.webp"
        ],
        "short_desc": "Compatible with HP GT series and HP Smart Tank 315, 415, 515. High sharpness, rich color reproduction, printhead-safe.",
        "specs": {"Ink Code": "HP GT51 / GT52", "Colors": "CMYK", "Compatibility": "HP GT 5810, 5820, 315, 415"},
        "variations": [
            {"name": "Single Color (Any)", "sale_price": 300, "regular_price": 350},
            {"name": "Full Set (4 Colors)", "sale_price": 1200, "regular_price": 1400}
        ]
    },
    {
        "id": 5776, "sku": "500116", "type": "variable", "is_featured": True,
        "name": "Splashjet Premium Sublimation Ink for Epson Printers (Heat Transfer for Mugs, T-Shirts)",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "Sublimation Inks",
        "sale_price": 350, "regular_price": 450, "price_range": "৳350 - ৳9,000",
        "stock": 120,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/sublimation-ink.Daraz-5.webp"
        ],
        "short_desc": "High heat transfer rate water-based dye sublimation ink for Epson L130, L310, L1300, L1800. Perfect for polyester t-shirts, mugs, phone cases, and ceramics.",
        "specs": {"Type": "Dye Sublimation", "Sizes": "100g, 500g, 1kg", "Features": "Waterproof, Scratch-Resistant, High Vibrancy"},
        "variations": [
            {"name": "Single Color 100g", "sale_price": 350, "regular_price": 450},
            {"name": "Single Color 500g", "sale_price": 1250, "regular_price": 1350},
            {"name": "Single Color 1kg", "sale_price": 2500, "regular_price": 2700},
            {"name": "Full Set 100g (4 Colors)", "sale_price": 1400, "regular_price": 1800},
            {"name": "Full Set 500g (4 Colors)", "sale_price": 4800, "regular_price": 5400},
            {"name": "Full Set 1kg (4 Colors)", "sale_price": 9000, "regular_price": 10800}
        ]
    },
    {
        "id": 5885, "sku": "500223", "type": "variable", "is_featured": True,
        "name": "Splashjet DTF Ink for Epson L1800, L805, L8050, L18050 Direct-To-Film (100g / 500g / 1kg)",
        "brand": "Splashjet", "category": "Splashjet Inks", "sub_category": "DTF Inks",
        "sale_price": 500, "regular_price": 550, "price_range": "৳500 - ৳14,000",
        "stock": 100,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/10/Product-Images-2.webp"
        ],
        "short_desc": "Premium grade Direct-To-Film ink for light and dark fabrics. Outstanding opacity white ink, high wash and rub fastness, stretchable and crack-free.",
        "specs": {"Type": "Direct-to-Film (DTF)", "Colors": "CMYK + White", "Sizes": "100g, 500g, 1kg", "Fabric": "Cotton, Polyester, Blends, Leather"},
        "variations": [
            {"name": "CMYK Color 100g", "sale_price": 500, "regular_price": 550},
            {"name": "White Ink 100g", "sale_price": 500, "regular_price": 550},
            {"name": "White Ink 500g", "sale_price": 1800, "regular_price": 2250},
            {"name": "White Ink 1kg", "sale_price": 3000, "regular_price": 3500},
            {"name": "Full Set 100g (CMYK+W)", "sale_price": 3000, "regular_price": 3300},
            {"name": "Full Set 1kg (CMYK+W)", "sale_price": 14000, "regular_price": 17500}
        ]
    },
    {
        "id": 5791, "sku": "500127", "type": "simple", "is_featured": True,
        "name": "Toshiba e-Studio 2523A A3 Multifunction Digital Photocopier",
        "brand": "Toshiba", "category": "Photocopy Machines", "sub_category": "Light Duty Copiers",
        "sale_price": 49000, "regular_price": 50000, "price_range": "৳49,000",
        "stock": 15,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/07/141_174056278894495.webp"
        ],
        "short_desc": "Best selling A3 monochrome photocopier in Bangladesh. Print, Copy, Scan at 25 CPM with 256MB RAM, Department Code security, and 1-Year or 70,000 copies parts warranty.",
        "specs": {"Speed": "25 ppm", "Resolution": "2,400 x 600 dpi", "Paper Size": "A5-R to A3", "Warranty": "1 Year or 70,000 Copies Parts Warranty"}
    },
    {
        "id": 5792, "sku": "500129", "type": "simple", "is_featured": True,
        "name": "Toshiba e-Studio 2523AD Multifunction Monochrome Photocopier with Auto Duplex",
        "brand": "Toshiba", "category": "Photocopy Machines", "sub_category": "Light Duty Copiers",
        "sale_price": 58000, "regular_price": 59000, "price_range": "৳58,000",
        "stock": 12,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/toshiba-e-studio-2823amw-multifunction-monochrome-photocopier.toshiba-2523a-photocopy-machine.Toshiba-e-Stu-93103dc4.jpg"
        ],
        "short_desc": "Automatic double-sided (Duplex) printing and copying, 25 ppm speed, flexible 350-600 sheet capacity, USB 2.0 connectivity, and full 1-year parts warranty.",
        "specs": {"Duplex": "Standard Automatic", "Speed": "25 ppm", "Resolution": "2,400 x 600 dpi", "Weight": "30kg"}
    },
    {
        "id": 5796, "sku": "500132", "type": "simple", "is_featured": True,
        "name": "Toshiba e-Studio 4528A Heavy Duty Multifunction Photocopier with RADF",
        "brand": "Toshiba", "category": "Photocopy Machines", "sub_category": "Heavy Duty Copiers",
        "sale_price": 385000, "regular_price": 390000, "price_range": "৳3,85,000",
        "stock": 5,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/toshiba-2523ad-photocopy-machine.download.jpeg"
        ],
        "short_desc": "High-volume commercial photocopier with 45 ppm speed, 10.1\" multi-touch WSVGA screen, 128GB SSD, Dual-Scan RADF up to 240 ipm, and 100,000 copies parts warranty.",
        "specs": {"Speed": "45 ppm (A4) / 25 ppm (A3)", "Screen": "10.1 inch Color Touch", "Storage": "128GB SSD", "Input Capacity": "Up to 5,200 Sheets"}
    },
    {
        "id": 5797, "sku": "500133", "type": "simple", "is_featured": False,
        "name": "Toshiba e-Studio 3028A Multifunction Monochrome Photocopier",
        "brand": "Toshiba", "category": "Photocopy Machines", "sub_category": "Heavy Duty Copiers",
        "sale_price": 185000, "regular_price": 190000, "price_range": "৳1,85,000",
        "stock": 8,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/e-studio-3028a-01-500x500-1.webp"
        ],
        "short_desc": "30 ppm fast A3 mono MFP with Intel Atom CPU, 4GB RAM, 128GB SSD, 10.1\" touchscreen and 100,000 copies replacement warranty.",
        "specs": {"Speed": "30 ppm", "RAM": "4 GB", "Duty Cycle": "High Volume", "Display": "10.1 inch Color WSVGA"}
    },
    {
        "id": 5808, "sku": "500145", "type": "simple", "is_featured": True,
        "name": "Epson EcoTank L8180 Multifunction A3+ WiFi Six-Color InkTank Photo Printer",
        "brand": "Epson", "category": "Printers", "sub_category": "Photo Printers",
        "sale_price": 82000, "regular_price": 85000, "price_range": "৳82,000",
        "stock": 14,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l8180-multifunction-a3-wifi-six-color-inktank-photo-printer.Epson-L8180.webp"
        ],
        "short_desc": "Flagship A3+ photo studio printer with 6-color ink system including Grey ink for supreme monochrome prints, auto duplex, 4.3\" LCD and SD card slot.",
        "specs": {"Print Size": "Up to A3+", "Resolution": "5760 x 1440 DPI", "Colors": "6 Colors (with Grey)", "Features": "Wi-Fi, Duplex, SD Slot"}
    },
    {
        "id": 5809, "sku": "500146", "type": "simple", "is_featured": True,
        "name": "Epson EcoTank L8050 Wi-Fi Single Function Six-Color Ink Tank Photo Printer",
        "brand": "Epson", "category": "Printers", "sub_category": "Photo Printers",
        "sale_price": 40500, "regular_price": 42000, "price_range": "৳40,500",
        "stock": 25,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l8050-wi-fi-single-function-six-color-ink-tank-printer.Epson-L8050.3-1.webp"
        ],
        "short_desc": "Successor to the legendary L805. 6-color photo printing, PVC ID card & CD/DVD printing, Wi-Fi Direct, 33 ppm speed and 7,200 page yield.",
        "specs": {"Resolution": "5760 x 1440 DPI", "Ink Code": "Epson 057", "Speed": "33 ppm mono, 15 ppm color", "Media": "Photo, PVC Cards, CD/DVD"}
    },
    {
        "id": 5828, "sku": "500166", "type": "simple", "is_featured": True,
        "name": "Epson EcoTank L3250 A4 Wi-Fi Multifunction InkTank Printer",
        "brand": "Epson", "category": "Printers", "sub_category": "All-in-One Printers",
        "sale_price": 22000, "regular_price": 22500, "price_range": "৳22,000",
        "stock": 35,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l3250-a4-wi-fi-multifunction-inktank-printer.Epson-L3250-1.webp"
        ],
        "short_desc": "The #1 popular Wi-Fi all-in-one printer for home and office. Print, scan, copy with 4,500 black / 7,500 color page yield and smart phone app printing.",
        "specs": {"Functions": "Print, Scan, Copy", "Speed": "33 ppm", "Connectivity": "Wi-Fi, Wi-Fi Direct, USB", "Warranty": "1 Year Free Service"}
    },
    {
        "id": 5829, "sku": "500168", "type": "simple", "is_featured": False,
        "name": "Epson EcoTank L3210 Multifunction InkTank Printer",
        "brand": "Epson", "category": "Printers", "sub_category": "All-in-One Printers",
        "sale_price": 18500, "regular_price": 19000, "price_range": "৳18,500",
        "stock": 40,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l3210-multifunction-inktank-printer.Epson-L3210.webp"
        ],
        "short_desc": "High quality, ultra low-cost printing, scanning, and copying. Spill-free refilling using Epson 003 inks.",
        "specs": {"Functions": "Print, Scan, Copy", "Speed": "33 ppm Black, 15 ppm Color", "Resolution": "5760 x 1440 dpi"}
    },
    {
        "id": 5814, "sku": "500152", "type": "simple", "is_featured": True,
        "name": "DTF Combo Package with Epson L8050 Printer & 15x15 Heat Press Machine Setup",
        "brand": "Corporate Tech", "category": "Machinery", "sub_category": "DTF Combo",
        "sale_price": 70400, "regular_price": 75000, "price_range": "৳70,400",
        "stock": 8,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/DTFWithoutText.webp",
            "https://corporatetechbd.com/wp-content/uploads/2025/08/DTFNew.webp"
        ],
        "short_desc": "Complete turnkey garment printing setup: Freesub 15x15 Heat Press + Epson L8050 + 6 DTF Inks + 100pcs A4 PET Film + 500g Melt Powder + Teflon Sheet + Software Dongle.",
        "specs": {"Heat Press": "Freesub 15x15 inch, 1400W", "Printer": "Epson L8050 6-Color", "Accessories": "Film, Powder, Inks, RIP Dongle included"}
    },
    {
        "id": 5843, "sku": "500181", "type": "simple", "is_featured": True,
        "name": "Sublimation Combo Package with 5-in-1 Heat Press and Epson L130 Printer",
        "brand": "Corporate Tech", "category": "Machinery", "sub_category": "Ready Business Setup",
        "sale_price": 37500, "regular_price": 38500, "price_range": "৳37,500",
        "stock": 10,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/sublimation-combo-package-with-5-in-1-heat-press-and-epson-l130.file_2024-10-09_09.15.39-2.webp"
        ],
        "short_desc": "Start your gift printing business immediately: 5-in-1 Heat Press (T-Shirt, Mug, Cap, Plate) + Epson L130 + Splashjet Sublimation Inks + Transfer Paper + Tape + Teflon.",
        "specs": {"Heat Press": "5-in-1 Multifunction (T-shirt, Mug, Cap, Plate)", "Printer": "Epson EcoTank L130", "Inks": "Splashjet CMYK Sublimation"}
    },
    {
        "id": 5832, "sku": "500170", "type": "simple", "is_featured": True,
        "name": "Epson EcoTank L15150 A3 Wi-Fi Duplex Multifunction Ink Tank Printer",
        "brand": "Epson", "category": "Printers", "sub_category": "A3 Multifunction",
        "sale_price": 115000, "regular_price": 120000, "price_range": "৳1,15,000",
        "stock": 6,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l15150-a3-wi-fi-duplex-multifunction-ink-tank-printer.Epson-L15150.1.webp"
        ],
        "short_desc": "Heavy duty A3+ Print, Scan, Copy, Fax with DURABrite pigment inks, auto duplex, 2 x 250 sheet paper cassettes, 50-sheet ADF, and 10.9cm touchscreen.",
        "specs": {"Speed": "32 ppm Black, 22 ppm Color", "Paper Size": "Up to A3+ (13x19 inch)", "Resolution": "4800 x 2400 DPI", "Duplex": "Auto Double-Sided"}
    },
    {
        "id": 5849, "sku": "500186", "type": "simple", "is_featured": False,
        "name": "Canon imagePROGRAF TC-20 Large Format 24-Inch Plotter Printer",
        "brand": "Canon", "category": "Printers", "sub_category": "Large Format Plotters",
        "sale_price": 112200, "regular_price": 115200, "price_range": "৳1,12,200",
        "stock": 5,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2026/06/canon-imageprograf-tc-20-large-format-printer-24-single-function-2400-x-1200-dpi-resolution-usb-lan-wi-fi-connectivity.imageprograf-tc-20-01-500x500-1.webp"
        ],
        "short_desc": "24-inch CAD drawings and poster printer with 2400 x 1200 dpi resolution, 32-second A1 draft speed, air feeding system, and Wi-Fi/LAN connectivity.",
        "specs": {"Width": "24-inch (610 mm)", "Speed": "A1 CAD drawing in 32 sec", "Resolution": "2400 x 1200 dpi", "Cartridge": "PFI-050 (70ml)"}
    },
    {
        "id": 5840, "sku": "500178", "type": "simple", "is_featured": False,
        "name": "Canon PIXMA G3730 Wi-Fi Multifunction Ink Tank Color Printer",
        "brand": "Canon", "category": "Printers", "sub_category": "All-in-One Printers",
        "sale_price": 19990, "regular_price": 21000, "price_range": "৳19,990",
        "stock": 20,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/canon-pixma-g3730-wi-fi-multifunction-ink-tank-printer.Untitled-design-16-1.jpg"
        ],
        "short_desc": "All-in-one wireless printer with up to 11 ipm mono and 6 ipm color speeds. Low cost printing with GI-71 ink bottles.",
        "specs": {"Resolution": "4800 x 1200 dpi", "Functions": "Print, Scan, Copy, Wi-Fi", "Inks": "Canon GI-71 / GI-71S"}
    },
    {
        "id": 5854, "sku": "500190", "type": "simple", "is_featured": False,
        "name": "Brother MFC-T920DW Duplex Wireless Multifunction Color Ink Tank Printer",
        "brand": "Brother", "category": "Printers", "sub_category": "All-in-One Printers",
        "sale_price": 38499, "regular_price": 40000, "price_range": "৳38,499",
        "stock": 15,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/brother-mfc-t920dw-duplex-wireless-multifunction-color-ink-tank-printer.Brother-T920DW-1.webp"
        ],
        "short_desc": "Print, scan, copy, and fax with automatic duplex, 20-sheet ADF, 1.8\" color LCD, Ethernet, Wi-Fi and 15,000 black page yield.",
        "specs": {"Speed": "30 ppm Black, 26 ppm Color", "Resolution": "1200 x 6000 dpi", "Duplex": "Auto 2-Sided", "Inks": "BTD60BK + BT5000 CMY"}
    },
    {
        "id": 5871, "sku": "500210", "type": "simple", "is_featured": False,
        "name": "Brother DCP-T520W Multifunction Color Ink Tank Printer with Wireless & Mobile Printing",
        "brand": "Brother", "category": "Printers", "sub_category": "All-in-One Printers",
        "sale_price": 23500, "regular_price": 24500, "price_range": "৳23,500",
        "stock": 18,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/brother-dcp-t520w-multifunction-color-inktank-printer-with-wireless-and-mobile-printing.Brother-T520DW.webp"
        ],
        "short_desc": "Fast 17 ipm black and 9.5 ipm color printing, wireless direct mobile print, 150-sheet paper tray, and 7,500 black page yield.",
        "specs": {"Functions": "Print, Copy, Scan", "Speed": "17 ipm Black, 9.5 ipm Color", "Wireless": "Wi-Fi & Wi-Fi Direct"}
    },
    {
        "id": 5876, "sku": "500213", "type": "simple", "is_featured": True,
        "name": "Xprinter XP-365B Thermal Barcode & Shipping Label Printer (USB + Bluetooth)",
        "brand": "Xprinter", "category": "POS & Barcode", "sub_category": "Barcode Printers",
        "sale_price": 8990, "regular_price": 9500, "price_range": "৳8,990",
        "stock": 25,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2026/06/xprinter-xp-365b-thermal-barcode-label-printer-usb-bluetooth-80mm-203dpi-127mms-speed.PRINTER-XPRINTER-XP-365B-USBBT-web-said-Large-1.jpg"
        ],
        "short_desc": "Direct thermal 80mm barcode and courier label printer with USB and Bluetooth. Prints up to 127mm/sec without ink or ribbon.",
        "specs": {"Print Width": "Up to 80mm", "Speed": "127 mm/sec", "Interface": "USB + Bluetooth", "Resolution": "203 DPI"}
    },
    {
        "id": 5877, "sku": "500215", "type": "simple", "is_featured": False,
        "name": "Xprinter XP-Q80A 80mm High-Speed Thermal POS Receipt Printer with Auto Cutter",
        "brand": "Xprinter", "category": "POS & Barcode", "sub_category": "Receipt Printers",
        "sale_price": 5800, "regular_price": 6500, "price_range": "৳5,800",
        "stock": 30,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2026/06/xprinter-xp-q80a-usb-thermal-receipt-printer-high-speed-80mm-pos-printer-with-auto-cutter-qr-code-support.PRINTER-XPRINTER-XP-Q80A-USB-web-said2-Large-1.jpg"
        ],
        "short_desc": "260 mm/s high-speed 80mm thermal receipt printer with 1.5 million cuts auto-cutter, cash drawer port, and ESC/POS command support.",
        "specs": {"Speed": "260 mm/sec", "Paper Width": "80mm", "Auto Cutter": "Partial (1.5M cuts)", "Interface": "USB"}
    },
    {
        "id": 5815, "sku": "500153", "type": "simple", "is_featured": False,
        "name": "TIGO C-405-84 Heavy-Duty POS Cash Drawer (8 Bill Clips & 4 Coin Compartments)",
        "brand": "TIGO", "category": "POS & Barcode", "sub_category": "Cash Drawers",
        "sale_price": 7660, "regular_price": 8500, "price_range": "৳7,660",
        "stock": 20,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/tigo-c-405-84-pos-cash-drawer-8-bill-clips-4-coin-compartments-rj11-interface-heavy-duty-steel-12v24v.COMP-1e8fe86f.webp"
        ],
        "short_desc": "Heavy-duty steel POS cash drawer with RJ11 interface, 3-position security lock with emergency release, and 12V/24V support.",
        "specs": {"Layout": "8 Bills + 4 Coins", "Interface": "RJ11 POS Printer Port", "Lock": "3-Position with 2 Keys", "Material": "SPCC/SECC Steel"}
    },
    {
        "id": 5821, "sku": "500159", "type": "simple", "is_featured": False,
        "name": "X-9700L 1D/2D Wireless Barcode Scanner with 90m Range",
        "brand": "General", "category": "POS & Barcode", "sub_category": "Barcode Scanners",
        "sale_price": 4800, "regular_price": 5800, "price_range": "৳4,800",
        "stock": 35,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/x-9700l-1d2d-wireless-barcode-scanner-high-precision-portable-and-fast.Untitled-design-12.webp"
        ],
        "short_desc": "2.4G RF wireless barcode scanner reading 1D and 2D QR codes up to 90m distance. 300 scans/sec with 3-hour fast recharge battery.",
        "specs": {"Range": "Up to 90m Wireless", "Speed": "300 scans/sec", "Barcodes": "1D & 2D QR Code, PDF417", "Battery": "1500mAh"}
    },
    {
        "id": 5858, "sku": "500196", "type": "simple", "is_featured": False,
        "name": "Professional Combo Heat Press 5-in-1 Machine P8100 (T-Shirt, Mug, Cap, Plate)",
        "brand": "General", "category": "Machinery", "sub_category": "Heat Press Machines",
        "sale_price": 24000, "regular_price": 25000, "price_range": "৳24,000",
        "stock": 10,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/professional-combo-heat-press-5-in-1-machine-p8100-t-shirt-mug-cap-plate-printing-solution.Untitled-design-2-1-1.webp"
        ],
        "short_desc": "12x15 inch flat press with quick-swap attachments for mugs, caps, and plates. Precise digital temperature and timer control.",
        "specs": {"Power": "1250W", "Platen Size": "12 x 15 inch", "Temp Range": "0-250°C", "Attachments": "Flat, Mug, Cap, Plate"}
    },
    {
        "id": 5859, "sku": "500197", "type": "simple", "is_featured": False,
        "name": "FreeSub 15x15 Inch Professional T-Shirt Heat Press Machine",
        "brand": "FreeSub", "category": "Machinery", "sub_category": "Heat Press Machines",
        "sale_price": 24000, "regular_price": 25000, "price_range": "৳24,000",
        "stock": 12,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2026/06/freesub-15-x-15-professional-t-shirt-heat-press-machine-high-performance-solution-for-custom-apparel-printing.Untitled-design-5-2.png"
        ],
        "short_desc": "Industrial manual heat press with spring-assisted handle, non-stick Teflon coated plate, uniform heat coils and digital controls.",
        "specs": {"Plate Size": "15 x 15 inch", "Power": "1200W", "Timer": "0-999 sec", "Warranty": "1 Year Service"}
    },
    {
        "id": 5865, "sku": "500204", "type": "simple", "is_featured": False,
        "name": "Toshiba T-2323C Master Copy E-Studio Toner (10,000 Pages)",
        "brand": "Toshiba", "category": "Accessories & Parts", "sub_category": "Photocopier Toner",
        "sale_price": 2500, "regular_price": 2800, "price_range": "৳2,500",
        "stock": 100,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/toshiba-t-2323c-master-copy-e-studio-toner.2323cm.webp"
        ],
        "short_desc": "Compatible high-density laser black toner for Toshiba e-Studio 2523A, 2523AD, 2323AM, 2823AM copiers. Up to 10,000 page yield.",
        "specs": {"Yield": "10,000 Pages", "Color": "Black", "Compatibility": "Toshiba 2523A/2323AM/2823AM"}
    },
    {
        "id": 5880, "sku": "500218", "type": "simple", "is_featured": False,
        "name": "Toshiba e-STUDIO 2523A Long-Life Photoconductor OPC Drum",
        "brand": "Toshiba", "category": "Accessories & Parts", "sub_category": "Photocopier Accessories",
        "sale_price": 1500, "regular_price": 1700, "price_range": "৳1,500",
        "stock": 45,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2026/06/toshiba-e-studio-2523a-photoconductor-drum.Toshiba-E-STUDIO-2007-Drum-Only-1.webp"
        ],
        "short_desc": "High durability OPC drum unit for Toshiba 2523A series photocopiers. Delivers sharp and crisp text for up to 60,000 pages.",
        "specs": {"Yield": "Up to 60,000 Pages", "Material": "Photoconductive Alloy", "Compatibility": "Toshiba 2523A Series"}
    },
    {
        "id": 5883, "sku": "500221", "type": "simple", "is_featured": False,
        "name": "Original Printhead for EPSON EcoTank L8050, L18050 Photo Printers",
        "brand": "Epson", "category": "Accessories & Parts", "sub_category": "Printer Parts",
        "sale_price": 24000, "regular_price": 25000, "price_range": "৳24,000",
        "stock": 8,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/09/original-printhead-for-epson-ecotank-l8050-l18050-reliable-high-quality-solution.product-image.webp"
        ],
        "short_desc": "100% Genuine Epson Micro-Piezo printhead (FA96001 / FA96231) for Epson L8050, L18050, ET-18100 photo printers. Sealed original packaging.",
        "specs": {"Part Number": "FA96001 / FA96231", "Compatibility": "Epson L8050, L18050", "Type": "Genuine OEM"}
    },
    {
        "id": 5884, "sku": "500222", "type": "simple", "is_featured": False,
        "name": "Epson Ink Maintenance Box C12C934601 for L15150, L18050, L8050, L8180",
        "brand": "Epson", "category": "Accessories & Parts", "sub_category": "Printer Accessories",
        "sale_price": 1990, "regular_price": 2500, "price_range": "৳1,990",
        "stock": 50,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/09/epson-ink-maintenance-box-for-l15150-l15160-l18050-l8050-l8180-printers.Untitled-design-6.webp"
        ],
        "short_desc": "Original waste ink maintenance box prevents leaks and keeps your EcoTank running at peak performance. Easy plug-and-play installation.",
        "specs": {"Model": "C12C934601", "Compatibility": "Epson L15150, L18050, L8050, L8180"}
    },
    {
        "id": 5857, "sku": "500195", "type": "simple", "is_featured": False,
        "name": "MT30+ Universal Screen Protector Cutter – Intelligent Precision Cutting Machine",
        "brand": "Corporate Tech", "category": "Machinery", "sub_category": "Cutting Machines",
        "sale_price": 38500, "regular_price": 39500, "price_range": "৳38,500",
        "stock": 10,
        "images": [
            "https://corporatetechbd.com/wp-content/uploads/2025/08/mt30-universal-screen-protector-cutter-intelligent-precision-cutting-machine-2024-update.product-image-1-1.webp"
        ],
        "short_desc": "Built-in computer, no annual activation fees. Cuts flexible hydrogel, TPU, and back films for smartphones, tablets, smartwatches, and cameras.",
        "specs": {"Screen": "Built-in Touch Computer", "Compatibility": "Phones, Tablets, Watches", "Warranty": "1 Year Service"}
    }
]

# Enrich products with SEO metadata
processed_products = []
featured_count = 0

for p in products_raw:
    slug = slugify(p["name"])
    reg = p.get("regular_price") or 0
    sale = p.get("sale_price") or reg
    discount = f"-{round(((reg - sale) / reg) * 100)}%" if reg > sale else None
    
    # User constraint: exactly 12 or 13 on the homepage
    is_feat = p.get("is_featured", False)
    if is_feat and featured_count < 12:
        featured_count += 1
    elif is_feat and featured_count >= 12:
        is_feat = False

    seo_title = f"{p['name']} | Best Price in Bangladesh - Corporate Technologies"
    seo_desc = f"Buy genuine {p['name']} at best price in Bangladesh from Corporate Technologies. Authorized distributor with official warranty, fast delivery & expert service."
    
    prod = {
        "id": p["id"],
        "sku": p["sku"],
        "title": p["name"],
        "name": p["name"],
        "slug": slug,
        "type": p["type"],
        "brand": p["brand"],
        "category": p["category"],
        "sub_category": p.get("sub_category", ""),
        "regular_price": reg,
        "sale_price": sale,
        "price_range_label": p.get("price_range", f"৳{sale:,}"),
        "discount_label": discount,
        "stock_quantity": p.get("stock", 20),
        "is_featured": is_feat,
        "image_url": p["images"][0] if p["images"] else "/splashjet_images/about-splashjet.jpg",
        "gallery_images": p.get("images", []),
        "short_description": p.get("short_desc", ""),
        "specifications": p.get("specs", {}),
        "variations": p.get("variations", []),
        "rating": 4.9,
        "reviews_count": 18,
        "seo": {
            "title": seo_title,
            "description": seo_desc,
            "canonical_url": f"https://corporatetechbd.com/product/{slug}",
            "keywords": f"{p['brand']}, {p['category']}, {p['name']}, Corporate Technologies Bangladesh"
        }
    }
    processed_products.append(prod)

print(f"Total processed products: {len(processed_products)}")
print(f"Featured on homepage: {sum(1 for p in processed_products if p['is_featured'])}")

# Save to backend/data/clean_real_products.json
with open('backend/data/clean_real_products.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, ensure_ascii=False, indent=2)

# Save to frontend/src/data/fallbackProducts.json
with open('frontend/src/data/fallbackProducts.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, ensure_ascii=False, indent=2)

print("Saved clean_real_products.json and frontend fallbackProducts.json successfully!")

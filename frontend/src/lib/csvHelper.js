/**
 * CSV Helper Utilities for Corporate Technologies Admin
 * Supports UTF-8 encoding (BOM for Excel compatibility) and CSV Formula Injection Protection.
 */

// Sanitize cell values to prevent CSV formula injection in spreadsheet software
function sanitizeCsvCell(value) {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();
  // If cell starts with dangerous formula symbols, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // If cell contains commas, quotes, or newlines, escape quotes and wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export rows to CSV and trigger file download
 * @param {string} filename - e.g. "corporate_tech_orders_2026.csv"
 * @param {Array<{ key: string, label: string }>} columns
 * @param {Array<object>} rows
 */
export function exportToCsv(filename, columns, rows) {
  const headerLine = columns.map(c => sanitizeCsvCell(c.label)).join(',');
  const rowLines = rows.map(row => {
    return columns.map(col => sanitizeCsvCell(row[col.key])).join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens Bengali / Unicode characters properly
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse an uploaded CSV file into an array of objects
 * @param {File} file
 * @returns {Promise<Array<object>>}
 */
export function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text = e.target.result || '';
        // Remove BOM if present
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }

        const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('The CSV file is empty or has no data rows.');
        }

        const headers = parseCsvLine(lines[0]).map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
          const rowValues = parseCsvLine(lines[i]);
          if (rowValues.length === 0 || (rowValues.length === 1 && !rowValues[0])) continue;

          const obj = {};
          headers.forEach((header, idx) => {
            let val = rowValues[idx] || '';
            // Remove leading single quote if added for formula safety
            if (val.startsWith("'")) {
              val = val.slice(1);
            }
            obj[header] = val.trim();
          });
          result.push(obj);
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file.'));
    reader.readAsText(file, 'UTF-8');
  });
}

// Helper to parse a single line respecting quotes
function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

/**
 * Download a sample CSV template for product imports
 */
export function downloadSampleProductCsv() {
  const sampleColumns = [
    { key: 'title', label: 'title' },
    { key: 'category', label: 'category' },
    { key: 'brand', label: 'brand' },
    { key: 'regular_price', label: 'regular_price' },
    { key: 'sale_price', label: 'sale_price' },
    { key: 'discount_label', label: 'discount_label' },
    { key: 'stock_quantity', label: 'stock_quantity' },
    { key: 'sku', label: 'sku' },
    { key: 'short_description', label: 'short_description' },
    { key: 'image_url', label: 'image_url' }
  ];

  const sampleRows = [
    {
      title: 'Epson EcoTank L3250 Wi-Fi All-in-One Ink Tank Printer',
      category: 'Printers',
      brand: 'Epson',
      regular_price: 22000,
      sale_price: 20500,
      discount_label: '-7%',
      stock_quantity: 15,
      sku: 'CT-EPSON-L3250',
      short_description: 'High-yield ink tank printer with Wi-Fi & borderless photo printing',
      image_url: 'https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l3250-a4-wi-fi-multifunction-inktank-printer.Epson-L3250-1.webp'
    },
    {
      title: 'Splashjet 003 Compatible Refill Ink Set (4 Colors)',
      category: 'Splashjet Inks',
      brand: 'Splashjet',
      regular_price: 1600,
      sale_price: 1400,
      discount_label: '-12%',
      stock_quantity: 50,
      sku: 'CT-SPLASH-003',
      short_description: 'Premium dye ink set compatible with Epson L1110, L3110, L3250',
      image_url: 'https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-003-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Splashjet-Epson-003.webp'
    }
  ];

  exportToCsv('sample_products_template.csv', sampleColumns, sampleRows);
}

/**
 * Download a sample CSV template for order imports
 */
export function downloadSampleOrderCsv() {
  const sampleColumns = [
    { key: 'order_number', label: 'Order Number' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'delivery_address', label: 'Delivery Address' },
    { key: 'city', label: 'City' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'delivery_fee', label: 'Delivery Fee' },
    { key: 'grand_total', label: 'Grand Total (COD)' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'order_status', label: 'Status' },
    { key: 'items', label: 'Items Description' },
    { key: 'courier_name', label: 'Courier' },
    { key: 'tracking_code', label: 'Tracking Code' }
  ];

  const sampleRows = [
    {
      order_number: 'CT-2609-1001',
      customer_name: 'Rahim Ahmed',
      phone: '01711000111',
      delivery_address: 'House 12, Road 4, Sector 3, Uttara',
      city: 'Dhaka',
      subtotal: 20500,
      delivery_fee: 60,
      grand_total: 20560,
      payment_method: 'cod',
      order_status: 'pending',
      items: 'Epson EcoTank L3250 Wi-Fi All-in-One Ink Tank Printer (x1)',
      courier_name: 'Steadfast',
      tracking_code: 'ST-987654'
    },
    {
      order_number: 'CT-2609-1002',
      customer_name: 'Tanvir Hasan',
      phone: '01819000222',
      delivery_address: 'GEC Circle, Nasirabad',
      city: 'Chittagong',
      subtotal: 1400,
      delivery_fee: 120,
      grand_total: 1520,
      payment_method: 'cod',
      order_status: 'confirmed',
      items: 'Splashjet 003 Compatible Refill Ink Set (4 Colors) (x1)',
      courier_name: 'Pathao',
      tracking_code: 'PTH-452109'
    }
  ];

  exportToCsv('sample_orders_template.csv', sampleColumns, sampleRows);
}

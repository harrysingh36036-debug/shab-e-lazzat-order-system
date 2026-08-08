# Shab-E-Lazzat Order & Inventory System

A lightweight, single-file order capture, purchase, and inventory management tool for the **Shab-E-Lazzat** restaurant. Built with HTML + Tailwind CSS + vanilla JavaScript — no build step, open `index.html` in any browser.

## Features

### Sales
- **Order metadata** — order ID, date, time, time block, order source (Dine-In / WhatsApp / Phone / Takeaway / Zomato-Swiggy), payment mode.
- **Full menu catalog** — Starters, Main Course, Breads, Rice & Biryani, Beverages, Desserts with size-based pricing; price auto-fills from the catalog.
- **Combo flag + add-ons** per line item.
- **Printable receipt** — monospace thermal-style receipt, prints only the receipt (nothing else).
- **CSV export** of the staged sale.

### Purchase
- **PO metadata** — PO ID, date, supplier (Fresh Veggies, Meat Masters, Spice Route, etc.), payment terms, expected delivery.
- **Raw-material catalog** — 46 ingredients (Vegetables, Meat, Spices, Dairy, Dry Goods, Beverages, Packaging, Cleaning) with units and reference prices.
- **GST % + discount** per line, live line-total calculation.
- **Save PO → auto-increases inventory stock** for matching items.
- **CSV export** of the staged purchase order.

### Inventory
- **Full stock table** — current stock, min/max levels, average cost, computed value, status badges (In Stock / Low Stock / Out of Stock).
- **Search + filters** (category, stock level).
- **Add / edit / delete** items, **single or bulk stock adjustments** (add / remove / set absolute) with reasons.
- **CSV export**.

### Dashboard
- Today's sales & purchases, low-stock alert count, total inventory value.
- 7-day sales & purchase trend charts (canvas, no libraries).
- Recent sales & purchase history tables.

### Platform
- **4 tabs** (Purchase / Inventory / Sales / Dashboard) with desktop + mobile navigation.
- **Dark mode + 6 accent colors + compact density** — all persisted.
- **Undo / Redo** (Ctrl+Z / Ctrl+Shift+Z) for staged rows, saved orders, inventory edits and stock adjustments.
- **Keyboard shortcuts** — `1`–`4` switch tabs, `Ctrl+,` settings, `Ctrl+D` dark mode.
- **Google Sheets sync** — push staged sales, purchase orders, or full inventory to a Google Sheet via a free Apps Script webhook (no API keys needed). Settings → Google Sheets Sync → copy the script, deploy it, paste the URL.
- **Backup / restore** — export all data as JSON, import it back, or clear everything.
- **Local-first** — all data lives in `localStorage` on the device; nothing leaves the browser except your explicit CSV / Sheets pushes.

## Usage

1. Start the server: `npm start` (or open `index.html` directly — CSV download works best over the server).
2. Open `http://localhost:9808`.
3. Fill order metadata, pick items (prices auto-populate), set quantity, click **Add to Order**.
4. Review staged items, then **Save**, **Export CSV**, **Print Receipt**, or **Push to Google Sheets**.

## Google Sheets setup (one-time)

1. Open the sheet you want to sync to.
2. Extensions → Apps Script → paste the code from **Settings → Copy Apps Script code**.
3. Deploy → New deployment → **Web app** → Execute as *Me*, access *Anyone* → Deploy.
4. Copy the `/exec` URL into **Settings → Google Sheets Sync** and hit **Push**.

## Data storage

All data is stored in the browser's `localStorage`, scoped per origin:
`shab_purchase_catalog`, `shab_purchase_orders`, `shab_inventory`, `shab_sales_catalog`, `shab_sales_orders`, `shab_settings`, `shab_history`.

Back up regularly via **Settings → Export All Data (JSON)**.

## Menu / catalog

The catalogs are the `DEFAULT_PURCHASE_CATALOG` and `DEFAULT_SALES_CATALOG` arrays in the inline script — the single source of truth on first run. Your saved `localStorage` data overrides them afterwards.

## License

For internal use by Shab-E-Lazzat.

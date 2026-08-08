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

### Customers
- **Customer database** — name, phone, type (Regular / Walk-in / Online / Bulk / VIP), address, notes.
- **Search + add / edit / delete**, CSV export.
- Pick a linked customer on the Sales tab — order is tagged with `customer_id` / `customer_name` in the sheet.
- Synced to Google Sheets in the `Customers` tab.

### Platform
- **5 tabs** (Purchase / Inventory / Sales / Customers / Dashboard) with desktop + mobile navigation.
- **Dark mode + 6 accent colors + compact density** — all persisted.
- **Undo / Redo** (Ctrl+Z / Ctrl+Shift+Z) for staged rows, saved orders, inventory edits and stock adjustments.
- **Keyboard shortcuts** — `1`–`5` switch tabs, `Ctrl+,` settings, `Ctrl+D` dark mode.
- **Google Sheets sync** — every save auto-syncs all tables (sales, purchases, inventory, customers, settings) to a Google Sheet via Apps Script; the login gates the UI only.
- **Backup / restore** — export all data as JSON, import it back, or clear everything.
- **Local-first** — data caches in `localStorage`, with Google Sheets as the shared source of truth across users.

## Usage

1. Start the server: `npm start` (or open `index.html` directly — CSV download works best over the server).
2. Open `http://localhost:9808`.
3. Fill order metadata, pick items (prices auto-populate), set quantity, click **Add to Order**.
4. Review staged items, then **Save**, **Export CSV**, **Print Receipt**, or **Push to Google Sheets**.

## Data sync setup (one-time, ~15 min)

Because the app runs fully client-side on public hosting, **no credential is ever shipped in the code**. The real Google token lives in two secret stores; a Cloudflare Worker sits in front of the Google script:

1. **Hardening — do this BEFORE anything else** (the old token was published in the page source, so treat it as compromised):
   - Open the sheet → **Share** → set to *Restricted* ("Anyone with the link" = **off**). The data stays saved; sync still works because the script runs as the owner.
2. **Apps Script (Google side)**
   - Extensions → Apps Script on your sheet → paste the code from **Settings → Copy Apps Script code** (or `apps-script-backend.js`).
   - In the editor run this once (replace `YourLongRandomToken` with a long random string):
     ```
     PropertiesService.getScriptProperties().setProperty('SECRET_TOKEN', 'YourLongRandomToken');
     ```
   - Deploy → New deployment → **Web app** → Execute as *Me*, access *Anyone* → copy the `/exec` URL.
3. **Cloudflare Worker (the only public endpoint)**
   - dash.cloudflare.com → Workers & Pages → Create → paste the code from **`worker.js`** → Deploy.
   - Worker **Settings → Variables and Secrets**:
     - Secret `APP_PASSWORD` → long random password (this is what you type in the app's Settings).
     - Secret `SHEETS_TOKEN` → the *same* token from step 3.
     - Plain text `SHEETS_URL` → your `/exec` URL.
     - Optional plain text `ALLOWED_ORIGIN` → `https://<your-user>.github.io` to block other sites from calling the Worker.
4. **In the app (site owner, once, on each device)**
   - Settings → Google Sheets Sync → **Sync Server URL** = `https://<your-worker-name>.workers.dev`, **Sync Password** = the `APP_PASSWORD` value. Save.
5. **Verify**: open the deployed page in a private window → Settings shows the Worker URL; DevTools → Network shows calls to your Worker only — no `script.google.com` requests and no token anywhere in the source.

### Data storage & safety

App data is cached in the browser's `localStorage`: `shab_purchase_catalog`, `shab_purchase_orders`, `shab_inventory`, `shab_sales_catalog`, `shab_sales_orders`, `shab_customers`, `shab_settings`, `shab_history`.

The **source of truth** is the Google Sheet — any user with the sync password sees the same data, synced on every save.

**What this setup protects:** the page source contains no `/exec` URL and no token, so someone who downloads the code cannot talk to the sheet directly. They can only call your Worker — and it rejects calls without the `APP_PASSWORD`.

**Remaining boundary (client-side apps can't fix this):** anyone who legitimately holds the sync password can read/write all synced data, and the Worker is a shared door. For per-user permissions or an audit log you'd need a proper backend (see `laptop-inventory` for a reference architecture).

## Menu / catalog

The catalogs are the `DEFAULT_PURCHASE_CATALOG` and `DEFAULT_SALES_CATALOG` arrays in the inline script — the single source of truth on first run. Your saved `localStorage` data overrides them afterwards.

## License

For internal use by Shab-E-Lazzat.

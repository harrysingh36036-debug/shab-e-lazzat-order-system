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

## Google Sheets setup (one-time)

1. Open the sheet you want to sync to.
2. Extensions → Apps Script → paste the code from **Settings → Copy Apps Script code**.
3. In the script, set a secret `SECRET_TOKEN` (the same one you'll enter in the app's Settings → Secret Token).
4. Deploy → New deployment → **Web app** → Execute as *Me*, access *Anyone* → Deploy.
5. Copy the `/exec` URL into **Settings → Google Sheets Sync**, enter the Secret Token, and every save auto-syncs.
6. Manual **Push** buttons still work for the current staged rows.

## Data storage & safety

App data is cached in the browser's `localStorage`:
`shab_purchase_catalog`, `shab_purchase_orders`, `shab_inventory`, `shab_sales_catalog`, `shab_sales_orders`, `shab_customers`, `shab_settings`, `shab_history`.

The **source of truth** is the Google Sheet — any logged-in user sees the same data, synced on every save.

**Is my data safe with the login?** The login screen (password hashes in `localStorage`) protects access to the *app UI* on shared devices, but anyone who obtains the Apps Script URL from the page source and knows the token can read/write the sheet directly — because this is a fully client-side app, real security is impossible without a server. To keep data safe:
- Set a long, unique `SECRET_TOKEN` in both the script and app Settings — unauthorized calls are rejected (403).
- Keep the spreadsheet itself private (never share the "view" link publicly).
- Don't post the `/exec` URL or token anywhere public.
- For real multi-user security (per-user passwords, permissions), you need a server-side backend — this static app can't guarantee that.

## Menu / catalog

The catalogs are the `DEFAULT_PURCHASE_CATALOG` and `DEFAULT_SALES_CATALOG` arrays in the inline script — the single source of truth on first run. Your saved `localStorage` data overrides them afterwards.

## License

For internal use by Shab-E-Lazzat.

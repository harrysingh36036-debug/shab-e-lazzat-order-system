# Shab-E-Lazzat Order & Inventory System

A lightweight, single-file order capture and inventory tracking tool for the **Shab-E-Lazzat** restaurant. Built with HTML + Tailwind CSS + vanilla JavaScript — no build step, open `index.html` in any browser.

## Features

- **Order Metadata** — order ID, date, time, time block, order source (WhatsApp / Phone / Takeaway / Zomato-Swiggy), and payment mode.
- **Smart cascading menu catalog** — pick Category → Sub-Category → Item Name → Itemize specifier; the unit price auto-fills from the linked catalog.
- **Live staging table** — add multiple items to a current order and review line totals instantly.
- **CSV export** — download the day's staged orders as a CSV for records or spreadsheet analytics.

## Usage

1. Open `index.html` in a browser.
2. Fill in order metadata, select menu items (price auto-populates), set quantity, and click **Add Item to Order**.
3. Review staged items in the table, then **Download Daily CSV**.

## Menu catalog

The `menuCatalog` array at the top of the inline script is the single data source. Extend it with entries of the shape:

```js
{ item: "Category", category: "Sub-Category", item_name: "Item Name", itemize: "Size/Spec", price: 90.00 }
```

## License

For internal use by Shab-E-Lazzat.

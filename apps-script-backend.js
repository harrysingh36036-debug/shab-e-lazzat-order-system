/**
 * Shab-E-Lazzat — Google Sheets Backend
 * Deploy as: Extensions → Apps Script → paste → Deploy → New deployment → Web app
 * Execute as Me, Who has access: Anyone → Deploy.
 *
 * ONE-TIME SETUP (in the Apps Script editor, before deploying):
 * run this once (replace YourLongRandomToken):
 *   PropertiesService.getScriptProperties().setProperty('SECRET_TOKEN', 'YourLongRandomToken');
 * The same value goes into the Cloudflare Worker secret SHEETS_TOKEN.
 * The token is NEVER hardcoded here so the public page source exposes nothing.
 */
var SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('SECRET_TOKEN') || '';

const SHEET_NAMES = {
  sales: 'Sales', purchases: 'Purchases', inventory: 'Inventory',
  customers: 'Customers', settings: 'Settings'
};
const HEADERS = {
  sales: ['so_id','date','time','time_block','source','category','subcategory','item','size','qty','unit_price','line_total','is_combo','add_ons','payment_mode','customer_id','customer_name'],
  purchases: ['po_id','date','time','supplier','item','unit','qty','unit_price','gst','discount','line_total','expected_delivery','payment_mode'],
  inventory: ['name','category','subcategory','unit','currentStock','minLevel','maxLevel','avgCost','value','supplier','lastUpdated'],
  customers: ['id','name','phone','type','address','notes','created'],
  settings: ['key','value']
};

function checkToken(e) {
  if (!SECRET_TOKEN) return false;
  var sent = e && e.parameter && e.parameter.token;
  if (e && e.postData) {
    try { var p = JSON.parse(e.postData.contents); sent = p.token || sent; } catch (err) {}
  }
  return sent === SECRET_TOKEN;
}

function doGet(e) {
  try {
    if (!checkToken(e)) return jsonResponse({ ok: false, error: 'Unauthorized' }, 403);
    const data = {};
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Object.entries(SHEET_NAMES).forEach(function ([key, name]) {
      const sheet = ss.getSheetByName(name);
      if (!sheet || sheet.getLastRow() === 0) { data[key] = []; return; }
      const values = sheet.getDataRange().getValues();
      const hdrs = values[0];
      data[key] = values.slice(1).map(function (r) {
        const obj = {};
        hdrs.forEach(function (h, i) { obj[h] = r[i]; });
        return obj;
      });
    });
    return jsonResponse({ ok: true, data: data });
  } catch (err) { return jsonResponse({ ok: false, error: err.toString() }, 500); }
}

function doPost(e) {
  try {
const payload = JSON.parse(e.postData.contents);
    if (!SECRET_TOKEN || payload.token !== SECRET_TOKEN) return jsonResponse({ ok: false, error: 'Unauthorized' }, 403);
    const action = payload.action || 'upsert';
    const table = payload.table;
    const items = payload.items || [];
    if (!table || !SHEET_NAMES[table]) return jsonResponse({ ok: false, error: 'Invalid table' }, 400);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAMES[table]);
    if (!sheet) { sheet = ss.insertSheet(SHEET_NAMES[table]); sheet.appendRow(HEADERS[table]); }
    else if (sheet.getLastRow() === 0) { sheet.appendRow(HEADERS[table]); }
    const headers = HEADERS[table];
    if (action === 'replace') {
      if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
      if (items.length) {
        sheet.getRange(2, 1, items.length, headers.length)
          .setValues(items.map(function (item) { return headers.map(function (h) { return item[h] != null ? item[h] : ''; }); }));
      }
      return jsonResponse({ ok: true, replaced: items.length });
    }
    if (action === 'upsert') {
      const rows = sheet.getDataRange().getValues().slice(1);
      const idKey = headers[0];
      items.forEach(function (item) {
        const rowData = headers.map(function (h) { return item[h] != null ? item[h] : ''; });
        let idx = -1;
        rows.forEach(function (r, i) { if (String(r[0]) === String(item[idKey])) idx = i; });
        if (idx >= 0) sheet.getRange(idx + 2, 1, 1, headers.length).setValues([rowData]);
        else sheet.appendRow(rowData);
      });
      return jsonResponse({ ok: true, upserted: items.length });
    }
    if (action === 'delete') {
      const idKey = headers[0];
      const rows = sheet.getDataRange().getValues().slice(1);
      rows.forEach(function (r, i) { if (String(r[0]) === String(payload.id)) sheet.deleteRow(i + 2); });
      return jsonResponse({ ok: true, deleted: payload.id });
    }
    return jsonResponse({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) { return jsonResponse({ ok: false, error: err.toString() }, 500); }
}

function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(obj, status) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


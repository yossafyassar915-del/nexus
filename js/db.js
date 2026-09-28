// db.js — the entire "backend" for this static demo.
//
// Every table lives in the browser's localStorage as plain JSON. On first
// load (or after "Reset Demo Data"), each table is seeded with realistic
// dummy data below. From then on, every Add/Edit/Delete the client makes
// is written straight to localStorage, so it survives page refreshes —
// but it only exists in THAT browser, on THAT device. There is no server,
// no shared database, and no way for two people to see the same changes.
//
// Method names/signatures (getLeads, createLead, getOpportunities, ...)
// deliberately match a typical REST API client shape, so every other page
// just imports { db as api } from here and calls it exactly like a normal
// async API client — nothing else had to change.

const PREFIX = "nexus_demo_";
const KEYS = {
  accounts: `${PREFIX}accounts`,
  leads: `${PREFIX}leads`,
  deals: `${PREFIX}deals`,
  inventory: `${PREFIX}inventory`,
  orders: `${PREFIX}orders`,
  purchaseOrders: `${PREFIX}purchase_orders`,
};

// ---------------------------------------------------------------------
// Small date helpers so seed data always looks "recent" relative to
// whenever someone actually opens the demo, instead of showing a fixed
// date from whenever this file was written.
// ---------------------------------------------------------------------
function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}
function daysAgo(n) {
  return hoursAgo(n * 24);
}
function inDays(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------
// Seed data (JSON-shaped JS objects) — realistic enough to demo every
// screen without looking obviously fake. Feel free to edit these directly.
// ---------------------------------------------------------------------
function buildSeed() {
  const accounts = [
    { id: "acc_1", name: "Apex Solutions", industry: "Manufacturing", owner: "Sarah Chen", website: "apexsolutions.com", created_at: daysAgo(120) },
    { id: "acc_2", name: "Coastal Traders", industry: "Retail & Wholesale", owner: "Marcus Webb", website: "coastaltraders.com", created_at: daysAgo(95) },
    { id: "acc_3", name: "Bright Horizons Retail", industry: "Retail", owner: "Priya Nair", website: "brighthorizons.com", created_at: daysAgo(70) },
    { id: "acc_4", name: "Falcon Freight Co.", industry: "Logistics", owner: "Omar Haddad", website: "falconfreight.com", created_at: daysAgo(45) },
    { id: "acc_5", name: "NovaTech Systems", industry: "Technology", owner: "Lena Ivanova", website: "novatechsys.com", created_at: daysAgo(20) },
  ];

  const leads = [
    { id: "lead_1", name: "John Mercer", company: "Coastal Traders", email: "john.mercer@coastaltraders.com", phone: "+1 415 555 0142", source: "website", status: "new", created_at: hoursAgo(4) },
    { id: "lead_2", name: "Aisha Rahman", company: "Bright Horizons Retail", email: "aisha.r@brighthorizons.com", phone: "+1 415 555 0198", source: "referral", status: "contacted", created_at: daysAgo(1) },
    { id: "lead_3", name: "Tom Becker", company: "Falcon Freight Co.", email: "t.becker@falconfreight.com", phone: "+1 415 555 0177", source: "voice-assistant", status: "qualified", created_at: daysAgo(3) },
    { id: "lead_4", name: "Grace Liu", company: "NovaTech Systems", email: "grace.liu@novatechsys.com", phone: "+1 415 555 0133", source: "website", status: "new", created_at: daysAgo(2) },
    { id: "lead_5", name: "Daniel Cruz", company: "Meridian Devices", email: "daniel.cruz@meridiandevices.com", phone: "+1 415 555 0166", source: "cold-call", status: "contacted", created_at: daysAgo(6) },
    { id: "lead_6", name: "Sofia Rossi", company: "Apex Solutions", email: "sofia.rossi@apexsolutions.com", phone: "+1 415 555 0121", source: "referral", status: "converted", created_at: daysAgo(14) },
  ];

  const deals = [
    { id: "deal_1", client_name: "Apex Solutions", deal_stage: "Proposal", value: 45000, probability: 75, owner: "Sarah Chen", last_activity: hoursAgo(3), created_at: daysAgo(18) },
    { id: "deal_2", client_name: "Apex Solutions", deal_stage: "Proposal", value: 36000, probability: 75, owner: "Sarah Chen", last_activity: hoursAgo(3), created_at: daysAgo(16) },
    { id: "deal_3", client_name: "Coastal Traders", deal_stage: "Qualified", value: 28000, probability: 40, owner: "Marcus Webb", last_activity: daysAgo(1), created_at: daysAgo(9) },
    { id: "deal_4", client_name: "Bright Horizons Retail", deal_stage: "Negotiation", value: 62000, probability: 60, owner: "Priya Nair", last_activity: hoursAgo(6), created_at: daysAgo(22) },
    { id: "deal_5", client_name: "Falcon Freight Co.", deal_stage: "Proposal", value: 15000, probability: 50, owner: "Omar Haddad", last_activity: daysAgo(2), created_at: daysAgo(11) },
    { id: "deal_6", client_name: "NovaTech Systems", deal_stage: "Won", value: 90000, probability: 100, owner: "Lena Ivanova", last_activity: daysAgo(5), created_at: daysAgo(40) },
    { id: "deal_7", client_name: "Meridian Devices", deal_stage: "Lost", value: 12000, probability: 0, owner: "Sarah Chen", last_activity: daysAgo(30), created_at: daysAgo(60) },
    { id: "deal_8", client_name: "Apex Solutions", deal_stage: "Qualified", value: 20000, probability: 20, owner: "Sarah Chen", last_activity: hoursAgo(2), created_at: daysAgo(4) },
  ];

  const inventory = [
    { id: "inv_1", sku: "NX-1001", name: "Steel Bracket 40mm", category: "Hardware", quantity: 1250, reorder_level: 300, unit_price: 4.20, warehouse: "Main" },
    { id: "inv_2", sku: "NX-1002", name: "Hydraulic Pump A2", category: "Machinery", quantity: 42, reorder_level: 50, unit_price: 310.00, warehouse: "Main" },
    { id: "inv_3", sku: "NX-1003", name: "Control Panel v3", category: "Electronics", quantity: 180, reorder_level: 100, unit_price: 96.50, warehouse: "North" },
    { id: "inv_4", sku: "NX-1004", name: "Industrial Fan Motor", category: "Machinery", quantity: 18, reorder_level: 25, unit_price: 145.00, warehouse: "Main" },
    { id: "inv_5", sku: "NX-1005", name: "Packaging Box (Large)", category: "Packaging", quantity: 3400, reorder_level: 500, unit_price: 0.85, warehouse: "South" },
    { id: "inv_6", sku: "NX-1006", name: "Safety Helmet", category: "Safety Gear", quantity: 220, reorder_level: 150, unit_price: 12.50, warehouse: "Main" },
    { id: "inv_7", sku: "NX-1007", name: "Copper Wiring 10m", category: "Electronics", quantity: 60, reorder_level: 80, unit_price: 22.00, warehouse: "North" },
  ];

  const orders = [
    {
      id: "ord_1", order_number: "ORD-1001", customer_name: "Apex Solutions", status: "processing", created_at: daysAgo(2),
      order_items: [
        { item_name: "Steel Bracket 40mm", quantity: 50, unit_price: 4.20 },
        { item_name: "Control Panel v3", quantity: 5, unit_price: 96.50 },
      ],
      total_value: 50 * 4.20 + 5 * 96.50,
    },
    {
      id: "ord_2", order_number: "ORD-1002", customer_name: "Coastal Traders", status: "completed", created_at: daysAgo(9),
      order_items: [{ item_name: "Packaging Box (Large)", quantity: 800, unit_price: 0.85 }],
      total_value: 800 * 0.85,
    },
    {
      id: "ord_3", order_number: "ORD-1003", customer_name: "Bright Horizons Retail", status: "pending", created_at: hoursAgo(10),
      order_items: [{ item_name: "Safety Helmet", quantity: 40, unit_price: 12.50 }],
      total_value: 40 * 12.50,
    },
    {
      id: "ord_4", order_number: "ORD-1004", customer_name: "NovaTech Systems", status: "shipped", created_at: daysAgo(5),
      order_items: [{ item_name: "Hydraulic Pump A2", quantity: 3, unit_price: 310.00 }],
      total_value: 3 * 310.00,
    },
  ];

  const purchaseOrders = [
    {
      id: "po_1", po_number: "PO-1001", supplier_name: "Global Parts Co.", status: "sent",
      expected_date: inDays(7), created_at: daysAgo(3),
      purchase_order_items: [{ item_name: "Hydraulic Pump A2", quantity: 100, unit_cost: 280.00 }],
      total_value: 28000,
    },
    {
      id: "po_2", po_number: "PO-1002", supplier_name: "Steel Supply Corp", status: "received",
      expected_date: daysAgo(1), created_at: daysAgo(12),
      purchase_order_items: [{ item_name: "Steel Bracket 40mm", quantity: 2000, unit_cost: 3.90 }],
      total_value: 7800,
    },
    {
      id: "po_3", po_number: "PO-1003", supplier_name: "CircuitWorks Ltd", status: "draft",
      expected_date: inDays(14), created_at: hoursAgo(20),
      purchase_order_items: [{ item_name: "Copper Wiring 10m", quantity: 150, unit_cost: 19.50 }],
      total_value: 2925,
    },
  ];

  return { accounts, leads, deals, inventory, orders, purchaseOrders };
}

// ---------------------------------------------------------------------
// Low-level storage helpers
// ---------------------------------------------------------------------
function readTable(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeTable(key, rows) {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch (err) {
    console.error("[db] Failed to write to localStorage:", err);
  }
}

function ensureSeeded() {
  const seed = buildSeed();
  Object.entries(KEYS).forEach(([name, key]) => {
    if (readTable(key) === null) {
      writeTable(key, seed[name]);
    }
  });
}
ensureSeeded();

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function list(tableName) {
  return readTable(KEYS[tableName]) || [];
}
function insert(tableName, record) {
  const rows = list(tableName);
  const withId = { id: uid(tableName), created_at: new Date().toISOString(), ...record };
  rows.unshift(withId);
  writeTable(KEYS[tableName], rows);
  return withId;
}
function patch(tableName, id, changes) {
  const rows = list(tableName);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...changes };
  writeTable(KEYS[tableName], rows);
  return rows[idx];
}

/** Wipes every table back to the original seed data. Used by the
 * "Reset Demo Data" button so the client can start a fresh run-through. */
function resetAll() {
  const seed = buildSeed();
  Object.entries(KEYS).forEach(([name, key]) => writeTable(key, seed[name]));
}

// =====================================================================
// Public API — a plain, self-contained client the rest of the app calls
// =====================================================================

// ---- Analytics / dashboard ----
function getKpis() {
  const deals = list("deals");
  const inventory = list("inventory");
  const orders = list("orders");
  const total_revenue = deals.reduce((sum, d) => sum + d.value, 0);
  const stock_value = inventory.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  return { total_revenue, new_orders: orders.length, stock_value: Math.round(stock_value * 100) / 100 };
}

// Static illustrative series (kept independent of live CRUD data, same as
// the full-stack version) so the charts always look complete and don't go
// blank just because the demo data set is small.
const MONTHLY_SALES = [
  ["Jan", 120], ["Feb", 150], ["Mar", 170], ["Apr", 140], ["May", 190], ["Jun", 210],
  ["Jul", 205], ["Aug", 230], ["Sep", 521], ["Oct", 240], ["Nov", 260], ["Dec", 280],
];
const INVENTORY_TURNOVER = [12, 18, 15, 22, 19, 28, 24, 30, 27, 33, 29, 36];

function getMonthlySales() {
  return MONTHLY_SALES.map(([month, value]) => ({ month, value }));
}
function getInventoryTurnover() {
  return { values: INVENTORY_TURNOVER };
}
function getOpportunities(limit = 20) {
  return [...list("deals")].sort((a, b) => b.value - a.value).slice(0, limit);
}

// ---- CRM: Leads ----
function getLeads(status) {
  const rows = list("leads");
  return status ? rows.filter((l) => l.status === status) : rows;
}
function createLead(lead) {
  return insert("leads", {
    name: lead.name, company: lead.company || "", email: lead.email || "",
    phone: lead.phone || "", source: lead.source || "manual", status: "new",
  });
}
function updateLeadStatus(id, status) {
  return patch("leads", id, { status });
}
function getTopLeads(limit = 5) {
  return getOpportunities(limit);
}

// ---- CRM: Accounts ----
function getAccounts() {
  return list("accounts");
}
function createAccount(account) {
  return insert("accounts", {
    name: account.name, industry: account.industry || "",
    owner: account.owner || "", website: account.website || "",
  });
}

// ---- CRM: Deals / Pipeline ----
function getDeals() {
  return list("deals");
}
function createDeal(deal) {
  return insert("deals", {
    client_name: deal.client_name, deal_stage: deal.deal_stage || "Qualified",
    value: Number(deal.value) || 0, probability: Number(deal.probability) || 0,
    owner: deal.owner || "", last_activity: new Date().toISOString(),
  });
}
function updateDealStage(id, deal_stage) {
  return patch("deals", id, { deal_stage, last_activity: new Date().toISOString() });
}

// ---- CRM: Search ----
function searchCrm(query) {
  const q = (query || "").toLowerCase();
  const leads = list("leads").filter(
    (l) => l.name.toLowerCase().includes(q) || (l.company || "").toLowerCase().includes(q)
  );
  const accounts = list("accounts").filter((a) => a.name.toLowerCase().includes(q));
  return { leads: leads.slice(0, 5), accounts: accounts.slice(0, 5) };
}

// ---- ERP: Inventory ----
function getInventory(lowStockOnly = false) {
  const rows = [...list("inventory")].sort((a, b) => a.name.localeCompare(b.name));
  return lowStockOnly ? rows.filter((i) => i.quantity <= i.reorder_level) : rows;
}
function getInventoryItemByName(fragment) {
  if (!fragment) return null;
  const f = fragment.toLowerCase();
  return list("inventory").find((i) => i.name.toLowerCase().includes(f)) || null;
}
function createInventoryItem(item) {
  return insert("inventory", {
    sku: item.sku, name: item.name, category: item.category || "",
    quantity: Number(item.quantity) || 0, reorder_level: Number(item.reorder_level) || 0,
    unit_price: Number(item.unit_price) || 0, warehouse: item.warehouse || "Main",
  });
}
function updateInventoryItem(id, fields) {
  return patch("inventory", id, fields);
}
function adjustInventoryQuantity(id, delta) {
  const item = list("inventory").find((i) => i.id === id);
  if (!item) return null;
  return patch("inventory", id, { quantity: Math.max(0, item.quantity + delta) });
}

// ---- ERP: Orders ----
function getOrders(status) {
  const rows = list("orders");
  return status ? rows.filter((o) => o.status === status) : rows;
}
function createOrder({ customer_name, items }) {
  const order_items = [];
  let total_value = 0;
  for (const line of items) {
    const invItem = list("inventory").find((i) => i.id === line.inventory_item_id);
    const unit_price = invItem ? invItem.unit_price : Number(line.unit_price) || 0;
    const item_name = invItem ? invItem.name : line.item_name || "Unknown item";
    const quantity = Number(line.quantity) || 1;
    order_items.push({ item_name, quantity, unit_price });
    total_value += quantity * unit_price;
    if (invItem) adjustInventoryQuantity(invItem.id, -quantity); // fulfill from stock
  }
  const order = insert("orders", {
    order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name, status: "pending",
    total_value: Math.round(total_value * 100) / 100, order_items,
  });
  return order;
}
function updateOrderStatus(id, status) {
  return patch("orders", id, { status });
}

// ---- ERP: Procurement / Purchase Orders ----
function getPurchaseOrders(status) {
  const rows = list("purchaseOrders");
  return status ? rows.filter((p) => p.status === status) : rows;
}
function createPurchaseOrder({ supplier_name, expected_date, items }) {
  const purchase_order_items = [];
  let total_value = 0;
  for (const line of items) {
    const invItem = list("inventory").find((i) => i.id === line.inventory_item_id);
    const unit_cost = invItem ? invItem.unit_price : Number(line.unit_cost) || 0;
    const item_name = invItem ? invItem.name : line.item_name || "Unknown item";
    const quantity = Number(line.quantity) || 1;
    purchase_order_items.push({ item_name, quantity, unit_cost });
    total_value += quantity * unit_cost;
  }
  return insert("purchaseOrders", {
    po_number: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier_name, status: "draft", expected_date: expected_date || null,
    total_value: Math.round(total_value * 100) / 100, purchase_order_items,
  });
}
function updatePurchaseOrderStatus(id, status) {
  const updated = patch("purchaseOrders", id, { status });
  if (updated && status === "received") {
    for (const line of updated.purchase_order_items || []) {
      const invItem = list("inventory").find((i) => i.name === line.item_name);
      if (invItem) adjustInventoryQuantity(invItem.id, line.quantity); // restock
    }
  }
  return updated;
}

// ---- ERP: Reports ----
function getStockValuation() {
  const items = getInventory();
  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  return { items, total_stock_value: Math.round(total * 100) / 100 };
}
function getLowStockReport() {
  return getInventory(true);
}

export const db = {
  // analytics
  getKpis, getMonthlySales, getInventoryTurnover, getOpportunities,
  // crm
  getLeads, createLead, updateLeadStatus, getTopLeads,
  getAccounts, createAccount,
  getDeals, createDeal, updateDealStage,
  searchCrm,
  // erp
  getInventory, getInventoryItemByName, createInventoryItem, updateInventoryItem,
  getOrders, createOrder, updateOrderStatus,
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus,
  getStockValuation, getLowStockReport,
  // demo controls
  resetAll,
};

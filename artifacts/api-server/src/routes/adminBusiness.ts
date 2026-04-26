import { Router, type IRouter } from "express";
import {
  getDb,
  saveDb,
  DEFAULT_SETTINGS,
  type AbandonedCart,
  type CustomerLedgerEntry,
  type CourierProvider,
  type CourierStatus,
  type FraudFlag,
  type Order,
} from "../lib/store";

const router: IRouter = Router();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function now() {
  return new Date().toISOString();
}
function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
function ensure() {
  const db = getDb();
  if (!db.abandonedCarts) db.abandonedCarts = [];
  if (!db.ledger) db.ledger = [];
  if (!db.settings) db.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  if (!db.settings!.courier) db.settings!.courier = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.courier));
  if (!db.settings!.seo) db.settings!.seo = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.seo));
  return db;
}

// ────────────────────────────────────────────────────────────────────
// PUBLIC: cart capture (called by storefront on cart change)
// ────────────────────────────────────────────────────────────────────
router.post("/abandoned-carts", (req, res) => {
  const db = ensure();
  const body = req.body as Partial<AbandonedCart>;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    res.json({ ok: true, skipped: true });
    return;
  }
  const id = body.id ?? uid();
  const existing = db.abandonedCarts!.find((c) => c.id === id);
  const subtotal = body.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  if (existing) {
    existing.items = body.items;
    existing.subtotal = subtotal;
    existing.identifier = body.identifier ?? existing.identifier;
    existing.phone = body.phone ?? existing.phone;
    existing.name = body.name ?? existing.name;
    existing.updatedAt = now();
    saveDb();
    res.json({ ok: true, id: existing.id });
    return;
  }
  const cart: AbandonedCart = {
    id,
    identifier: body.identifier,
    phone: body.phone,
    name: body.name,
    items: body.items,
    subtotal,
    status: "active",
    createdAt: now(),
    updatedAt: now(),
  };
  db.abandonedCarts!.push(cart);
  saveDb();
  res.json({ ok: true, id });
});

router.post("/abandoned-carts/:id/recovered", (req, res) => {
  const db = ensure();
  const c = db.abandonedCarts!.find((x) => x.id === req.params.id);
  if (c) {
    c.status = "recovered";
    c.updatedAt = now();
    saveDb();
  }
  res.json({ ok: true });
});

// ────────────────────────────────────────────────────────────────────
// ADMIN: abandoned carts
// ────────────────────────────────────────────────────────────────────
router.get("/admin/abandoned-carts", (req, res) => {
  const db = ensure();
  const status = (req.query.status as string) ?? "all";
  let list = [...db.abandonedCarts!].sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
  if (status !== "all") list = list.filter((c) => c.status === status);
  const summary = {
    active: db.abandonedCarts!.filter((c) => c.status === "active").length,
    recovered: db.abandonedCarts!.filter((c) => c.status === "recovered").length,
    lost: db.abandonedCarts!.filter((c) => c.status === "lost").length,
    activeValue: db.abandonedCarts!
      .filter((c) => c.status === "active")
      .reduce((s, c) => s + c.subtotal, 0),
  };
  res.json({ items: list, summary });
});

router.put("/admin/abandoned-carts/:id", (req, res) => {
  const db = ensure();
  const c = db.abandonedCarts!.find((x) => x.id === req.params.id);
  if (!c) {
    res.status(404).json({ error: "কার্ট নেই" });
    return;
  }
  const body = req.body as Partial<AbandonedCart>;
  if (body.status) c.status = body.status;
  if (body.recoveryMessageSentAt) c.recoveryMessageSentAt = body.recoveryMessageSentAt;
  c.updatedAt = now();
  saveDb();
  res.json(c);
});

router.delete("/admin/abandoned-carts/:id", (req, res) => {
  const db = ensure();
  const idx = db.abandonedCarts!.findIndex((x) => x.id === req.params.id);
  if (idx >= 0) db.abandonedCarts!.splice(idx, 1);
  saveDb();
  res.json({ ok: true });
});

// ────────────────────────────────────────────────────────────────────
// ANALYTICS
// ────────────────────────────────────────────────────────────────────
router.get("/admin/analytics", (req, res) => {
  const db = ensure();
  const range = ((req.query.range as string) ?? "14d").replace("d", "");
  const days = Math.max(1, Math.min(180, parseInt(range, 10) || 14));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // build day bucket
  const series: { day: string; orders: number; revenue: number }[] = [];
  const dayMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    dayMap.set(k, { orders: 0, revenue: 0 });
    series.push({ day: k, orders: 0, revenue: 0 });
  }

  const sinceMs = today.getTime() - (days - 1) * 86400000;
  const ordersInRange = db.orders.filter((o) => new Date(o.createdAt).getTime() >= sinceMs);
  for (const o of ordersInRange) {
    const k = dayKey(new Date(o.createdAt));
    const slot = dayMap.get(k);
    if (slot && o.status !== "cancelled") {
      slot.orders += 1;
      slot.revenue += o.total;
    }
  }
  for (const s of series) {
    const slot = dayMap.get(s.day)!;
    s.orders = slot.orders;
    s.revenue = slot.revenue;
  }

  // status breakdown
  const statusBreakdown = db.orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const paymentBreakdown = db.orders.reduce<Record<string, number>>((acc, o) => {
    const k = o.paymentStatus ?? "unpaid";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  // top products by sold
  const productSales = new Map<string, { id: string; titleBn: string; image: string; units: number; revenue: number }>();
  for (const o of ordersInRange) {
    if (o.status === "cancelled") continue;
    for (const it of o.items) {
      const cur = productSales.get(it.productId) ?? {
        id: it.productId,
        titleBn: it.titleBn,
        image: it.image,
        units: 0,
        revenue: 0,
      };
      cur.units += it.qty;
      cur.revenue += it.lineTotal;
      productSales.set(it.productId, cur);
    }
  }
  const topProducts = [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // top customers
  const custMap = new Map<string, { phone: string; name: string; orders: number; revenue: number }>();
  for (const o of ordersInRange) {
    if (o.status === "cancelled") continue;
    const phone = o.address?.phone ?? "anon";
    const cur = custMap.get(phone) ?? { phone, name: o.address?.name ?? "Guest", orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += o.total;
    custMap.set(phone, cur);
  }
  const topCustomers = [...custMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // category breakdown
  const catMap = new Map<string, number>();
  for (const o of ordersInRange) {
    if (o.status === "cancelled") continue;
    for (const it of o.items) {
      const p = db.products.find((x) => x.id === it.productId);
      const k = p?.category ?? "other";
      catMap.set(k, (catMap.get(k) ?? 0) + it.lineTotal);
    }
  }
  const categoryRevenue = [...catMap.entries()].map(([category, revenue]) => ({ category, revenue }));

  // KPIs
  const totalRevenue = ordersInRange
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const totalOrders = ordersInRange.filter((o) => o.status !== "cancelled").length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const cancelRate = ordersInRange.length
    ? Math.round((ordersInRange.filter((o) => o.status === "cancelled").length / ordersInRange.length) * 100)
    : 0;
  const cogs = ordersInRange
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => {
      let total = 0;
      for (const it of o.items) {
        const p = db.products.find((x) => x.id === it.productId);
        const cost = p?.costPrice ?? Math.round((p?.wholesalePrice ?? it.unitPrice) * 0.78);
        total += cost * it.qty;
      }
      return s + total;
    }, 0);
  const grossProfit = totalRevenue - cogs;
  const profitMargin = totalRevenue ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  res.json({
    range: days,
    series,
    statusBreakdown,
    paymentBreakdown,
    topProducts,
    topCustomers,
    categoryRevenue,
    kpi: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      cancelRate,
      cogs,
      grossProfit,
      profitMargin,
    },
  });
});

// ────────────────────────────────────────────────────────────────────
// CUSTOMER DETAIL + LEDGER
// ────────────────────────────────────────────────────────────────────
router.get("/admin/customers/:identifier", (req, res) => {
  const db = ensure();
  const id = decodeURIComponent(req.params.identifier);
  const user = db.users.find((u) => u.identifier === id || u.phone === id);
  const orders = db.orders
    .filter((o) => o.userIdentifier === id || o.address?.phone === id)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  const ledgerEntries = db.ledger!.filter((l) => l.identifier === id);
  const balance = ledgerEntries.reduce((s, l) => {
    if (l.type === "credit" || l.type === "refund") return s + l.amount;
    if (l.type === "debit") return s - l.amount;
    return s + l.amount;
  }, 0);
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const returned = orders.filter((o) => o.status === "returned").length;
  res.json({
    user: user ?? null,
    identifier: id,
    orders,
    ledger: ledgerEntries.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)),
    balance,
    stats: {
      totalOrders: orders.length,
      totalRevenue,
      cancelled,
      returned,
      lifetimeValue: totalRevenue,
    },
  });
});

router.post("/admin/customers/:identifier/ledger", (req, res) => {
  const db = ensure();
  const id = decodeURIComponent(req.params.identifier);
  const body = req.body as Partial<CustomerLedgerEntry>;
  if (!body.type || !body.amount) {
    res.status(400).json({ error: "ফিল্ড পূরণ করুন" });
    return;
  }
  const entry: CustomerLedgerEntry = {
    id: uid(),
    identifier: id,
    type: body.type,
    amount: Number(body.amount),
    note: body.note,
    orderNo: body.orderNo,
    author: body.author ?? "Admin",
    createdAt: now(),
  };
  db.ledger!.push(entry);
  saveDb();
  res.json(entry);
});

// ────────────────────────────────────────────────────────────────────
// COURIER ASSIGN + STATUS + FRAUD
// ────────────────────────────────────────────────────────────────────
router.put("/admin/orders/:orderNo/courier", (req, res) => {
  const db = ensure();
  const o = db.orders.find((x) => x.orderNo === req.params.orderNo);
  if (!o) {
    res.status(404).json({ error: "অর্ডার নেই" });
    return;
  }
  const body = req.body as Partial<Order>;
  if (body.courier !== undefined) o.courier = body.courier as CourierProvider;
  if (body.trackingId !== undefined) o.trackingId = body.trackingId;
  if (body.courierStatus !== undefined) o.courierStatus = body.courierStatus as CourierStatus;
  if (body.deliveryCharge !== undefined) o.deliveryCharge = Number(body.deliveryCharge);
  if (body.codAmount !== undefined) o.codAmount = Number(body.codAmount);
  if (body.fastDelivery !== undefined) o.fastDelivery = Boolean(body.fastDelivery);
  if (!o.courierStatus && o.courier) o.courierStatus = "pickup_requested";
  saveDb();
  res.json(o);
});

function computeFraud(orderNo: string) {
  const db = ensure();
  const o = db.orders.find((x) => x.orderNo === orderNo);
  if (!o) return null;
  const phone = o.address?.phone ?? "";
  const allByCustomer = db.orders.filter((x) => x.address?.phone === phone);
  const flags: FraudFlag[] = [];
  let score = 0;
  // new customer
  if (allByCustomer.length === 1) {
    flags.push("new_customer");
    score += 10;
  }
  // high value
  if (o.total >= 5000) {
    flags.push("high_value");
    score += 15;
  }
  if (o.total >= 15000) score += 15;
  // many returns
  const returns = allByCustomer.filter((x) => x.status === "returned").length;
  if (returns >= 2) {
    flags.push("many_returns");
    score += 25;
  }
  const courierReturns = allByCustomer.filter((x) => x.courierStatus === "returned").length;
  if (courierReturns >= 1) {
    flags.push("courier_returns");
    score += 15;
  }
  // repeat cancellations
  const cancels = allByCustomer.filter((x) => x.status === "cancelled").length;
  if (cancels >= 2) {
    flags.push("repeat_cancel");
    score += 20;
  }
  // burst orders within last 24h
  const last24 = allByCustomer.filter(
    (x) => Date.now() - new Date(x.createdAt).getTime() < 24 * 3600 * 1000,
  );
  if (last24.length >= 4) {
    flags.push("burst_orders");
    score += 15;
  }
  o.fraudScore = Math.min(100, score);
  o.fraudFlags = flags;
  saveDb();
  return o;
}

router.put("/admin/orders/:orderNo/fraud", (req, res) => {
  const o = computeFraud(req.params.orderNo);
  if (!o) {
    res.status(404).json({ error: "অর্ডার নেই" });
    return;
  }
  res.json(o);
});

router.post("/admin/fraud/recompute-all", (_req, res) => {
  const db = ensure();
  for (const o of db.orders) computeFraud(o.orderNo);
  res.json({ ok: true, count: db.orders.length });
});

// ────────────────────────────────────────────────────────────────────
// COURIER + SEO SETTINGS
// ────────────────────────────────────────────────────────────────────
router.get("/admin/settings/courier", (_req, res) => {
  const db = ensure();
  res.json(db.settings!.courier);
});
router.put("/admin/settings/courier", (req, res) => {
  const db = ensure();
  db.settings!.courier = { ...db.settings!.courier!, ...(req.body ?? {}) };
  saveDb();
  res.json(db.settings!.courier);
});
router.get("/admin/settings/seo", (_req, res) => {
  const db = ensure();
  res.json(db.settings!.seo);
});
router.put("/admin/settings/seo", (req, res) => {
  const db = ensure();
  db.settings!.seo = { ...db.settings!.seo!, ...(req.body ?? {}) };
  saveDb();
  res.json(db.settings!.seo);
});

// ────────────────────────────────────────────────────────────────────
// REFINED PRODUCT UPDATE (cost / SEO / featured / hotDeal / variants)
// ────────────────────────────────────────────────────────────────────
router.put("/admin/products/:id/refined", (req, res) => {
  const db = ensure();
  const p = db.products.find((x) => x.id === req.params.id);
  if (!p) {
    res.status(404).json({ error: "পণ্য নেই" });
    return;
  }
  const b = req.body ?? {};
  if (b.costPrice !== undefined) p.costPrice = Number(b.costPrice);
  if (b.seoTitle !== undefined) p.seoTitle = String(b.seoTitle);
  if (b.seoDescription !== undefined) p.seoDescription = String(b.seoDescription);
  if (b.seoKeywords !== undefined) p.seoKeywords = String(b.seoKeywords);
  if (b.featured !== undefined) p.featured = Boolean(b.featured);
  if (b.hotDeal !== undefined) p.hotDeal = Boolean(b.hotDeal);
  if (b.published !== undefined) p.published = Boolean(b.published);
  if (Array.isArray(b.variants)) p.variants = b.variants;
  if (Array.isArray(b.gallery)) p.gallery = b.gallery;
  if (Array.isArray(b.tiers) && b.tiers.length) p.tiers = b.tiers;
  saveDb();
  res.json(p);
});

router.post("/admin/products/bulk", (req, res) => {
  const db = ensure();
  const { ids = [], action, value } = (req.body ?? {}) as {
    ids?: string[];
    action?: string;
    value?: unknown;
  };
  if (!Array.isArray(ids) || !action) {
    res.status(400).json({ error: "Invalid bulk request" });
    return;
  }
  let count = 0;
  for (const id of ids) {
    const p = db.products.find((x) => x.id === id);
    if (!p) continue;
    if (action === "publish") p.published = true;
    else if (action === "unpublish") p.published = false;
    else if (action === "feature") p.featured = true;
    else if (action === "unfeature") p.featured = false;
    else if (action === "hotDeal") p.hotDeal = true;
    else if (action === "unhotDeal") p.hotDeal = false;
    else if (action === "delete") {
      const idx = db.products.findIndex((x) => x.id === id);
      if (idx >= 0) db.products.splice(idx, 1);
    } else if (action === "setStock" && typeof value === "number") p.stock = value;
    count++;
  }
  saveDb();
  res.json({ ok: true, count });
});

// ────────────────────────────────────────────────────────────────────
// SHIPMENTS LIST (orders with courier info)
// ────────────────────────────────────────────────────────────────────
router.get("/admin/shipments", (req, res) => {
  const db = ensure();
  const status = (req.query.status as string) ?? "all";
  let list = db.orders
    .filter((o) => o.status === "packed" || o.status === "shipped" || o.status === "delivered" || o.status === "returned")
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  if (status !== "all") list = list.filter((o) => (o.courierStatus ?? "not_assigned") === status);
  const summary = {
    pickup: list.filter((o) => o.courierStatus === "pickup_requested").length,
    transit: list.filter((o) => o.courierStatus === "in_transit").length,
    out: list.filter((o) => o.courierStatus === "out_for_delivery").length,
    delivered: list.filter((o) => o.courierStatus === "delivered").length,
    returned: list.filter((o) => o.courierStatus === "returned").length,
  };
  res.json({ items: list, summary });
});

// ────────────────────────────────────────────────────────────────────
// PUBLIC SETTINGS extension — include SEO + courier defaults
// ────────────────────────────────────────────────────────────────────
router.get("/settings/public-seo", (_req, res) => {
  const db = ensure();
  res.json({
    seo: db.settings!.seo,
    courier: {
      defaultDeliveryCharge: db.settings!.courier!.defaultDeliveryCharge,
      fastDelivery: db.settings!.courier!.fastDelivery,
    },
  });
});

export default router;

import { Router, type IRouter } from "express";
import {
  getDb,
  saveDb,
  DEFAULT_SETTINGS,
  type Review,
  type StockLog,
  type StockLogType,
  type SmsLog,
  type SmsTemplateKey,
  type TxnLog,
  type TxnLogStatus,
  type PaymentSettings,
  type SmsSettings,
  type AdminRole,
  type OrderNote,
  type PaymentStatus,
} from "../lib/store";

const router: IRouter = Router();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function now() {
  return new Date().toISOString();
}
function ensure() {
  const db = getDb();
  if (!db.reviews) db.reviews = [];
  if (!db.stockLogs) db.stockLogs = [];
  if (!db.smsLogs) db.smsLogs = [];
  if (!db.txnLogs) db.txnLogs = [];
  if (!db.settings) db.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  return db;
}

// ────────────────────────────────────────────────────────────────────
// DASHBOARD (extended)
// ────────────────────────────────────────────────────────────────────
router.get("/admin/dashboard", (_req, res) => {
  const db = ensure();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tdMs = today.getTime();

  const todayOrders = db.orders.filter((o) => new Date(o.createdAt).getTime() >= tdMs);
  const pendingOrders = db.orders.filter((o) => o.status === "pending");
  const pendingPayment = db.orders.filter(
    (o) => o.paymentMethod !== "cod" && (o.paymentStatus ?? "unpaid") !== "paid",
  );
  const lowStock = db.products.filter((p) => p.stock < 50);
  const customers = new Set(db.orders.map((o) => o.address?.phone).filter(Boolean));

  const reviewTotal = db.reviews?.length ?? 0;
  const reviewPending = db.reviews?.filter((r) => r.status === "pending").length ?? 0;

  const totalRevenue = db.orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  res.json({
    totalOrders: db.orders.length,
    todayOrders: todayOrders.length,
    pendingOrders: pendingOrders.length,
    totalRevenue,
    todayRevenue,
    pendingPaymentCount: pendingPayment.length,
    pendingPaymentAmount: pendingPayment.reduce((s, o) => s + o.total, 0),
    lowStockCount: lowStock.length,
    totalProducts: db.products.length,
    totalCustomers: customers.size,
    totalReviews: reviewTotal,
    pendingReviews: reviewPending,
    recentOrders: db.orders.slice(-8).reverse(),
    lowStockProducts: lowStock.slice(0, 6).map((p) => ({
      id: p.id,
      titleBn: p.titleBn,
      image: p.image,
      stock: p.stock,
    })),
  });
});

// ────────────────────────────────────────────────────────────────────
// ORDERS — notes + payment status
// ────────────────────────────────────────────────────────────────────
router.post("/admin/orders/:orderNo/notes", (req, res) => {
  const db = ensure();
  const o = db.orders.find((o) => o.orderNo === req.params.orderNo);
  if (!o) { res.status(404).json({ error: "অর্ডার নেই" }); return; }
  const text = String(req.body?.text ?? "").trim();
  const author = String(req.body?.author ?? "Admin").trim() || "Admin";
  if (!text) { res.status(400).json({ error: "নোট ফাঁকা" }); return; }
  const note: OrderNote = { id: uid(), text, author, createdAt: now() };
  o.internalNotes = [...(o.internalNotes ?? []), note];
  saveDb();
  res.json(o);
});

router.put("/admin/orders/:orderNo/payment", (req, res) => {
  const db = ensure();
  const o = db.orders.find((o) => o.orderNo === req.params.orderNo);
  if (!o) { res.status(404).json({ error: "অর্ডার নেই" }); return; }
  const status = String(req.body?.paymentStatus ?? "") as PaymentStatus;
  const ALLOW: PaymentStatus[] = ["unpaid", "pending", "paid", "refunded", "failed"];
  if (!ALLOW.includes(status)) { res.status(400).json({ error: "পেমেন্ট স্ট্যাটাস সঠিক নয়" }); return; }
  o.paymentStatus = status;
  if (req.body?.txnRef !== undefined) o.txnRef = String(req.body.txnRef);
  if (status === "paid") {
    db.txnLogs = db.txnLogs ?? [];
    db.txnLogs.push({
      id: uid(),
      orderNo: o.orderNo,
      amount: o.total,
      method: o.paymentMethod,
      reference: o.txnRef,
      status: "success",
      payerPhone: o.address?.phone,
      gateway: "manual",
      note: "Manual verification",
      createdAt: now(),
    });
  }
  saveDb();
  res.json(o);
});

// ────────────────────────────────────────────────────────────────────
// REVIEWS
// ────────────────────────────────────────────────────────────────────
router.get("/admin/reviews", (_req, res) => {
  res.json(ensure().reviews ?? []);
});

router.post("/admin/reviews", (req, res) => {
  const db = ensure();
  const b = req.body ?? {};
  const review: Review = {
    id: uid(),
    productId: b.productId,
    productTitleBn: b.productTitleBn,
    customerName: String(b.customerName ?? "").trim() || "অজানা",
    customerPhone: b.customerPhone,
    rating: Math.max(1, Math.min(5, Number(b.rating ?? 5))),
    text: String(b.text ?? "").trim(),
    status: "pending",
    featured: false,
    createdAt: now(),
  };
  db.reviews = [review, ...(db.reviews ?? [])];
  saveDb();
  res.json(review);
});

router.put("/admin/reviews/:id", (req, res) => {
  const db = ensure();
  const r = db.reviews?.find((r) => r.id === req.params.id);
  if (!r) { res.status(404).json({ error: "রিভিউ নেই" }); return; }
  if (req.body?.status) r.status = req.body.status;
  if (typeof req.body?.featured === "boolean") r.featured = req.body.featured;
  saveDb();
  res.json(r);
});

router.delete("/admin/reviews/:id", (req, res) => {
  const db = ensure();
  db.reviews = (db.reviews ?? []).filter((r) => r.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

// Public: approved reviews for storefront
router.get("/reviews/featured", (_req, res) => {
  const db = ensure();
  const list = (db.reviews ?? [])
    .filter((r) => r.status === "approved" && r.featured)
    .slice(0, 12);
  res.json(list);
});

// ────────────────────────────────────────────────────────────────────
// INVENTORY
// ────────────────────────────────────────────────────────────────────
router.get("/admin/inventory", (_req, res) => {
  const db = ensure();
  const list = db.products.map((p) => ({
    id: p.id,
    slug: p.slug,
    titleBn: p.titleBn,
    image: p.image,
    category: p.category,
    stock: p.stock,
    moq: p.moq,
    unit: p.unit,
    wholesalePrice: p.wholesalePrice,
    oldPrice: p.oldPrice,
    purchaseCost: Math.round(p.wholesalePrice * 0.78),
    margin: Math.round(((p.wholesalePrice - p.wholesalePrice * 0.78) / p.wholesalePrice) * 100),
    sold: p.sold,
    lowStock: p.stock < 50,
    reorder: p.stock < 20,
  }));
  res.json(list);
});

router.post("/admin/inventory/log", (req, res) => {
  const db = ensure();
  const productId = String(req.body?.productId ?? "");
  const type = String(req.body?.type ?? "in") as StockLogType;
  const qty = Math.max(1, Math.floor(Number(req.body?.qty ?? 0)));
  const note = req.body?.note ? String(req.body.note) : undefined;
  const author = String(req.body?.author ?? "Admin");

  const p = db.products.find((p) => p.id === productId);
  if (!p) { res.status(404).json({ error: "পণ্য নেই" }); return; }
  if (!qty) { res.status(400).json({ error: "পরিমাণ অবৈধ" }); return; }
  if (!["in", "out", "damaged", "adjust"].includes(type)) {
    res.status(400).json({ error: "টাইপ সঠিক নয়" });
    return;
  }

  const before = p.stock;
  let after = before;
  if (type === "in") after = before + qty;
  else if (type === "out" || type === "damaged") after = Math.max(0, before - qty);
  else if (type === "adjust") after = qty;
  p.stock = after;

  const log: StockLog = {
    id: uid(),
    productId,
    productTitleBn: p.titleBn,
    type,
    qty,
    beforeStock: before,
    afterStock: after,
    note,
    author,
    createdAt: now(),
  };
  db.stockLogs = [log, ...(db.stockLogs ?? [])].slice(0, 500);
  saveDb();
  res.json({ product: p, log });
});

router.get("/admin/inventory/logs", (_req, res) => {
  res.json(ensure().stockLogs ?? []);
});

// ────────────────────────────────────────────────────────────────────
// SETTINGS — payment, sms, roles
// ────────────────────────────────────────────────────────────────────
router.get("/admin/settings", (_req, res) => {
  res.json(ensure().settings);
});

router.put("/admin/settings/payment", (req, res) => {
  const db = ensure();
  const next = req.body as Partial<PaymentSettings>;
  db.settings!.payment = {
    ...db.settings!.payment,
    ...next,
    uddoktapay: { ...db.settings!.payment.uddoktapay, ...(next?.uddoktapay ?? {}) },
    enabledMethods: { ...db.settings!.payment.enabledMethods, ...(next?.enabledMethods ?? {}) },
    manualNumbers: { ...db.settings!.payment.manualNumbers, ...(next?.manualNumbers ?? {}) },
  };
  saveDb();
  res.json(db.settings!.payment);
});

router.put("/admin/settings/sms", (req, res) => {
  const db = ensure();
  const next = req.body as Partial<SmsSettings>;
  db.settings!.sms = {
    ...db.settings!.sms,
    ...next,
    templates: { ...db.settings!.sms.templates, ...(next?.templates ?? {}) },
  };
  saveDb();
  res.json(db.settings!.sms);
});

router.put("/admin/settings/roles", (req, res) => {
  const db = ensure();
  const next = req.body as { roles: AdminRole[] };
  if (Array.isArray(next?.roles)) db.settings!.roles = next.roles;
  saveDb();
  res.json(db.settings!.roles);
});

// ────────────────────────────────────────────────────────────────────
// SMS — send (placeholder), logs
// ────────────────────────────────────────────────────────────────────
router.post("/admin/sms/send", (req, res) => {
  const db = ensure();
  const to = String(req.body?.to ?? "").trim();
  const template = (req.body?.template ?? "custom") as SmsTemplateKey | "custom";
  const vars = (req.body?.vars ?? {}) as Record<string, string | number>;
  const customText = req.body?.text ? String(req.body.text) : undefined;

  if (!to) { res.status(400).json({ error: "ফোন নম্বর দিন" }); return; }

  let text = customText ?? "";
  if (!text && template !== "custom") {
    const tpl = db.settings!.sms.templates[template] ?? "";
    text = tpl.replace(/\{(\w+)\}/g, (_m, k) => String(vars[k] ?? ""));
  }
  if (!text) { res.status(400).json({ error: "টেক্সট খালি" }); return; }

  const status = db.settings!.sms.mode === "live" && db.settings!.sms.apiKey ? "sent" : "queued";
  const log: SmsLog = {
    id: uid(),
    to,
    template,
    text,
    status,
    provider: db.settings!.sms.provider,
    createdAt: now(),
  };
  db.smsLogs = [log, ...(db.smsLogs ?? [])].slice(0, 500);
  saveDb();
  res.json(log);
});

router.get("/admin/sms/logs", (_req, res) => {
  res.json(ensure().smsLogs ?? []);
});

// ────────────────────────────────────────────────────────────────────
// TRANSACTIONS
// ────────────────────────────────────────────────────────────────────
router.get("/admin/transactions", (_req, res) => {
  res.json(ensure().txnLogs ?? []);
});

router.post("/admin/transactions", (req, res) => {
  const db = ensure();
  const txn: TxnLog = {
    id: uid(),
    orderNo: req.body?.orderNo,
    amount: Number(req.body?.amount ?? 0),
    method: req.body?.method ?? "manual",
    reference: req.body?.reference,
    status: (req.body?.status ?? "pending") as TxnLogStatus,
    payerPhone: req.body?.payerPhone,
    gateway: req.body?.gateway,
    note: req.body?.note,
    createdAt: now(),
  };
  db.txnLogs = [txn, ...(db.txnLogs ?? [])].slice(0, 500);
  saveDb();
  res.json(txn);
});

router.put("/admin/transactions/:id", (req, res) => {
  const db = ensure();
  const t = db.txnLogs?.find((t) => t.id === req.params.id);
  if (!t) { res.status(404).json({ error: "ট্রানজেকশন নেই" }); return; }
  if (req.body?.status) t.status = req.body.status as TxnLogStatus;
  if (req.body?.note !== undefined) t.note = String(req.body.note);
  saveDb();
  res.json(t);
});

export default router;

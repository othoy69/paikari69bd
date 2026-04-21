import { Router, type IRouter } from "express";
import {
  AdminCreateProductBody,
  AdminUpdateProductBody,
  AdminUpdateStockBody,
  AdminUpdateOrderStatusBody,
} from "@workspace/api-zod";
import { getDb, saveDb, type Product } from "../lib/store";

const router: IRouter = Router();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
}

router.get("/admin/stats", (_req, res) => {
  const db = getDb();
  const totalRevenue = db.orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = db.orders.filter((o) => o.status === "pending").length;
  const lowStockCount = db.products.filter((p) => p.stock < 50).length;
  const recentOrders = db.orders.slice(0, 8);
  const topProducts = [...db.products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 6);
  res.json({
    totalOrders: db.orders.length,
    pendingOrders,
    totalRevenue,
    totalProducts: db.products.length,
    lowStockCount,
    recentOrders,
    topProducts,
  });
});

router.get("/admin/products", (_req, res) => {
  res.json(getDb().products);
});

router.post("/admin/products", (req, res) => {
  const parsed = AdminCreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ফর্ম সঠিক নয়" });
    return;
  }
  const b = parsed.data;
  const id = uid();
  const slug = `${slugify(b.titleEn ?? b.titleBn)}-${id.slice(0, 4)}`;
  const product: Product = {
    id,
    slug,
    titleBn: b.titleBn,
    titleEn: b.titleEn ?? b.titleBn,
    descriptionBn: b.descriptionBn,
    category: b.category,
    source: b.source,
    image: b.image,
    gallery: [b.image],
    oldPrice: b.oldPrice,
    wholesalePrice: b.wholesalePrice,
    moq: b.moq,
    unit: b.unit ?? "পিস",
    tiers: [
      { minQty: 1, price: b.oldPrice, label: "১ পিস" },
      { minQty: b.moq, price: b.wholesalePrice, label: `${b.moq}+ পিস` },
    ],
    stock: b.stock,
    badges: b.badges ?? [],
    rating: 4.5,
    sold: 0,
    deliveryNote: "১-৩ দিনে সারাদেশে",
  };
  const db = getDb();
  db.products.push(product);
  saveDb();
  res.json(product);
});

router.put("/admin/products/:id", (req, res) => {
  const parsed = AdminUpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ফর্ম সঠিক নয়" });
    return;
  }
  const db = getDb();
  const p = db.products.find((p) => p.id === req.params.id);
  if (!p) {
    res.status(404).json({ error: "পণ্য নেই" });
    return;
  }
  const b = parsed.data;
  Object.assign(p, {
    titleBn: b.titleBn,
    titleEn: b.titleEn ?? p.titleEn,
    descriptionBn: b.descriptionBn ?? p.descriptionBn,
    category: b.category,
    source: b.source,
    image: b.image,
    oldPrice: b.oldPrice,
    wholesalePrice: b.wholesalePrice,
    moq: b.moq,
    unit: b.unit ?? p.unit,
    stock: b.stock,
    badges: b.badges ?? p.badges,
  });
  saveDb();
  res.json(p);
});

router.delete("/admin/products/:id", (req, res) => {
  const db = getDb();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx >= 0) {
    db.products.splice(idx, 1);
    saveDb();
  }
  res.json({ ok: true });
});

router.put("/admin/products/:id/stock", (req, res) => {
  const parsed = AdminUpdateStockBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "স্টক সঠিক নয়" });
    return;
  }
  const db = getDb();
  const p = db.products.find((p) => p.id === req.params.id);
  if (!p) {
    res.status(404).json({ error: "পণ্য নেই" });
    return;
  }
  p.stock = parsed.data.stock;
  saveDb();
  res.json(p);
});

router.get("/admin/orders", (_req, res) => {
  res.json(getDb().orders);
});

router.put("/admin/orders/:orderNo/status", (req, res) => {
  const parsed = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "স্ট্যাটাস সঠিক নয়" });
    return;
  }
  const db = getDb();
  const o = db.orders.find((o) => o.orderNo === req.params.orderNo);
  if (!o) {
    res.status(404).json({ error: "অর্ডার নেই" });
    return;
  }
  o.status = parsed.data.status;
  saveDb();
  res.json(o);
});

export default router;

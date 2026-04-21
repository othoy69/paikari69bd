import { Router, type IRouter } from "express";
import { CreateOrderBody } from "@workspace/api-zod";
import { getDb, saveDb, type Order, type OrderItem } from "../lib/store";

const router: IRouter = Router();

function calcUnitPrice(tiers: { minQty: number; price: number }[], qty: number): number {
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  for (const t of sorted) {
    if (qty >= t.minQty) return t.price;
  }
  return sorted[sorted.length - 1]?.price ?? 0;
}

function makeOrderNo(): string {
  const d = new Date();
  const stamp =
    d.getFullYear().toString().slice(2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `P69-${stamp}-${rand}`;
}

router.post("/orders", (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "অর্ডার ফর্ম সঠিক নয়" });
    return;
  }
  const body = parsed.data;
  const db = getDb();
  const items: OrderItem[] = [];
  let subtotal = 0;
  let savings = 0;
  for (const line of body.items) {
    const p = db.products.find((p) => p.id === line.productId);
    if (!p) continue;
    const qty = Math.max(1, line.qty);
    const unitPrice = calcUnitPrice(p.tiers, qty);
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;
    savings += Math.max(0, (p.oldPrice - unitPrice) * qty);
    items.push({
      productId: p.id,
      titleBn: p.titleBn,
      image: p.image,
      qty,
      unitPrice,
      lineTotal,
    });
    p.stock = Math.max(0, p.stock - qty);
    p.sold += qty;
  }
  const shipping = body.address.division === "Dhaka" ? 60 : 130;
  const total = subtotal + shipping;
  const order: Order = {
    orderNo: makeOrderNo(),
    createdAt: new Date().toISOString(),
    status: body.paymentMethod === "cod" ? "confirmed" : "pending",
    items,
    address: body.address,
    paymentMethod: body.paymentMethod,
    txnRef: body.txnRef,
    note: body.note,
    subtotal,
    shipping,
    savings,
    total,
    userIdentifier: body.userIdentifier,
  };
  db.orders.unshift(order);
  saveDb();
  res.json(order);
});

router.get("/orders/:orderNo", (req, res) => {
  const o = getDb().orders.find((o) => o.orderNo === req.params.orderNo);
  if (!o) {
    res.status(404).json({ error: "অর্ডার খুঁজে পাওয়া যায়নি" });
    return;
  }
  res.json(o);
});

router.get("/me/orders", (req, res) => {
  const phone = String(req.query.phone ?? "");
  if (!phone) {
    res.status(400).json({ error: "ফোন নাম্বার দিন" });
    return;
  }
  const items = getDb().orders.filter(
    (o) => o.userIdentifier === phone || o.address.phone === phone,
  );
  res.json(items);
});

export default router;

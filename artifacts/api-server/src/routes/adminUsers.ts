import { Router, type IRouter } from "express";
import { getDb, saveDb } from "../lib/store";

const router: IRouter = Router();

router.get("/admin/users", (_req, res) => {
  const db = getDb();
  const byPhone = new Map<string, {
    phone: string;
    name: string;
    email?: string;
    shopName?: string;
    district?: string;
    division?: string;
    orderCount: number;
    totalSpent: number;
    lastOrderAt?: string;
    pendingOrders: number;
    deliveredOrders: number;
    addressCount: number;
    wishlistCount: number;
    isRegistered: boolean;
    createdAt?: string;
  }>();

  // Seed from registered users
  for (const u of db.users) {
    const phone = u.phone ?? u.identifier;
    if (!phone) continue;
    byPhone.set(phone, {
      phone,
      name: u.name ?? "অজানা",
      email: u.email,
      shopName: u.shopName,
      district: u.district,
      orderCount: 0,
      totalSpent: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      addressCount: u.addresses?.length ?? 0,
      wishlistCount: u.wishlist?.length ?? 0,
      isRegistered: true,
      createdAt: u.createdAt,
    });
  }

  // Aggregate from orders
  for (const o of db.orders) {
    const phone = o.address?.phone ?? "unknown";
    const existing = byPhone.get(phone) ?? {
      phone,
      name: o.address?.name ?? "অজানা",
      district: o.address?.district,
      division: o.address?.division,
      shopName: o.address?.shopName,
      orderCount: 0,
      totalSpent: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      addressCount: 0,
      wishlistCount: 0,
      isRegistered: false,
    };
    existing.orderCount += 1;
    if (o.status !== "cancelled") existing.totalSpent += o.total;
    if (o.status === "pending" || o.status === "confirmed") existing.pendingOrders += 1;
    if (o.status === "delivered") existing.deliveredOrders += 1;
    if (!existing.lastOrderAt || existing.lastOrderAt < o.createdAt) {
      existing.lastOrderAt = o.createdAt;
    }
    if (!existing.name && o.address?.name) existing.name = o.address.name;
    if (!existing.district && o.address?.district) existing.district = o.address.district;
    byPhone.set(phone, existing);
  }

  const list = Array.from(byPhone.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  saveDb();
  res.json(list);
});

router.get("/admin/users/:phone", (req, res) => {
  const db = getDb();
  const phone = req.params.phone;
  const user = db.users.find((u) => u.phone === phone || u.identifier === phone);
  const orders = db.orders.filter((o) => o.address?.phone === phone);
  res.json({
    user,
    orders,
    totalSpent: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
    addresses: user?.addresses ?? [],
    wishlist: user?.wishlist ?? [],
    notifications: user?.notifications ?? [],
  });
});

export default router;

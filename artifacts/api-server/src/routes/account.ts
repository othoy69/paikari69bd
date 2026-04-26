import { Router, type IRouter } from "express";
import {
  getDb,
  saveDb,
  type AuthUser,
  type SavedAddress,
  type Notification,
} from "../lib/store";

const router: IRouter = Router();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function now() {
  return new Date().toISOString();
}

function findOrCreateUser(identifier: string): AuthUser {
  const db = getDb();
  let u = db.users.find((u) => u.identifier === identifier);
  if (!u) {
    u = { identifier, createdAt: now() };
    db.users.push(u);
  }
  if (!u.addresses) u.addresses = [];
  if (!u.wishlist) u.wishlist = [];
  if (!u.notifications) u.notifications = [];
  return u;
}

function readIdentifier(req: { query: Record<string, unknown>; body?: { identifier?: unknown } }): string | null {
  const q = req.query?.identifier;
  if (typeof q === "string" && q.trim()) return q.trim();
  const b = req.body?.identifier;
  if (typeof b === "string" && b.trim()) return b.trim();
  return null;
}

// ─────────── Addresses ───────────
router.get("/account/addresses", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  saveDb();
  res.json(u.addresses ?? []);
});

router.post("/account/addresses", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  const b = req.body ?? {};
  const addr: SavedAddress = {
    id: uid(),
    label: String(b.label ?? "বাসা").trim() || "বাসা",
    name: String(b.name ?? "").trim(),
    phone: String(b.phone ?? "").trim(),
    division: String(b.division ?? "Dhaka"),
    district: String(b.district ?? "").trim(),
    area: String(b.area ?? "").trim(),
    addressLine: String(b.addressLine ?? "").trim(),
    landmark: b.landmark ? String(b.landmark) : undefined,
    isDefault: Boolean(b.isDefault),
  };
  if (!addr.name || !addr.phone || !addr.district || !addr.area || !addr.addressLine) {
    res.status(400).json({ error: "নাম, ফোন, জেলা, এলাকা ও ঠিকানা দিন" });
    return;
  }
  if (addr.isDefault) {
    u.addresses = (u.addresses ?? []).map((a) => ({ ...a, isDefault: false }));
  } else if ((u.addresses?.length ?? 0) === 0) {
    addr.isDefault = true;
  }
  u.addresses = [addr, ...(u.addresses ?? [])];
  saveDb();
  res.json(addr);
});

router.put("/account/addresses/:id", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  const a = (u.addresses ?? []).find((a) => a.id === req.params.id);
  if (!a) {
    res.status(404).json({ error: "ঠিকানা নেই" });
    return;
  }
  const b = req.body ?? {};
  Object.assign(a, {
    label: b.label ?? a.label,
    name: b.name ?? a.name,
    phone: b.phone ?? a.phone,
    division: b.division ?? a.division,
    district: b.district ?? a.district,
    area: b.area ?? a.area,
    addressLine: b.addressLine ?? a.addressLine,
    landmark: b.landmark ?? a.landmark,
  });
  if (b.isDefault === true) {
    u.addresses = (u.addresses ?? []).map((x) => ({ ...x, isDefault: x.id === a.id }));
  }
  saveDb();
  res.json(a);
});

router.delete("/account/addresses/:id", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  u.addresses = (u.addresses ?? []).filter((a) => a.id !== req.params.id);
  if (u.addresses.length > 0 && !u.addresses.some((a) => a.isDefault)) {
    u.addresses[0].isDefault = true;
  }
  saveDb();
  res.json({ ok: true });
});

// ─────────── Wishlist ───────────
router.get("/account/wishlist", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const db = getDb();
  const u = findOrCreateUser(id);
  const list = (u.wishlist ?? [])
    .map((w) => {
      const p = db.products.find((p) => p.id === w.productId);
      return p ? { ...p, addedAt: w.addedAt } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  saveDb();
  res.json(list);
});

router.post("/account/wishlist", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const productId = String(req.body?.productId ?? "");
  if (!productId) {
    res.status(400).json({ error: "productId দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  if (!(u.wishlist ?? []).some((w) => w.productId === productId)) {
    u.wishlist = [{ productId, addedAt: now() }, ...(u.wishlist ?? [])];
  }
  saveDb();
  res.json({ ok: true, count: u.wishlist?.length ?? 0 });
});

router.delete("/account/wishlist/:productId", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  u.wishlist = (u.wishlist ?? []).filter((w) => w.productId !== req.params.productId);
  saveDb();
  res.json({ ok: true });
});

// ─────────── Notifications ───────────
router.get("/account/notifications", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  saveDb();
  res.json(u.notifications ?? []);
});

router.post("/account/notifications", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  const b = req.body ?? {};
  const n: Notification = {
    id: uid(),
    title: String(b.title ?? ""),
    body: String(b.body ?? ""),
    type: (b.type ?? "system") as Notification["type"],
    read: false,
    href: b.href ? String(b.href) : undefined,
    createdAt: now(),
  };
  u.notifications = [n, ...(u.notifications ?? [])].slice(0, 50);
  saveDb();
  res.json(n);
});

router.put("/account/notifications/read", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  u.notifications = (u.notifications ?? []).map((n) => ({ ...n, read: true }));
  saveDb();
  res.json({ ok: true });
});

router.delete("/account/notifications/:id", (req, res) => {
  const id = readIdentifier(req);
  if (!id) {
    res.status(400).json({ error: "identifier দিন" });
    return;
  }
  const u = findOrCreateUser(id);
  u.notifications = (u.notifications ?? []).filter((n) => n.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

export default router;

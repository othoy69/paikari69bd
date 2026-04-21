import { Router, type IRouter } from "express";
import { RequestOtpBody, VerifyOtpBody, UpdateMeBody } from "@workspace/api-zod";
import { getDb, saveDb } from "../lib/store";

const router: IRouter = Router();

router.post("/auth/request-otp", (req, res) => {
  const parsed = RequestOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ফোন/ইমেইল দিন" });
    return;
  }
  const { identifier } = parsed.data;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const db = getDb();
  db.otps = db.otps.filter((o) => o.identifier !== identifier);
  db.otps.push({ identifier, code, expiresAt: Date.now() + 10 * 60 * 1000 });
  saveDb();
  res.json({ sent: true, devOtp: code });
});

router.post("/auth/verify-otp", (req, res) => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "OTP সঠিক নয়" });
    return;
  }
  const { identifier, otp, name } = parsed.data;
  const db = getDb();
  const found = db.otps.find(
    (o) => o.identifier === identifier && o.code === otp && o.expiresAt > Date.now(),
  );
  if (!found) {
    res.status(401).json({ error: "OTP মেলেনি বা মেয়াদ শেষ" });
    return;
  }
  db.otps = db.otps.filter((o) => o.identifier !== identifier);
  let user = db.users.find((u) => u.identifier === identifier);
  if (!user) {
    const isPhone = /^[0-9+\-\s]+$/.test(identifier);
    user = {
      identifier,
      name: name ?? "",
      phone: isPhone ? identifier : "",
      email: isPhone ? "" : identifier,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
  } else if (name) {
    user.name = name;
  }
  saveDb();
  res.json(user);
});

router.get("/me", (req, res) => {
  const identifier = String(req.query.identifier ?? "");
  const user = getDb().users.find((u) => u.identifier === identifier);
  if (!user) {
    res.status(404).json({ error: "ইউজার পাওয়া যায়নি" });
    return;
  }
  res.json(user);
});

router.put("/me", (req, res) => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "ফর্ম সঠিক নয়" });
    return;
  }
  const data = parsed.data;
  const db = getDb();
  let user = db.users.find((u) => u.identifier === data.identifier);
  if (!user) {
    user = {
      identifier: data.identifier,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
  }
  user.name = data.name ?? user.name;
  user.email = data.email ?? user.email;
  user.phone = data.phone ?? user.phone;
  user.shopName = data.shopName ?? user.shopName;
  user.address = data.address ?? user.address;
  user.district = data.district ?? user.district;
  saveDb();
  res.json(user);
});

export default router;

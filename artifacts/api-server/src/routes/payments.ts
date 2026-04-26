import { Router, type IRouter } from "express";
import { getDb, saveDb, DEFAULT_SETTINGS, type TxnLog } from "../lib/store";

const router: IRouter = Router();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function now() {
  return new Date().toISOString();
}
function ensureSettings() {
  const db = getDb();
  if (!db.settings) db.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  if (!db.txnLogs) db.txnLogs = [];
  return db;
}

// ─────────── Public: storefront settings ───────────
router.get("/settings/public", (_req, res) => {
  const db = ensureSettings();
  const s = db.settings!;
  res.json({
    storefront: s.storefront,
    paymentMethods: s.payment.enabledMethods,
    manualNumbers: s.payment.manualNumbers,
    uddoktapayEnabled: s.payment.uddoktapay.enabled,
  });
});

// ─────────── bKash sandbox/mock ───────────
// Stage 1: Create payment → returns paymentID + redirect URL
router.post("/payments/bkash/create", (req, res) => {
  const db = ensureSettings();
  const amount = Number(req.body?.amount ?? 0);
  const orderNo = String(req.body?.orderNo ?? "");
  const payerPhone = req.body?.payerPhone ? String(req.body.payerPhone) : undefined;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "amount দিন" });
    return;
  }
  const paymentID = `TR${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
  // log a pending txn
  const txn: TxnLog = {
    id: uid(),
    orderNo,
    amount,
    method: "bkash",
    reference: paymentID,
    status: "pending",
    payerPhone,
    gateway: "bkash-sandbox",
    note: "Created via /payments/bkash/create (mock)",
    createdAt: now(),
  };
  db.txnLogs!.unshift(txn);
  saveDb();
  res.json({
    paymentID,
    bkashURL: `https://sandbox.bkash.com/checkout/payment/redirect/?paymentID=${paymentID}`,
    successCallbackURL: `/api/payments/bkash/execute`,
    amount,
    currency: "BDT",
    intent: "sale",
    statusCode: "0000",
    statusMessage: "Successful",
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  });
});

// Stage 2: Execute payment → flips txn to success
router.post("/payments/bkash/execute", (req, res) => {
  const db = ensureSettings();
  const paymentID = String(req.body?.paymentID ?? "");
  if (!paymentID) {
    res.status(400).json({ error: "paymentID দিন" });
    return;
  }
  const txn = db.txnLogs!.find((t) => t.reference === paymentID);
  if (!txn) {
    res.status(404).json({ error: "txn নেই" });
    return;
  }
  txn.status = "success";
  txn.note = "Executed via /payments/bkash/execute (mock)";
  // Update order if exists
  if (txn.orderNo) {
    const o = db.orders.find((o) => o.orderNo === txn.orderNo);
    if (o) {
      o.paymentStatus = "paid";
      o.txnRef = paymentID;
    }
  }
  saveDb();
  res.json({
    paymentID,
    trxID: `BKS${Math.floor(Math.random() * 1e10).toString(36).toUpperCase()}`,
    transactionStatus: "Completed",
    amount: txn.amount,
    currency: "BDT",
    intent: "sale",
    statusCode: "0000",
    statusMessage: "Successful",
    paymentExecuteTime: now(),
  });
});

// ─────────── Nagad sandbox/mock ───────────
router.post("/payments/nagad/initialize", (req, res) => {
  const db = ensureSettings();
  const amount = Number(req.body?.amount ?? 0);
  const orderNo = String(req.body?.orderNo ?? "");
  const payerPhone = req.body?.payerPhone ? String(req.body.payerPhone) : undefined;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "amount দিন" });
    return;
  }
  const paymentReferenceId = `NGD${Date.now()}`;
  const challenge = Math.random().toString(36).slice(2, 14);
  const txn: TxnLog = {
    id: uid(),
    orderNo,
    amount,
    method: "nagad",
    reference: paymentReferenceId,
    status: "pending",
    payerPhone,
    gateway: "nagad-sandbox",
    note: "Initialized (mock)",
    createdAt: now(),
  };
  db.txnLogs!.unshift(txn);
  saveDb();
  res.json({
    sensitiveData: { paymentReferenceId, challenge },
    callBackUrl: `https://sandbox.mynagad.com/checkout/?id=${paymentReferenceId}`,
    status: "Success",
  });
});

router.post("/payments/nagad/complete", (req, res) => {
  const db = ensureSettings();
  const ref = String(req.body?.paymentReferenceId ?? "");
  if (!ref) {
    res.status(400).json({ error: "paymentReferenceId দিন" });
    return;
  }
  const txn = db.txnLogs!.find((t) => t.reference === ref);
  if (!txn) {
    res.status(404).json({ error: "txn নেই" });
    return;
  }
  txn.status = "success";
  txn.note = "Completed (mock)";
  if (txn.orderNo) {
    const o = db.orders.find((o) => o.orderNo === txn.orderNo);
    if (o) {
      o.paymentStatus = "paid";
      o.txnRef = ref;
    }
  }
  saveDb();
  res.json({
    status: "Success",
    issuerPaymentRefNo: `NPI${Math.floor(Math.random() * 1e10).toString(36).toUpperCase()}`,
    paymentRefId: ref,
    amount: txn.amount,
    completeTime: now(),
  });
});

router.post("/payments/nagad/verify", (req, res) => {
  const db = ensureSettings();
  const ref = String(req.body?.paymentReferenceId ?? "");
  const txn = db.txnLogs!.find((t) => t.reference === ref);
  if (!txn) {
    res.status(404).json({ error: "txn নেই" });
    return;
  }
  res.json({
    paymentRefId: ref,
    statusCode: "Success",
    status: txn.status === "success" ? "Success" : "Pending",
    amount: txn.amount,
  });
});

// ─────────── UddoktaPay placeholder ───────────
router.post("/payments/uddoktapay/create", (req, res) => {
  const db = ensureSettings();
  const amount = Number(req.body?.amount ?? 0);
  const orderNo = String(req.body?.orderNo ?? "");
  if (!amount) {
    res.status(400).json({ error: "amount দিন" });
    return;
  }
  const invoice_id = `UDP${Date.now()}`;
  const txn: TxnLog = {
    id: uid(),
    orderNo,
    amount,
    method: "uddoktapay",
    reference: invoice_id,
    status: "pending",
    gateway: "uddoktapay-sandbox",
    note: "Created via /payments/uddoktapay/create (mock)",
    createdAt: now(),
  };
  db.txnLogs!.unshift(txn);
  saveDb();
  res.json({
    status: true,
    payment_url: `${db.settings!.payment.uddoktapay.apiBaseUrl}/checkout/${invoice_id}`,
    invoice_id,
    amount,
  });
});

export default router;

const BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body?.error ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  dashboard: () => http<DashboardData>("/admin/dashboard"),

  // reviews
  listReviews: () => http<Review[]>("/admin/reviews"),
  updateReview: (id: string, body: Partial<Review>) =>
    http<Review>(`/admin/reviews/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteReview: (id: string) =>
    http<{ ok: true }>(`/admin/reviews/${id}`, { method: "DELETE" }),

  // inventory
  listInventory: () => http<InventoryItem[]>("/admin/inventory"),
  inventoryLog: (body: {
    productId: string;
    type: "in" | "out" | "damaged" | "adjust";
    qty: number;
    note?: string;
    author?: string;
  }) => http<{ product: unknown; log: StockLog }>("/admin/inventory/log", { method: "POST", body: JSON.stringify(body) }),
  listStockLogs: () => http<StockLog[]>("/admin/inventory/logs"),

  // settings
  getSettings: () => http<Settings>("/admin/settings"),
  savePayment: (body: unknown) =>
    http<PaymentSettings>("/admin/settings/payment", { method: "PUT", body: JSON.stringify(body) }),
  saveSms: (body: unknown) =>
    http<SmsSettings>("/admin/settings/sms", { method: "PUT", body: JSON.stringify(body) }),
  saveRoles: (body: { roles: AdminRole[] }) =>
    http<AdminRole[]>("/admin/settings/roles", { method: "PUT", body: JSON.stringify(body) }),

  // sms
  sendSms: (body: { to: string; template?: string; vars?: Record<string, unknown>; text?: string }) =>
    http<SmsLog>("/admin/sms/send", { method: "POST", body: JSON.stringify(body) }),
  listSmsLogs: () => http<SmsLog[]>("/admin/sms/logs"),

  // transactions
  listTransactions: () => http<TxnLog[]>("/admin/transactions"),
  updateTransaction: (id: string, body: { status?: string; note?: string }) =>
    http<TxnLog>(`/admin/transactions/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  // orders extra
  addOrderNote: (orderNo: string, body: { text: string; author?: string }) =>
    http<unknown>(`/admin/orders/${orderNo}/notes`, { method: "POST", body: JSON.stringify(body) }),
  setOrderPayment: (orderNo: string, body: { paymentStatus: string; txnRef?: string }) =>
    http<unknown>(`/admin/orders/${orderNo}/payment`, { method: "PUT", body: JSON.stringify(body) }),
};

// ── Types (mirror server) ──
export type DashboardData = {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingPaymentCount: number;
  pendingPaymentAmount: number;
  lowStockCount: number;
  totalProducts: number;
  totalCustomers: number;
  totalReviews: number;
  pendingReviews: number;
  recentOrders: Array<{
    orderNo: string;
    total: number;
    status: string;
    paymentStatus?: string;
    items: unknown[];
    address: { name?: string; phone?: string };
    createdAt: string;
  }>;
  lowStockProducts: Array<{ id: string; titleBn: string; image: string; stock: number }>;
};

export type Review = {
  id: string;
  productId?: string;
  productTitleBn?: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  slug: string;
  titleBn: string;
  image: string;
  category: string;
  stock: number;
  moq: number;
  unit: string;
  wholesalePrice: number;
  oldPrice: number;
  purchaseCost: number;
  margin: number;
  sold: number;
  lowStock: boolean;
  reorder: boolean;
};

export type StockLog = {
  id: string;
  productId: string;
  productTitleBn: string;
  type: "in" | "out" | "damaged" | "adjust";
  qty: number;
  beforeStock: number;
  afterStock: number;
  note?: string;
  author: string;
  createdAt: string;
};

export type PaymentSettings = {
  enabledMethods: Record<string, boolean>;
  uddoktapay: {
    enabled: boolean;
    mode: "test" | "live";
    apiBaseUrl: string;
    apiKey: string;
    secretKey: string;
    webhookUrl: string;
    successUrl: string;
    cancelUrl: string;
    ipnUrl: string;
  };
  manualNumbers: { bkash: string; nagad: string; rocket: string; bankInfo: string };
};

export type SmsTemplateKey =
  | "otp"
  | "orderConfirm"
  | "paymentConfirm"
  | "shipped"
  | "delivered"
  | "cancelled";

export type SmsSettings = {
  provider: string;
  apiUrl: string;
  apiKey: string;
  senderId: string;
  mode: "test" | "live";
  templates: Record<SmsTemplateKey, string>;
};

export type SmsLog = {
  id: string;
  to: string;
  template: string;
  text: string;
  status: "queued" | "sent" | "failed";
  provider?: string;
  createdAt: string;
};

export type TxnLog = {
  id: string;
  orderNo?: string;
  amount: number;
  method: string;
  reference?: string;
  status: "pending" | "success" | "failed" | "refunded";
  payerPhone?: string;
  gateway?: string;
  note?: string;
  createdAt: string;
};

export type AdminRole = {
  key: string;
  nameBn: string;
  permissions: string[];
  members: { name: string; phone?: string }[];
};

export type Settings = {
  payment: PaymentSettings;
  sms: SmsSettings;
  roles: AdminRole[];
};

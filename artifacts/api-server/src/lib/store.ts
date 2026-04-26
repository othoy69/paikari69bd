import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger";

export type PriceTier = { minQty: number; price: number; label?: string };

export type ProductVariant = {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
};

export type Product = {
  id: string;
  slug: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  category: string;
  categoryNameBn?: string;
  source: string;
  image: string;
  gallery: string[];
  oldPrice: number;
  wholesalePrice: number;
  costPrice?: number;
  moq: number;
  unit: string;
  tiers: PriceTier[];
  stock: number;
  badges: string[];
  rating: number;
  sold: number;
  deliveryNote: string;
  flashEndsAt?: string;
  tags?: string[];
  variants?: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featured?: boolean;
  hotDeal?: boolean;
  published?: boolean;
};

export type Category = {
  slug: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  image?: string;
  productCount: number;
};

export type Address = {
  name: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string;
  shopName?: string;
};

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "bank" | "cod";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type CourierStatus =
  | "not_assigned"
  | "pickup_requested"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "lost";

export type CourierProvider = "steadfast" | "pathao" | "redx" | "ecourier" | "manual";

export type FraudFlag =
  | "new_customer"
  | "high_value"
  | "many_returns"
  | "phone_blacklist"
  | "courier_returns"
  | "repeat_cancel"
  | "burst_orders";

export type OrderItem = {
  productId: string;
  titleBn: string;
  image: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded" | "failed";

export type OrderNote = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

export type Order = {
  orderNo: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  items: OrderItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  txnRef?: string;
  note?: string;
  internalNotes?: OrderNote[];
  subtotal: number;
  shipping: number;
  savings?: number;
  total: number;
  userIdentifier?: string;
  // Courier / shipment
  courier?: CourierProvider;
  trackingId?: string;
  courierStatus?: CourierStatus;
  deliveryCharge?: number;
  codAmount?: number;
  fastDelivery?: boolean;
  // Fraud
  fraudScore?: number;
  fraudFlags?: FraudFlag[];
};

export type AbandonedCart = {
  id: string;
  identifier?: string;
  phone?: string;
  name?: string;
  items: { productId: string; titleBn: string; image: string; qty: number; unitPrice: number }[];
  subtotal: number;
  status: "active" | "recovered" | "lost";
  recoveryMessageSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerLedgerEntry = {
  id: string;
  identifier: string;
  type: "credit" | "debit" | "refund" | "adjust";
  amount: number;
  note?: string;
  orderNo?: string;
  author: string;
  createdAt: string;
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

export type StockLogType = "in" | "out" | "damaged" | "adjust";
export type StockLog = {
  id: string;
  productId: string;
  productTitleBn: string;
  type: StockLogType;
  qty: number;
  beforeStock: number;
  afterStock: number;
  note?: string;
  author: string;
  createdAt: string;
};

export type SmsTemplateKey =
  | "otp"
  | "orderConfirm"
  | "paymentConfirm"
  | "shipped"
  | "delivered"
  | "cancelled";

export type SmsLog = {
  id: string;
  to: string;
  template: SmsTemplateKey | "custom";
  text: string;
  status: "queued" | "sent" | "failed";
  provider?: string;
  createdAt: string;
};

export type TxnLogStatus = "pending" | "success" | "failed" | "refunded";
export type TxnLog = {
  id: string;
  orderNo?: string;
  amount: number;
  method: PaymentMethod | "uddoktapay";
  reference?: string;
  status: TxnLogStatus;
  payerPhone?: string;
  gateway?: string;
  note?: string;
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
  manualNumbers: {
    bkash: string;
    nagad: string;
    rocket: string;
    bankInfo: string;
  };
};

export type SmsSettings = {
  provider: string;
  apiUrl: string;
  apiKey: string;
  senderId: string;
  mode: "test" | "live";
  templates: Record<SmsTemplateKey, string>;
};

export type AdminRoleKey = "super_admin" | "order_manager" | "inventory_manager" | "support";
export type AdminRole = {
  key: AdminRoleKey;
  nameBn: string;
  permissions: string[];
  members: { name: string; phone?: string }[];
};

export type CourierSettings = {
  defaultProvider: CourierProvider;
  steadfast: {
    enabled: boolean;
    mode: "test" | "live";
    apiBaseUrl: string;
    apiKey: string;
    secretKey: string;
    notifyUrl: string;
  };
  pathao: { enabled: boolean; clientId: string; clientSecret: string };
  redx: { enabled: boolean; apiKey: string };
  ecourier: { enabled: boolean; apiKey: string; secret: string };
  defaultDeliveryCharge: { insideDhaka: number; outsideDhaka: number; subDhaka: number };
  fastDelivery: { enabled: boolean; chargeExtra: number; areas: string[] };
};

export type SeoSettings = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  ogImage: string;
  twitterHandle?: string;
  homepage: { title: string; description: string; keywords: string };
  productPattern: { title: string; description: string };
  categoryPattern: { title: string; description: string };
  sitemapEnabled: boolean;
  robotsAllow: boolean;
  canonicalDomain: string;
};

export type StorefrontSettings = {
  whatsappNumber: string;
  whatsappDisplay: string;
  merchantPhone: string;
  facebookPixelId: string;
  fbPageUrl: string;
  facebookAppId?: string;
  metaSiteVerify?: string;
  googleAnalyticsId?: string;
  enabledTracking: {
    pixel: boolean;
    pageView: boolean;
    addToCart: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
    whatsappClick: boolean;
  };
};

export type Settings = {
  payment: PaymentSettings;
  sms: SmsSettings;
  roles: AdminRole[];
  storefront?: StorefrontSettings;
  courier?: CourierSettings;
  seo?: SeoSettings;
};

export type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string;
  isDefault?: boolean;
};

export type WishlistEntry = { productId: string; addedAt: string };

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: "order" | "payment" | "promo" | "system";
  read: boolean;
  href?: string;
  createdAt: string;
};

export type AuthUser = {
  identifier: string;
  name?: string;
  email?: string;
  phone?: string;
  shopName?: string;
  address?: string;
  district?: string;
  createdAt: string;
  addresses?: SavedAddress[];
  wishlist?: WishlistEntry[];
  notifications?: Notification[];
};

export type Otp = { identifier: string; code: string; expiresAt: number };

type DB = {
  products: Product[];
  orders: Order[];
  users: AuthUser[];
  otps: Otp[];
  reviews?: Review[];
  stockLogs?: StockLog[];
  smsLogs?: SmsLog[];
  txnLogs?: TxnLog[];
  settings?: Settings;
  abandonedCarts?: AbandonedCart[];
  ledger?: CustomerLedgerEntry[];
};

export const DEFAULT_SETTINGS: Settings = {
  payment: {
    enabledMethods: {
      bkash: true,
      nagad: true,
      rocket: true,
      bank: true,
      cod: true,
      uddoktapay: false,
    },
    uddoktapay: {
      enabled: false,
      mode: "test",
      apiBaseUrl: "https://sandbox.uddoktapay.com/api",
      apiKey: "",
      secretKey: "",
      webhookUrl: "https://paikari69bd.com/api/uddoktapay/webhook",
      successUrl: "https://paikari69bd.com/order/success",
      cancelUrl: "https://paikari69bd.com/order/cancel",
      ipnUrl: "https://paikari69bd.com/api/uddoktapay/ipn",
    },
    manualNumbers: {
      bkash: "01700-000069",
      nagad: "01700-000069",
      rocket: "01700-0000691",
      bankInfo: "Dutch-Bangla Bank • A/C: 1234567890123 • Paikari69bd Ltd",
    },
  },
  sms: {
    provider: "BulkSMSBD",
    apiUrl: "https://bulksmsbd.net/api/smsapi",
    apiKey: "",
    senderId: "Paikari69",
    mode: "test",
    templates: {
      otp: "আপনার পাইকারি69bd OTP কোড: {code}। কোডটি ৫ মিনিটের জন্য বৈধ।",
      orderConfirm: "ধন্যবাদ! আপনার অর্ডার {orderNo} (৳{total}) কনফার্ম হয়েছে। ডেলিভারি ১-৩ দিনে।",
      paymentConfirm: "পেমেন্ট প্রাপ্ত। অর্ডার {orderNo} এর ৳{total} টাকা পেয়েছি। ধন্যবাদ।",
      shipped: "আপনার অর্ডার {orderNo} পাঠিয়ে দেওয়া হয়েছে। শীঘ্রই পেয়ে যাবেন।",
      delivered: "অর্ডার {orderNo} সফলভাবে ডেলিভার হয়েছে। আবার অর্ডার করুন paikari69bd.com",
      cancelled: "দুঃখিত, আপনার অর্ডার {orderNo} বাতিল হয়েছে। প্রশ্ন থাকলে: 01872-888954",
    },
  },
  courier: {
    defaultProvider: "steadfast",
    steadfast: {
      enabled: false,
      mode: "test",
      apiBaseUrl: "https://portal.packzy.com/api/v1",
      apiKey: "",
      secretKey: "",
      notifyUrl: "https://paikari69bd.com/api/courier/steadfast/webhook",
    },
    pathao: { enabled: false, clientId: "", clientSecret: "" },
    redx: { enabled: false, apiKey: "" },
    ecourier: { enabled: false, apiKey: "", secret: "" },
    defaultDeliveryCharge: { insideDhaka: 60, subDhaka: 100, outsideDhaka: 130 },
    fastDelivery: { enabled: true, chargeExtra: 50, areas: ["ঢাকা শহর"] },
  },
  seo: {
    siteName: "পাইকারি69bd.com",
    defaultTitle: "পাইকারি69bd.com — বাংলাদেশের সেরা পাইকারি মার্কেটপ্লেস",
    defaultDescription: "অরিজিনাল প্রোডাক্ট, পাইকারি দাম, সারাদেশে দ্রুত ডেলিভারি — রিসেলার ও দোকানদারদের প্রথম পছন্দ।",
    defaultKeywords: "পাইকারি, wholesale Bangladesh, পাইকারি দাম, paikari, বাংলাদেশ, রিসেলার",
    ogImage: "https://paikari69bd.com/og-cover.jpg",
    twitterHandle: "@paikari69bd",
    homepage: {
      title: "পাইকারি দামে সারা বাংলাদেশে — পাইকারি69bd.com",
      description: "৫০,০০০+ রিসেলারের ভরসার বাজার। অরিজিনাল প্রোডাক্ট, MOQ থেকে শুরু পাইকারি দাম, সারাদেশে দ্রুত ডেলিভারি।",
      keywords: "পাইকারি, wholesale, paikari69bd, রিসেলার, বাংলাদেশ পাইকারি",
    },
    productPattern: {
      title: "{title} — পাইকারি দাম ৳{price} | পাইকারি69bd.com",
      description: "{title}, পাইকারি দাম ৳{price}, MOQ {moq} {unit}, সারাদেশে দ্রুত ডেলিভারি। অর্ডার করুন paikari69bd.com",
    },
    categoryPattern: {
      title: "{category} — পাইকারি কালেকশন | পাইকারি69bd.com",
      description: "{category} ক্যাটাগরির সেরা পাইকারি প্রোডাক্ট। বেস্ট দাম, ফ্রেশ স্টক, সারাদেশে ডেলিভারি।",
    },
    sitemapEnabled: true,
    robotsAllow: true,
    canonicalDomain: "https://paikari69bd.com",
  },
  storefront: {
    whatsappNumber: "8801872888954",
    whatsappDisplay: "01872-888954",
    merchantPhone: "01700-000069",
    facebookPixelId: "",
    fbPageUrl: "https://facebook.com/paikari69bd",
    facebookAppId: "",
    metaSiteVerify: "",
    googleAnalyticsId: "",
    enabledTracking: {
      pixel: true,
      pageView: true,
      addToCart: true,
      initiateCheckout: true,
      purchase: true,
      whatsappClick: true,
    },
  },
  roles: [
    {
      key: "super_admin",
      nameBn: "সুপার অ্যাডমিন",
      permissions: ["সব কিছু"],
      members: [{ name: "Owner", phone: "01700-000069" }],
    },
    {
      key: "order_manager",
      nameBn: "অর্ডার ম্যানেজার",
      permissions: ["অর্ডার দেখা", "স্ট্যাটাস পরিবর্তন", "নোট যোগ", "পেমেন্ট ভেরিফাই"],
      members: [],
    },
    {
      key: "inventory_manager",
      nameBn: "ইনভেন্টরি ম্যানেজার",
      permissions: ["পণ্য যোগ", "স্টক আপডেট", "স্টক লগ", "ক্ষতিগ্রস্ত নোট"],
      members: [],
    },
    {
      key: "support",
      nameBn: "সাপোর্ট স্টাফ",
      permissions: ["রিভিউ মডারেট", "অর্ডার দেখা", "WhatsApp চ্যাট"],
      members: [],
    },
  ],
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let db: DB = {
  products: [],
  orders: [],
  users: [],
  otps: [],
  reviews: [],
  stockLogs: [],
  smsLogs: [],
  txnLogs: [],
  settings: DEFAULT_SETTINGS,
  abandonedCarts: [],
  ledger: [],
};

function load() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const loaded = JSON.parse(raw) as DB;
      db = {
        ...loaded,
        reviews: loaded.reviews ?? [],
        stockLogs: loaded.stockLogs ?? [],
        smsLogs: loaded.smsLogs ?? [],
        txnLogs: loaded.txnLogs ?? [],
        abandonedCarts: loaded.abandonedCarts ?? [],
        ledger: loaded.ledger ?? [],
        settings: {
          ...DEFAULT_SETTINGS,
          ...(loaded.settings ?? {}),
          courier: loaded.settings?.courier ?? DEFAULT_SETTINGS.courier,
          seo: loaded.settings?.seo ?? DEFAULT_SETTINGS.seo,
          storefront: loaded.settings?.storefront ?? DEFAULT_SETTINGS.storefront,
        },
      };
    }
  } catch (err) {
    logger.error({ err }, "store load failed");
  }
}

function persist() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    logger.error({ err }, "store persist failed");
  }
}

export function getDb(): DB {
  return db;
}

export function saveDb() {
  persist();
}

export function setDb(next: DB) {
  db = next;
  persist();
}

load();

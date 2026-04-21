import fs from "node:fs";
import path from "node:path";
import { logger } from "./logger";

export type PriceTier = { minQty: number; price: number; label?: string };

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
  | "cancelled";

export type OrderItem = {
  productId: string;
  titleBn: string;
  image: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  orderNo: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  txnRef?: string;
  note?: string;
  subtotal: number;
  shipping: number;
  savings?: number;
  total: number;
  userIdentifier?: string;
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
};

export type Otp = { identifier: string; code: string; expiresAt: number };

type DB = {
  products: Product[];
  orders: Order[];
  users: AuthUser[];
  otps: Otp[];
};

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let db: DB = { products: [], orders: [], users: [], otps: [] };

function load() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      db = JSON.parse(raw);
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

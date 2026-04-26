// Build a pre-filled WhatsApp order message from cart contents
import { bdt } from "./format";

export type WAItem = {
  titleBn: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
};

export type WAOrderInput = {
  customerName?: string;
  customerPhone?: string;
  shopName?: string;
  district?: string;
  area?: string;
  addressLine?: string;
  items: WAItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  note?: string;
};

export function buildWhatsAppOrderMessage(input: WAOrderInput): string {
  const lines: string[] = [];
  lines.push("আসসালামু আলাইকুম, আমি পাইকারি69bd থেকে অর্ডার করতে চাই।");
  lines.push("");
  lines.push("─── অর্ডারের বিবরণ ───");
  input.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.titleBn}`);
    lines.push(`   পরিমাণ: ${it.qty} ${it.unit} × ${bdt(it.unitPrice)} = ${bdt(it.lineTotal)}`);
  });
  lines.push("");
  lines.push("─── হিসাব ───");
  lines.push(`সাবটোটাল: ${bdt(input.subtotal)}`);
  if (input.shipping !== undefined) lines.push(`ডেলিভারি: ${bdt(input.shipping)}`);
  lines.push(`মোট: ${bdt(input.total)}`);
  lines.push("");
  if (input.customerName || input.customerPhone) {
    lines.push("─── গ্রাহক তথ্য ───");
    if (input.customerName) lines.push(`নাম: ${input.customerName}`);
    if (input.customerPhone) lines.push(`মোবাইল: ${input.customerPhone}`);
    if (input.shopName) lines.push(`দোকান: ${input.shopName}`);
    if (input.district || input.area) lines.push(`এলাকা: ${[input.area, input.district].filter(Boolean).join(", ")}`);
    if (input.addressLine) lines.push(`ঠিকানা: ${input.addressLine}`);
    lines.push("");
  }
  if (input.note) {
    lines.push(`নোট: ${input.note}`);
    lines.push("");
  }
  lines.push("দয়া করে অর্ডার কনফার্ম করুন।");
  return lines.join("\n");
}

export function whatsappOrderUrl(waNumber: string, message: string): string {
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

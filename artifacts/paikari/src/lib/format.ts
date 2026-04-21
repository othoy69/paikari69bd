import type { PriceTier } from "@workspace/api-client-react";

export function bdt(price: number): string {
  return "৳" + Math.round(price).toLocaleString("en-IN");
}

export function calcUnitPrice(tiers: PriceTier[] | undefined, qty: number): number {
  if (!tiers || tiers.length === 0) return 0;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  for (const t of sorted) {
    if (qty >= t.minQty) return t.price;
  }
  return sorted[sorted.length - 1]?.price ?? 0;
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function bnNum(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

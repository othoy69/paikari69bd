import { Product } from "@workspace/api-client-react";
import { bdt } from "../../lib/format";

export function PriceTierTable({ tiers }: { tiers: Product["tiers"] }) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted text-muted-foreground text-left">
            <th className="py-2 px-4 font-medium">পরিমাণ</th>
            <th className="py-2 px-4 font-medium">পাইকারি দাম</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tiers.map((tier, idx) => (
            <tr key={idx} className="bg-card">
              <td className="py-2 px-4 font-medium text-foreground">
                {tier.minQty}+ পিস
              </td>
              <td className="py-2 px-4 font-bold text-primary">
                {bdt(tier.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

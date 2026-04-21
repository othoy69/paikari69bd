import React from "react";

export function PaymentBadges() {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      <span className="px-3 py-1 rounded border bg-[#E2136E]/10 text-[#E2136E] border-[#E2136E]/20 text-xs font-bold">bKash</span>
      <span className="px-3 py-1 rounded border bg-[#F7931E]/10 text-[#F7931E] border-[#F7931E]/20 text-xs font-bold">Nagad</span>
      <span className="px-3 py-1 rounded border bg-[#8C3494]/10 text-[#8C3494] border-[#8C3494]/20 text-xs font-bold">Rocket</span>
      <span className="px-3 py-1 rounded border bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-bold">Bank</span>
      <span className="px-3 py-1 rounded border bg-green-500/10 text-green-600 border-green-500/20 text-xs font-bold">COD</span>
    </div>
  );
}

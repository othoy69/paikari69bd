import React from "react";
import { Link } from "wouter";
import { Plus, Flame, Truck, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { bdt } from "../../lib/format";
import { useCart } from "../../contexts/CartContext";
import type { Product } from "@workspace/api-client-react";

type Theme = "jersey" | "saree" | "threepiece";

interface FeaturedSegmentProps {
  theme: Theme;
  eyebrow: string;
  titleBn: string;
  subtitleBn: string;
  ctaText: string;
  ctaHref: string;
  products: Product[];
}

const THEMES: Record<Theme, { from: string; to: string; ring: string; chip: string; pill: string; offerBg: string }> = {
  jersey: {
    from: "from-emerald-700",
    to: "to-emerald-500",
    ring: "ring-emerald-500/30",
    chip: "bg-emerald-100 text-emerald-800",
    pill: "from-emerald-600 to-emerald-500",
    offerBg: "bg-emerald-600",
  },
  saree: {
    from: "from-fuchsia-700",
    to: "to-rose-500",
    ring: "ring-rose-500/30",
    chip: "bg-rose-100 text-rose-800",
    pill: "from-fuchsia-600 to-rose-500",
    offerBg: "bg-rose-600",
  },
  threepiece: {
    from: "from-indigo-700",
    to: "to-violet-500",
    ring: "ring-violet-500/30",
    chip: "bg-violet-100 text-violet-800",
    pill: "from-indigo-600 to-violet-500",
    offerBg: "bg-violet-600",
  },
};

export function FeaturedSegment({ theme, eyebrow, titleBn, subtitleBn, ctaText, ctaHref, products }: FeaturedSegmentProps) {
  if (products.length === 0) return null;
  const t = THEMES[theme];

  return (
    <section className="container mx-auto px-3 md:px-4 my-4">
      <div className={`rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br ${t.from} ${t.to} p-4 md:p-6 shadow-2xl ring-1 ${t.ring}`}>
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div className="text-white">
            <span className={`inline-block text-[10px] md:text-xs font-extrabold ${t.chip} px-2 py-0.5 rounded-full uppercase tracking-wide mb-1.5`}>
              {eyebrow}
            </span>
            <h2 className="text-xl md:text-3xl font-extrabold leading-tight">{titleBn}</h2>
            <p className="text-xs md:text-sm text-white/90 font-medium mt-1">{subtitleBn}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] md:text-xs text-white/95 font-semibold">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> দ্রুত ডেলিভারি</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> অরিজিনাল গ্যারান্টি</span>
            </div>
          </div>
          <Link href={ctaHref} className="self-stretch md:self-auto">
            <button className="h-full md:h-auto px-4 py-2 bg-white text-slate-900 font-extrabold text-xs md:text-sm rounded-xl shadow hover:shadow-lg whitespace-nowrap">
              {ctaText} →
            </button>
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.slice(0, 6).map((p) => (
            <FeaturedProductCard key={p.id} product={p} theme={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProductCard({ product, theme }: { product: Product; theme: typeof THEMES[Theme] }) {
  const { addItem } = useCart();
  const tier1 = product.tiers?.find((t) => t.minQty === 1) ?? product.tiers?.[0];
  const tier5 = product.tiers?.find((t) => t.minQty === 5);
  const tier10 = product.tiers?.find((t) => t.minQty === 10);
  const fallbackTiers = product.tiers ?? [];
  const t5 = tier5 ?? fallbackTiers[1];
  const t10 = tier10 ?? fallbackTiers[fallbackTiers.length - 1];

  const savings = product.oldPrice - product.wholesalePrice;
  const savingsPct = Math.round((savings / product.oldPrice) * 100);

  const addQty = (qty: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, qty, product);
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col">
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img src={product.image} alt={product.titleBn} loading="lazy" className="w-full h-full object-cover" />

          {/* Discount slash */}
          <div className={`absolute top-0 left-0 ${theme.offerBg} text-white px-3 py-1.5 rounded-br-2xl shadow-lg`}>
            <div className="text-lg font-extrabold leading-none">-{savingsPct}%</div>
            <div className="text-[9px] font-bold opacity-90 mt-0.5 leading-none">মেগা অফার</div>
          </div>

          {/* Hot badge */}
          <div className="absolute top-2 right-2 bg-yellow-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <Flame className="w-3 h-3" />
            সীমিত স্টক
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="text-[10px] text-slate-500 font-medium">{product.source}</div>
          <h3 className="font-bold text-sm md:text-[15px] line-clamp-2 leading-snug text-slate-900 mt-0.5 min-h-[40px]">
            {product.titleBn}
          </h3>

          {/* Headline price (1pc) */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{bdt(tier1?.price ?? product.wholesalePrice)}</span>
            <span className="text-xs text-slate-400 line-through">{bdt(product.oldPrice)}</span>
            <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              সাশ্রয় {bdt(savings)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">১ {product.unit} খুচরা দাম</div>

          {/* Quantity tiers — 5pc & 10pc as headline offers */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {t5 && (
              <button
                onClick={addQty(t5.minQty)}
                className="rounded-xl border-2 border-orange-500 bg-orange-50 hover:bg-orange-100 p-2 text-left transition-colors"
              >
                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-wide">৫ {product.unit} অর্ডার</div>
                <div className="text-base md:text-lg font-extrabold text-orange-700 leading-tight">{bdt(t5.price)}</div>
                <div className="text-[9px] font-semibold text-orange-600">/ {product.unit}</div>
              </button>
            )}
            {t10 && (
              <button
                onClick={addQty(t10.minQty)}
                className="relative rounded-xl border-2 border-red-500 bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 p-2 text-left transition-colors"
              >
                <div className="absolute -top-2 right-1.5 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
                  বেস্ট ডিল
                </div>
                <div className="text-[10px] font-bold text-red-700 uppercase tracking-wide">১০ {product.unit} অর্ডার</div>
                <div className="text-base md:text-lg font-extrabold text-red-700 leading-tight">{bdt(t10.price)}</div>
                <div className="text-[9px] font-semibold text-red-600">/ {product.unit}</div>
              </button>
            )}
          </div>

          <Button
            onClick={addQty(product.moq)}
            size="sm"
            className={`w-full font-extrabold text-xs mt-2.5 h-10 bg-gradient-to-r ${theme.pill} hover:opacity-95 border-0 text-white shadow-lg`}
          >
            <Plus className="w-4 h-4 mr-0.5" strokeWidth={3} />
            অর্ডার করুন (MOQ {product.moq} {product.unit})
          </Button>
        </div>
      </div>
    </Link>
  );
}

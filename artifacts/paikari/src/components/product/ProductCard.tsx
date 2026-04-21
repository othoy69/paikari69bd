import React from "react";
import { Link } from "wouter";
import { Plus, Flame, Zap, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { bdt } from "../../lib/format";
import { useCart } from "../../contexts/CartContext";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

const BADGE_ICONS: Record<string, React.ElementType> = {
  "ফ্ল্যাশ ডিল": Flame,
  "হট": Flame,
  "বেস্টসেলার": TrendingUp,
  "নতুন": Sparkles,
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, product.moq, product);
  };

  const savings = product.oldPrice - product.wholesalePrice;
  const savingsPercent = Math.round((savings / product.oldPrice) * 100);
  const lowStock = product.stock > 0 && product.stock < 50;
  const primaryBadge = product.badges?.[0];
  const PrimaryIcon = primaryBadge ? BADGE_ICONS[primaryBadge] ?? Zap : null;

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-border/60 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(234,88,12,0.15)] hover:-translate-y-0.5 hover:border-primary/40 transition-all cursor-pointer h-full">
        {/* Discount Ribbon */}
        {savingsPercent > 0 && (
          <div className="absolute top-0 left-0 z-10">
            <div className="relative bg-gradient-to-br from-red-500 to-orange-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-br-2xl rounded-tl-2xl shadow-md">
              <span className="block leading-none">{savingsPercent}%</span>
              <span className="block text-[8px] font-medium opacity-90 leading-none mt-0.5">ছাড়</span>
            </div>
          </div>
        )}

        {/* Top-right primary badge */}
        {primaryBadge && PrimaryIcon && (
          <div className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm border border-orange-100">
            <PrimaryIcon className="w-3 h-3 text-orange-600" />
            <span className="text-[10px] font-bold text-orange-700">{primaryBadge}</span>
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.titleBn}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Bottom gradient + MOQ */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-md px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm">
              MOQ: {product.moq} {product.unit}
            </div>
            {lowStock && (
              <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm animate-pulse">
                মাত্র {product.stock}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 flex-1 flex flex-col">
          <div className="text-[10px] text-slate-500 mb-1 line-clamp-1">{product.source}</div>
          <h3 className="font-semibold text-[13px] line-clamp-2 leading-snug mb-2 text-slate-900 min-h-[34px]">
            {product.titleBn}
          </h3>

          <div className="mt-auto space-y-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-orange-600 leading-none">
                {bdt(product.wholesalePrice)}
              </span>
              <span className="text-[11px] text-slate-400 line-through leading-none">
                {bdt(product.oldPrice)}
              </span>
            </div>

            {savings > 0 && (
              <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 inline-block px-1.5 py-0.5 rounded">
                {bdt(savings)} সাশ্রয় / {product.unit}
              </div>
            )}

            {/* Tier preview */}
            {product.tiers && product.tiers.length > 1 && (
              <div className="flex gap-1 text-[9px]">
                {product.tiers.slice(-2).map((t, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                    {t.minQty}+: {bdt(t.price)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleAddToCart}
            size="sm"
            className="w-full font-bold text-xs mt-2.5 h-9 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-0.5" strokeWidth={3} />
            কার্টে যোগ
          </Button>
        </div>
      </div>
    </Link>
  );
}

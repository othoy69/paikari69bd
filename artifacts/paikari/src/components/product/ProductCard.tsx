import React from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { bdt } from "../../lib/format";
import { useCart } from "../../contexts/CartContext";
import { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, product.moq, product);
  };

  const savings = product.oldPrice - product.wholesalePrice;
  const savingsPercent = Math.round((savings / product.oldPrice) * 100);

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="group flex flex-col bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
        {/* Image & Badges */}
        <div className="relative aspect-square bg-muted/30 overflow-hidden">
          <img
            src={product.image}
            alt={product.titleBn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {savingsPercent > 0 && (
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-bold border-none shadow-sm">
                {savingsPercent}% ছাড়
              </Badge>
            )}
            {product.badges?.map((badge, i) => (
              <Badge key={i} variant="outline" className="bg-white/90 backdrop-blur-sm font-medium border-none shadow-sm">
                {badge}
              </Badge>
            ))}
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-primary text-primary-foreground border-none font-bold shadow-sm">
              MOQ: {product.moq} {product.unit}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground mb-1 font-medium">{product.source}</div>
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2 flex-1">
            {product.titleBn}
          </h3>

          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary leading-none">
                {bdt(product.wholesalePrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through leading-none">
                {bdt(product.oldPrice)}
              </span>
            </div>
            
            {/* Tiers preview */}
            {product.tiers && product.tiers.length > 0 && (
              <div className="text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded truncate">
                {product.tiers.slice(0, 2).map(t => `${t.minQty}+: ${bdt(t.price)}`).join(" | ")}
                {product.tiers.length > 2 && "..."}
              </div>
            )}
          </div>

          <Button 
            onClick={handleAddToCart}
            className="w-full font-bold text-xs" 
            size="sm"
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            কার্টে যোগ করুন
          </Button>
        </div>
      </div>
    </Link>
  );
}

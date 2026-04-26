import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { bdt, calcUnitPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { WhatsAppOrderCta } from "@/components/common/WhatsAppOrderCta";
import { useStorefrontSettings } from "@/contexts/SettingsContext";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items, updateQty, remove, clear } = useCart();
  const { data: allProducts, isLoading } = useListProducts();
  const { storefront } = useStorefrontSettings();

  const lines = useMemo(() => {
    if (!allProducts) return [];
    return items
      .map((it) => {
        const product = allProducts.find((p) => p.id === it.productId);
        if (!product) return null;
        const unitPrice = calcUnitPrice(product.tiers, it.qty);
        return {
          ...it,
          product,
          unitPrice,
          lineTotal: unitPrice * it.qty,
          retailTotal: product.oldPrice * it.qty,
        };
      })
      .filter(Boolean) as Array<{
        productId: string;
        qty: number;
        product: NonNullable<ReturnType<typeof allProducts.find>>;
        unitPrice: number;
        lineTotal: number;
        retailTotal: number;
      }>;
  }, [items, allProducts]);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const retail = lines.reduce((s, l) => s + l.retailTotal, 0);
  const savings = Math.max(0, retail - subtotal);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <Skeleton className="h-6 w-48 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full mb-3 rounded-xl" />
        ))}
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 pb-24 flex flex-col items-center text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-1">আপনার কার্ট খালি</h2>
        <p className="text-sm text-muted-foreground mb-6">পাইকারি দামে কেনাকাটা শুরু করুন</p>
        <Link href="/">
          <Button size="lg">পণ্য দেখুন</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-32 md:pb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">আপনার কার্ট ({lines.length})</h1>
        <Button variant="ghost" size="sm" onClick={clear}>সব মুছুন</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {lines.map((l) => (
            <div key={l.productId} className="bg-card border rounded-2xl p-3 flex gap-3">
              <Link href={`/product/${l.product.slug}`}>
                <img src={l.product.image} alt={l.product.titleBn} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${l.product.slug}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary">{l.product.titleBn}</h3>
                </Link>
                <div className="text-xs text-muted-foreground mt-1">{l.product.source}</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold text-primary">{bdt(l.unitPrice)}</span>
                  <span className="text-xs text-muted-foreground">/ {l.product.unit}</span>
                  <span className="text-xs text-muted-foreground line-through">{bdt(l.product.oldPrice)}</span>
                </div>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <QuantityStepper value={l.qty} onChange={(v) => updateQty(l.productId, v)} min={1} max={l.product.stock} />
                  <div className="text-right">
                    <div className="font-bold">{bdt(l.lineTotal)}</div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(l.productId)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-card border rounded-2xl p-4 space-y-3 sticky top-20">
            <h3 className="font-bold">অর্ডার সারাংশ</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">সাবটোটাল</span>
              <span className="font-semibold">{bdt(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">পাইকারি সাশ্রয়</span>
                <span className="font-semibold text-emerald-600">- {bdt(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ডেলিভারি</span>
              <span className="text-muted-foreground">চেকআউটে যোগ হবে</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold">আনুমানিক মোট</span>
              <span className="font-bold text-primary text-lg">{bdt(subtotal)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => setLocation("/checkout")}>
              চেকআউট <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">অথবা</span></div>
            </div>

            <WhatsAppOrderCta
              items={lines.map((l) => ({
                titleBn: l.product.titleBn,
                qty: l.qty,
                unit: l.product.unit,
                unitPrice: l.unitPrice,
                lineTotal: l.lineTotal,
              }))}
              subtotal={subtotal}
              total={subtotal}
              source="cart"
              className="w-full"
              size="lg"
            />
            <p className="text-[11px] text-center text-muted-foreground">
              WhatsApp এ অর্ডার করুন: {storefront.whatsappDisplay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

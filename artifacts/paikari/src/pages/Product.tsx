import { useState, useMemo } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  useGetProduct,
  getGetProductQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriceTierTable } from "@/components/product/PriceTierTable";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { PaymentBadges } from "@/components/common/PaymentBadges";
import { useCart } from "@/contexts/CartContext";
import { bdt, calcUnitPrice } from "@/lib/format";
import {
  ChevronRight,
  MapPin,
  Truck,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  Zap,
} from "lucide-react";

export default function Product() {
  const [, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug ?? "";
  const { addItem } = useCart();

  const { data: product, isLoading } = useGetProduct(slug, {
    query: { enabled: !!slug, queryKey: getGetProductQueryKey(slug) },
  });

  const [imageIdx, setImageIdx] = useState(0);
  const [qty, setQty] = useState<number>(product?.moq ?? 1);

  const effectiveQty = qty || product?.moq || 1;
  const unitPrice = useMemo(
    () => (product ? calcUnitPrice(product.tiers, effectiveQty) : 0),
    [product, effectiveQty],
  );
  const total = unitPrice * effectiveQty;
  const savings = product ? Math.max(0, (product.oldPrice - unitPrice) * effectiveQty) : 0;
  const savingsPct = product
    ? Math.round(((product.oldPrice - product.wholesalePrice) / product.oldPrice) * 100)
    : 0;

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="aspect-square w-full max-w-xl rounded-2xl mb-4" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const mainImage = gallery[imageIdx] ?? product.image;
  const lowStock = product.stock > 0 && product.stock < 50;

  const handleAddToCart = () => {
    addItem(product.id, effectiveQty, product);
  };
  const handleBuyNow = () => {
    addItem(product.id, effectiveQty, product);
    setLocation("/checkout");
  };

  return (
    <div className="pb-32 md:pb-12">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-3 overflow-hidden">
          <Link href="/" className="hover:text-foreground">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${product.category}`} className="hover:text-foreground">
            {product.categoryNameBn ?? product.category}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="truncate">{product.titleBn}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden border bg-card">
              <img src={mainImage} alt={product.titleBn} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                      i === imageIdx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {product.badges?.map((b, i) => (
                <Badge key={i} className="bg-destructive text-destructive-foreground border-none">{b}</Badge>
              ))}
            </div>
            <h1 className="text-xl md:text-2xl font-bold leading-snug">{product.titleBn}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{product.source}</span>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">{bdt(unitPrice)}</span>
                <span className="text-base text-muted-foreground line-through">{bdt(product.oldPrice)}</span>
                {savingsPct > 0 && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-none">
                    {savingsPct}% সাশ্রয়
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                প্রতি {product.unit}-এর দাম • সর্বনিম্ন অর্ডার (MOQ): <b className="text-foreground">{product.moq} {product.unit}</b>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-sm">পাইকারি দাম তালিকা</h3>
              <PriceTierTable tiers={product.tiers} />
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-sm">পরিমাণ নির্বাচন করুন</h3>
              <div className="flex items-center justify-between bg-muted rounded-xl p-3">
                <QuantityStepper
                  value={effectiveQty}
                  onChange={setQty}
                  min={1}
                  max={product.stock}
                />
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">মোট</div>
                  <div className="text-xl font-bold text-primary">{bdt(total)}</div>
                  {savings > 0 && (
                    <div className="text-xs text-emerald-600 font-semibold">{bdt(savings)} সাশ্রয়</div>
                  )}
                </div>
              </div>
            </div>

            {lowStock && (
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-xl text-sm font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>মাত্র {product.stock} {product.unit} বাকি! দ্রুত অর্ডার করুন</span>
              </div>
            )}

            {product.descriptionBn && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 text-sm">বিস্তারিত</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.descriptionBn}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 mt-0.5 text-primary" />
                <div>
                  <div className="font-semibold">ডেলিভারি</div>
                  <div className="text-muted-foreground">{product.deliveryNote}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-600" />
                <div>
                  <div className="font-semibold">পেমেন্ট ও ডেলিভারির গ্যারান্টি</div>
                  <div className="text-muted-foreground">নিরাপদ পেমেন্ট, ক্যাশ অন ডেলিভারিও সাপোর্টেড</div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex gap-3 pt-2">
              <Button size="lg" variant="outline" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" /> কার্টে যোগ করুন
              </Button>
              <Button size="lg" className="flex-1" onClick={handleBuyNow}>
                <Zap className="w-4 h-4 mr-2" /> এখনই অর্ডার
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-sm">পেমেন্ট মাধ্যম</h3>
              <PaymentBadges />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t p-3 flex gap-2 md:hidden shadow-lg">
        <Button variant="outline" className="flex-1" onClick={handleAddToCart}>
          <ShoppingCart className="w-4 h-4 mr-1" /> কার্ট
        </Button>
        <Button className="flex-1" onClick={handleBuyNow}>
          <Zap className="w-4 h-4 mr-1" /> এখনই অর্ডার • {bdt(total)}
        </Button>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { MoqBanner } from "@/components/common/MoqBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

type Sort = "default" | "price-asc" | "price-desc" | "bestseller" | "new";

export default function Category() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";
  const [sort, setSort] = useState<Sort>("default");

  const { data: cats } = useListCategories();
  const cat = cats?.find((c) => c.slug === slug);

  const { data: products, isLoading } = useListProducts({ category: slug });

  const sorted = useMemo(() => {
    if (!products) return [];
    const list = [...products];
    if (sort === "price-asc") list.sort((a, b) => a.wholesalePrice - b.wholesalePrice);
    if (sort === "price-desc") list.sort((a, b) => b.wholesalePrice - a.wholesalePrice);
    if (sort === "bestseller") list.sort((a, b) => b.sold - a.sold);
    if (sort === "new") list.sort((a, b) => (b.badges?.includes("নতুন") ? 1 : 0) - (a.badges?.includes("নতুন") ? 1 : 0));
    return list;
  }, [products, sort]);

  return (
    <div className="pb-24 md:pb-6">
      <MoqBanner />
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">হোম</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/categories" className="hover:text-foreground">ক্যাটাগরি</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{cat?.nameBn ?? slug}</span>
        </nav>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{cat?.nameBn ?? slug}</h1>
            <p className="text-sm text-muted-foreground">{products?.length ?? 0} টি পণ্য পাওয়া গেছে</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {([
            ["default", "সব"],
            ["bestseller", "বেস্টসেলার"],
            ["new", "নতুন"],
            ["price-asc", "দাম: কম-বেশি"],
            ["price-desc", "দাম: বেশি-কম"],
          ] as [Sort, string][]).map(([k, label]) => (
            <Button
              key={k}
              variant={sort === k ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setSort(k)}
            >
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">এই ক্যাটাগরিতে কোনো পণ্য নেই</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

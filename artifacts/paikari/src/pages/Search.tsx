import { useMemo } from "react";
import { useSearch } from "wouter";
import { useListProducts, ListProductsTag } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";

export default function Search() {
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const q = params.get("q") ?? "";
  const tagRaw = params.get("tag") ?? undefined;
  const tag = tagRaw && (Object.values(ListProductsTag) as string[]).includes(tagRaw)
    ? (tagRaw as ListProductsTag)
    : undefined;

  const { data: products, isLoading } = useListProducts({
    ...(q ? { q } : {}),
    ...(tag ? { tag } : {}),
  });

  const heading = q ? `"${q}"` : tag === "flash" ? "ফ্ল্যাশ ডিল" : tag === "bestseller" ? "বেস্টসেলার" : "অনুসন্ধান";

  return (
    <div className="container mx-auto px-4 py-4 pb-24 md:pb-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="text-sm text-muted-foreground">{products?.length ?? 0} টি পণ্য পাওয়া গেছে</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <SearchX className="w-12 h-12 mb-3" />
          <p>কোনো পণ্য খুঁজে পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

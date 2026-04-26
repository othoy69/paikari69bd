import { Link } from "wouter";
import { Heart, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { bdt } from "@/lib/format";

export default function Wishlist() {
  const { identifier } = useAuth();
  const { items, remove, has, toggle, count } = useWishlist();
  const { addItem } = useCart();
  const { data: allProducts } = useListProducts();

  // For guests, hydrate from local product list
  const guestItems = !identifier
    ? (allProducts ?? []).filter((p) => has(p.id)).map((p) => ({ ...p, addedAt: new Date().toISOString() }))
    : [];
  const list = identifier ? items : guestItems;

  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center pb-24 max-w-2xl">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">আপনার উইশলিস্ট খালি</h2>
        <p className="text-sm text-muted-foreground mb-4">
          পছন্দের পণ্যে হার্ট আইকনে ক্লিক করে এখানে সংরক্ষণ করুন
        </p>
        <Link href="/"><Button size="lg"><ArrowLeft className="w-4 h-4 mr-1" /> দোকানে ফিরুন</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 pb-24 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-extrabold">আমার উইশলিস্ট ({count})</h1>
        <Link href="/account">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> অ্যাকাউন্ট
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((p) => (
          <div key={p.id} className="bg-white border rounded-2xl overflow-hidden flex flex-col">
            <Link href={`/product/${p.slug}`} className="block relative aspect-square bg-slate-50">
              <img src={p.image} alt={p.titleBn} className="w-full h-full object-cover" loading="lazy" />
            </Link>
            <div className="p-2.5 flex-1 flex flex-col">
              <Link href={`/product/${p.slug}`} className="text-sm font-bold line-clamp-2 mb-1 hover:text-primary">
                {p.titleBn}
              </Link>
              <div className="text-xs text-muted-foreground mb-2">{p.unit} • MOQ {p.moq}</div>
              <div className="text-base font-extrabold text-primary mb-2">{bdt(p.wholesalePrice)}</div>
              <div className="mt-auto flex gap-1.5">
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => addItem(p.id, p.moq, p as never)}
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" /> কার্টে
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2"
                  onClick={() => (identifier ? remove(p.id) : toggle(p.id))}
                  aria-label="সরান"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

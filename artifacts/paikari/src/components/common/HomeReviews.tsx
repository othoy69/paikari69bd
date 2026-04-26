import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { publicApi, type FeaturedReview } from "@/lib/publicApi";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeReviews() {
  const [reviews, setReviews] = useState<FeaturedReview[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .featuredReviews()
      .then((r) => setReviews(r))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (!reviews || reviews.length === 0)) return null;

  return (
    <section className="container mx-auto px-3 md:px-4 my-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-2xl font-extrabold text-slate-900">
          গ্রাহকদের মতামত
        </h2>
        <div className="text-xs md:text-sm text-emerald-700 font-bold flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          ৪.৮/৫ • ৫০ হাজার+ সন্তুষ্ট রিসেলার
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(reviews ?? []).slice(0, 6).map((r) => (
            <div
              key={r.id}
              className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Quote className="absolute -top-3 left-4 w-6 h-6 text-orange-500/80 bg-white rounded-full p-1 border" />
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < r.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                {r.text}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{r.customerName}</div>
                  {r.productTitleBn && (
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      পণ্য: {r.productTitleBn}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

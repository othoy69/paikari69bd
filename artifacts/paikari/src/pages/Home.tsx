import { useGetHomeSummary } from "@workspace/api-client-react";
import { ProductCard } from "../components/product/ProductCard";
import { FeaturedSegment } from "../components/product/FeaturedSegment";
import { CountdownTimer } from "../components/common/CountdownTimer";
import { PaymentBadges } from "../components/common/PaymentBadges";
import { Skeleton } from "../components/ui/skeleton";
import { Link } from "wouter";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import {
  Flame,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Truck,
  ShieldCheck,
  Headphones,
  RefreshCcw,
} from "lucide-react";

export default function Home() {
  const { data: summary, isLoading } = useGetHomeSummary();

  if (isLoading || !summary) {
    return (
      <div className="container mx-auto px-3 md:px-4 py-4 space-y-6">
        <Skeleton className="w-full h-44 md:h-80 rounded-2xl" />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0 bg-slate-50/50">
      {/* Hero Carousel */}
      <section className="container mx-auto px-3 md:px-4 pt-3 md:pt-5">
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {summary.heroSlides.map((slide, i) => (
              <CarouselItem key={i}>
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[3/1] shadow-lg">
                  <img src={slide.image} alt={slide.titleBn} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-center p-5 md:p-12 max-w-2xl">
                    <span className="inline-block w-fit text-[10px] md:text-xs font-bold text-white bg-white/15 backdrop-blur px-2.5 py-1 rounded-full mb-2 md:mb-3 border border-white/20">
                      পাইকারি69bd.com
                    </span>
                    <h2 className="text-xl md:text-5xl font-extrabold text-white mb-2 md:mb-4 leading-tight">{slide.titleBn}</h2>
                    <p className="text-xs md:text-lg text-white/90 mb-3 md:mb-6 line-clamp-2">{slide.subtitleBn}</p>
                    <Link href={slide.ctaHref}>
                      <button className="w-fit bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 md:px-7 py-2 md:py-3 rounded-full font-bold shadow-lg hover:shadow-xl text-sm md:text-base transition-all">
                        {slide.ctaText}
                      </button>
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </div>
        </Carousel>
      </section>

      {/* ─── HERO FEATURED SEGMENTS (most prominent) ─── */}
      <FeaturedSegment
        theme="jersey"
        eyebrow="মেগা অফার • জার্সি কালেকশন"
        titleBn="অরিজিনাল জার্সি — পাইকারি দামে!"
        subtitleBn="৫৫% পর্যন্ত ছাড়! আর্জেন্টিনা, ব্রাজিল, বাংলাদেশ — সব দল • রিসেলার প্রাইস"
        ctaText="সব জার্সি দেখুন"
        ctaHref="/search?q=জার্সি"
        products={summary.featuredJerseys ?? []}
      />

      <FeaturedSegment
        theme="saree"
        eyebrow="স্পেশাল কালেকশন • টাঙ্গাইল"
        titleBn="টাঙ্গাইলের অরিজিনাল শাড়ি কালেকশন"
        subtitleBn="সরাসরি তাঁতি থেকে! ৫০% পর্যন্ত ছাড় • হাফ সিল্ক, জামদানি, কটন তাঁত"
        ctaText="শাড়ি কালেকশন"
        ctaHref="/search?q=টাঙ্গাইল"
        products={summary.featuredSarees ?? []}
      />

      <FeaturedSegment
        theme="threepiece"
        eyebrow="হট ট্রেন্ড • থ্রি-পিস কালেকশন"
        titleBn="প্রিমিয়াম থ্রি-পিস কালেকশন"
        subtitleBn="জর্জেট, লন কটন, ইন্ডিয়ান আনস্টিচড • ৫২% পর্যন্ত পাইকারি ছাড়"
        ctaText="থ্রি-পিস দেখুন"
        ctaHref="/search?q=থ্রি-পিস"
        products={summary.featuredThreePiece ?? []}
      />

      {/* Trust micro-bar */}
      <section className="container mx-auto px-3 md:px-4 mt-3">
        <div className="grid grid-cols-4 gap-2 bg-white border border-slate-200 rounded-2xl p-2 md:p-3 shadow-sm">
          {[
            { icon: Truck, label: "দ্রুত ডেলিভারি" },
            { icon: ShieldCheck, label: "নিরাপদ পেমেন্ট" },
            { icon: RefreshCcw, label: "সহজ রিটার্ন" },
            { icon: Headphones, label: "২৪/৭ সাপোর্ট" },
          ].map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={i} className="flex flex-col md:flex-row items-center justify-center gap-1.5 text-center md:text-left text-slate-700">
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-orange-600 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-semibold leading-tight">{it.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-3 md:px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-xl font-extrabold text-slate-900">ক্যাটাগরি ব্রাউজ করুন</h2>
          <Link href="/categories" className="text-xs md:text-sm font-bold text-orange-600 flex items-center gap-0.5 hover:underline">
            সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
          {summary.categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              <div className="group flex flex-col items-center gap-1.5 cursor-pointer">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100/60 group-hover:border-orange-300 group-hover:shadow-md transition-all">
                  {cat.image && (
                    <img src={cat.image} alt={cat.nameBn} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-center text-slate-800 line-clamp-2 leading-tight">{cat.nameBn}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      {summary.flashDeals.length > 0 && (
        <section className="container mx-auto px-3 md:px-4 my-2">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-4 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 md:mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 backdrop-blur p-1.5 md:p-2 rounded-xl">
                  <Flame className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-extrabold text-white leading-none">ফ্ল্যাশ ডিল</h2>
                  <p className="text-[10px] md:text-xs text-white/90 font-medium mt-0.5">সীমিত সময়ের জন্য বিশেষ ছাড়</p>
                </div>
              </div>
              {summary.flashEndsAt && (
                <div className="hidden md:block">
                  <CountdownTimer endsAt={summary.flashEndsAt} />
                </div>
              )}
              {summary.flashEndsAt && (
                <div className="md:hidden">
                  <CountdownTimer endsAt={summary.flashEndsAt} variant="compact" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {summary.flashDeals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="container mx-auto px-3 md:px-4 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-base md:text-xl font-extrabold text-slate-900">বেস্টসেলার</h2>
          </div>
          <Link href="/search?tag=bestseller" className="text-xs md:text-sm font-bold text-orange-600 flex items-center gap-0.5 hover:underline">
            সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          {summary.bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      {summary.newArrivals.length > 0 && (
        <section className="container mx-auto px-3 md:px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base md:text-xl font-extrabold text-slate-900">নতুন এসেছে</h2>
            </div>
            <Link href="/search?tag=new" className="text-xs md:text-sm font-bold text-orange-600 flex items-center gap-0.5 hover:underline">
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            {summary.newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Trust Stats */}
      <section className="container mx-auto px-3 md:px-4 py-6">
        <div className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 md:p-8 text-white shadow-xl">
          <div className="text-center mb-4">
            <h2 className="text-lg md:text-2xl font-extrabold">৫০ হাজার+ রিসেলারের ভরসার বাজার</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1">পাইকারি দামে সারা বাংলাদেশে দ্রুত ডেলিভারি</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { v: `${summary.trustStats.resellers.toLocaleString("en-IN")}+`, l: "সক্রিয় রিসেলার" },
              { v: `${summary.trustStats.ordersDelivered.toLocaleString("en-IN")}+`, l: "অর্ডার ডেলিভার্ড" },
              { v: `${summary.trustStats.districts}`, l: "জেলায় ডেলিভারি" },
              { v: `${summary.trustStats.satisfaction}%`, l: "সন্তুষ্টির হার" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-center">
                <div className="text-xl md:text-3xl font-extrabold text-orange-400 leading-none">{s.v}</div>
                <div className="text-[10px] md:text-xs text-slate-300 mt-1.5 font-medium">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Partners */}
      <section className="container mx-auto px-3 md:px-4 pb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <div className="text-xs md:text-sm font-bold text-slate-700 mb-3">আমরা গ্রহণ করি</div>
          <PaymentBadges />
        </div>
      </section>
    </div>
  );
}

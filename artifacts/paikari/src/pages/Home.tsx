import { useGetHomeSummary } from "@workspace/api-client-react";
import { ProductCard } from "../components/product/ProductCard";
import { CountdownTimer } from "../components/common/CountdownTimer";
import { Skeleton } from "../components/ui/skeleton";
import { Link } from "wouter";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

export default function Home() {
  const { data: summary, isLoading } = useGetHomeSummary();

  if (isLoading || !summary) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="w-full h-48 md:h-96 rounded-2xl" />
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero Carousel */}
      <section className="container mx-auto px-4 py-4 md:py-6">
        <Carousel opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {summary.heroSlides.map((slide, i) => (
              <CarouselItem key={i}>
                <div className="relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[3/1]">
                  <img src={slide.image} alt={slide.titleBn} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-6 md:p-12">
                    <h2 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">{slide.titleBn}</h2>
                    <p className="text-sm md:text-xl text-white/90 mb-4 md:mb-6">{slide.subtitleBn}</p>
                    <Link href={slide.ctaHref}>
                      <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold w-fit hover:bg-primary/90 transition-colors">
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

      {/* Categories */}
      <section className="container mx-auto px-4 py-4">
        <h2 className="text-lg font-bold mb-4">ক্যাটাগরি সমূহ</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {summary.categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted/50 flex items-center justify-center text-3xl group-hover:bg-primary/10 transition-colors overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.nameBn} className="w-full h-full object-cover" />
                  ) : (
                    <span>{cat.icon}</span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium text-center">{cat.nameBn}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      {summary.flashDeals.length > 0 && (
        <section className="container mx-auto px-4 py-6 bg-destructive/5 my-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-destructive">ফ্ল্যাশ সেল</h2>
              {summary.flashEndsAt && <CountdownTimer endsAt={summary.flashEndsAt} />}
            </div>
            <Link href="/search?tag=flash" className="text-sm font-medium text-primary hover:underline">
              সব দেখুন
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {summary.flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">সেরা বিক্রীত</h2>
          <Link href="/search?tag=bestseller" className="text-sm font-medium text-primary hover:underline">
            সব দেখুন
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {summary.bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Strip */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-2xl shadow-sm border p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">{summary.trustStats.resellers.toLocaleString('en-IN')}+</div>
            <div className="text-sm text-muted-foreground font-medium">রিসেলার</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">{summary.trustStats.ordersDelivered.toLocaleString('en-IN')}+</div>
            <div className="text-sm text-muted-foreground font-medium">অর্ডার ডেলিভারি</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">{summary.trustStats.districts}</div>
            <div className="text-sm text-muted-foreground font-medium">জেলায় ডেলিভারি</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">{summary.trustStats.satisfaction}%</div>
            <div className="text-sm text-muted-foreground font-medium">সন্তুষ্টি</div>
          </div>
        </div>
      </section>

    </div>
  );
}

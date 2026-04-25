import { Trophy, Flame, Zap, ArrowRight } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { CountdownTimer } from "./CountdownTimer";
import { bdt } from "../../lib/format";

interface Props {
  endsAt?: string;
}

export function WorldCupBanner({ endsAt }: Props) {
  const goJersey = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("featured-jersey");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-4", "ring-yellow-300", "ring-offset-2");
      setTimeout(() => el.classList.remove("ring-4", "ring-yellow-300", "ring-offset-2"), 1400);
    }
  };

  return (
    <section className="container mx-auto px-3 md:px-4 mt-3">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-red-700" />
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0, transparent 40%)",
          }}
        />
        {/* Trophy backdrop */}
        <Trophy className="absolute -right-6 -bottom-6 w-44 h-44 md:w-72 md:h-72 text-white/10" strokeWidth={1.2} />

        <div className="relative p-5 md:p-7">
          {/* Top row */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-yellow-300 text-red-700 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-extrabold shadow-lg">
                <Flame className="w-3.5 h-3.5" />
                সেরা হট আইটেম
              </span>
              <span className="hidden md:inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white px-2.5 py-1 rounded-full text-[11px] font-bold border border-white/30">
                <Zap className="w-3 h-3" /> সীমিত স্টক — মাত্র ৪৫ পিস
              </span>
            </div>
            {endsAt && (
              <div className="hidden md:block">
                <CountdownTimer endsAt={endsAt} variant="compact" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="text-white">
              <div className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest opacity-90 mb-1">
                FIFA World Cup 2026 • Premium Edition
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg">
                ওয়ার্ল্ড কাপ ২০২৬ অফিসিয়াল জার্সি
              </h2>
              <p className="text-xs md:text-base font-medium text-white/95 mt-1.5 max-w-2xl">
                AAA+ প্রিমিয়াম ড্রাই-ফিট কাপড় • আর্জেন্টিনা, ব্রাজিল, পর্তুগাল, ফ্রান্স, স্পেন, জার্মানি — সব দল!
              </p>

              {/* Pricing strip */}
              <div className="mt-3 flex flex-wrap items-end gap-2 md:gap-3">
                <div className="bg-white rounded-xl px-3 py-2 shadow-lg">
                  <div className="text-[9px] font-extrabold text-orange-600 uppercase">১ পিস</div>
                  <div className="text-lg md:text-xl font-extrabold text-slate-900 leading-none">{bdt(750)}</div>
                </div>
                <div className="bg-white rounded-xl px-3 py-2 shadow-lg ring-2 ring-yellow-300">
                  <div className="text-[9px] font-extrabold text-orange-600 uppercase">৫ পিস</div>
                  <div className="text-lg md:text-xl font-extrabold text-orange-600 leading-none">{bdt(580)}</div>
                </div>
                <div className="relative bg-gradient-to-br from-red-600 to-red-700 rounded-xl px-3 py-2 shadow-lg ring-2 ring-yellow-300">
                  <span className="absolute -top-2 -right-2 bg-yellow-300 text-red-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
                    বেস্ট ডিল
                  </span>
                  <div className="text-[9px] font-extrabold text-yellow-200 uppercase">১০ পিস</div>
                  <div className="text-lg md:text-xl font-extrabold text-white leading-none">{bdt(490)}</div>
                </div>
                <div className="ml-1">
                  <div className="text-[10px] text-white/85 line-through leading-none">{bdt(1450)}</div>
                  <div className="inline-block bg-emerald-500 text-white text-[10px] md:text-xs font-extrabold px-2 py-0.5 rounded-md mt-1 shadow">
                    সাশ্রয় ৬০%
                  </div>
                </div>
              </div>

              <div className="md:hidden mt-3">
                {endsAt && <CountdownTimer endsAt={endsAt} variant="compact" />}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto md:items-end">
              <a
                href="#featured-jersey"
                onClick={goJersey}
                className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-white text-red-700 hover:bg-yellow-50 px-5 py-3 rounded-xl font-extrabold text-sm md:text-base shadow-lg transition-colors whitespace-nowrap"
              >
                এখনই অর্ডার করুন
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </a>
              <div className="md:flex md:justify-end">
                <WhatsAppButton
                  variant="pill"
                  message="আসসালামু আলাইকুম, ওয়ার্ল্ড কাপ ২০২৬ জার্সি অর্ডার করতে চাই। দাম ও স্টক জানাবেন।"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

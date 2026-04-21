import { Link } from "wouter";
import { ArrowRight, Flame, Sparkles, Crown } from "lucide-react";

const BOXES = [
  {
    href: "#featured-jersey",
    eyebrow: "মেগা অফার",
    title: "অরিজিনাল জার্সি",
    subtitle: "আর্জেন্টিনা • ব্রাজিল • বাংলাদেশ",
    discount: "৫৫%",
    cta: "জার্সি দেখুন",
    icon: Flame,
    bg: "from-emerald-600 via-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/40",
    accent: "bg-yellow-300 text-emerald-900",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=600&q=70",
  },
  {
    href: "#featured-saree",
    eyebrow: "সরাসরি টাঙ্গাইল থেকে",
    title: "টাঙ্গাইল তাঁতশাড়ি",
    subtitle: "তাঁতির হাত থেকে সরাসরি আপনার দোকানে",
    discount: "৫০%",
    cta: "শাড়ি দেখুন",
    icon: Crown,
    bg: "from-fuchsia-600 via-rose-500 to-pink-500",
    glow: "shadow-rose-500/40",
    accent: "bg-yellow-300 text-rose-900",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=70",
  },
  {
    href: "#featured-threepiece",
    eyebrow: "হট ট্রেন্ড",
    title: "প্রিমিয়াম থ্রি-পিস",
    subtitle: "জর্জেট • লন কটন • আনস্টিচড",
    discount: "৫২%",
    cta: "থ্রি-পিস দেখুন",
    icon: Sparkles,
    bg: "from-indigo-600 via-violet-500 to-purple-500",
    glow: "shadow-violet-500/40",
    accent: "bg-yellow-300 text-violet-900",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=600&q=70",
  },
];

function scrollToHash(hash: string) {
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // little flash highlight
    el.classList.add("ring-4", "ring-yellow-300", "ring-offset-2");
    setTimeout(() => el.classList.remove("ring-4", "ring-yellow-300", "ring-offset-2"), 1400);
  }
}

export function ThreeFeatureBoxes() {
  return (
    <section className="container mx-auto px-3 md:px-4 my-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {BOXES.map((b) => {
          const Icon = b.icon;
          return (
            <Link
              key={b.href}
              href={b.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToHash(b.href);
              }}
            >
              <div className={`relative group cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-br ${b.bg} shadow-xl ${b.glow} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-44 md:h-56`}>
                {/* Background image */}
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-110 transition-all duration-500"
                />
                {/* Gradient over image */}
                <div className={`absolute inset-0 bg-gradient-to-br ${b.bg} opacity-90`} />

                {/* Discount badge top-right */}
                <div className={`absolute top-3 right-3 ${b.accent} px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-lg`}>
                  {b.discount} ছাড়
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-4 text-white">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">{b.eyebrow}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-extrabold leading-tight drop-shadow">{b.title}</h3>
                    <p className="text-xs md:text-sm font-medium opacity-95 mt-1 line-clamp-2">{b.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 bg-white/95 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-full shadow group-hover:bg-white transition-colors">
                      {b.cta}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] font-bold opacity-80">পাইকারি দাম</span>
                  </div>
                </div>

                {/* Corner shine */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/15 rotate-45 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

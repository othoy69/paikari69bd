import { Facebook, ShoppingBag, Tag, Users, ArrowRight } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";

const FB_PAGES = [
  {
    name: "পাইকারি69bd — Main Page",
    handle: "@paikari69bd",
    href: "https://facebook.com/paikari69bd",
    desc: "মেইন পেজ • প্রতিদিন নতুন কালেকশন ও মেগা অফার",
  },
  {
    name: "পাইকারি69bd — অফার ও কালেকশন",
    handle: "@paikari69bd.offers",
    href: "https://facebook.com/paikari69bd.offers",
    desc: "জার্সি, শাড়ি, থ্রি-পিস ও বিশেষ ডিসকাউন্ট",
  },
];

export function FacebookCTA() {
  return (
    <section className="container mx-auto px-3 md:px-4 my-4">
      <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1877F2] via-[#1565d8] to-[#0d4ea6] p-4 md:p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3 text-white">
          <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center">
            <Facebook className="w-6 h-6 fill-white text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-extrabold leading-tight">ফেসবুকে আমাদের ফলো করুন</h2>
            <p className="text-xs md:text-sm text-white/85 font-medium">
              নতুন কালেকশন, ফ্ল্যাশ ডিল ও মেগা অফার সবার আগে পেতে
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {FB_PAGES.map((p) => (
            <a
              key={p.handle}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 hover:bg-white/15 backdrop-blur rounded-xl p-3 border border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <Facebook className="w-7 h-7 fill-[#1877F2] text-[#1877F2]" />
                </div>
                <div className="flex-1 min-w-0 text-white">
                  <div className="text-sm font-extrabold truncate">{p.name}</div>
                  <div className="text-[10px] opacity-80 truncate">{p.handle}</div>
                  <div className="text-[11px] opacity-90 mt-0.5 line-clamp-1">{p.desc}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>

        {/* Persuasion strip for FB visitors */}
        <div className="bg-white/95 backdrop-blur rounded-xl p-3 md:p-4">
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            {[
              { icon: ShoppingBag, label: "অরিজিনাল প্রোডাক্ট" },
              { icon: Tag, label: "সবচেয়ে কম পাইকারি দাম" },
              { icon: Users, label: "৫০ হাজার+ রিসেলার" },
            ].map((it, i) => {
              const Ic = it.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Ic className="w-4 h-4 md:w-5 md:h-5 text-[#1877F2]" />
                  <span className="text-[10px] md:text-xs font-bold text-slate-800 leading-tight">{it.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] md:text-sm text-slate-700 text-center font-medium leading-snug">
            ফেসবুক থেকে এসেছেন? <b className="text-[#1877F2]">পুরো কালেকশন ওয়েবসাইটে</b> দেখুন — অর্ডার দিন মাত্র ২ মিনিটে।
          </div>
          <div className="flex flex-col md:flex-row gap-2 mt-3">
            <a
              href="/"
              className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold text-sm rounded-xl shadow hover:shadow-lg"
            >
              পুরো কালেকশন দেখুন
            </a>
            <div className="flex-1">
              <WhatsAppButton variant="pill" message="আসসালামু আলাইকুম, আমি ফেসবুক থেকে এসেছি, অর্ডার করতে চাই।" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhatsAppHelpStrip() {
  return (
    <section className="container mx-auto px-3 md:px-4 my-4">
      <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-4 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
          <div className="flex-1 text-white">
            <div className="inline-block text-[10px] md:text-xs font-extrabold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full uppercase tracking-wide mb-2">
              ২৪/৭ লাইভ সাপোর্ট
            </div>
            <h2 className="text-xl md:text-3xl font-extrabold leading-tight">
              অর্ডার বা যেকোনো প্রশ্নে — WhatsApp এ মেসেজ দিন
            </h2>
            <p className="text-xs md:text-sm text-white/90 font-medium mt-1.5">
              পাইকারি দাম, স্টক, ডেলিভারি, কাস্টম অর্ডার — সব কিছু WhatsApp এ দ্রুত সমাধান
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] md:text-xs text-white/95 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                এখনই অনলাইন
              </span>
              <span>• দ্রুত উত্তর • বাংলায় কথা বলুন</span>
            </div>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <WhatsAppButton variant="pill" message="আসসালামু আলাইকুম, পাইকারি69bd থেকে যোগাযোগ করছি।" />
          </div>
        </div>
      </div>
    </section>
  );
}

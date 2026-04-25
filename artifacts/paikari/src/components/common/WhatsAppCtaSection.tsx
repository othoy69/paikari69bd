import { MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import { WA_NUMBER, WA_DISPLAY } from "./WhatsAppButton";

const ORDER_MSG = encodeURIComponent("আসসালামু আলাইকুম, আমি পাইকারি69bd থেকে অর্ডার করতে চাই।");

export function WhatsAppCtaSection() {
  return (
    <section className="container mx-auto px-3 md:px-4 my-4">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600" />
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.4) 0, transparent 35%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.3) 0, transparent 40%)",
          }}
        />
        <MessageCircle
          className="absolute -right-6 -bottom-6 w-44 h-44 md:w-64 md:h-64 text-white/10"
          strokeWidth={1.2}
        />

        <div className="relative p-6 md:p-9 text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-[11px] md:text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border border-white/30 mb-3">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            ২৪/৭ লাইভ সাপোর্ট
          </div>
          <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight">
            সরাসরি অর্ডার করুন WhatsApp এ
          </h3>
          <p className="text-xs md:text-base text-white/90 font-medium mt-2 max-w-xl mx-auto">
            প্রশ্ন আছে? দাম জানতে চান? ক্যাটালগ দেখতে চান? <br className="hidden md:block" />
            আমরা সবসময় রেডি — এখনই মেসেজ করুন!
          </p>

          <div className="mt-5 flex flex-col md:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${ORDER_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-3.5 rounded-full font-extrabold text-base shadow-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp এ অর্ডার করুন
            </a>
            <a
              href="tel:+8801872888954"
              className="inline-flex items-center gap-2 text-white text-lg md:text-xl font-extrabold tabular-nums tracking-wide hover:text-yellow-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {WA_DISPLAY}
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] md:text-xs text-white/95 font-semibold">
            {[
              "অরিজিনাল প্রোডাক্ট",
              "সবচেয়ে কম পাইকারি দাম",
              "সারাদেশে দ্রুত ডেলিভারি",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

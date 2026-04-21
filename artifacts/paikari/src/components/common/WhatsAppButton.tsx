import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const WA_NUMBER = "8801872888954";
const WA_DISPLAY = "01872-888954";

function waLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${WA_NUMBER}${text}`;
}

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.834 2.722.834.345 0 2.42-.515 2.42-1.49 0-.502-1.073-2.467-1.404-2.467ZM16 6c5.523 0 10 4.477 10 10 0 1.85-.5 3.583-1.378 5.067l1.378 5.073-5.234-1.328A9.954 9.954 0 0 1 16 26C10.477 26 6 21.523 6 16S10.477 6 16 6Z" />
  </svg>
);

export function WhatsAppButton({
  variant = "compact",
  message,
}: {
  variant?: "compact" | "pill" | "icon";
  message?: string;
}) {
  if (variant === "icon") {
    return (
      <a
        href={waLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#1faa55] text-white shadow"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </a>
    );
  }
  if (variant === "pill") {
    return (
      <a
        href={waLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1faa55] text-white font-bold shadow-lg hover:shadow-xl transition-all"
      >
        <WhatsAppIcon className="w-5 h-5" />
        <span>WhatsApp এ অর্ডার করুন</span>
      </a>
    );
  }
  // compact (default for header)
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3.5 h-9 md:h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#1fbb5b] hover:to-[#0e7a6c] text-white font-bold shadow-md hover:shadow-lg transition-all"
    >
      <WhatsAppIcon className="w-4 h-4 md:w-5 md:h-5" />
      <div className="text-left leading-tight">
        <div className="text-[9px] md:text-[10px] font-semibold opacity-90">WhatsApp</div>
        <div className="text-[11px] md:text-xs font-extrabold tabular-nums">{WA_DISPLAY}</div>
      </div>
    </a>
  );
}

export function WhatsAppFloating() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const quickMsgs = [
    { label: "অর্ডার সংক্রান্ত সাহায্য", msg: "আসসালামু আলাইকুম, আমি অর্ডার করতে চাই।" },
    { label: "পাইকারি দাম জানতে চাই", msg: "ভাই, পাইকারি দাম জানতে চাচ্ছি।" },
    { label: "ডেলিভারি সম্পর্কে জিজ্ঞাসা", msg: "ডেলিভারি কত দিনে আসে এবং চার্জ কত?" },
    { label: "নতুন রিসেলার - সাহায্য চাই", msg: "আমি নতুন রিসেলার, কিভাবে শুরু করব?" },
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-[60] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[280px] md:w-[320px] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-3 flex items-center gap-2 text-white">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <WhatsAppIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold leading-tight">পাইকারি69bd সাপোর্ট</div>
              <div className="text-[10px] opacity-90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                সাধারণত মিনিটের মধ্যে উত্তর দিই
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-white/15 flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3">
            <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 leading-relaxed mb-2.5 border border-slate-100">
              আসসালামু আলাইকুম! 👋 যেকোনো প্রশ্ন বা অর্ডারের জন্য নিচের যেকোনো অপশনে ক্লিক করুন।
            </div>
            <div className="space-y-1.5">
              {quickMsgs.map((q) => (
                <a
                  key={q.label}
                  href={waLink(q.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-left text-xs font-semibold text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-colors"
                >
                  → {q.label}
                </a>
              ))}
            </div>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mt-3 px-3 py-2.5 bg-[#25D366] hover:bg-[#1faa55] text-white font-extrabold text-sm rounded-xl shadow"
            >
              চ্যাট শুরু করুন
            </a>
            <div className="text-center text-[10px] text-slate-500 mt-2 font-medium">
              {WA_DISPLAY} • সকাল ৯টা - রাত ১১টা
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="WhatsApp চ্যাট"
        className="relative group"
      >
        {pulse && !open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-50" />
        )}
        <span className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-2xl group-hover:scale-105 transition-transform">
          {open ? <X className="w-7 h-7" strokeWidth={2.5} /> : <WhatsAppIcon className="w-8 h-8 md:w-9 md:h-9" />}
        </span>
        {!open && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
            ১
          </span>
        )}
      </button>
    </div>
  );
}

export { WA_DISPLAY, WA_NUMBER, waLink };

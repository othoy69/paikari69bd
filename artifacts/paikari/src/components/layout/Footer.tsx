import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";
import { WhatsAppButton, WA_DISPLAY } from "../common/WhatsAppButton";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-xl font-extrabold text-white">
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">পাইকারি</span>
              <span>69bd.com</span>
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              বাংলাদেশের অন্যতম বিশ্বস্ত পাইকারি মার্কেটপ্লেস। অরিজিনাল প্রোডাক্ট, পাইকারি দাম, দ্রুত ডেলিভারি।
            </p>
            <div className="pt-2">
              <WhatsAppButton variant="pill" message="আসসালামু আলাইকুম, পাইকারি69bd থেকে যোগাযোগ করছি।" />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">ক্যাটাগরি</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/fashion" className="hover:text-orange-400">ফ্যাশন ও পোশাক</Link></li>
              <li><Link href="/category/electronics" className="hover:text-orange-400">ইলেকট্রনিক্স</Link></li>
              <li><Link href="/category/home" className="hover:text-orange-400">হোম ও কিচেন</Link></li>
              <li><Link href="/category/beauty" className="hover:text-orange-400">বিউটি ও কেয়ার</Link></li>
              <li><Link href="/categories" className="hover:text-orange-400">সব ক্যাটাগরি →</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">তথ্য</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-orange-400">শর্ত ও নিয়মাবলী</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400">প্রাইভেসি পলিসি</Link></li>
              <li><Link href="/return" className="hover:text-orange-400">রিটার্ন পলিসি</Link></li>
              <li><Link href="/shipping" className="hover:text-orange-400">শিপিং তথ্য</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">যোগাযোগ</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`https://wa.me/8801872888954`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400"
                >
                  <span className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  </span>
                  <span>
                    <span className="block text-[10px] text-slate-500 leading-none">WhatsApp</span>
                    <span className="block font-bold text-white tabular-nums">{WA_DISPLAY}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="tel:+8801700000069" className="flex items-center gap-2 hover:text-orange-400">
                  <span className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-orange-400" />
                  </span>
                  <span>
                    <span className="block text-[10px] text-slate-500 leading-none">হটলাইন</span>
                    <span className="block font-bold text-white tabular-nums">01700-000069</span>
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-slate-300" />
                </span>
                <span className="text-slate-300">support@paikari69bd.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-300" />
                </span>
                <span className="text-slate-300">ঢাকা</span>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <a
                  href="https://facebook.com/paikari69bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1877F2]/15 hover:bg-[#1877F2]/30 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 fill-[#1877F2] text-[#1877F2]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} পাইকারি69bd.com — All rights reserved.
          </p>
          <p className="text-xs text-slate-500">Made for Bangladesh wholesale market</p>
        </div>
      </div>
    </footer>
  );
}

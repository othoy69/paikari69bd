import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { WhatsAppButton, WA_DISPLAY } from "../common/WhatsAppButton";

export function Header() {
  const { itemCount } = useCart();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
      {/* Top utility bar - desktop only */}
      <div className="hidden md:block bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 text-white text-xs">
        <div className="container mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> সারা বাংলাদেশে দ্রুত ডেলিভারি</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ১০০% নিরাপদ পেমেন্ট</span>
            <span>• ২৪/৭ WhatsApp সাপোর্ট</span>
          </div>
          <div className="flex items-center gap-3">
            <span>অর্ডার বা সাহায্যের জন্য WhatsApp:</span>
            <a
              href={`https://wa.me/8801872888954`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold underline-offset-2 hover:underline tabular-nums"
            >
              {WA_DISPLAY}
            </a>
          </div>
        </div>
      </div>

      {/* Mobile WhatsApp call-out strip */}
      <div className="md:hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] px-3 py-1.5 flex items-center justify-between gap-2">
        <span className="font-semibold leading-tight">যেকোনো প্রশ্নে WhatsApp করুন</span>
        <a
          href="https://wa.me/8801872888954"
          target="_blank"
          rel="noopener noreferrer"
          className="font-extrabold tabular-nums underline-offset-2 hover:underline"
        >
          {WA_DISPLAY} →
        </a>
      </div>

      <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">পাইকারি</span>
          <span className="text-lg md:text-2xl font-extrabold text-slate-900">69bd</span>
          <span className="text-xs md:text-sm font-bold text-slate-500">.com</span>
        </Link>

        <div className="flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="পণ্য, ক্যাটাগরি, ব্র্যান্ড খুঁজুন..."
              className="w-full pl-9 pr-24 h-10 bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-orange-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 bg-orange-600 hover:bg-orange-700 text-white">খুঁজুন</Button>
          </form>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="hidden md:block">
            <WhatsAppButton variant="compact" />
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setLocation('/search')}>
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-1.5" onClick={() => setLocation('/account')}>
            <User className="h-4 w-4" />
            <span className="text-xs font-medium">অ্যাকাউন্ট</span>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setLocation('/account')}>
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="relative gap-1.5" onClick={() => setLocation('/cart')}>
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden md:inline text-xs font-medium">কার্ট</span>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 right-0 md:right-2 h-5 min-w-[20px] px-1 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="px-3 pb-2 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="পণ্য খুঁজুন..."
            className="w-full pl-9 h-10 bg-slate-50 border-slate-200 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}

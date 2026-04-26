import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Boxes,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Menu,
  X,
  Users,
  Globe,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, group: "main" },
  { href: "/admin/orders", label: "অর্ডার ম্যানেজ", icon: ShoppingBag, group: "ops" },
  { href: "/admin/products", label: "পণ্য", icon: Package, group: "ops" },
  { href: "/admin/inventory", label: "স্টক ম্যানেজ", icon: Boxes, group: "ops" },
  { href: "/admin/reviews", label: "রিভিউ ম্যানেজ", icon: Star, group: "ops" },
  { href: "/admin/users", label: "কাস্টমার ম্যানেজ", icon: Users, group: "ops" },
  { href: "/admin/payments", label: "পেমেন্ট সেটিংস", icon: CreditCard, group: "settings" },
  { href: "/admin/sms", label: "SMS সেটিংস", icon: MessageSquare, group: "settings" },
  { href: "/admin/storefront", label: "স্টোরফ্রন্ট ও ট্র্যাকিং", icon: Globe, group: "settings" },
  { href: "/admin/roles", label: "রোল ও অনুমতি", icon: ShieldCheck, group: "settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }: (typeof NAV)[number]) => {
    const active = location === href;
    return (
      <Link href={href}>
        <div
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            active
              ? "bg-orange-500 text-white shadow-sm"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  const Sidebar = () => (
    <>
      <div className="px-4 py-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> দোকানে ফিরুন
        </Link>
        <div className="font-extrabold text-white text-base leading-tight">
          <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">পাইকারি</span>
          <span>69bd</span>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
            অ্যাডমিন প্যানেল
          </div>
        </div>
      </div>
      <div className="px-2 py-3 space-y-3 overflow-y-auto flex-1">
        <div>
          <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Overview</div>
          {NAV.filter((n) => n.group === "main").map((n) => <NavLink key={n.href} {...n} />)}
        </div>
        <div>
          <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Operations</div>
          <div className="space-y-1">
            {NAV.filter((n) => n.group === "ops").map((n) => <NavLink key={n.href} {...n} />)}
          </div>
        </div>
        <div>
          <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Settings</div>
          <div className="space-y-1">
            {NAV.filter((n) => n.group === "settings").map((n) => <NavLink key={n.href} {...n} />)}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-slate-800 text-[10px] text-slate-500">
        Logged in as <span className="text-slate-300 font-bold">Super Admin</span>
        <div className="text-slate-500">v1.0 · Bangladesh wholesale</div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile top bar */}
      <header className="md:hidden bg-slate-900 text-white sticky top-0 z-40 flex items-center justify-between px-3 h-14">
        <button onClick={() => setOpen(true)} className="p-2 -ml-2" aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-bold">
          <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">পাইকারি</span>
          <span>69bd</span>
        </div>
        <Link href="/" className="text-xs text-slate-400">দোকানে</Link>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-slate-900 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Desktop fixed sidebar + content */}
      <div className="md:flex">
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 min-h-screen sticky top-0 max-h-screen">
          <Sidebar />
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-7 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}

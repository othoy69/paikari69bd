import { Link, useLocation } from "wouter";
import { Home, Grid3x3, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

export function MobileNav() {
  const [location] = useLocation();
  const { itemCount } = useCart();

  const items = [
    { href: "/", icon: Home, label: "হোম" },
    { href: "/categories", icon: Grid3x3, label: "ক্যাটাগরি" },
    { href: "/cart", icon: ShoppingCart, label: "কার্ট", badge: itemCount },
    { href: "/account", icon: User, label: "আমি" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)] md:hidden shadow-[0_-2px_12px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-orange-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {isActive && <span className="absolute top-0 inset-x-6 h-0.5 bg-orange-600 rounded-b" />}
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

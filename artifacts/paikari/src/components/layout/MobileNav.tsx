import { Link, useLocation } from "wouter";
import { Home, Grid, ShoppingCart, User } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

export function MobileNav() {
  const [location] = useLocation();
  const { itemCount } = useCart();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/categories", icon: Grid, label: "Categories" },
    { href: "/cart", icon: ShoppingCart, label: "Cart", badge: itemCount },
    { href: "/account", icon: User, label: "Account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

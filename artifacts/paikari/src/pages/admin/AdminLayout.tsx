import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const tabs = [
    { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { href: "/admin/products", label: "পণ্য", icon: Package },
    { href: "/admin/orders", label: "অর্ডার", icon: ShoppingBag },
  ];
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> দোকানে ফিরুন
          </Link>
          <div className="font-bold text-primary">পাইকারি69bd.com — অ্যাডমিন</div>
        </div>
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = location === t.href;
            return (
              <Link key={t.href} href={t.href}>
                <div className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                  <Icon className="w-4 h-4" /> {t.label}
                </div>
              </Link>
            );
          })}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

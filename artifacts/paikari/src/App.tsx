import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloating } from "@/components/common/WhatsAppButton";
import { MobileNav } from "@/components/layout/MobileNav";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import Category from "@/pages/Category";
import Search from "@/pages/Search";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Auth from "@/pages/Auth";
import Account from "@/pages/Account";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminSMS from "@/pages/admin/AdminSMS";
import AdminRoles from "@/pages/admin/AdminRoles";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileNav />
      <WhatsAppFloating />
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/sms" component={AdminSMS} />
      <Route path="/admin/roles" component={AdminRoles} />
      <Route>
        <PublicLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/categories" component={Categories} />
            <Route path="/category/:slug" component={Category} />
            <Route path="/search" component={Search} />
            <Route path="/product/:slug" component={Product} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order-success/:orderNo" component={OrderSuccess} />
            <Route path="/auth" component={Auth} />
            <Route path="/account" component={Account} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRouter />
            </WouterRouter>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

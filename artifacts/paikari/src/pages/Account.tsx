import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  useGetMe,
  getGetMeQueryKey,
  useUpdateMe,
  useListMyOrders,
  getListMyOrdersQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { bdt } from "@/lib/format";
import { LogOut, RefreshCw, User as UserIcon, ShoppingBag } from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "প্রক্রিয়াধীন", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "নিশ্চিত", color: "bg-blue-100 text-blue-700" },
  packed: { label: "প্যাক করা হয়েছে", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "শিপড", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "ডেলিভার্ড", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "বাতিল", color: "bg-red-100 text-red-700" },
};

export default function Account() {
  const [, setLocation] = useLocation();
  const { identifier, signOut } = useAuth();
  const { addItem } = useCart();

  if (!identifier) {
    return (
      <div className="container mx-auto px-4 py-16 text-center pb-24">
        <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">লগইন প্রয়োজন</h2>
        <p className="text-sm text-muted-foreground mb-4">আপনার অর্ডার ও প্রোফাইল দেখতে লগইন করুন</p>
        <Link href="/auth"><Button size="lg">লগইন করুন</Button></Link>
      </div>
    );
  }

  const { data: me } = useGetMe(
    { identifier },
    { query: { queryKey: getGetMeQueryKey({ identifier }) } },
  );
  const { data: orders, isLoading: loadingOrders } = useListMyOrders(
    { phone: identifier },
    { query: { queryKey: getListMyOrdersQueryKey({ phone: identifier }) } },
  );
  const updateMe = useUpdateMe();

  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", shopName: "", address: "", district: "",
  });
  useEffect(() => {
    if (me) {
      setProfile({
        name: me.name ?? "",
        email: me.email ?? "",
        phone: me.phone ?? "",
        shopName: me.shopName ?? "",
        address: me.address ?? "",
        district: me.district ?? "",
      });
    }
  }, [me]);

  const onSave = async () => {
    await updateMe.mutateAsync({
      data: { identifier, ...profile },
    });
  };

  const reorder = (items: { productId: string; qty: number }[]) => {
    items.forEach((it) => addItem(it.productId, it.qty));
    setLocation("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">আমার অ্যাকাউন্ট</h1>
        <Button variant="outline" size="sm" onClick={() => { signOut(); setLocation("/"); }}>
          <LogOut className="w-4 h-4 mr-1" /> সাইন আউট
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-card border rounded-2xl p-4 space-y-3">
          <h2 className="font-bold">প্রোফাইল</h2>
          <div className="grid grid-cols-1 gap-3">
            <div><Label>নাম</Label><Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>মোবাইল</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>ইমেইল</Label><Input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>দোকানের নাম</Label><Input value={profile.shopName} onChange={(e) => setProfile((p) => ({ ...p, shopName: e.target.value }))} /></div>
            <div><Label>জেলা</Label><Input value={profile.district} onChange={(e) => setProfile((p) => ({ ...p, district: e.target.value }))} /></div>
            <div><Label>ঠিকানা</Label><Input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} /></div>
          </div>
          <Button onClick={onSave} disabled={updateMe.isPending} className="w-full">
            {updateMe.isPending ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
          </Button>
        </section>

        <section className="bg-card border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">আমার অর্ডার</h2>
            <Badge variant="outline">{orders?.length ?? 0} টি</Badge>
          </div>
          {loadingOrders ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>এখনো কোনো অর্ডার নেই</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {orders.map((o) => {
                const st = STATUS_LABEL[o.status] ?? STATUS_LABEL.pending;
                return (
                  <div key={o.orderNo} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-mono font-semibold text-sm">{o.orderNo}</div>
                        <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-GB")}</div>
                      </div>
                      <Badge className={`${st.color} border-none`}>{st.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{o.items.length} টি পণ্য • <b className="text-primary">{bdt(o.total)}</b></div>
                    <div className="flex gap-2 mt-2">
                      <Link href={`/order-success/${o.orderNo}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">বিস্তারিত</Button>
                      </Link>
                      <Button size="sm" className="flex-1" onClick={() => reorder(o.items.map((i) => ({ productId: i.productId, qty: i.qty })))}>
                        <RefreshCw className="w-3 h-3 mr-1" /> আবার অর্ডার
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

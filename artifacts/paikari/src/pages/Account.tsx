import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  useGetMe,
  getGetMeQueryKey,
  useUpdateMe,
  useListMyOrders,
  getListMyOrdersQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { publicApi, type SavedAddress, type Notification } from "@/lib/publicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { bdt } from "@/lib/format";
import {
  LogOut, RefreshCw, User as UserIcon, ShoppingBag, MapPin, Heart, Bell,
  Plus, Edit2, Trash2, CheckCircle2, BellOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TabKey = "profile" | "orders" | "addresses" | "wishlist" | "notifications";
const TABS: { key: TabKey; label: string; icon: typeof UserIcon }[] = [
  { key: "profile", label: "প্রোফাইল", icon: UserIcon },
  { key: "orders", label: "অর্ডার", icon: ShoppingBag },
  { key: "addresses", label: "ঠিকানা", icon: MapPin },
  { key: "wishlist", label: "উইশলিস্ট", icon: Heart },
  { key: "notifications", label: "নোটিফিকেশন", icon: Bell },
];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "প্রক্রিয়াধীন", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "নিশ্চিত", color: "bg-blue-100 text-blue-700" },
  packed: { label: "প্যাক করা হয়েছে", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "শিপড", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "ডেলিভার্ড", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "বাতিল", color: "bg-red-100 text-red-700" },
};

const DIVISIONS = ["Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"];

export default function Account() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute<{ tab?: TabKey }>("/account/:tab");
  const tab: TabKey = (params?.tab as TabKey) || "profile";
  const { identifier, signOut } = useAuth();

  if (!identifier) {
    return (
      <div className="container mx-auto px-4 py-16 text-center pb-24">
        <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-1">লগইন প্রয়োজন</h2>
        <p className="text-sm text-muted-foreground mb-4">আপনার অ্যাকাউন্ট দেখতে লগইন করুন</p>
        <Link href="/auth"><Button size="lg">লগইন করুন</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 pb-24 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-extrabold">আমার অ্যাকাউন্ট</h1>
        <Button variant="outline" size="sm" onClick={() => { signOut(); setLocation("/"); }}>
          <LogOut className="w-4 h-4 mr-1" /> সাইন আউট
        </Button>
      </div>

      {/* Tab nav */}
      <div className="flex overflow-x-auto gap-1 md:gap-2 border-b mb-4 -mx-3 px-3 md:mx-0 md:px-0">
        {TABS.map((t) => {
          const Ic = t.icon;
          const active = tab === t.key;
          return (
            <Link key={t.key} href={t.key === "profile" ? "/account" : `/account/${t.key}`}>
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Ic className="w-4 h-4" />
                {t.label}
              </button>
            </Link>
          );
        })}
      </div>

      {tab === "profile" && <ProfileTab identifier={identifier} />}
      {tab === "orders" && <OrdersTab identifier={identifier} />}
      {tab === "addresses" && <AddressesTab identifier={identifier} />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "notifications" && <NotificationsTab identifier={identifier} />}
    </div>
  );
}

function ProfileTab({ identifier }: { identifier: string }) {
  const { data: me } = useGetMe(
    { identifier },
    { query: { queryKey: getGetMeQueryKey({ identifier }) } },
  );
  const updateMe = useUpdateMe();
  const { toast } = useToast();

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
    try {
      await updateMe.mutateAsync({ data: { identifier, ...profile } });
      toast({ title: "প্রোফাইল আপডেট হয়েছে" });
    } catch {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-4 max-w-2xl">
      <h2 className="font-bold mb-3">ব্যক্তিগত তথ্য</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><Label>নাম</Label><Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
        <div><Label>মোবাইল</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
        <div><Label>ইমেইল</Label><Input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></div>
        <div><Label>দোকানের নাম</Label><Input value={profile.shopName} onChange={(e) => setProfile((p) => ({ ...p, shopName: e.target.value }))} /></div>
        <div><Label>জেলা</Label><Input value={profile.district} onChange={(e) => setProfile((p) => ({ ...p, district: e.target.value }))} /></div>
        <div className="md:col-span-2"><Label>ঠিকানা</Label><Input value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} /></div>
      </div>
      <Button onClick={onSave} disabled={updateMe.isPending} className="w-full md:w-auto mt-4">
        {updateMe.isPending ? "সংরক্ষণ হচ্ছে..." : "প্রোফাইল আপডেট করুন"}
      </Button>
    </div>
  );
}

function OrdersTab({ identifier }: { identifier: string }) {
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  const { data: orders, isLoading } = useListMyOrders(
    { phone: identifier },
    { query: { queryKey: getListMyOrdersQueryKey({ phone: identifier }) } },
  );
  const reorder = (items: { productId: string; qty: number }[]) => {
    items.forEach((it) => addItem(it.productId, it.qty));
    setLocation("/cart");
  };
  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  }
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 bg-card border rounded-2xl">
        <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>এখনো কোনো অর্ডার নেই</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {orders.map((o) => {
        const st = STATUS_LABEL[o.status] ?? STATUS_LABEL.pending;
        return (
          <div key={o.orderNo} className="bg-card border rounded-xl p-3">
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
  );
}

function AddressesTab({ identifier }: { identifier: string }) {
  const [list, setList] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const { toast } = useToast();

  const empty = useMemo<Omit<SavedAddress, "id">>(() => ({
    label: "বাসা", name: "", phone: "", division: "Dhaka", district: "", area: "", addressLine: "", landmark: "", isDefault: false,
  }), []);
  const [form, setForm] = useState(empty);

  const refresh = () => {
    setLoading(true);
    publicApi.listAddresses(identifier).then(setList).finally(() => setLoading(false));
  };
  useEffect(refresh, [identifier]);

  const startAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (a: SavedAddress) => { setEditing(a); setForm({ ...a }); setOpen(true); };

  const onSave = async () => {
    try {
      if (editing) {
        await publicApi.updateAddress(identifier, editing.id, form);
        toast({ title: "ঠিকানা আপডেট হয়েছে" });
      } else {
        await publicApi.addAddress(identifier, form);
        toast({ title: "ঠিকানা যোগ হয়েছে" });
      }
      setOpen(false);
      refresh();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("এই ঠিকানা মুছবেন?")) return;
    await publicApi.deleteAddress(identifier, id);
    refresh();
  };

  const setDefault = async (a: SavedAddress) => {
    await publicApi.updateAddress(identifier, a.id, { ...a, isDefault: true });
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">{list.length} টি ঠিকানা সংরক্ষিত</div>
        <Button size="sm" onClick={startAdd}><Plus className="w-4 h-4 mr-1" /> নতুন ঠিকানা</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : list.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 bg-card border rounded-2xl">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>এখনো কোনো ঠিকানা সংরক্ষিত নেই</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((a) => (
            <div key={a.id} className={`bg-card border rounded-2xl p-3 ${a.isDefault ? "border-primary" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{a.label}</Badge>
                  {a.isDefault && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px]">ডিফল্ট</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(a)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onDelete(a.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="font-bold text-sm">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.phone}</div>
              <div className="text-xs mt-1">{a.addressLine}, {a.area}, {a.district}, {a.division}</div>
              {a.landmark && <div className="text-xs text-muted-foreground">ল্যান্ডমার্ক: {a.landmark}</div>}
              {!a.isDefault && (
                <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => setDefault(a)}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ডিফল্ট সেট করুন
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b font-bold">{editing ? "ঠিকানা সম্পাদনা" : "নতুন ঠিকানা যোগ"}</div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>লেবেল (যেমন: বাসা / অফিস)</Label><Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} /></div>
              <div><Label>নাম *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>মোবাইল *</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>বিভাগ</Label>
                <Select value={form.division} onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>জেলা *</Label><Input value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} /></div>
              <div className="col-span-2"><Label>থানা/এলাকা *</Label><Input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} /></div>
              <div className="col-span-2"><Label>পূর্ণ ঠিকানা *</Label><Input value={form.addressLine} onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))} /></div>
              <div className="col-span-2"><Label>ল্যান্ডমার্ক</Label><Input value={form.landmark ?? ""} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} /></div>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                ডিফল্ট ঠিকানা হিসেবে সেট করুন
              </label>
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
              <Button onClick={onSave}>সংরক্ষণ করুন</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WishlistTab() {
  const { items, count, remove } = useWishlist();
  const { addItem } = useCart();
  if (count === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 bg-card border rounded-2xl">
        <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>আপনার উইশলিস্ট খালি</p>
        <Link href="/"><Button size="sm" className="mt-3">শপিং শুরু করুন</Button></Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((p) => (
        <div key={p.id} className="bg-card border rounded-2xl overflow-hidden">
          <Link href={`/product/${p.slug}`} className="block aspect-square bg-slate-50">
            <img src={p.image} alt={p.titleBn} className="w-full h-full object-cover" loading="lazy" />
          </Link>
          <div className="p-2.5">
            <Link href={`/product/${p.slug}`} className="text-xs font-bold line-clamp-2 hover:text-primary">{p.titleBn}</Link>
            <div className="text-base font-extrabold text-primary mt-1">{bdt(p.wholesalePrice)}</div>
            <div className="flex gap-1.5 mt-2">
              <Button size="sm" className="flex-1 text-xs" onClick={() => addItem(p.id, p.moq)}>
                <ShoppingBag className="w-3.5 h-3.5 mr-1" /> কার্ট
              </Button>
              <Button variant="outline" size="sm" className="px-2" onClick={() => remove(p.id)}>
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsTab({ identifier }: { identifier: string }) {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    publicApi.listNotifications(identifier).then(setList).finally(() => setLoading(false));
  };
  useEffect(refresh, [identifier]);

  const markAllRead = async () => {
    await publicApi.markNotificationsRead(identifier);
    refresh();
  };
  const del = async (id: string) => {
    await publicApi.deleteNotification(identifier, id);
    refresh();
  };
  const unread = list.filter((n) => !n.read).length;

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  }
  if (list.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 bg-card border rounded-2xl">
        <BellOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>নতুন কোনো নোটিফিকেশন নেই</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">{unread} টি নতুন</div>
        {unread > 0 && <Button size="sm" variant="outline" onClick={markAllRead}>সব পঠিত হিসেবে চিহ্নিত করুন</Button>}
      </div>
      <div className="space-y-2">
        {list.map((n) => (
          <div key={n.id} className={`bg-card border rounded-xl p-3 flex gap-3 ${!n.read ? "border-primary/40 bg-orange-50/30" : ""}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-slate-300" : "bg-primary"}`} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
              <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString("en-GB")}</div>
              {n.href && (
                <Link href={n.href}>
                  <Button variant="link" size="sm" className="px-0 h-6">দেখুন</Button>
                </Link>
              )}
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(n.id)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

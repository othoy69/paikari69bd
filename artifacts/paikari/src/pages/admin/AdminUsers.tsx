import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { bdt } from "@/lib/format";
import { Search, Phone, MessageCircle, ShoppingBag, MapPin, Crown } from "lucide-react";

type UserRow = {
  phone: string;
  name: string;
  email?: string;
  shopName?: string;
  district?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  pendingOrders: number;
  deliveredOrders: number;
  addressCount: number;
  wishlistCount: number;
  isRegistered: boolean;
  createdAt?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "registered" | "guest" | "vip">("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchTerm =
        !term ||
        u.phone.toLowerCase().includes(term) ||
        u.name.toLowerCase().includes(term) ||
        (u.shopName ?? "").toLowerCase().includes(term) ||
        (u.district ?? "").toLowerCase().includes(term);
      const matchFilter =
        filter === "all"
          ? true
          : filter === "registered"
          ? u.isRegistered
          : filter === "guest"
          ? !u.isRegistered
          : u.totalSpent >= 10000;
      return matchTerm && matchFilter;
    });
  }, [users, q, filter]);

  const totals = useMemo(() => ({
    total: users.length,
    registered: users.filter((u) => u.isRegistered).length,
    vip: users.filter((u) => u.totalSpent >= 10000).length,
    revenue: users.reduce((s, u) => s + u.totalSpent, 0),
  }), [users]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">কাস্টমার ম্যানেজমেন্ট</h1>
        <div className="text-xs text-muted-foreground">মোট রেভিনিউ: <b className="text-primary">{bdt(totals.revenue)}</b></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="মোট কাস্টমার" value={totals.total} />
        <StatCard label="রেজিস্টার্ড" value={totals.registered} />
        <StatCard label="গেস্ট অর্ডার" value={totals.total - totals.registered} />
        <StatCard label="VIP (১০হাজার+)" value={totals.vip} />
      </div>

      <div className="bg-card border rounded-2xl p-3 mb-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ফোন, নাম, দোকান বা এলাকা দিয়ে খুঁজুন"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "registered", "guest", "vip"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === "all" ? "সব" : f === "registered" ? "রেজিস্টার্ড" : f === "guest" ? "গেস্ট" : "VIP"}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">কোনো কাস্টমার পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">কাস্টমার</th>
                  <th className="px-3 py-2 font-medium">যোগাযোগ</th>
                  <th className="px-3 py-2 font-medium">এলাকা</th>
                  <th className="px-3 py-2 font-medium text-right">অর্ডার</th>
                  <th className="px-3 py-2 font-medium text-right">মোট ক্রয়</th>
                  <th className="px-3 py-2 font-medium">শেষ অর্ডার</th>
                  <th className="px-3 py-2 font-medium">দ্রুত কাজ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((u) => (
                  <tr key={u.phone} className="hover:bg-muted/30 align-top">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                          {(u.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            {u.name}
                            {u.totalSpent >= 10000 && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {u.isRegistered ? (
                              <Badge variant="outline" className="text-[10px] h-4 bg-emerald-50 text-emerald-700 border-emerald-200">রেজিস্টার্ড</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] h-4">গেস্ট</Badge>
                            )}
                            {u.shopName && <span className="text-[10px] text-muted-foreground line-clamp-1">{u.shopName}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div className="font-mono">{u.phone}</div>
                      {u.email && <div className="text-muted-foreground">{u.email}</div>}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" />{u.district ?? "—"}</div>
                      <div className="text-muted-foreground mt-0.5">{u.addressCount} ঠিকানা • {u.wishlistCount} উইশ</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="font-bold">{u.orderCount}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {u.pendingOrders > 0 && <span className="text-amber-600">{u.pendingOrders} প্রক্রিয়াধীন</span>}
                        {u.pendingOrders > 0 && u.deliveredOrders > 0 && " • "}
                        {u.deliveredOrders > 0 && <span className="text-emerald-600">{u.deliveredOrders} ডেলিভার্ড</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-primary">{bdt(u.totalSpent)}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {u.lastOrderAt ? new Date(u.lastOrderAt).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <a href={`tel:${u.phone}`} className="inline-flex items-center justify-center w-7 h-7 rounded-md border bg-white hover:bg-blue-50 text-blue-600">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/88${u.phone.replace(/\D/g, "").slice(-11)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md border bg-white hover:bg-emerald-50 text-emerald-600"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border rounded-2xl p-3">
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

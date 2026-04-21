import { useGetAdminStats } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { bdt } from "@/lib/format";
import { ShoppingBag, Package, DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pending: "প্রক্রিয়াধীন",
  confirmed: "নিশ্চিত",
  packed: "প্যাক",
  shipped: "শিপড",
  delivered: "ডেলিভার্ড",
  cancelled: "বাতিল",
};

export default function AdminDashboard() {
  const { data, isLoading } = useGetAdminStats();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">ড্যাশবোর্ড</h1>
      {isLoading || !data ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatCard icon={ShoppingBag} label="মোট অর্ডার" value={data.totalOrders.toString()} accent="text-primary bg-primary/10" />
            <StatCard icon={Clock} label="প্রক্রিয়াধীন" value={data.pendingOrders.toString()} accent="text-amber-600 bg-amber-100" />
            <StatCard icon={DollarSign} label="মোট রেভিনিউ" value={bdt(data.totalRevenue)} accent="text-emerald-600 bg-emerald-100" />
            <StatCard icon={Package} label="মোট পণ্য" value={data.totalProducts.toString()} accent="text-blue-600 bg-blue-100" />
            <StatCard icon={AlertCircle} label="স্টক কম" value={data.lowStockCount.toString()} accent="text-destructive bg-destructive/10" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <section className="bg-card border rounded-2xl p-4">
              <h2 className="font-bold mb-3">সাম্প্রতিক অর্ডার</h2>
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">এখনো কোনো অর্ডার নেই</p>
              ) : (
                <div className="space-y-2">
                  {data.recentOrders.map((o) => (
                    <div key={o.orderNo} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                      <div>
                        <div className="font-mono font-semibold">{o.orderNo}</div>
                        <div className="text-xs text-muted-foreground">{o.address?.name} • {o.items.length} টি</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{bdt(o.total)}</div>
                        <Badge variant="outline" className="text-xs">{STATUS_LABEL[o.status] ?? o.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-card border rounded-2xl p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> টপ পণ্য</h2>
              <div className="space-y-2">
                {data.topProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 text-sm border-b last:border-0 pb-2">
                    <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="line-clamp-1 font-medium">{p.titleBn}</div>
                      <div className="text-xs text-muted-foreground">{p.sold} বিক্রি • স্টক: {p.stock}</div>
                    </div>
                    <div className="font-bold text-primary">{bdt(p.wholesalePrice)}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent} mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

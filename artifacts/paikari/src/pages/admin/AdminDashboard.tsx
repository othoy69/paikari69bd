import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, PageHeader, StatCard, StatusBadge, EmptyState } from "./_ui";
import { adminApi } from "@/lib/adminApi";
import { bdt } from "@/lib/format";
import {
  ShoppingBag,
  CalendarDays,
  Clock,
  DollarSign,
  AlertTriangle,
  Package,
  Users,
  Star,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.dashboard,
    refetchInterval: 30000,
  });

  return (
    <AdminLayout>
      <PageHeader
        title="ড্যাশবোর্ড"
        desc="আপনার পাইকারি ব্যবসার লাইভ ওভারভিউ"
      />

      {isLoading || !data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <StatCard icon={ShoppingBag} label="মোট অর্ডার" value={data.totalOrders.toString()} tone="orange" />
            <StatCard icon={CalendarDays} label="আজকের অর্ডার" value={data.todayOrders.toString()} hint={bdt(data.todayRevenue)} tone="blue" />
            <StatCard icon={Clock} label="পেন্ডিং অর্ডার" value={data.pendingOrders.toString()} tone="amber" />
            <StatCard icon={DollarSign} label="মোট রেভিনিউ" value={bdt(data.totalRevenue)} tone="emerald" />
            <StatCard icon={AlertTriangle} label="পেমেন্ট পেন্ডিং" value={data.pendingPaymentCount.toString()} hint={bdt(data.pendingPaymentAmount)} tone="red" />
            <StatCard icon={Package} label="স্টক কম" value={data.lowStockCount.toString()} hint={`${data.totalProducts} মোট পণ্য`} tone="purple" />
            <StatCard icon={Users} label="মোট কাস্টমার" value={data.totalCustomers.toString()} tone="slate" />
            <StatCard icon={Star} label="মোট রিভিউ" value={data.totalReviews.toString()} hint={`${data.pendingReviews} পেন্ডিং`} tone="amber" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card
              title="সাম্প্রতিক অর্ডার"
              right={<Link href="/admin/orders" className="text-xs font-bold text-orange-600 flex items-center gap-0.5 hover:underline">সব দেখুন <ChevronRight className="w-3 h-3" /></Link>}
              className="lg:col-span-2"
            >
              {data.recentOrders.length === 0 ? (
                <EmptyState message="এখনো কোনো অর্ডার নেই" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentOrders.map((o) => (
                    <div key={o.orderNo} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-slate-900">{o.orderNo}</div>
                        <div className="text-xs text-slate-600 truncate">{o.address?.name} • {o.items.length} টি পণ্য</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="font-extrabold text-slate-900 tabular-nums text-sm">{bdt(o.total)}</div>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card
              title="স্টক কম পণ্য"
              right={<Link href="/admin/inventory" className="text-xs font-bold text-orange-600 flex items-center gap-0.5 hover:underline">ম্যানেজ <ChevronRight className="w-3 h-3" /></Link>}
            >
              {data.lowStockProducts.length === 0 ? (
                <EmptyState message="সব পণ্যের স্টক ভালো" />
              ) : (
                <div className="space-y-2">
                  {data.lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-2.5">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">{p.titleBn}</div>
                        <div className="text-[11px] text-red-600 font-semibold">মাত্র {p.stock} পিস বাকি</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

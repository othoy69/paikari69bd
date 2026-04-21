import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListOrders,
  getAdminListOrdersQueryKey,
  useAdminUpdateOrderStatus,
} from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { bdt } from "@/lib/format";

const STATUS_OPTIONS = [
  { v: "pending", l: "প্রক্রিয়াধীন", c: "bg-amber-100 text-amber-700" },
  { v: "confirmed", l: "নিশ্চিত", c: "bg-blue-100 text-blue-700" },
  { v: "packed", l: "প্যাক করা হয়েছে", c: "bg-purple-100 text-purple-700" },
  { v: "shipped", l: "শিপড", c: "bg-indigo-100 text-indigo-700" },
  { v: "delivered", l: "ডেলিভার্ড", c: "bg-emerald-100 text-emerald-700" },
  { v: "cancelled", l: "বাতিল", c: "bg-red-100 text-red-700" },
] as const;

const PAYMENT_LABEL: Record<string, string> = {
  bkash: "বিকাশ", nagad: "নগদ", rocket: "রকেট", bank: "ব্যাংক", cod: "ক্যাশ অন ডেলিভারি",
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useAdminListOrders();
  const updateStatus = useAdminUpdateOrderStatus();

  const onChange = async (orderNo: string, status: string) => {
    await updateStatus.mutateAsync({ orderNo, data: { status: status as never } });
    qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">অর্ডার ম্যানেজমেন্ট</h1>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">এখনো কোনো অর্ডার নেই</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">অর্ডার নং</th>
                  <th className="px-3 py-2 font-medium">কাস্টমার</th>
                  <th className="px-3 py-2 font-medium">পেমেন্ট</th>
                  <th className="px-3 py-2 font-medium text-right">মোট</th>
                  <th className="px-3 py-2 font-medium">তারিখ</th>
                  <th className="px-3 py-2 font-medium">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => {
                  const opt = STATUS_OPTIONS.find((s) => s.v === o.status);
                  return (
                    <tr key={o.orderNo} className="hover:bg-muted/30 align-top">
                      <td className="px-3 py-3">
                        <div className="font-mono font-semibold">{o.orderNo}</div>
                        <div className="text-xs text-muted-foreground">{o.items.length} টি পণ্য</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{o.address?.name}</div>
                        <div className="text-xs text-muted-foreground">{o.address?.phone}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{o.address?.area}, {o.address?.district}</div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod}</Badge>
                        {o.txnRef && <div className="text-xs text-muted-foreground mt-1 font-mono">{o.txnRef}</div>}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-primary">{bdt(o.total)}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB")}</td>
                      <td className="px-3 py-3">
                        <Select value={o.status} onValueChange={(v) => onChange(o.orderNo, v)}>
                          <SelectTrigger className={`w-40 ${opt?.c ?? ""}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

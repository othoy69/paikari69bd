import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListOrders,
  getAdminListOrdersQueryKey,
  useAdminUpdateOrderStatus,
  type Order,
} from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { bdt } from "@/lib/format";
import { adminApi } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, MessageCircle, Phone, X, StickyNote, Wallet, Send } from "lucide-react";

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

const PAYMENT_STATUS = [
  { v: "unpaid", l: "অপরিশোধিত", c: "bg-slate-100 text-slate-700" },
  { v: "pending", l: "যাচাইকরণ", c: "bg-amber-100 text-amber-700" },
  { v: "paid", l: "পরিশোধিত", c: "bg-emerald-100 text-emerald-700" },
  { v: "failed", l: "ব্যর্থ", c: "bg-red-100 text-red-700" },
  { v: "refunded", l: "ফেরত", c: "bg-purple-100 text-purple-700" },
] as const;

type AnyOrder = Order & {
  paymentStatus?: string;
  txnRef?: string;
  internalNotes?: { id: string; text: string; author: string; createdAt: string }[];
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useAdminListOrders();
  const updateStatus = useAdminUpdateOrderStatus();
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [drawer, setDrawer] = useState<AnyOrder | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ((orders as AnyOrder[]) ?? []).filter((o) => {
      const matchTerm =
        !term ||
        o.orderNo.toLowerCase().includes(term) ||
        (o.address?.name ?? "").toLowerCase().includes(term) ||
        (o.address?.phone ?? "").toLowerCase().includes(term) ||
        (o.address?.district ?? "").toLowerCase().includes(term) ||
        (o.txnRef ?? "").toLowerCase().includes(term);
      const matchStatus = statusFilter === "all" ? true : o.status === statusFilter;
      const matchPayment = paymentFilter === "all" ? true : (o.paymentStatus ?? "unpaid") === paymentFilter;
      return matchTerm && matchStatus && matchPayment;
    });
  }, [orders, q, statusFilter, paymentFilter]);

  const onChangeStatus = async (orderNo: string, status: string) => {
    await updateStatus.mutateAsync({ orderNo, data: { status: status as never } });
    qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
  };

  const refreshOrders = () => qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });

  const stats = useMemo(() => {
    const list = (orders as AnyOrder[]) ?? [];
    return {
      total: list.length,
      pending: list.filter((o) => o.status === "pending").length,
      shipped: list.filter((o) => o.status === "shipped").length,
      pendingPayment: list.filter((o) => (o.paymentStatus ?? "unpaid") !== "paid" && o.paymentMethod !== "cod").length,
    };
  }, [orders]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">অর্ডার ম্যানেজমেন্ট</h1>
        <div className="text-xs text-muted-foreground">
          মোট: <b>{stats.total}</b> • প্রক্রিয়াধীন: <b className="text-amber-600">{stats.pending}</b> • শিপড: <b className="text-indigo-600">{stats.shipped}</b> • অপরিশোধিত: <b className="text-red-600">{stats.pendingPayment}</b>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-3 mb-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="অর্ডার নং, ফোন, নাম, এলাকা বা TXN দিয়ে খুঁজুন"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="সব স্ট্যাটাস" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="সব পেমেন্ট" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব পেমেন্ট</SelectItem>
            {PAYMENT_STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</div>
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
                  <th className="px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((o) => {
                  const opt = STATUS_OPTIONS.find((s) => s.v === o.status);
                  const ps = PAYMENT_STATUS.find((s) => s.v === (o.paymentStatus ?? "unpaid"))!;
                  return (
                    <tr key={o.orderNo} className="hover:bg-muted/30 align-top">
                      <td className="px-3 py-3">
                        <div className="font-mono font-semibold">{o.orderNo}</div>
                        <div className="text-xs text-muted-foreground">{o.items.length} টি পণ্য</div>
                        {o.internalNotes && o.internalNotes.length > 0 && (
                          <div className="text-[10px] text-amber-700 mt-0.5 flex items-center gap-1">
                            <StickyNote className="w-3 h-3" /> {o.internalNotes.length} নোট
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{o.address?.name}</div>
                        <div className="text-xs text-muted-foreground">{o.address?.phone}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{o.address?.area}, {o.address?.district}</div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod}</Badge>
                        <div className="mt-1"><Badge className={`${ps.c} border-none text-[10px]`}>{ps.l}</Badge></div>
                        {o.txnRef && <div className="text-xs text-muted-foreground mt-1 font-mono">{o.txnRef}</div>}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-primary">{bdt(o.total)}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB")}</td>
                      <td className="px-3 py-3">
                        <Select value={o.status} onValueChange={(v) => onChangeStatus(o.orderNo, v)}>
                          <SelectTrigger className={`w-40 ${opt?.c ?? ""}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-3">
                        <Button size="icon" variant="ghost" onClick={() => setDrawer(o)} aria-label="বিস্তারিত">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawer && (
        <OrderDrawer
          order={drawer}
          onClose={() => setDrawer(null)}
          onChanged={() => { refreshOrders(); }}
          onToast={(t) => toast(t)}
          onReload={async () => {
            // refetch just this order via the list
            await qc.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
            const fresh = (qc.getQueryData(getAdminListOrdersQueryKey()) as AnyOrder[] | undefined)?.find((x) => x.orderNo === drawer.orderNo);
            if (fresh) setDrawer(fresh);
          }}
        />
      )}
    </AdminLayout>
  );
}

function OrderDrawer({
  order, onClose, onChanged, onToast, onReload,
}: {
  order: AnyOrder;
  onClose: () => void;
  onChanged: () => void;
  onToast: (t: { title: string; variant?: "default" | "destructive" }) => void;
  onReload: () => Promise<void>;
}) {
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus ?? "unpaid");
  const [txnRef, setTxnRef] = useState(order.txnRef ?? "");
  const [noteText, setNoteText] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const savePayment = async () => {
    setSavingPayment(true);
    try {
      await adminApi.setOrderPayment(order.orderNo, { paymentStatus, txnRef });
      onToast({ title: "পেমেন্ট আপডেট হয়েছে" });
      await onReload();
      onChanged();
    } catch (e) {
      onToast({ title: e instanceof Error ? e.message : "সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSavingPayment(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await adminApi.addOrderNote(order.orderNo, { text: noteText.trim(), author: "Admin" });
      setNoteText("");
      onToast({ title: "নোট যোগ হয়েছে" });
      await onReload();
      onChanged();
    } catch (e) {
      onToast({ title: e instanceof Error ? e.message : "সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white w-full max-w-xl h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
          <div>
            <div className="font-mono font-bold">{order.orderNo}</div>
            <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("en-GB")}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Customer */}
          <section className="bg-slate-50 border rounded-xl p-3">
            <div className="text-xs font-bold text-muted-foreground mb-1">কাস্টমার</div>
            <div className="font-bold">{order.address?.name}</div>
            <div className="text-sm">{order.address?.phone}</div>
            <div className="text-sm text-muted-foreground">{order.address?.addressLine}, {order.address?.area}, {order.address?.district}</div>
            <div className="flex gap-1 mt-2">
              <a href={`tel:${order.address?.phone}`} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-white hover:bg-blue-50 text-blue-600"><Phone className="w-3 h-3" /> কল</a>
              <a href={`https://wa.me/88${(order.address?.phone ?? "").replace(/\D/g, "").slice(-11)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-white hover:bg-emerald-50 text-emerald-600"><MessageCircle className="w-3 h-3" /> WhatsApp</a>
            </div>
          </section>

          {/* Items */}
          <section>
            <div className="text-xs font-bold text-muted-foreground mb-2">পণ্য ({order.items.length})</div>
            <div className="space-y-2">
              {order.items.map((it, i) => {
                const item = it as typeof it & { unit?: string };
                return (
                  <div key={i} className="flex items-center justify-between border rounded-lg p-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium line-clamp-1">{item.titleBn}</div>
                      <div className="text-xs text-muted-foreground">{item.qty} {item.unit ?? "pc"} × {bdt(item.unitPrice)}</div>
                    </div>
                    <div className="font-bold whitespace-nowrap">{bdt(item.lineTotal)}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>সাবটোটাল</span><span>{bdt(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>ডেলিভারি</span><span>{bdt(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>মোট</span><span className="text-primary">{bdt(order.total)}</span></div>
            </div>
          </section>

          {/* Payment management */}
          <section className="border rounded-xl p-3 bg-blue-50/30">
            <div className="flex items-center gap-1 mb-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold">পেমেন্ট ম্যানেজমেন্ট</span>
            </div>
            <div className="text-xs text-muted-foreground mb-2">পদ্ধতি: <Badge variant="outline">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</Badge></div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="TXN রেফারেন্স" value={txnRef} onChange={(e) => setTxnRef(e.target.value)} />
            </div>
            <Button onClick={savePayment} disabled={savingPayment} className="w-full mt-2" size="sm">
              {savingPayment ? "সংরক্ষণ..." : "পেমেন্ট আপডেট করুন"}
            </Button>
          </section>

          {/* Internal notes */}
          <section className="border rounded-xl p-3 bg-amber-50/40">
            <div className="flex items-center gap-1 mb-2">
              <StickyNote className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-bold">আভ্যন্তরীণ নোট</span>
            </div>
            <div className="space-y-2 mb-2 max-h-48 overflow-y-auto">
              {(order.internalNotes ?? []).length === 0 ? (
                <div className="text-xs text-muted-foreground">এখনো কোনো নোট নেই</div>
              ) : (
                (order.internalNotes ?? []).map((n) => (
                  <div key={n.id} className="bg-white border rounded-lg p-2 text-xs">
                    <div className="font-medium text-slate-700 whitespace-pre-wrap">{n.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">— {n.author} • {new Date(n.createdAt).toLocaleString("en-GB")}</div>
                  </div>
                ))
              )}
            </div>
            <Textarea
              rows={2}
              placeholder="নতুন নোট যোগ করুন..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="mb-2 text-sm"
            />
            <Button onClick={addNote} disabled={savingNote || !noteText.trim()} size="sm" className="w-full">
              <Send className="w-3.5 h-3.5 mr-1" /> {savingNote ? "যোগ হচ্ছে..." : "নোট যোগ করুন"}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

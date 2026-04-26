import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, PageHeader, StatusBadge, EmptyState } from "./_ui";
import { adminApi, type InventoryItem } from "@/lib/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { bdt } from "@/lib/format";
import { Search, Plus, Minus, AlertTriangle, History, X, Boxes } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  in: "স্টক ইন",
  out: "স্টক আউট",
  damaged: "ক্ষতিগ্রস্ত",
  adjust: "সমন্বয়",
};

export default function AdminInventory() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-inventory"], queryFn: adminApi.listInventory });
  const { data: logs } = useQuery({ queryKey: ["admin-stocklogs"], queryFn: adminApi.listStockLogs });
  const log = useMutation({
    mutationFn: adminApi.inventoryLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      qc.invalidateQueries({ queryKey: ["admin-stocklogs"] });
    },
  });

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "reorder" | "ok">("all");
  const [drawer, setDrawer] = useState<InventoryItem | null>(null);

  const list = (data ?? []).filter((p) => {
    if (q && !p.titleBn.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "low" && !p.lowStock) return false;
    if (filter === "reorder" && !p.reorder) return false;
    if (filter === "ok" && p.lowStock) return false;
    return true;
  });

  return (
    <AdminLayout>
      <PageHeader
        title="স্টক ম্যানেজমেন্ট"
        desc="বর্তমান স্টক, লো-স্টক অ্যালার্ট, পারচেজ কস্ট, রিঅর্ডার পয়েন্ট"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <SummaryTile label="মোট পণ্য" value={(data ?? []).length} tone="bg-slate-900" />
        <SummaryTile label="লো স্টক" value={(data ?? []).filter((p) => p.lowStock).length} tone="bg-amber-500" />
        <SummaryTile label="রিঅর্ডার দরকার" value={(data ?? []).filter((p) => p.reorder).length} tone="bg-red-600" />
        <SummaryTile label="স্বাস্থ্যকর" value={(data ?? []).filter((p) => !p.lowStock).length} tone="bg-emerald-600" />
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "all", l: "সব" },
              { v: "low", l: "লো স্টক" },
              { v: "reorder", l: "রিঅর্ডার" },
              { v: "ok", l: "ভালো" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => setFilter(t.v as never)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  filter === t.v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="পণ্য সার্চ..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState message="কোনো পণ্য নেই" />
        ) : (
          <div className="overflow-x-auto -mx-4 md:-mx-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 md:px-5 py-2 font-bold">পণ্য</th>
                  <th className="px-3 py-2 font-bold text-right">স্টক</th>
                  <th className="px-3 py-2 font-bold text-right">কেনা দাম</th>
                  <th className="px-3 py-2 font-bold text-right">বিক্রি দাম</th>
                  <th className="px-3 py-2 font-bold text-right">মার্জিন</th>
                  <th className="px-3 md:px-5 py-2 font-bold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-3 md:px-5 py-3">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 line-clamp-1">{p.titleBn}</div>
                          <div className="text-[11px] text-slate-500">MOQ: {p.moq} {p.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className={`font-extrabold tabular-nums ${p.reorder ? "text-red-600" : p.lowStock ? "text-amber-600" : "text-slate-900"}`}>
                        {p.stock}
                      </div>
                      {p.reorder ? (
                        <StatusBadge status="failed" label="রিঅর্ডার" />
                      ) : p.lowStock ? (
                        <StatusBadge status="pending" label="লো" />
                      ) : (
                        <StatusBadge status="approved" label="OK" />
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-600">{bdt(p.purchaseCost)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-bold text-slate-900">{bdt(p.wholesalePrice)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">{p.margin}%</span>
                    </td>
                    <td className="px-3 md:px-5 py-3 text-right">
                      <button
                        onClick={() => setDrawer(p)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      >
                        <Boxes className="w-3 h-3" /> স্টক আপডেট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="স্টক লগ" right={<History className="w-4 h-4 text-slate-400" />} className="mt-4">
        {(logs ?? []).length === 0 ? (
          <EmptyState message="এখনো কোনো স্টক লগ নেই" />
        ) : (
          <div className="overflow-x-auto -mx-4 md:-mx-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 md:px-5 py-2 font-bold">পণ্য</th>
                  <th className="px-3 py-2 font-bold">টাইপ</th>
                  <th className="px-3 py-2 font-bold text-right">পরিমাণ</th>
                  <th className="px-3 py-2 font-bold text-right">আগে → পরে</th>
                  <th className="px-3 py-2 font-bold">নোট</th>
                  <th className="px-3 md:px-5 py-2 font-bold text-right">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(logs ?? []).slice(0, 30).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="px-3 md:px-5 py-2.5 font-medium text-slate-900 max-w-[200px] truncate">{l.productTitleBn}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={l.type} label={TYPE_LABEL[l.type]} /></td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold">{l.qty}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{l.beforeStock} → <b className="text-slate-900">{l.afterStock}</b></td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">{l.note ?? "—"}</td>
                    <td className="px-3 md:px-5 py-2.5 text-right text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {drawer && (
        <StockDrawer
          item={drawer}
          onClose={() => setDrawer(null)}
          onSubmit={(body) => {
            log.mutate(body, { onSuccess: () => setDrawer(null) });
          }}
          submitting={log.isPending}
        />
      )}
    </AdminLayout>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${tone} text-white flex items-center justify-center font-extrabold`}>
        {value}
      </div>
      <div>
        <div className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function StockDrawer({
  item,
  onClose,
  onSubmit,
  submitting,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSubmit: (body: { productId: string; type: "in" | "out" | "damaged" | "adjust"; qty: number; note?: string }) => void;
  submitting: boolean;
}) {
  const [type, setType] = useState<"in" | "out" | "damaged" | "adjust">("in");
  const [qty, setQty] = useState(10);
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full md:w-96 md:h-full md:max-h-screen rounded-t-2xl md:rounded-none p-5 overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        <h3 className="font-extrabold text-slate-900 mb-1">স্টক আপডেট</h3>
        <p className="text-xs text-slate-600 line-clamp-2">{item.titleBn}</p>
        <div className="text-[11px] text-slate-500 mt-1">বর্তমান স্টক: <b className="text-slate-900">{item.stock} {item.unit}</b></div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">টাইপ</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "in", l: "স্টক ইন", icon: Plus, c: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { v: "out", l: "স্টক আউট", icon: Minus, c: "bg-amber-50 text-amber-700 border-amber-200" },
                { v: "damaged", l: "ক্ষতিগ্রস্ত", icon: AlertTriangle, c: "bg-red-50 text-red-700 border-red-200" },
                { v: "adjust", l: "সমন্বয়", icon: Boxes, c: "bg-blue-50 text-blue-700 border-blue-200" },
              ].map((t) => {
                const Icon = t.icon;
                const active = type === t.v;
                return (
                  <button
                    key={t.v}
                    onClick={() => setType(t.v as never)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      active ? `${t.c} ring-2 ring-offset-1` : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {t.l}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">
              {type === "adjust" ? "নতুন স্টক (সম্পূর্ণ)" : "পরিমাণ"}
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">নোট (অপশনাল)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="যেমন: সাপ্লায়ার থেকে নতুন লট, ক্ষতিগ্রস্ত প্যাকেট..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
            />
          </div>
          <button
            disabled={submitting || !qty}
            onClick={() => onSubmit({ productId: item.id, type, qty, note: note || undefined })}
            className="w-full px-4 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, PageHeader, StatusBadge, EmptyState } from "./_ui";
import { adminApi, type Review } from "@/lib/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Check, X, Trash2, Phone, Search } from "lucide-react";

const TABS = [
  { v: "all", l: "সব" },
  { v: "pending", l: "পেন্ডিং" },
  { v: "approved", l: "অনুমোদিত" },
  { v: "rejected", l: "প্রত্যাখ্যাত" },
] as const;

export default function AdminReviews() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reviews"], queryFn: adminApi.listReviews });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Review> }) => adminApi.updateReview(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
  const del = useMutation({
    mutationFn: adminApi.deleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const [tab, setTab] = useState<(typeof TABS)[number]["v"]>("all");
  const [q, setQ] = useState("");

  const list = (data ?? []).filter((r) => {
    if (tab !== "all" && r.status !== tab) return false;
    if (q && !`${r.customerName} ${r.text} ${r.productTitleBn ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <PageHeader title="রিভিউ ম্যানেজ" desc="অনুমোদন, প্রত্যাখ্যান, ফিচার্ড টগল ও রিভিউ মুছুন" />

      <Card>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => {
              const count = (data ?? []).filter((r) => t.v === "all" || r.status === t.v).length;
              return (
                <button
                  key={t.v}
                  onClick={() => setTab(t.v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    tab === t.v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {t.l} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="relative md:ml-auto md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="রিভিউ বা কাস্টমার সার্চ..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState message="কোনো রিভিউ নেই" />
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r.id} className="border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-900 text-sm">{r.customerName}</span>
                      <StatusBadge status={r.status} />
                      {r.featured && <StatusBadge status="approved" label="ফিচার্ড" />}
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                    {r.productTitleBn && (
                      <div className="text-[11px] text-slate-500 mb-1">পণ্য: {r.productTitleBn}</div>
                    )}
                    <p className="text-sm text-slate-700 leading-relaxed">{r.text}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      {r.customerPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{r.customerPhone}</span>}
                      <span>{new Date(r.createdAt).toLocaleString("en-GB")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => update.mutate({ id: r.id, body: { status: "approved" } })}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Check className="w-3 h-3" /> অনুমোদন
                    </button>
                    <button
                      onClick={() => update.mutate({ id: r.id, body: { status: "rejected" } })}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                    >
                      <X className="w-3 h-3" /> প্রত্যাখ্যান
                    </button>
                    <button
                      onClick={() => update.mutate({ id: r.id, body: { featured: !r.featured } })}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${
                        r.featured ? "bg-yellow-100 text-yellow-700 border-yellow-300" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Star className="w-3 h-3" /> {r.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("রিভিউটি মুছবেন?")) del.mutate(r.id);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                    >
                      <Trash2 className="w-3 h-3" /> মুছুন
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AdminLayout>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, PageHeader, StatusBadge, EmptyState } from "./_ui";
import { adminApi, type PaymentSettings, type Settings } from "@/lib/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { bdt } from "@/lib/format";
import { CreditCard, Save, Eye, EyeOff, Wallet, Phone, AlertCircle } from "lucide-react";

const METHODS = [
  { v: "bkash", l: "বিকাশ", c: "bg-pink-100 text-pink-700 border-pink-300" },
  { v: "nagad", l: "নগদ", c: "bg-orange-100 text-orange-700 border-orange-300" },
  { v: "rocket", l: "রকেট", c: "bg-purple-100 text-purple-700 border-purple-300" },
  { v: "bank", l: "ব্যাংক ট্রান্সফার", c: "bg-blue-100 text-blue-700 border-blue-300" },
  { v: "cod", l: "ক্যাশ অন ডেলিভারি", c: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { v: "uddoktapay", l: "UddoktaPay গেটওয়ে", c: "bg-indigo-100 text-indigo-700 border-indigo-300" },
] as const;

export default function AdminPayments() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery<Settings>({ queryKey: ["admin-settings"], queryFn: adminApi.getSettings });
  const { data: txns } = useQuery({ queryKey: ["admin-transactions"], queryFn: adminApi.listTransactions });

  const [draft, setDraft] = useState<PaymentSettings | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (settings && !draft) setDraft(JSON.parse(JSON.stringify(settings.payment)));
  }, [settings, draft]);

  const save = useMutation({
    mutationFn: adminApi.savePayment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const updateTxn = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: string; note?: string } }) =>
      adminApi.updateTransaction(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-transactions"] }),
  });

  if (isLoading || !draft) {
    return <AdminLayout><Skeleton className="h-96 rounded-2xl" /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <PageHeader
        title="পেমেন্ট সেটিংস"
        desc="UddoktaPay গেটওয়ে, ম্যানুয়াল মোবাইল ব্যাংকিং, ক্যাশ অন ডেলিভারি এবং ট্রানজেকশন লগ"
        right={
          <button
            onClick={() => save.mutate(draft)}
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {save.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="পেমেন্ট মেথড" className="lg:col-span-1">
          <div className="space-y-2">
            {METHODS.map((m) => {
              const on = draft.enabledMethods[m.v] ?? false;
              return (
                <label key={m.v} className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border cursor-pointer hover:bg-slate-50 ${m.c}`}>
                  <span className="text-xs font-bold">{m.l}</span>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) =>
                      setDraft({ ...draft, enabledMethods: { ...draft.enabledMethods, [m.v]: e.target.checked } })
                    }
                    className="w-4 h-4 accent-slate-900"
                  />
                </label>
              );
            })}
          </div>
        </Card>

        <Card title="UddoktaPay গেটওয়ে" right={
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <span className={draft.uddoktapay.mode === "live" ? "text-emerald-700" : "text-amber-700"}>
              {draft.uddoktapay.mode === "live" ? "LIVE" : "TEST"}
            </span>
            <button
              onClick={() =>
                setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, mode: draft.uddoktapay.mode === "live" ? "test" : "live" } })
              }
              className={`relative w-9 h-5 rounded-full transition-colors ${draft.uddoktapay.mode === "live" ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${draft.uddoktapay.mode === "live" ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </label>
        } className="lg:col-span-2">
          <div className="space-y-3">
            <Field label="API Base URL">
              <input
                value={draft.uddoktapay.apiBaseUrl}
                onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, apiBaseUrl: e.target.value } })}
                className="input"
              />
            </Field>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="API Key">
                <input
                  value={draft.uddoktapay.apiKey}
                  onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, apiKey: e.target.value } })}
                  placeholder="UDPAY-XXXXXXXX"
                  className="input font-mono text-xs"
                />
              </Field>
              <Field label="Secret Key">
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={draft.uddoktapay.secretKey}
                    onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, secretKey: e.target.value } })}
                    placeholder="••••••••••••"
                    className="input pr-9 font-mono text-xs"
                  />
                  <button
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    type="button"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <Field label="Webhook URL">
                <input
                  value={draft.uddoktapay.webhookUrl}
                  onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, webhookUrl: e.target.value } })}
                  className="input text-xs"
                />
              </Field>
              <Field label="Success URL">
                <input
                  value={draft.uddoktapay.successUrl}
                  onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, successUrl: e.target.value } })}
                  className="input text-xs"
                />
              </Field>
              <Field label="Cancel URL">
                <input
                  value={draft.uddoktapay.cancelUrl}
                  onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, cancelUrl: e.target.value } })}
                  className="input text-xs"
                />
              </Field>
            </div>
            <Field label="IPN URL">
              <input
                value={draft.uddoktapay.ipnUrl}
                onChange={(e) => setDraft({ ...draft, uddoktapay: { ...draft.uddoktapay, ipnUrl: e.target.value } })}
                className="input text-xs"
              />
            </Field>

            {!draft.uddoktapay.apiKey && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <b>API Key বসানো হয়নি।</b> UddoktaPay সাইট থেকে API Key ও Secret Key নিয়ে এখানে বসান। তারপর Live মোডে চালু করুন।
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="ম্যানুয়াল পেমেন্ট নম্বর" className="mt-4">
        <div className="grid md:grid-cols-2 gap-3">
          <Field label="বিকাশ মার্চেন্ট নম্বর">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={draft.manualNumbers.bkash}
                onChange={(e) => setDraft({ ...draft, manualNumbers: { ...draft.manualNumbers, bkash: e.target.value } })}
                className="input pl-9"
              />
            </div>
          </Field>
          <Field label="নগদ মার্চেন্ট নম্বর">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={draft.manualNumbers.nagad}
                onChange={(e) => setDraft({ ...draft, manualNumbers: { ...draft.manualNumbers, nagad: e.target.value } })}
                className="input pl-9"
              />
            </div>
          </Field>
          <Field label="রকেট মার্চেন্ট নম্বর">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={draft.manualNumbers.rocket}
                onChange={(e) => setDraft({ ...draft, manualNumbers: { ...draft.manualNumbers, rocket: e.target.value } })}
                className="input pl-9"
              />
            </div>
          </Field>
          <Field label="ব্যাংক ইনফো">
            <textarea
              value={draft.manualNumbers.bankInfo}
              onChange={(e) => setDraft({ ...draft, manualNumbers: { ...draft.manualNumbers, bankInfo: e.target.value } })}
              rows={2}
              className="input"
            />
          </Field>
        </div>
      </Card>

      <Card title="ট্রানজেকশন লগ" right={<Wallet className="w-4 h-4 text-slate-400" />} className="mt-4">
        {(txns ?? []).length === 0 ? (
          <EmptyState message="এখনো কোনো ট্রানজেকশন নেই — পেমেন্ট কনফার্ম হলে এখানে দেখা যাবে" />
        ) : (
          <div className="overflow-x-auto -mx-4 md:-mx-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 md:px-5 py-2 font-bold">অর্ডার / রেফ</th>
                  <th className="px-3 py-2 font-bold">মেথড</th>
                  <th className="px-3 py-2 font-bold text-right">পরিমাণ</th>
                  <th className="px-3 py-2 font-bold">কাস্টমার</th>
                  <th className="px-3 py-2 font-bold">স্ট্যাটাস</th>
                  <th className="px-3 md:px-5 py-2 font-bold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(txns ?? []).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-3 md:px-5 py-2.5">
                      <div className="font-mono font-bold text-xs text-slate-900">{t.orderNo ?? "—"}</div>
                      {t.reference && <div className="text-[11px] text-slate-500 font-mono">{t.reference}</div>}
                    </td>
                    <td className="px-3 py-2.5"><span className="text-xs font-bold uppercase">{t.method}</span></td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-extrabold text-slate-900">{bdt(t.amount)}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">{t.payerPhone ?? "—"}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={t.status} /></td>
                    <td className="px-3 md:px-5 py-2.5 text-right">
                      {t.status === "pending" ? (
                        <button
                          onClick={() => updateTxn.mutate({ id: t.id, body: { status: "success" } })}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                        >
                          ভেরিফাই
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString("en-GB")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <style>{`.input{ width:100%; padding:0.55rem 0.75rem; font-size: 0.85rem; border:1px solid #e2e8f0; border-radius:0.5rem; background:white; outline:none; transition:border-color .15s }.input:focus{ border-color: #0f172a; }`}</style>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

// silence unused
void CreditCard;

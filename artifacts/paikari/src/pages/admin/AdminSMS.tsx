import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, PageHeader, StatusBadge, EmptyState } from "./_ui";
import { adminApi, type SmsSettings, type Settings, type SmsTemplateKey } from "@/lib/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Send, Eye, EyeOff, MessageSquare, AlertCircle } from "lucide-react";

const TPL_LABEL: Record<SmsTemplateKey, string> = {
  otp: "OTP কোড",
  orderConfirm: "অর্ডার কনফার্মেশন",
  paymentConfirm: "পেমেন্ট কনফার্মেশন",
  shipped: "অর্ডার শিপড",
  delivered: "অর্ডার ডেলিভার্ড",
  cancelled: "অর্ডার বাতিল",
};

export default function AdminSMS() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery<Settings>({ queryKey: ["admin-settings"], queryFn: adminApi.getSettings });
  const { data: logs } = useQuery({ queryKey: ["admin-sms-logs"], queryFn: adminApi.listSmsLogs });
  const [draft, setDraft] = useState<SmsSettings | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [testTo, setTestTo] = useState("01700-000069");
  const [testTpl, setTestTpl] = useState<SmsTemplateKey | "custom">("orderConfirm");
  const [testText, setTestText] = useState("");

  useEffect(() => {
    if (settings && !draft) setDraft(JSON.parse(JSON.stringify(settings.sms)));
  }, [settings, draft]);

  const save = useMutation({
    mutationFn: adminApi.saveSms,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });
  const send = useMutation({
    mutationFn: adminApi.sendSms,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-sms-logs"] }),
  });

  if (isLoading || !draft) return <AdminLayout><Skeleton className="h-96 rounded-2xl" /></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader
        title="SMS গেটওয়ে সেটিংস"
        desc="OTP, অর্ডার কনফার্মেশন, ডেলিভারি আপডেট ও কাস্টম SMS"
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

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="API কনফিগারেশন" right={
          <label className="inline-flex items-center gap-2 text-xs font-bold">
            <span className={draft.mode === "live" ? "text-emerald-700" : "text-amber-700"}>{draft.mode === "live" ? "LIVE" : "TEST"}</span>
            <button
              onClick={() => setDraft({ ...draft, mode: draft.mode === "live" ? "test" : "live" })}
              className={`relative w-9 h-5 rounded-full ${draft.mode === "live" ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${draft.mode === "live" ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </label>
        }>
          <div className="space-y-3">
            <Field label="প্রোভাইডার">
              <select
                value={draft.provider}
                onChange={(e) => setDraft({ ...draft, provider: e.target.value })}
                className="input"
              >
                <option>BulkSMSBD</option>
                <option>SMS Net BD</option>
                <option>MIM SMS</option>
                <option>Adn SMS</option>
                <option>Custom HTTP</option>
              </select>
            </Field>
            <Field label="API URL">
              <input value={draft.apiUrl} onChange={(e) => setDraft({ ...draft, apiUrl: e.target.value })} className="input text-xs" />
            </Field>
            <Field label="API Key">
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={draft.apiKey}
                  onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                  placeholder="••••••••••••"
                  className="input pr-9 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Field label="Sender ID / Mask">
              <input value={draft.senderId} onChange={(e) => setDraft({ ...draft, senderId: e.target.value })} className="input" />
            </Field>
            {!draft.apiKey && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>API Key দেওয়া হয়নি। Test মোডে SMS শুধু লগে যাবে, প্রকৃত ফোনে যাবে না।</div>
              </div>
            )}
          </div>
        </Card>

        <Card title="টেস্ট SMS পাঠান" right={<MessageSquare className="w-4 h-4 text-slate-400" />}>
          <div className="space-y-3">
            <Field label="মোবাইল নম্বর">
              <input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="017XX-XXXXXX" className="input" />
            </Field>
            <Field label="টেমপ্লেট">
              <select value={testTpl} onChange={(e) => setTestTpl(e.target.value as never)} className="input">
                {(Object.keys(TPL_LABEL) as SmsTemplateKey[]).map((k) => (
                  <option key={k} value={k}>{TPL_LABEL[k]}</option>
                ))}
                <option value="custom">কাস্টম টেক্সট</option>
              </select>
            </Field>
            {testTpl === "custom" && (
              <Field label="মেসেজ">
                <textarea value={testText} onChange={(e) => setTestText(e.target.value)} rows={3} className="input" />
              </Field>
            )}
            <button
              onClick={() =>
                send.mutate({
                  to: testTo,
                  template: testTpl,
                  text: testTpl === "custom" ? testText : undefined,
                  vars: { code: "1234", orderNo: "PKR-12345", total: "5800" },
                })
              }
              disabled={send.isPending || !testTo}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {send.isPending ? "পাঠানো হচ্ছে..." : "টেস্ট পাঠান"}
            </button>
          </div>
        </Card>
      </div>

      <Card title="SMS টেমপ্লেট" className="mt-4">
        <div className="space-y-3">
          {(Object.keys(TPL_LABEL) as SmsTemplateKey[]).map((k) => (
            <div key={k} className="border border-slate-200 rounded-lg p-3 hover:border-slate-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-extrabold text-slate-900">{TPL_LABEL[k]}</div>
                <div className="text-[10px] text-slate-500">{(draft.templates[k] ?? "").length} অক্ষর</div>
              </div>
              <textarea
                rows={2}
                value={draft.templates[k] ?? ""}
                onChange={(e) => setDraft({ ...draft, templates: { ...draft.templates, [k]: e.target.value } })}
                className="input text-sm font-medium"
              />
              <div className="text-[10px] text-slate-500 mt-1">ভেরিয়েবল: <code>{"{code}"}</code> <code>{"{orderNo}"}</code> <code>{"{total}"}</code></div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="SMS লগ" className="mt-4">
        {(logs ?? []).length === 0 ? (
          <EmptyState message="এখনো কোনো SMS পাঠানো হয়নি" />
        ) : (
          <div className="overflow-x-auto -mx-4 md:-mx-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 md:px-5 py-2 font-bold">প্রাপক</th>
                  <th className="px-3 py-2 font-bold">টেমপ্লেট</th>
                  <th className="px-3 py-2 font-bold">মেসেজ</th>
                  <th className="px-3 py-2 font-bold">স্ট্যাটাস</th>
                  <th className="px-3 md:px-5 py-2 font-bold text-right">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(logs ?? []).slice(0, 30).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="px-3 md:px-5 py-2.5 font-mono text-xs">{l.to}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {(TPL_LABEL as Record<string, string>)[l.template] ?? l.template}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 max-w-xs line-clamp-2">{l.text}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={l.status} /></td>
                    <td className="px-3 md:px-5 py-2.5 text-right text-xs text-slate-500">{new Date(l.createdAt).toLocaleString("en-GB")}</td>
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

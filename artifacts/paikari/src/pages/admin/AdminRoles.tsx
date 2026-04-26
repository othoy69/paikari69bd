import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, PageHeader } from "./_ui";
import { adminApi, type AdminRole, type Settings } from "@/lib/adminApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, UserPlus, Trash2, Save, Crown, Package, Boxes, Headphones } from "lucide-react";

const ROLE_ICON: Record<string, React.ElementType> = {
  super_admin: Crown,
  order_manager: Package,
  inventory_manager: Boxes,
  support: Headphones,
};
const ROLE_TONE: Record<string, string> = {
  super_admin: "from-orange-500 to-red-500",
  order_manager: "from-blue-500 to-indigo-600",
  inventory_manager: "from-emerald-500 to-teal-600",
  support: "from-purple-500 to-fuchsia-600",
};

export default function AdminRoles() {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery<Settings>({ queryKey: ["admin-settings"], queryFn: adminApi.getSettings });
  const [draft, setDraft] = useState<AdminRole[] | null>(null);

  useEffect(() => {
    if (settings && !draft) setDraft(JSON.parse(JSON.stringify(settings.roles)));
  }, [settings, draft]);

  const save = useMutation({
    mutationFn: (roles: AdminRole[]) => adminApi.saveRoles({ roles }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  if (isLoading || !draft) return <AdminLayout><Skeleton className="h-96 rounded-2xl" /></AdminLayout>;

  const addMember = (idx: number) => {
    const name = prompt("সদস্যের নাম:");
    if (!name) return;
    const phone = prompt("ফোন নম্বর (অপশনাল):") || undefined;
    const next = [...draft];
    next[idx] = { ...next[idx], members: [...next[idx].members, { name, phone }] };
    setDraft(next);
  };
  const removeMember = (idx: number, mIdx: number) => {
    const next = [...draft];
    next[idx] = { ...next[idx], members: next[idx].members.filter((_, i) => i !== mIdx) };
    setDraft(next);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="রোল ও অনুমতি"
        desc="অ্যাডমিন প্যানেলে কে কী করতে পারবে — রোল ও সদস্য ম্যানেজ করুন"
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

      <div className="grid md:grid-cols-2 gap-4">
        {draft.map((role, idx) => {
          const Icon = ROLE_ICON[role.key] ?? ShieldCheck;
          const tone = ROLE_TONE[role.key] ?? "from-slate-700 to-slate-900";
          return (
            <Card key={role.key}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center text-white shadow`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-slate-900">{role.nameBn}</div>
                  <div className="text-[11px] font-mono text-slate-500">{role.key}</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">অনুমতি</div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((p, i) => (
                    <span key={i} className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{p}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">সদস্য ({role.members.length})</div>
                  <button
                    onClick={() => addMember(idx)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900"
                  >
                    <UserPlus className="w-3 h-3" /> সদস্য যোগ
                  </button>
                </div>
                {role.members.length === 0 ? (
                  <div className="text-xs text-slate-400 italic">কোনো সদস্য নেই</div>
                ) : (
                  <div className="space-y-1.5">
                    {role.members.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{m.name}</div>
                          {m.phone && <div className="text-[11px] text-slate-500 font-mono">{m.phone}</div>}
                        </div>
                        <button
                          onClick={() => removeMember(idx, mIdx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <b>UI প্রিভিউ:</b> বর্তমানে সব অ্যাডমিন রুটে সম্পূর্ণ অ্যাক্সেস আছে। ভবিষ্যতে অথেন্টিকেশন চালু হলে এই রোলগুলো অনুযায়ী পেইজ-লেভেল পারমিশন প্রয়োগ করা যাবে।
        </div>
      </div>
    </AdminLayout>
  );
}

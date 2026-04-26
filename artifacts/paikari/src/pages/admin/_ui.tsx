import { type LucideIcon } from "lucide-react";

export const STATUS_LABEL: Record<string, string> = {
  pending: "প্রক্রিয়াধীন",
  confirmed: "নিশ্চিত",
  packed: "প্যাক",
  shipped: "শিপড",
  delivered: "ডেলিভার্ড",
  cancelled: "বাতিল",
  unpaid: "অপেক্ষমাণ",
  paid: "পেইড",
  refunded: "ফেরত",
  failed: "ব্যর্থ",
  approved: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
  success: "সফল",
  in: "স্টক ইন",
  out: "স্টক আউট",
  damaged: "ক্ষতিগ্রস্ত",
  adjust: "সমন্বয়",
  queued: "কিউতে",
  sent: "প্রেরিত",
};

const TONE: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
};

const STATUS_TONE: Record<string, keyof typeof TONE> = {
  pending: "amber",
  confirmed: "blue",
  packed: "purple",
  shipped: "blue",
  delivered: "green",
  cancelled: "red",
  unpaid: "amber",
  paid: "green",
  refunded: "slate",
  failed: "red",
  approved: "green",
  rejected: "red",
  success: "green",
  in: "green",
  out: "amber",
  damaged: "red",
  adjust: "blue",
  queued: "amber",
  sent: "green",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = TONE[STATUS_TONE[status] ?? "slate"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${tone}`}
    >
      {label ?? STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PageHeader({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">{title}</h1>
        {desc && <p className="text-xs md:text-sm text-slate-600 mt-0.5">{desc}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "slate",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "orange" | "emerald" | "amber" | "red" | "blue" | "slate" | "purple";
}) {
  const TONES = {
    orange: "from-orange-500 to-red-500 text-white",
    emerald: "from-emerald-500 to-teal-600 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    red: "from-red-500 to-rose-600 text-white",
    blue: "from-blue-500 to-indigo-600 text-white",
    slate: "from-slate-700 to-slate-900 text-white",
    purple: "from-purple-500 to-fuchsia-600 text-white",
  } as const;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TONES[tone]} flex items-center justify-center mb-3 shadow`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{value}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}

export function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {(title || right) && (
        <div className="px-4 md:px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
          {title && <h2 className="font-bold text-slate-900 text-sm md:text-base">{title}</h2>}
          {right}
        </div>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="text-center text-sm text-slate-500 py-10">{message}</div>;
}

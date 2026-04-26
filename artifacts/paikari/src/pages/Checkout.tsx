import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useListProducts,
  useCreateOrder,
} from "@workspace/api-client-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStorefrontSettings } from "@/contexts/SettingsContext";
import { publicApi } from "@/lib/publicApi";
import { pixel } from "@/lib/pixel";
import { bdt, calcUnitPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Lock, MessageCircle, Loader2 } from "lucide-react";
import { WhatsAppOrderCta } from "@/components/common/WhatsAppOrderCta";

const DIVISIONS = [
  "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi",
  "Barishal", "Rangpur", "Mymensingh",
];

const PAYMENTS = [
  { id: "bkash", labelBn: "বিকাশ", color: "bg-pink-50 text-pink-700 border-pink-200", brand: "#E2136E" },
  { id: "nagad", labelBn: "নগদ", color: "bg-orange-50 text-orange-700 border-orange-200", brand: "#F7931E" },
  { id: "rocket", labelBn: "রকেট", color: "bg-purple-50 text-purple-700 border-purple-200", brand: "#8C3494" },
  { id: "bank", labelBn: "ব্যাংক ট্রান্সফার", color: "bg-blue-50 text-blue-700 border-blue-200", brand: "#1d4ed8" },
  { id: "cod", labelBn: "ক্যাশ অন ডেলিভারি", color: "bg-emerald-50 text-emerald-700 border-emerald-200", brand: "#059669" },
] as const;

type PayId = typeof PAYMENTS[number]["id"];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, clear } = useCart();
  const { identifier } = useAuth();
  const { storefront } = useStorefrontSettings();
  const { data: allProducts } = useListProducts();
  const createOrder = useCreateOrder();
  const [gatewayLoading, setGatewayLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: identifier && /^[0-9+\-\s]+$/.test(identifier) ? identifier : "",
    shopName: "",
    division: "Dhaka",
    district: "",
    area: "",
    addressLine: "",
    landmark: "",
  });
  const [payment, setPayment] = useState<PayId>("cod");
  const [txnRef, setTxnRef] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(() => {
    if (!allProducts) return [];
    return items
      .map((it) => {
        const product = allProducts.find((p) => p.id === it.productId);
        if (!product) return null;
        const unitPrice = calcUnitPrice(product.tiers, it.qty);
        return { ...it, product, unitPrice, lineTotal: unitPrice * it.qty };
      })
      .filter(Boolean) as Array<{
        productId: string; qty: number;
        product: NonNullable<ReturnType<typeof allProducts.find>>;
        unitPrice: number; lineTotal: number;
      }>;
  }, [items, allProducts]);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = form.division === "Dhaka" ? 60 : 130;
  const total = subtotal + shipping;

  // Fire InitiateCheckout once when entering checkout with items
  useEffect(() => {
    if (lines.length > 0) {
      pixel.initiateCheckout({
        value: total,
        num_items: lines.reduce((s, l) => s + l.qty, 0),
        content_ids: lines.map((l) => l.productId),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center pb-24">
        <h2 className="text-xl font-bold mb-2">কার্ট খালি</h2>
        <Link href="/"><Button>হোমে ফিরুন</Button></Link>
      </div>
    );
  }

  const updateField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const runGateway = async (orderNo: string): Promise<{ ok: boolean; ref?: string; status?: string }> => {
    if (payment === "bkash") {
      setGatewayLoading(true);
      try {
        const c = await publicApi.bkashCreate({ amount: total, orderNo, payerPhone: form.phone });
        // sandbox: auto-execute
        const ex = await publicApi.bkashExecute({ paymentID: c.paymentID });
        return { ok: ex.transactionStatus === "Completed", ref: ex.trxID, status: ex.transactionStatus };
      } catch (e) {
        setError(e instanceof Error ? e.message : "বিকাশ পেমেন্ট ব্যর্থ");
        return { ok: false };
      } finally {
        setGatewayLoading(false);
      }
    }
    if (payment === "nagad") {
      setGatewayLoading(true);
      try {
        const init = await publicApi.nagadInitialize({ amount: total, orderNo, payerPhone: form.phone });
        const done = await publicApi.nagadComplete({ paymentReferenceId: init.sensitiveData.paymentReferenceId });
        return { ok: done.status === "Success", ref: done.issuerPaymentRefNo, status: done.status };
      } catch (e) {
        setError(e instanceof Error ? e.message : "নগদ পেমেন্ট ব্যর্থ");
        return { ok: false };
      } finally {
        setGatewayLoading(false);
      }
    }
    return { ok: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.phone || !form.district || !form.area || !form.addressLine) {
      setError("অনুগ্রহ করে সকল প্রয়োজনীয় ঘর পূরণ করুন");
      return;
    }
    // For rocket/bank, manual TrxID still required
    if ((payment === "rocket" || payment === "bank") && !txnRef) {
      setError("পেমেন্টের লেনদেন নাম্বার (TrxID) দিন");
      return;
    }
    try {
      // Generate a temporary order reference for gateway flow
      const tempOrderNo = `TMP-${Date.now()}`;
      let finalTxnRef = txnRef;
      if (payment === "bkash" || payment === "nagad") {
        const g = await runGateway(tempOrderNo);
        if (!g.ok) {
          if (!error) setError("পেমেন্ট সম্পন্ন হয়নি, আবার চেষ্টা করুন");
          return;
        }
        finalTxnRef = g.ref ?? "";
      }
      const res = await createOrder.mutateAsync({
        data: {
          items: items.map((it) => ({ productId: it.productId, qty: it.qty })),
          address: {
            name: form.name,
            phone: form.phone,
            shopName: form.shopName || undefined,
            division: form.division,
            district: form.district,
            area: form.area,
            addressLine: form.addressLine,
            landmark: form.landmark || undefined,
          },
          paymentMethod: payment,
          txnRef: finalTxnRef || undefined,
          note: note || undefined,
          userIdentifier: identifier ?? form.phone,
        },
      });
      pixel.purchase({
        value: total,
        num_items: lines.reduce((s, l) => s + l.qty, 0),
        content_ids: lines.map((l) => l.productId),
        orderNo: res.orderNo,
      });
      clear();
      setLocation(`/order-success/${res.orderNo}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "অর্ডার করতে সমস্যা হয়েছে");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-4 py-4 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold mb-4">চেকআউট</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card border rounded-2xl p-4 space-y-3">
            <h2 className="font-bold">ডেলিভারি ঠিকানা</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>আপনার নাম *</Label>
                <Input value={form.name} onChange={updateField("name")} placeholder="পূর্ণ নাম" />
              </div>
              <div>
                <Label>মোবাইল নাম্বার *</Label>
                <Input value={form.phone} onChange={updateField("phone")} placeholder="017XXXXXXXX" />
              </div>
              <div>
                <Label>দোকানের নাম (ঐচ্ছিক)</Label>
                <Input value={form.shopName} onChange={updateField("shopName")} placeholder="যেমন: হাসান স্টোর" />
              </div>
              <div>
                <Label>বিভাগ *</Label>
                <Select value={form.division} onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>জেলা *</Label>
                <Input value={form.district} onChange={updateField("district")} placeholder="যেমন: ঢাকা" />
              </div>
              <div>
                <Label>থানা/এলাকা *</Label>
                <Input value={form.area} onChange={updateField("area")} placeholder="যেমন: মিরপুর" />
              </div>
              <div className="md:col-span-2">
                <Label>ঠিকানা *</Label>
                <Input value={form.addressLine} onChange={updateField("addressLine")} placeholder="বাসা / রোড নং, এলাকা" />
              </div>
              <div className="md:col-span-2">
                <Label>ল্যান্ডমার্ক (ঐচ্ছিক)</Label>
                <Input value={form.landmark} onChange={updateField("landmark")} placeholder="পরিচিত স্থাপনার নাম" />
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-4 space-y-3">
            <h2 className="font-bold">পেমেন্ট মাধ্যম</h2>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as PayId)} className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PAYMENTS.map((p) => (
                <Label
                  key={p.id}
                  htmlFor={`pay-${p.id}`}
                  className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-2 transition-all ${
                    payment === p.id ? p.color + " border-current" : "border-border"
                  }`}
                >
                  <RadioGroupItem id={`pay-${p.id}`} value={p.id} />
                  <span className="font-semibold text-sm">{p.labelBn}</span>
                </Label>
              ))}
            </RadioGroup>

            {(payment === "bkash" || payment === "nagad") && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm space-y-2">
                <div className="font-semibold text-emerald-900">
                  {payment === "bkash" ? "বিকাশ" : "নগদ"} স্যান্ডবক্স পেমেন্ট
                </div>
                <div className="text-emerald-800">
                  "অর্ডার নিশ্চিত করুন" বাটনে চাপলে {payment === "bkash" ? "বিকাশ" : "নগদ"} পেমেন্ট প্রক্রিয়া স্বয়ংক্রিয়ভাবে সম্পন্ন হবে।
                  পরিমাণ: <b>{bdt(total)}</b>
                </div>
                <div className="text-xs text-emerald-700">
                  উৎপাদনে যাওয়ার পর এটি প্রকৃত {payment === "bkash" ? "bKash" : "Nagad"} pop-up এ পরিবর্তিত হবে।
                </div>
              </div>
            )}
            {(payment === "rocket" || payment === "bank") && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm space-y-2">
                <div className="font-semibold text-amber-900">পেমেন্ট নির্দেশনা</div>
                <div className="text-amber-800">
                  নিচের নাম্বারে <b>{bdt(total)}</b> Send Money করুন:
                </div>
                <div className="bg-white rounded-md p-2 font-mono text-base font-bold text-center">
                  {storefront.merchantPhone} ({PAYMENTS.find((x) => x.id === payment)?.labelBn})
                </div>
                <div>
                  <Label>লেনদেন নাম্বার (TrxID) *</Label>
                  <Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} placeholder="যেমন: 9AB1CD2E3F" />
                </div>
              </div>
            )}
            {payment === "cod" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-900">
                পণ্য বুঝে নেওয়ার সময় ডেলিভারি ম্যানকে টাকা পরিশোধ করবেন।
              </div>
            )}
          </section>

          <section className="bg-card border rounded-2xl p-4 space-y-2">
            <Label>অর্ডার নোট (ঐচ্ছিক)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশনা" />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-4 space-y-3 sticky top-20">
            <h3 className="font-bold">আপনার অর্ডার ({lines.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lines.map((l) => (
                <div key={l.productId} className="flex gap-2 text-sm">
                  <img src={l.product.image} alt="" className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 font-medium">{l.product.titleBn}</div>
                    <div className="text-xs text-muted-foreground">{l.qty} × {bdt(l.unitPrice)}</div>
                  </div>
                  <div className="font-semibold">{bdt(l.lineTotal)}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>সাবটোটাল</span><span>{bdt(subtotal)}</span></div>
              <div className="flex justify-between"><span>ডেলিভারি ({form.division})</span><span>{bdt(shipping)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>মোট পেমেন্ট</span>
                <span className="text-primary">{bdt(total)}</span>
              </div>
            </div>
            {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
            <Button type="submit" size="lg" className="w-full" disabled={createOrder.isPending || gatewayLoading}>
              {gatewayLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              {gatewayLoading
                ? `${payment === "bkash" ? "বিকাশ" : "নগদ"} পেমেন্ট প্রসেসিং...`
                : createOrder.isPending
                ? "অর্ডার করছি..."
                : `অর্ডার নিশ্চিত করুন • ${bdt(total)}`}
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">অথবা</span></div>
            </div>

            <WhatsAppOrderCta
              items={lines.map((l) => ({
                titleBn: l.product.titleBn,
                qty: l.qty,
                unit: l.product.unit,
                unitPrice: l.unitPrice,
                lineTotal: l.lineTotal,
              }))}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              customerName={form.name}
              customerPhone={form.phone}
              shopName={form.shopName}
              district={form.district}
              area={form.area}
              addressLine={form.addressLine}
              note={note}
              source="checkout"
              className="w-full"
              size="lg"
              label="WhatsApp এ অর্ডার পাঠান"
            />
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> নিরাপদ ও সুরক্ষিত পেমেন্ট
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

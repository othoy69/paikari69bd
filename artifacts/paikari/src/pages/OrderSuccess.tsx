import { useRoute, Link } from "wouter";
import {
  useGetOrder,
  getGetOrderQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { bdt } from "@/lib/format";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";

export default function OrderSuccess() {
  const [, params] = useRoute("/order-success/:orderNo");
  const orderNo = params?.orderNo ?? "";
  const { data: order, isLoading } = useGetOrder(orderNo, {
    query: { enabled: !!orderNo, queryKey: getGetOrderQueryKey(orderNo) },
  });

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full max-w-xl mx-auto rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center mb-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-emerald-900 mb-1">অর্ডার সফল হয়েছে!</h1>
        <p className="text-emerald-800 text-sm">আপনার অর্ডারটি গ্রহণ করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।</p>
        <div className="mt-3 inline-block bg-white px-4 py-2 rounded-lg font-mono font-bold text-emerald-900">
          {order.orderNo}
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-4 mb-4">
        <h2 className="font-bold mb-3">অর্ডার সারাংশ</h2>
        <div className="space-y-2">
          {order.items.map((it, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <img src={it.image} alt="" className="w-14 h-14 rounded object-cover" />
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{it.titleBn}</div>
                <div className="text-xs text-muted-foreground">{it.qty} × {bdt(it.unitPrice)}</div>
              </div>
              <div className="font-semibold">{bdt(it.lineTotal)}</div>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>সাবটোটাল</span><span>{bdt(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>ডেলিভারি</span><span>{bdt(order.shipping)}</span></div>
          {order.savings ? (
            <div className="flex justify-between text-emerald-600"><span>পাইকারি সাশ্রয়</span><span>{bdt(order.savings)}</span></div>
          ) : null}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>মোট</span><span className="text-primary">{bdt(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-4 mb-4">
        <h2 className="font-bold mb-3">পরবর্তী ধাপ</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-2"><Package className="w-4 h-4" /></div>
            <div>
              <div className="font-semibold">প্রক্রিয়াকরণ</div>
              <div className="text-muted-foreground">আমরা শীঘ্রই আপনার অর্ডার কনফার্ম করব ফোনে।</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-2"><Truck className="w-4 h-4" /></div>
            <div>
              <div className="font-semibold">ডেলিভারি</div>
              <div className="text-muted-foreground">{order.address.division === "Dhaka" ? "১-২ দিনে" : "২-৪ দিনে"} ডেলিভারি হবে।</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/" className="flex-1"><Button variant="outline" className="w-full"><Home className="w-4 h-4 mr-1" />হোমে ফিরুন</Button></Link>
        <Link href="/account" className="flex-1"><Button className="w-full">অর্ডার দেখুন</Button></Link>
      </div>
    </div>
  );
}

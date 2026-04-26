import { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { StorefrontSettings } from "@/lib/publicApi";
import { Save, Globe, MessageCircle, Activity } from "lucide-react";

const DEFAULT: StorefrontSettings = {
  whatsappNumber: "8801872888954",
  whatsappDisplay: "01872-888954",
  merchantPhone: "01700-000069",
  facebookPixelId: "",
  fbPageUrl: "https://facebook.com/paikari69bd",
  facebookAppId: "",
  metaSiteVerify: "",
  googleAnalyticsId: "",
  enabledTracking: {
    pixel: true,
    pageView: true,
    addToCart: true,
    initiateCheckout: true,
    purchase: true,
    whatsappClick: true,
  },
};

export default function AdminStorefront() {
  const [s, setS] = useState<StorefrontSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((all: { storefront?: StorefrontSettings }) => {
        if (all.storefront) {
          setS({ ...DEFAULT, ...all.storefront, enabledTracking: { ...DEFAULT.enabledTracking, ...(all.storefront.enabledTracking ?? {}) } });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/storefront", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "সেটিংস সংরক্ষিত হয়েছে" });
    } catch {
      toast({ title: "সংরক্ষণে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Skeleton className="h-72 w-full" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">স্টোরফ্রন্ট ও ট্র্যাকিং সেটিংস</h1>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-1" /> {saving ? "সংরক্ষণ..." : "সংরক্ষণ করুন"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Contact / WhatsApp */}
        <section className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold">যোগাযোগ ও WhatsApp</h2>
          </div>
          <div className="space-y-3">
            <div>
              <Label>WhatsApp নাম্বার (আন্তর্জাতিক ফরম্যাট, যেমন 8801872888954)</Label>
              <Input value={s.whatsappNumber} onChange={(e) => setS((p) => ({ ...p, whatsappNumber: e.target.value }))} />
            </div>
            <div>
              <Label>WhatsApp প্রদর্শনী নাম্বার (যেমন 01872-888954)</Label>
              <Input value={s.whatsappDisplay} onChange={(e) => setS((p) => ({ ...p, whatsappDisplay: e.target.value }))} />
            </div>
            <div>
              <Label>মার্চেন্ট ফোন (পেমেন্ট নাম্বার)</Label>
              <Input value={s.merchantPhone} onChange={(e) => setS((p) => ({ ...p, merchantPhone: e.target.value }))} />
            </div>
            <div>
              <Label>Facebook পেজ URL</Label>
              <Input value={s.fbPageUrl} onChange={(e) => setS((p) => ({ ...p, fbPageUrl: e.target.value }))} />
            </div>
          </div>
        </section>

        {/* Facebook Pixel */}
        <section className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-[#1877F2]" />
            <h2 className="font-bold">Facebook Pixel ট্র্যাকিং</h2>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Pixel ID</Label>
              <Input
                placeholder="যেমন: 123456789012345"
                value={s.facebookPixelId}
                onChange={(e) => setS((p) => ({ ...p, facebookPixelId: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Meta Events Manager থেকে নিন। সংরক্ষণের পর সাইট রিফ্রেশ করুন।</p>
            </div>
            <div>
              <Label>Facebook App ID (ঐচ্ছিক)</Label>
              <Input value={s.facebookAppId ?? ""} onChange={(e) => setS((p) => ({ ...p, facebookAppId: e.target.value }))} />
            </div>
            <div>
              <Label>Meta Domain Verification কোড (ঐচ্ছিক)</Label>
              <Input value={s.metaSiteVerify ?? ""} onChange={(e) => setS((p) => ({ ...p, metaSiteVerify: e.target.value }))} />
            </div>
            <div>
              <Label>Google Analytics ID (ঐচ্ছিক, যেমন G-XXXX)</Label>
              <Input value={s.googleAnalyticsId ?? ""} onChange={(e) => setS((p) => ({ ...p, googleAnalyticsId: e.target.value }))} />
            </div>
          </div>
        </section>

        {/* Tracking events toggles */}
        <section className="lg:col-span-2 bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold">ইভেন্ট ট্র্যাকিং চালু/বন্ধ</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {([
              ["pixel", "Facebook Pixel চালু"],
              ["pageView", "PageView ইভেন্ট"],
              ["addToCart", "AddToCart ইভেন্ট"],
              ["initiateCheckout", "InitiateCheckout ইভেন্ট"],
              ["purchase", "Purchase ইভেন্ট"],
              ["whatsappClick", "WhatsApp Click ইভেন্ট"],
            ] as const).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between border rounded-lg px-3 py-2.5">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={s.enabledTracking[k]}
                  onCheckedChange={(v) => setS((p) => ({ ...p, enabledTracking: { ...p.enabledTracking, [k]: Boolean(v) } }))}
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

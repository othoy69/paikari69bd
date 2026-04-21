import { useState } from "react";
import { useLocation } from "wouter";
import {
  useRequestOtp,
  useVerifyOtp,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Phone, Mail, ShieldCheck } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { setIdentifier } = useAuth();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [identifier, setId] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();

  const onRequest = async () => {
    setError(null);
    if (!identifier) {
      setError(tab === "phone" ? "মোবাইল নাম্বার দিন" : "ইমেইল দিন");
      return;
    }
    try {
      const res = await requestOtp.mutateAsync({ data: { identifier } });
      setDevOtp(res.devOtp ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP পাঠাতে সমস্যা হয়েছে");
    }
  };

  const onVerify = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError("৬ ডিজিটের OTP দিন");
      return;
    }
    try {
      await verifyOtp.mutateAsync({ data: { identifier, otp, name: name || undefined } });
      setIdentifier(identifier);
      setLocation("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP মেলেনি");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 pb-24 max-w-md">
      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold">লগইন বা রেজিস্টার</h1>
          <p className="text-sm text-muted-foreground">পাইকারি দাম দেখতে ও অর্ডার করতে লগইন করুন</p>
        </div>

        {step === "identifier" && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "phone" | "email")} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="phone"><Phone className="w-4 h-4 mr-1" /> মোবাইল</TabsTrigger>
              <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" /> ইমেইল</TabsTrigger>
            </TabsList>
            <TabsContent value="phone" className="space-y-3">
              <Label>মোবাইল নাম্বার</Label>
              <Input
                type="tel"
                value={identifier}
                onChange={(e) => setId(e.target.value)}
                placeholder="017XXXXXXXX"
              />
            </TabsContent>
            <TabsContent value="email" className="space-y-3">
              <Label>ইমেইল</Label>
              <Input
                type="email"
                value={identifier}
                onChange={(e) => setId(e.target.value)}
                placeholder="you@example.com"
              />
            </TabsContent>
            <Button className="w-full mt-4" size="lg" onClick={onRequest} disabled={requestOtp.isPending}>
              {requestOtp.isPending ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
            </Button>
          </Tabs>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm">
                <div className="font-semibold">ডেভেলপমেন্ট OTP</div>
                <div className="text-2xl font-mono font-bold tracking-widest">{devOtp}</div>
                <div className="text-xs mt-1">টেস্টিংয়ের সুবিধার্থে এখানে দেখানো হলো</div>
              </div>
            )}
            <div>
              <Label>৬ ডিজিটের OTP</Label>
              <div className="flex justify-center mt-2">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div>
              <Label>আপনার নাম (ঐচ্ছিক)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="আপনার নাম" />
            </div>
            <Button className="w-full" size="lg" onClick={onVerify} disabled={verifyOtp.isPending}>
              {verifyOtp.isPending ? "যাচাই করছি..." : "যাচাই করুন"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { setStep("identifier"); setOtp(""); setDevOtp(null); }}>
              পিছনে যান
            </Button>
          </div>
        )}

        {error && <div className="mt-3 text-sm text-destructive bg-destructive/10 p-2 rounded text-center">{error}</div>}
      </div>
    </div>
  );
}

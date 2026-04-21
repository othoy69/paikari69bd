import React from "react";
import { AlertCircle } from "lucide-react";

export function MoqBanner() {
  return (
    <div className="bg-primary/10 text-primary px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertCircle className="w-4 h-4" />
      <span>পাইকারি দামে কিনতে পণ্যের ন্যূনতম অর্ডার পরিমাণ (MOQ) খেয়াল করুন।</span>
    </div>
  );
}

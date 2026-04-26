import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";

export function WishlistButton({
  productId,
  size = "md",
  className = "",
}: {
  productId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const active = has(productId);

  const dim =
    size === "lg" ? "w-10 h-10" : size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const iDim = size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggle(productId);
      toast({
        title: active ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যুক্ত হয়েছে",
      });
    } catch {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={active ? "উইশলিস্ট থেকে সরান" : "উইশলিস্টে যোগ করুন"}
      className={`${dim} flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-md hover:scale-110 transition-transform border ${
        active ? "border-red-300" : "border-slate-200"
      } ${className}`}
    >
      <Heart
        className={`${iDim} ${active ? "fill-red-500 text-red-500" : "text-slate-500"}`}
        strokeWidth={2}
      />
    </button>
  );
}

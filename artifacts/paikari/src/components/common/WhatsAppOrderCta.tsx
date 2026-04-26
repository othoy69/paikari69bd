import { MessageCircle } from "lucide-react";
import { useStorefrontSettings } from "@/contexts/SettingsContext";
import { buildWhatsAppOrderMessage, whatsappOrderUrl, type WAItem } from "@/lib/whatsappOrder";
import { pixel } from "@/lib/pixel";

type Props = {
  items: WAItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  shopName?: string;
  district?: string;
  area?: string;
  addressLine?: string;
  note?: string;
  size?: "sm" | "lg";
  source?: string;
  className?: string;
  label?: string;
};

export function WhatsAppOrderCta({
  items, subtotal, shipping, total,
  customerName, customerPhone, shopName, district, area, addressLine, note,
  size = "lg", source = "cart", className = "", label,
}: Props) {
  const { storefront } = useStorefrontSettings();
  const message = buildWhatsAppOrderMessage({
    items, subtotal, shipping, total,
    customerName, customerPhone, shopName, district, area, addressLine, note,
  });
  const href = whatsappOrderUrl(storefront.whatsappNumber, message);

  const onClick = () => {
    pixel.whatsappClick(`order-${source}`);
  };

  const padding = size === "lg" ? "px-5 py-3.5 text-base" : "px-4 py-2.5 text-sm";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#1fbb5b] hover:to-[#0e7a6c] text-white font-extrabold shadow-lg hover:shadow-xl transition-all ${padding} ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      {label ?? "WhatsApp এ অর্ডার করুন"}
    </a>
  );
}

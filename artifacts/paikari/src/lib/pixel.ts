// Facebook Pixel helper — config loaded from /api/settings/public
import type { StorefrontSettings } from "./publicApi";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    __pixelLoaded?: boolean;
    __pixelConfig?: StorefrontSettings;
  }
}

let cfg: StorefrontSettings | null = null;
let initialized = false;

export function configurePixel(s: StorefrontSettings) {
  cfg = s;
  if (typeof window !== "undefined") window.__pixelConfig = s;
  if (!initialized && s.facebookPixelId && s.enabledTracking?.pixel) {
    loadPixelScript(s.facebookPixelId);
  }
}

function loadPixelScript(pixelId: string) {
  if (typeof window === "undefined" || window.__pixelLoaded) return;
  window.__pixelLoaded = true;
  initialized = true;

  // Standard Meta Pixel snippet (loader)
  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window as any, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq?.("init", pixelId);
  window.fbq?.("track", "PageView");

  // noscript fallback
  const noscript = document.createElement("noscript");
  const img = document.createElement("img");
  img.height = 1;
  img.width = 1;
  img.style.display = "none";
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.head.appendChild(noscript);
}

function shouldFire(event: keyof StorefrontSettings["enabledTracking"]) {
  if (typeof window === "undefined") return false;
  const c = cfg ?? window.__pixelConfig;
  if (!c?.enabledTracking?.pixel) return false;
  if (!c.facebookPixelId) return false;
  return c.enabledTracking[event] !== false;
}

export const pixel = {
  pageView: () => {
    if (!shouldFire("pageView")) return;
    window.fbq?.("track", "PageView");
  },
  viewContent: (data: { content_ids: string[]; content_name?: string; value?: number; currency?: string }) => {
    if (!shouldFire("pageView")) return;
    window.fbq?.("track", "ViewContent", { ...data, currency: data.currency ?? "BDT" });
  },
  addToCart: (data: { content_ids: string[]; content_name?: string; value?: number; currency?: string }) => {
    if (!shouldFire("addToCart")) return;
    window.fbq?.("track", "AddToCart", { ...data, currency: data.currency ?? "BDT" });
  },
  initiateCheckout: (data: { value: number; currency?: string; num_items: number; content_ids?: string[] }) => {
    if (!shouldFire("initiateCheckout")) return;
    window.fbq?.("track", "InitiateCheckout", { ...data, currency: data.currency ?? "BDT" });
  },
  purchase: (data: { value: number; currency?: string; content_ids?: string[]; num_items?: number; orderNo?: string }) => {
    if (!shouldFire("purchase")) return;
    window.fbq?.("track", "Purchase", { ...data, currency: data.currency ?? "BDT" });
  },
  whatsappClick: (label: string) => {
    if (!shouldFire("whatsappClick")) return;
    window.fbq?.("trackCustom", "WhatsAppClick", { label });
  },
  custom: (event: string, data?: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    if (!cfg?.facebookPixelId) return;
    window.fbq?.("trackCustom", event, data);
  },
};

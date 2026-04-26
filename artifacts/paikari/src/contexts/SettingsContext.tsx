import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { publicApi, type PublicSettings, type StorefrontSettings } from "@/lib/publicApi";
import { configurePixel } from "@/lib/pixel";

const DEFAULT_STOREFRONT: StorefrontSettings = {
  whatsappNumber: "8801872888954",
  whatsappDisplay: "01872-888954",
  merchantPhone: "01700-000069",
  facebookPixelId: "",
  fbPageUrl: "https://facebook.com/paikari69bd",
  enabledTracking: {
    pixel: true,
    pageView: true,
    addToCart: true,
    initiateCheckout: true,
    purchase: true,
    whatsappClick: true,
  },
};

type Ctx = {
  settings: PublicSettings | null;
  storefront: StorefrontSettings;
  refresh: () => void;
};

const SettingsContext = createContext<Ctx | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  const refresh = () => {
    publicApi
      .settings()
      .then((s) => {
        setSettings(s);
        if (s.storefront) configurePixel(s.storefront);
      })
      .catch(() => {
        /* settings unavailable — keep defaults */
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  const storefront = settings?.storefront ?? DEFAULT_STOREFRONT;

  return (
    <SettingsContext.Provider value={{ settings, storefront, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useStorefrontSettings() {
  const c = useContext(SettingsContext);
  if (!c) throw new Error("useStorefrontSettings must be used within SettingsProvider");
  return c;
}

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { publicApi, type WishlistEntry } from "@/lib/publicApi";

type Ctx = {
  items: WishlistEntry[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
};

const WishlistContext = createContext<Ctx | undefined>(undefined);

const LOCAL_KEY = "p69_wishlist";

function readLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocal(ids: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { identifier } = useAuth();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [localIds, setLocalIds] = useState<string[]>(() => readLocal());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!identifier) return;
    setLoading(true);
    try {
      const list = await publicApi.listWishlist(identifier);
      setItems(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  // Sync local guest wishlist into account on login
  useEffect(() => {
    if (!identifier) {
      setItems([]);
      return;
    }
    (async () => {
      try {
        for (const pid of localIds) {
          await publicApi.addToWishlist(identifier, pid);
        }
        if (localIds.length) {
          setLocalIds([]);
          writeLocal([]);
        }
        await refresh();
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  const has = useCallback(
    (productId: string) => {
      if (identifier) return items.some((i) => i.id === productId);
      return localIds.includes(productId);
    },
    [items, localIds, identifier],
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (identifier) {
        if (items.some((i) => i.id === productId)) {
          await publicApi.removeFromWishlist(identifier, productId);
        } else {
          await publicApi.addToWishlist(identifier, productId);
        }
        await refresh();
      } else {
        setLocalIds((prev) => {
          const next = prev.includes(productId)
            ? prev.filter((x) => x !== productId)
            : [productId, ...prev];
          writeLocal(next);
          return next;
        });
      }
    },
    [identifier, items, refresh],
  );

  const remove = useCallback(
    async (productId: string) => {
      if (identifier) {
        await publicApi.removeFromWishlist(identifier, productId);
        await refresh();
      } else {
        setLocalIds((prev) => {
          const next = prev.filter((x) => x !== productId);
          writeLocal(next);
          return next;
        });
      }
    },
    [identifier, refresh],
  );

  const count = identifier ? items.length : localIds.length;

  return (
    <WishlistContext.Provider value={{ items, count, has, toggle, remove, refresh, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const c = useContext(WishlistContext);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
}

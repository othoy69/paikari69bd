const BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body?.error ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export type StorefrontSettings = {
  whatsappNumber: string;
  whatsappDisplay: string;
  merchantPhone: string;
  facebookPixelId: string;
  fbPageUrl: string;
  facebookAppId?: string;
  metaSiteVerify?: string;
  googleAnalyticsId?: string;
  enabledTracking: {
    pixel: boolean;
    pageView: boolean;
    addToCart: boolean;
    initiateCheckout: boolean;
    purchase: boolean;
    whatsappClick: boolean;
  };
};

export type PublicSettings = {
  storefront: StorefrontSettings;
  paymentMethods: Record<string, boolean>;
  manualNumbers: { bkash: string; nagad: string; rocket: string; bankInfo: string };
  uddoktapayEnabled: boolean;
};

export type SavedAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  landmark?: string;
  isDefault?: boolean;
};

export type WishlistEntry = {
  id: string;
  slug: string;
  titleBn: string;
  image: string;
  wholesalePrice: number;
  oldPrice: number;
  unit: string;
  moq: number;
  stock: number;
  addedAt: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: "order" | "payment" | "promo" | "system";
  read: boolean;
  href?: string;
  createdAt: string;
};

export type FeaturedReview = {
  id: string;
  productId?: string;
  productTitleBn?: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
};

export const publicApi = {
  settings: () => http<PublicSettings>("/settings/public"),
  featuredReviews: () => http<FeaturedReview[]>("/reviews/featured"),

  // Addresses
  listAddresses: (identifier: string) =>
    http<SavedAddress[]>(`/account/addresses?identifier=${encodeURIComponent(identifier)}`),
  addAddress: (identifier: string, body: Omit<SavedAddress, "id">) =>
    http<SavedAddress>(`/account/addresses?identifier=${encodeURIComponent(identifier)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateAddress: (identifier: string, id: string, body: Partial<SavedAddress>) =>
    http<SavedAddress>(`/account/addresses/${id}?identifier=${encodeURIComponent(identifier)}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteAddress: (identifier: string, id: string) =>
    http<{ ok: true }>(`/account/addresses/${id}?identifier=${encodeURIComponent(identifier)}`, {
      method: "DELETE",
    }),

  // Wishlist
  listWishlist: (identifier: string) =>
    http<WishlistEntry[]>(`/account/wishlist?identifier=${encodeURIComponent(identifier)}`),
  addToWishlist: (identifier: string, productId: string) =>
    http<{ ok: true; count: number }>(`/account/wishlist?identifier=${encodeURIComponent(identifier)}`, {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  removeFromWishlist: (identifier: string, productId: string) =>
    http<{ ok: true }>(`/account/wishlist/${productId}?identifier=${encodeURIComponent(identifier)}`, {
      method: "DELETE",
    }),

  // Notifications
  listNotifications: (identifier: string) =>
    http<Notification[]>(`/account/notifications?identifier=${encodeURIComponent(identifier)}`),
  markNotificationsRead: (identifier: string) =>
    http<{ ok: true }>(`/account/notifications/read?identifier=${encodeURIComponent(identifier)}`, {
      method: "PUT",
    }),
  deleteNotification: (identifier: string, id: string) =>
    http<{ ok: true }>(`/account/notifications/${id}?identifier=${encodeURIComponent(identifier)}`, {
      method: "DELETE",
    }),

  // Payments (sandbox/mock)
  bkashCreate: (body: { amount: number; orderNo: string; payerPhone?: string }) =>
    http<{ paymentID: string; bkashURL: string; statusCode: string; statusMessage: string }>(
      "/payments/bkash/create",
      { method: "POST", body: JSON.stringify(body) },
    ),
  bkashExecute: (body: { paymentID: string }) =>
    http<{ trxID: string; transactionStatus: string; statusCode: string }>(
      "/payments/bkash/execute",
      { method: "POST", body: JSON.stringify(body) },
    ),
  nagadInitialize: (body: { amount: number; orderNo: string; payerPhone?: string }) =>
    http<{ sensitiveData: { paymentReferenceId: string; challenge: string }; callBackUrl: string }>(
      "/payments/nagad/initialize",
      { method: "POST", body: JSON.stringify(body) },
    ),
  nagadComplete: (body: { paymentReferenceId: string }) =>
    http<{ status: string; issuerPaymentRefNo: string; paymentRefId: string }>(
      "/payments/nagad/complete",
      { method: "POST", body: JSON.stringify(body) },
    ),
};

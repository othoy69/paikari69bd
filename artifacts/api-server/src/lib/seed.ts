import { getDb, saveDb, setDb, type Product, type Category } from "./store";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CATEGORIES: Category[] = [
  { slug: "fashion", nameBn: "ফ্যাশন ও পোশাক", nameEn: "Fashion & Apparel", icon: "Shirt", productCount: 0 },
  { slug: "electronics", nameBn: "ইলেকট্রনিক্স", nameEn: "Electronics", icon: "Smartphone", productCount: 0 },
  { slug: "grocery", nameBn: "মুদি ও খাবার", nameEn: "Grocery & Food", icon: "ShoppingBasket", productCount: 0 },
  { slug: "home", nameBn: "হোম ও কিচেন", nameEn: "Home & Kitchen", icon: "Home", productCount: 0 },
  { slug: "beauty", nameBn: "বিউটি ও কেয়ার", nameEn: "Beauty & Care", icon: "Sparkles", productCount: 0 },
  { slug: "kids", nameBn: "বাচ্চাদের পণ্য", nameEn: "Kids & Toys", icon: "Baby", productCount: 0 },
  { slug: "stationery", nameBn: "স্টেশনারি", nameEn: "Stationery", icon: "Pencil", productCount: 0 },
  { slug: "accessories", nameBn: "এক্সেসরিজ", nameEn: "Accessories", icon: "Watch", productCount: 0 },
];

const IMG = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=900&q=70`;

type Seed = Omit<Product, "id" | "slug" | "categoryNameBn" | "gallery"> & {
  gallery?: string[];
};

const DAY = 24 * 60 * 60 * 1000;
const flashEndsAt = new Date(Date.now() + 2 * DAY).toISOString();

const SEED: Seed[] = [
  {
    titleBn: "প্রিমিয়াম কটন পাঞ্জাবি (পুরুষ)",
    titleEn: "Premium Cotton Panjabi",
    descriptionBn: "১০০% কটন কাপড়, রিসেলারদের জন্য বিশেষ পাইকারি দাম। সাইজ M, L, XL, XXL মিক্স প্যাক।",
    category: "fashion",
    source: "কেরানীগঞ্জ, ঢাকা",
    image: "photo-1602810318383-e386cc2a3ccf",
    oldPrice: 950,
    wholesalePrice: 520,
    moq: 6,
    unit: "পিস",
    tiers: [
      { minQty: 1, price: 750, label: "১ পিস (খুচরা)" },
      { minQty: 6, price: 520, label: "৬+ পিস" },
      { minQty: 24, price: 470, label: "২৪+ পিস (কার্টন)" },
    ],
    stock: 320,
    badges: ["ফ্ল্যাশ ডিল", "বেস্টসেলার"],
    rating: 4.7,
    sold: 1840,
    deliveryNote: "ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ২-৪ দিন",
    flashEndsAt,
    tags: ["flash", "bestseller"],
  },
  {
    titleBn: "থ্রি-পিস উইন্টার কালেকশন",
    titleEn: "Three Piece Winter Collection",
    descriptionBn: "জর্জেট কাপড়, এমব্রয়ডারি ডিজাইন। মিক্স কালার প্যাক।",
    category: "fashion",
    source: "ইসলামপুর, ঢাকা",
    image: "photo-1583391733956-6c78276477e2",
    oldPrice: 1850,
    wholesalePrice: 980,
    moq: 4,
    unit: "সেট",
    tiers: [
      { minQty: 1, price: 1200, label: "১ সেট" },
      { minQty: 4, price: 980, label: "৪+ সেট" },
      { minQty: 12, price: 880, label: "১২+ সেট" },
    ],
    stock: 145,
    badges: ["নতুন"],
    rating: 4.6,
    sold: 720,
    deliveryNote: "সারাদেশে কুরিয়ারে ডেলিভারি",
    tags: ["new", "featured"],
  },
  {
    titleBn: "স্মার্টওয়াচ Y68 (মিক্স কালার)",
    titleEn: "Smartwatch Y68",
    descriptionBn: "ব্লুটুথ কল, হার্ট-রেট, স্টেপ কাউন্টার। রিসেলারদের জন্য পাইকারি প্যাক।",
    category: "electronics",
    source: "ইম্পোর্টেড, চট্টগ্রাম পোর্ট",
    image: "photo-1546868871-7041f2a55e12",
    oldPrice: 850,
    wholesalePrice: 320,
    moq: 10,
    unit: "পিস",
    tiers: [
      { minQty: 1, price: 450, label: "১ পিস" },
      { minQty: 10, price: 320, label: "১০+ পিস" },
      { minQty: 50, price: 285, label: "৫০+ পিস" },
    ],
    stock: 540,
    badges: ["ফ্ল্যাশ ডিল", "হট"],
    rating: 4.4,
    sold: 3210,
    deliveryNote: "১-৩ দিনে সারাদেশে",
    flashEndsAt,
    tags: ["flash", "bestseller"],
  },
  {
    titleBn: "ব্লুটুথ ইয়ারবাড TWS Pro",
    titleEn: "TWS Pro Earbuds",
    descriptionBn: "এনসি সাপোর্টেড, ৪+২০ ঘন্টা ব্যাকআপ। ভালো বিল্ড কোয়ালিটি।",
    category: "electronics",
    source: "ইম্পোর্টেড, চট্টগ্রাম",
    image: "photo-1606220588913-b3aacb4d2f46",
    oldPrice: 1200,
    wholesalePrice: 480,
    moq: 10,
    unit: "পিস",
    tiers: [
      { minQty: 1, price: 650, label: "১ পিস" },
      { minQty: 10, price: 480, label: "১০+ পিস" },
      { minQty: 30, price: 430, label: "৩০+ পিস" },
    ],
    stock: 280,
    badges: ["বেস্টসেলার"],
    rating: 4.5,
    sold: 2450,
    deliveryNote: "১-৩ দিনে সারাদেশে",
    tags: ["bestseller"],
  },
  {
    titleBn: "প্রিমিয়াম বাসমতি চাল ৫ কেজি",
    titleEn: "Premium Basmati Rice 5kg",
    descriptionBn: "এক্সপোর্ট কোয়ালিটি, ১২ মাস স্টোরেজ। মুদি দোকানদারদের জন্য পাইকারি।",
    category: "grocery",
    source: "নাটোর",
    image: "photo-1586201375761-83865001e31c",
    oldPrice: 720,
    wholesalePrice: 540,
    moq: 5,
    unit: "ব্যাগ",
    tiers: [
      { minQty: 1, price: 620, label: "১ ব্যাগ" },
      { minQty: 5, price: 540, label: "৫+ ব্যাগ" },
      { minQty: 20, price: 510, label: "২০+ ব্যাগ (বস্তা)" },
    ],
    stock: 800,
    badges: ["ফ্রেশ স্টক"],
    rating: 4.8,
    sold: 5400,
    deliveryNote: "ঢাকা ও আশেপাশে দ্রুত ডেলিভারি",
    tags: ["bestseller"],
  },
  {
    titleBn: "সয়াবিন তেল ৫ লিটার (পেট বোতল)",
    titleEn: "Soybean Oil 5L",
    descriptionBn: "রিফাইন্ড সয়াবিন তেল, ব্র্যান্ডেড সিল প্যাক।",
    category: "grocery",
    source: "ময়মনসিংহ ডিপো",
    image: "photo-1474979266404-7eaacbcd87c5",
    oldPrice: 950,
    wholesalePrice: 820,
    moq: 6,
    unit: "বোতল",
    tiers: [
      { minQty: 1, price: 880, label: "১ বোতল" },
      { minQty: 6, price: 820, label: "৬+ বোতল" },
      { minQty: 24, price: 790, label: "২৪+ বোতল" },
    ],
    stock: 220,
    badges: [],
    rating: 4.5,
    sold: 1900,
    deliveryNote: "ঢাকার ভিতরে ১ দিনে",
  },
  {
    titleBn: "স্টেইনলেস স্টিল কুকওয়্যার সেট (৭ পিস)",
    titleEn: "Steel Cookware Set 7pc",
    descriptionBn: "টেকসই বিল্ড, ইন্ডাকশন কম্প্যাটিবল।",
    category: "home",
    source: "নারায়ণগঞ্জ",
    image: "photo-1584990347449-a08a6d8d0d7e",
    oldPrice: 3200,
    wholesalePrice: 1980,
    moq: 3,
    unit: "সেট",
    tiers: [
      { minQty: 1, price: 2400, label: "১ সেট" },
      { minQty: 3, price: 1980, label: "৩+ সেট" },
      { minQty: 10, price: 1850, label: "১০+ সেট" },
    ],
    stock: 88,
    badges: ["নতুন"],
    rating: 4.6,
    sold: 410,
    deliveryNote: "৩-৫ দিনে সারাদেশে",
    tags: ["new"],
  },
  {
    titleBn: "নন-স্টিক ফ্রাই প্যান ২৬cm",
    titleEn: "Non-stick Fry Pan",
    descriptionBn: "৫ লেয়ার নন-স্টিক কোটিং।",
    category: "home",
    source: "চট্টগ্রাম",
    image: "photo-1556910103-1c02745aae4d",
    oldPrice: 950,
    wholesalePrice: 540,
    moq: 6,
    unit: "পিস",
    tiers: [
      { minQty: 1, price: 720, label: "১ পিস" },
      { minQty: 6, price: 540, label: "৬+ পিস" },
      { minQty: 24, price: 495, label: "২৪+ পিস" },
    ],
    stock: 175,
    badges: [],
    rating: 4.4,
    sold: 980,
    deliveryNote: "৩-৫ দিনে",
  },
  {
    titleBn: "হারবাল ফেস ওয়াশ ১০০ml",
    titleEn: "Herbal Face Wash",
    descriptionBn: "নিম ও তুলসী ব্লেন্ড, সব স্কিন টাইপের জন্য।",
    category: "beauty",
    source: "লোকাল ব্র্যান্ড, ঢাকা",
    image: "photo-1556228720-195a672e8a03",
    oldPrice: 220,
    wholesalePrice: 95,
    moq: 24,
    unit: "পিস",
    tiers: [
      { minQty: 1, price: 150, label: "১ পিস" },
      { minQty: 24, price: 95, label: "২৪+ পিস (কার্টন)" },
      { minQty: 144, price: 85, label: "১৪৪+ পিস (১২ কার্টন)" },
    ],
    stock: 1200,
    badges: ["বেস্টসেলার"],
    rating: 4.7,
    sold: 8900,
    deliveryNote: "১-৩ দিনে সারাদেশে",
    tags: ["bestseller"],
  },
  {
    titleBn: "লিপস্টিক সেট (৬ কালার)",
    titleEn: "Lipstick Set",
    descriptionBn: "ম্যাট ফিনিশ, লং লাস্টিং।",
    category: "beauty",
    source: "ইম্পোর্টেড",
    image: "photo-1586495777744-4413f21062fa",
    oldPrice: 850,
    wholesalePrice: 380,
    moq: 6,
    unit: "সেট",
    tiers: [
      { minQty: 1, price: 520, label: "১ সেট" },
      { minQty: 6, price: 380, label: "৬+ সেট" },
      { minQty: 24, price: 340, label: "২৪+ সেট" },
    ],
    stock: 95,
    badges: ["ফ্ল্যাশ ডিল"],
    rating: 4.5,
    sold: 670,
    deliveryNote: "১-৩ দিনে",
    flashEndsAt,
    tags: ["flash"],
  },
  {
    titleBn: "বাচ্চাদের ফ্যামিলি প্যাক ডায়াপার",
    titleEn: "Baby Diaper Family Pack",
    descriptionBn: "M/L/XL সাইজ মিক্স, ৪৮ পিস।",
    category: "kids",
    source: "ইম্পোর্টেড",
    image: "photo-1515488042361-ee00e0ddd4e4",
    oldPrice: 1450,
    wholesalePrice: 980,
    moq: 4,
    unit: "প্যাক",
    tiers: [
      { minQty: 1, price: 1180, label: "১ প্যাক" },
      { minQty: 4, price: 980, label: "৪+ প্যাক" },
      { minQty: 12, price: 920, label: "১২+ প্যাক" },
    ],
    stock: 210,
    badges: ["বেস্টসেলার"],
    rating: 4.7,
    sold: 1320,
    deliveryNote: "১-৩ দিনে",
    tags: ["bestseller"],
  },
  {
    titleBn: "কাঠের শিক্ষামূলক খেলনা সেট",
    titleEn: "Wooden Educational Toys",
    descriptionBn: "নন-টক্সিক পেইন্ট, ৩+ বছর বয়সী বাচ্চাদের জন্য।",
    category: "kids",
    source: "লোকাল হ্যান্ডমেইড",
    image: "photo-1558877385-81a1c7e67d72",
    oldPrice: 750,
    wholesalePrice: 420,
    moq: 6,
    unit: "সেট",
    tiers: [
      { minQty: 1, price: 580, label: "১ সেট" },
      { minQty: 6, price: 420, label: "৬+ সেট" },
      { minQty: 20, price: 380, label: "২০+ সেট" },
    ],
    stock: 130,
    badges: ["নতুন"],
    rating: 4.6,
    sold: 245,
    deliveryNote: "৩-৫ দিনে",
    tags: ["new"],
  },
  {
    titleBn: "প্রিমিয়াম এ৪ পেপার রিম (৫০০ পিস)",
    titleEn: "A4 Paper Ream 500pc",
    descriptionBn: "৭৫ জিএসএম, অফিস ও স্কুল ইউজের জন্য।",
    category: "stationery",
    source: "লোকাল মিল",
    image: "photo-1583521214690-73421a1829a9",
    oldPrice: 480,
    wholesalePrice: 360,
    moq: 10,
    unit: "রিম",
    tiers: [
      { minQty: 1, price: 420, label: "১ রিম" },
      { minQty: 10, price: 360, label: "১০+ রিম" },
      { minQty: 50, price: 340, label: "৫০+ রিম" },
    ],
    stock: 600,
    badges: [],
    rating: 4.6,
    sold: 2100,
    deliveryNote: "১-৩ দিনে",
  },
  {
    titleBn: "প্রিমিয়াম জেল কলম (৫০ পিস বক্স)",
    titleEn: "Gel Pen Box",
    descriptionBn: "স্মুথ রাইটিং, ০.৫mm টিপ।",
    category: "stationery",
    source: "ইম্পোর্টেড",
    image: "photo-1517242810446-cc8951b2be40",
    oldPrice: 350,
    wholesalePrice: 195,
    moq: 12,
    unit: "বক্স",
    tiers: [
      { minQty: 1, price: 250, label: "১ বক্স" },
      { minQty: 12, price: 195, label: "১২+ বক্স" },
      { minQty: 60, price: 175, label: "৬০+ বক্স" },
    ],
    stock: 410,
    badges: ["বেস্টসেলার"],
    rating: 4.5,
    sold: 3400,
    deliveryNote: "১-৩ দিনে",
    tags: ["bestseller"],
  },
  {
    titleBn: "ছেলেদের লেদার বেল্ট (মিক্স)",
    titleEn: "Men Leather Belt",
    descriptionBn: "জেনুইন PU লেদার, অটো-লক বাকল।",
    category: "accessories",
    source: "ইসলামপুর, ঢাকা",
    image: "photo-1624222247344-550fb60583a8",
    oldPrice: 650,
    wholesalePrice: 280,
    moq: 12,
    unit: "পিস",
    tiers: [
      { minQty: 1, price: 380, label: "১ পিস" },
      { minQty: 12, price: 280, label: "১২+ পিস" },
      { minQty: 48, price: 250, label: "৪৮+ পিস" },
    ],
    stock: 320,
    badges: ["ফ্ল্যাশ ডিল"],
    rating: 4.4,
    sold: 1450,
    deliveryNote: "১-৩ দিনে",
    flashEndsAt,
    tags: ["flash", "bestseller"],
  },
  {
    titleBn: "মেয়েদের হিজাব পিন সেট (২৪ পিস)",
    titleEn: "Hijab Pin Set",
    descriptionBn: "মিক্স ডিজাইন, প্রিমিয়াম স্টোন ফিনিশ।",
    category: "accessories",
    source: "লোকাল",
    image: "photo-1611591437281-460bfbe1220a",
    oldPrice: 420,
    wholesalePrice: 175,
    moq: 12,
    unit: "সেট",
    tiers: [
      { minQty: 1, price: 240, label: "১ সেট" },
      { minQty: 12, price: 175, label: "১২+ সেট" },
      { minQty: 60, price: 155, label: "৬০+ সেট" },
    ],
    stock: 540,
    badges: ["নতুন"],
    rating: 4.6,
    sold: 880,
    deliveryNote: "১-৩ দিনে",
    tags: ["new"],
  },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function ensureSeed(): void {
  const db = getDb();
  if (db.products.length > 0) {
    // refresh category counts
    const map = new Map(CATEGORIES.map((c) => [c.slug, { ...c, productCount: 0 }]));
    for (const p of db.products) {
      const c = map.get(p.category);
      if (c) c.productCount += 1;
    }
    (db as unknown as { categories?: Category[] }).categories = Array.from(map.values());
    saveDb();
    return;
  }
  const products: Product[] = SEED.map((s) => {
    const slug = `${slugify(s.titleEn)}-${uid().slice(0, 4)}`;
    const cat = CATEGORIES.find((c) => c.slug === s.category);
    return {
      id: uid(),
      slug,
      categoryNameBn: cat?.nameBn,
      gallery: s.gallery ?? [
        IMG(s.image),
        IMG(s.image),
        IMG(s.image),
      ],
      ...s,
      image: IMG(s.image),
    };
  });
  setDb({ products, orders: [], users: [], otps: [] });
}

export function getCategories(): Category[] {
  const counts = new Map<string, number>();
  for (const p of getDb().products) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return CATEGORIES.map((c) => ({
    ...c,
    productCount: counts.get(c.slug) ?? 0,
    image: IMG(
      {
        fashion: "photo-1483985988355-763728e1935b",
        electronics: "photo-1518770660439-4636190af475",
        grocery: "photo-1542838132-92c53300491e",
        home: "photo-1556909114-f6e7ad7d3136",
        beauty: "photo-1522335789203-aaa2bcdf6c9c",
        kids: "photo-1515488042361-ee00e0ddd4e4",
        stationery: "photo-1456735190827-d1262f71b8a3",
        accessories: "photo-1611591437281-460bfbe1220a",
      }[c.slug] ?? "photo-1483985988355-763728e1935b",
    ),
  }));
}

export function flashEndsAtIso(): string {
  return flashEndsAt;
}

ensureSeed();

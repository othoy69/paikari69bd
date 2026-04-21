import { Router, type IRouter } from "express";
import { getDb } from "../lib/store";
import { getCategories, flashEndsAtIso } from "../lib/seed";

const router: IRouter = Router();

router.get("/categories", (_req, res) => {
  res.json(getCategories());
});

router.get("/products", (req, res) => {
  const { category, q, tag, limit } = req.query as {
    category?: string;
    q?: string;
    tag?: string;
    limit?: string;
  };
  let items = [...getDb().products];
  if (category) items = items.filter((p) => p.category === category);
  if (tag) items = items.filter((p) => (p.tags ?? []).includes(tag));
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (p) =>
        p.titleBn.toLowerCase().includes(needle) ||
        p.titleEn.toLowerCase().includes(needle) ||
        (p.descriptionBn ?? "").toLowerCase().includes(needle),
    );
  }
  if (limit) items = items.slice(0, Number(limit));
  res.json(items);
});

router.get("/products/:slug", (req, res) => {
  const p = getDb().products.find((p) => p.slug === req.params.slug);
  if (!p) {
    res.status(404).json({ error: "পণ্য খুঁজে পাওয়া যায়নি" });
    return;
  }
  res.json(p);
});

router.get("/home/summary", (_req, res) => {
  const products = getDb().products;
  const flashDeals = products.filter((p) => (p.tags ?? []).includes("flash")).slice(0, 8);
  const bestSellers = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8);
  const newArrivals = products.filter((p) => (p.tags ?? []).includes("new")).slice(0, 8);
  const heroSlides = [
    {
      titleBn: "পাইকারি দামে সারা বাংলাদেশে",
      subtitleBn: "৫০,০০০+ রিসেলারের ভরসার বাজার • MOQ থেকে শুরু",
      ctaText: "এখনই কিনুন",
      ctaHref: "/category/fashion",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=70",
      accent: "orange",
    },
    {
      titleBn: "ফ্ল্যাশ ডিল চলছে — ৬০% পর্যন্ত ছাড়",
      subtitleBn: "নির্দিষ্ট সময়ের জন্য সীমিত স্টক, দ্রুত অর্ডার করুন",
      ctaText: "ফ্ল্যাশ ডিল দেখুন",
      ctaHref: "/category/electronics",
      image:
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=70",
      accent: "red",
    },
    {
      titleBn: "নতুন রিসেলার? ফ্রি কনসালটেশন নিন",
      subtitleBn: "অভিজ্ঞ টিমের পরামর্শে শুরু করুন আপনার নিজের ব্যবসা",
      ctaText: "যোগাযোগ করুন",
      ctaHref: "/account",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=70",
      accent: "emerald",
    },
  ];
  res.json({
    heroSlides,
    categories: getCategories(),
    flashDeals,
    bestSellers,
    newArrivals,
    trustStats: {
      resellers: 52340,
      ordersDelivered: 184500,
      districts: 64,
      satisfaction: 98.6,
    },
    flashEndsAt: flashEndsAtIso(),
  });
});

export default router;

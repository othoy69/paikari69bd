import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminListProducts,
  getAdminListProductsQueryKey,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
  useAdminUpdateStock,
} from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { bdt } from "@/lib/format";
import { Plus, Pencil, Trash2, Save } from "lucide-react";

const CATEGORIES = [
  { v: "fashion", l: "ফ্যাশন ও পোশাক" },
  { v: "electronics", l: "ইলেকট্রনিক্স" },
  { v: "grocery", l: "মুদি ও খাবার" },
  { v: "home", l: "হোম ও কিচেন" },
  { v: "beauty", l: "বিউটি ও কেয়ার" },
  { v: "kids", l: "বাচ্চাদের পণ্য" },
  { v: "stationery", l: "স্টেশনারি" },
  { v: "accessories", l: "এক্সেসরিজ" },
];

type FormState = {
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  category: string;
  source: string;
  image: string;
  oldPrice: number;
  wholesalePrice: number;
  moq: number;
  unit: string;
  stock: number;
  badges: string;
};

const empty: FormState = {
  titleBn: "", titleEn: "", descriptionBn: "", category: "fashion",
  source: "", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=70",
  oldPrice: 0, wholesalePrice: 0, moq: 1, unit: "পিস", stock: 0, badges: "",
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useAdminListProducts();
  const createMut = useAdminCreateProduct();
  const updateMut = useAdminUpdateProduct();
  const deleteMut = useAdminDeleteProduct();
  const stockMut = useAdminUpdateStock();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });

  const openCreate = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const p = products?.find((p) => p.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      titleBn: p.titleBn,
      titleEn: p.titleEn,
      descriptionBn: p.descriptionBn ?? "",
      category: p.category,
      source: p.source,
      image: p.image,
      oldPrice: p.oldPrice,
      wholesalePrice: p.wholesalePrice,
      moq: p.moq,
      unit: p.unit,
      stock: p.stock,
      badges: (p.badges ?? []).join(", "),
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      titleBn: form.titleBn,
      titleEn: form.titleEn || form.titleBn,
      descriptionBn: form.descriptionBn || undefined,
      category: form.category,
      source: form.source,
      image: form.image,
      oldPrice: Number(form.oldPrice),
      wholesalePrice: Number(form.wholesalePrice),
      moq: Number(form.moq),
      unit: form.unit,
      stock: Number(form.stock),
      badges: form.badges ? form.badges.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    if (editingId) {
      await updateMut.mutateAsync({ id: editingId, data: body });
    } else {
      await createMut.mutateAsync({ data: body });
    }
    invalidate();
    setOpen(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("এই পণ্যটি মুছে ফেলবেন?")) return;
    await deleteMut.mutateAsync({ id });
    invalidate();
  };

  const onStockBlur = async (id: string, newStock: number) => {
    await stockMut.mutateAsync({ id, data: { stock: newStock } });
    invalidate();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">পণ্য ম্যানেজমেন্ট</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> নতুন পণ্য
        </Button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">পণ্য</th>
                  <th className="px-3 py-2 font-medium">ক্যাটাগরি</th>
                  <th className="px-3 py-2 font-medium text-right">দাম</th>
                  <th className="px-3 py-2 font-medium text-center">স্টক</th>
                  <th className="px-3 py-2 font-medium text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products?.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                        <div className="min-w-0">
                          <div className="font-medium line-clamp-1">{p.titleBn}</div>
                          <div className="text-xs text-muted-foreground">MOQ: {p.moq} {p.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2"><Badge variant="outline">{p.categoryNameBn ?? p.category}</Badge></td>
                    <td className="px-3 py-2 text-right">
                      <div className="font-bold text-primary">{bdt(p.wholesalePrice)}</div>
                      <div className="text-xs text-muted-foreground line-through">{bdt(p.oldPrice)}</div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Input
                        type="number"
                        defaultValue={p.stock}
                        className="w-20 mx-auto h-8"
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v !== p.stock) onStockBlur(p.id, v);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p.id)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "পণ্য সম্পাদনা" : "নতুন পণ্য"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>বাংলা নাম *</Label><Input value={form.titleBn} onChange={(e) => setForm({ ...form, titleBn: e.target.value })} required /></div>
              <div><Label>ইংরেজি নাম</Label><Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>বর্ণনা</Label><Textarea value={form.descriptionBn} onChange={(e) => setForm({ ...form, descriptionBn: e.target.value })} /></div>
              <div>
                <Label>ক্যাটাগরি *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>সোর্স</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>ছবির URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div><Label>খুচরা দাম</Label><Input type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })} /></div>
              <div><Label>পাইকারি দাম</Label><Input type="number" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: Number(e.target.value) })} /></div>
              <div><Label>MOQ</Label><Input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })} /></div>
              <div><Label>একক</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div><Label>স্টক</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
              <div><Label>ব্যাজ (কমা দিয়ে)</Label><Input value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} placeholder="ফ্ল্যাশ ডিল, বেস্টসেলার" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                <Save className="w-4 h-4 mr-1" /> সংরক্ষণ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

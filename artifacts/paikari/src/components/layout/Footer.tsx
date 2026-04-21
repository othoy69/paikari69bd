import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">পাইকারি69bd.com</h3>
            <p className="text-sm text-muted-foreground">
              বাংলাদেশের অন্যতম বিশ্বস্ত পাইকারি মার্কেটপ্লেস। ঢাকা, চট্টগ্রাম, সিলেট, খুলনা, রাজশাহী, বরিশাল, রংপুর, ময়মনসিংহ সহ সারা দেশে ডেলিভারি।
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/electronics" className="hover:text-foreground">Electronics</Link></li>
              <li><Link href="/category/fashion" className="hover:text-foreground">Fashion</Link></li>
              <li><Link href="/category/home" className="hover:text-foreground">Home & Kitchen</Link></li>
              <li><Link href="/category/beauty" className="hover:text-foreground">Health & Beauty</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Policies</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/return" className="hover:text-foreground">Return Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground">Shipping Info</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Phone: +880 1700-000069</li>
              <li>Email: support@paikari69bd.com</li>
              <li>Address: Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} পাইকারি69bd.com. All rights reserved.
          </p>
          <div className="flex gap-2">
            {/* Payment partner logos could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}

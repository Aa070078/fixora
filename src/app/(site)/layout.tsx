import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartProvider } from "@/lib/cart";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
import Navigation from "@/components/wedding/navigation";
import SiteBackground from "@/components/wedding/site-background";
import { CartProvider } from "@/components/cart/cart-provider";
import CartDrawer from "@/components/cart/cart-drawer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="relative min-h-screen grain-overlay bg-transparent">
        <SiteBackground />
        <Navigation />
        <main className="relative z-10">{children}</main>
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

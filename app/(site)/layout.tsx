import Navigation from "@/components/wedding/navigation";
import MonogramVeil from "@/components/wedding/monogram-veil";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen grain-overlay">
      <MonogramVeil letters="R&P" />
      <Navigation />
      <main className="relative z-10">{children}</main>
    </div>
  );
}

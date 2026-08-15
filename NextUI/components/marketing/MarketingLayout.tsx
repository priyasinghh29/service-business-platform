import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-on-background">
      <MarketingHeader />
      <main className="flex-1 pt-[73px]">{children}</main>
      <MarketingFooter />
    </div>
  );
}

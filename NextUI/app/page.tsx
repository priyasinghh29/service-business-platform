import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import HomeSections from "@/components/home/HomeSections";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-on-background">
      <MarketingHeader />
      <main className="flex-1">
        <HomeSections />
      </main>
      <MarketingFooter />
    </div>
  );
}

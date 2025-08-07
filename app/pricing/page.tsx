import BottomNav from "@/components/bottom-nav";
import PricingPage from "@/components/pages/pricing-page";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <PricingPage />
      </main>
      <BottomNav currentPage="pricing" />
    </div>
  );
}

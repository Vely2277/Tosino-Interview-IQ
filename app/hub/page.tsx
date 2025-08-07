import BottomNav from "@/components/bottom-nav";
import HubPage from "@/components/pages/hub-page";

export default function Hub() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <HubPage />
      </main>
      <BottomNav currentPage="hub" />
    </div>
  );
}

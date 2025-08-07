import BottomNav from "@/components/bottom-nav";
import ProgressPage from "@/components/pages/progress-page";

export default function Progress() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <ProgressPage />
      </main>
      <BottomNav currentPage="progress" />
    </div>
  );
}

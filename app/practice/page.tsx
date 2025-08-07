import BottomNav from "@/components/bottom-nav";
import PracticePage from "@/components/pages/practice-page";

export default function Practice() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <PracticePage />
      </main>
      <BottomNav currentPage="practice" />
    </div>
  );
}

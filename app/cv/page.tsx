import BottomNav from "@/components/bottom-nav";
import CvPage from "@/components/pages/cv-page";

export default function CV() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <CvPage />
      </main>
      <BottomNav currentPage="cv" />
    </div>
  );
}

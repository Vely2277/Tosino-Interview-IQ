
import BottomNav from "@/components/bottom-nav";
import CreateCvPage from "@/components/pages/create-cv-page";

export default function CreateCV() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <CreateCvPage />
      </main>
      <BottomNav currentPage="create-cv" />
    </div>
  );
}

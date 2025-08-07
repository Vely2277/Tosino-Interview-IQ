import BottomNav from "@/components/bottom-nav";
import CreateCvPage from "@/components/pages/create-cv-page";

export default function CreateCV() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <CreateCvPage />
      </main>
      <BottomNav currentPage="create-cv" />
    </div>
  );
}

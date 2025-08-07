import BottomNav from "@/components/bottom-nav";
import TextInterviewPage from "@/components/pages/text-interview-page";

export default function TextInterview() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <TextInterviewPage />
      </main>
      <BottomNav currentPage="text-interview" />
    </div>
  );
}

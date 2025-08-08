
import BottomNav from "@/components/bottom-nav";
import TextInterviewPage from "@/components/pages/text-interview-page";

export default function TextInterview() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <TextInterviewPage />
      </main>
      <BottomNav currentPage="text-interview" />
    </div>
  );
}

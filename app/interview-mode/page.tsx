import BottomNav from "@/components/bottom-nav";
import InterviewModePage from "@/components/pages/interview-mode-page";

export default function InterviewMode() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <InterviewModePage />
      </main>
      <BottomNav currentPage="interview-mode" />
    </div>
  );
}

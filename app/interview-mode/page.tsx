//interview-mode/page.tsx
import BottomNav from "@/components/bottom-nav";
import InterviewModePage from "@/components/pages/interview-mode-page";

export default function InterviewMode() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <InterviewModePage />
      </main>
      <BottomNav currentPage="interview-mode" />
    </div>
  );
}

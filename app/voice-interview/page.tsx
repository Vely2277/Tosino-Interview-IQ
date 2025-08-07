import BottomNav from "@/components/bottom-nav";
import VoiceInterviewPage from "@/components/pages/voice-interview-page";

export default function VoiceInterview() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <VoiceInterviewPage />
      </main>
      <BottomNav currentPage="voice-interview" />
    </div>
  );
}

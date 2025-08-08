
import BottomNav from "@/components/bottom-nav";
import VoiceInterviewPage from "@/components/pages/voice-interview-page";

export default function VoiceInterview() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <VoiceInterviewPage />
      </main>
      <BottomNav currentPage="voice-interview" />
    </div>
  );
}

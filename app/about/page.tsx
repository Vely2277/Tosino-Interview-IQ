import BottomNav from "@/components/bottom-nav";
import AboutPage from "@/components/pages/about-page";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <AboutPage />
      </main>
      <BottomNav currentPage="about" />
    </div>
  );
}

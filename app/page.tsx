import BottomNav from "@/components/bottom-nav";
import HomePage from "@/components/pages/home-page";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 w-full">
      <main className="w-full">
        <HomePage />
      </main>
      <BottomNav currentPage="home" />
    </div>
  );
}

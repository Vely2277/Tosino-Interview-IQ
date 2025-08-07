"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Mic, TrendingUp, FileText, Users, DollarSign } from "lucide-react";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Practice",
      icon: Mic,
      path: "/practice",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Progress",
      icon: TrendingUp,
      path: "/progress",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "CV",
      icon: FileText,
      path: "/cv",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Hub",
      icon: Users,
      path: "/hub",
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      label: "Pricing",
      icon: DollarSign,
      path: "/pricing",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="grid grid-cols-6 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                active
                  ? `${item.color} bg-gray-50`
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? "scale-110" : ""}`} />
              <span className={`text-xs font-medium ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

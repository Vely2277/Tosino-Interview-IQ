"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Mic, TrendingUp, FileText, Sprout, Receipt } from "lucide-react"

interface BottomNavProps {
  currentPage?: string
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "practice", icon: Mic, label: "Practice", path: "/practice" },
    { id: "progress", icon: TrendingUp, label: "Progress", path: "/progress" },
    { id: "cv", icon: FileText, label: "CV", path: "/cv" },
    { id: "hub", icon: Sprout, label: "Hub", path: "/hub" },
    { id: "pricing", icon: Receipt, label: "Pricing", path: "/pricing" },
  ]

  const getCurrentPage = () => {
    if (currentPage) return currentPage
    const currentItem = navItems.find(item => item.path === pathname)
    return currentItem ? currentItem.id : "home"
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
  <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#23263a] border-t border-gray-200 dark:border-blue-900 px-4 py-2">
  <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = getCurrentPage() === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900"
                  : "text-gray-600 dark:text-blue-200 hover:text-gray-900 dark:hover:text-blue-400"
              }`}
            >
              <Icon size={20} className={isActive ? "" : "dark:text-blue-200"} />
              <span className={`text-xs mt-1 ${isActive ? "dark:text-blue-100" : "dark:text-blue-200"}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

"use client"

import { Home, Mic, TrendingUp, FileText, Sprout, Receipt } from "lucide-react"

interface BottomNavProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "practice", icon: Mic, label: "Practice" },
    { id: "progress", icon: TrendingUp, label: "Progress" },
    { id: "cv", icon: FileText, label: "CV" },
    { id: "hub", icon: Sprout, label: "Hub" },
    { id: "pricing", icon: Receipt, label: "Pricing" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

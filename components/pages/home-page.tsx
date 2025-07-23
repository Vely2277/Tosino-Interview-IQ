"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Sparkles } from "lucide-react"

interface HomePageProps {
  onNavigate: (page: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <Brain className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">InterviewIQ</h1>
        <p className="text-lg text-gray-600">AI-Powered Interview Coach</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Master Every Interview</h2>
          </div>
          <p className="text-gray-600">
            Practice with our AI interviewer, get personalized feedback, and boost your confidence for any job
            interview.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time AI feedback</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Voice and text practice modes</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>CV optimization tools</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Career insights and tips</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button onClick={() => onNavigate("practice")} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
          Get Started
        </Button>
        <Button onClick={() => onNavigate("practice")} variant="outline" className="w-full" size="lg">
          Go to Practice
        </Button>
      </div>
    </div>
  )
}

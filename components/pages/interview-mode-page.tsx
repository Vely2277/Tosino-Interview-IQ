"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MessageCircle, ArrowLeft } from "lucide-react"

interface InterviewModePageProps {
  onNavigate: (page: string) => void
  interviewData: { jobTitle: string; company: string; sessionId?: string }
}

export default function InterviewModePage({ onNavigate, interviewData }: InterviewModePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate("practice")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Interview Mode</h1>
          <p className="text-sm text-gray-600">
            {interviewData.jobTitle} {interviewData.company && `at ${interviewData.company}`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate("voice-interview")}
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <span>Start Interview with Voice</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Mic-enabled interaction with voice responses from AI interviewer</p>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>• Uses speech recognition</li>
              <li>• AI speaks back to you</li>
              <li>• More realistic experience</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("text-interview")}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <span>Start Interview with Text</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Chat interface with text-based responses</p>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>• Type your responses</li>
              <li>• Read AI feedback</li>
              <li>• Great for quiet environments</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

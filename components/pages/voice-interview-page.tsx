"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, ArrowLeft, Volume2 } from "lucide-react"
import { interviewAPI } from "@/lib/api"

interface VoiceInterviewPageProps {
  onNavigate: (page: string) => void
  interviewData: { jobTitle: string; company: string; sessionId?: string }
}

export default function VoiceInterviewPage({ onNavigate, interviewData }: VoiceInterviewPageProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState(
    "Hello! I'm excited to interview you for the " +
      interviewData.jobTitle +
      " position" +
      (interviewData.company ? ` at ${interviewData.company}` : "") +
      ". Let's start with a simple question: Can you tell me a bit about yourself?",
  )
  const [isLoading, setIsLoading] = useState(false)

  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate speech recognition
      setTimeout(() => {
        setTranscript("I'm a passionate developer with 3 years of experience...")
        setIsListening(false)
        handleSendResponse("I'm a passionate developer with 3 years of experience...")
      }, 3000)
    }
  }

  const handleSendResponse = async (response: string) => {
    setIsLoading(true)
    try {
      // Use centralized API instead of mock setTimeout
      const result = await interviewAPI.sendResponse({
        sessionId: interviewData.sessionId || "fallback-session-id",
        userResponse: response,
        mode: "voice",
      })

      setAiResponse(result.aiResponse)
      setTranscript("")
    } catch (error) {
      console.error("Interview API error:", error)
      setAiResponse("Sorry, there was an error processing your response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const speakResponse = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(aiResponse)
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate("interview-mode")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Voice Interview</h1>
          <p className="text-sm text-gray-600">
            {interviewData.jobTitle} {interviewData.company && `at ${interviewData.company}`}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">AI Interviewer</span>
              <Button variant="ghost" size="sm" onClick={speakResponse}>
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-blue-900">{aiResponse}</p>
          </div>

          {transcript && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-medium text-gray-800">Your Response</span>
              <p className="text-gray-900 mt-1">{transcript}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full ${
                isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600">
            {isListening ? "Listening... Tap to stop" : "Tap to speak"}
          </p>

          {isLoading && <p className="text-center text-sm text-blue-600">AI is thinking...</p>}
        </CardContent>
      </Card>

      <Button onClick={() => onNavigate("progress")} variant="outline" className="w-full">
        End Interview
      </Button>
    </div>
  )
}

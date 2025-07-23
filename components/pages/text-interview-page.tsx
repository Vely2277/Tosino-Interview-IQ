"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"

interface TextInterviewPageProps {
  onNavigate: (page: string) => void
  interviewData: { jobTitle: string; company: string }
}

interface Message {
  type: "ai" | "user"
  content: string
  timestamp: Date
}

export default function TextInterviewPage({ onNavigate, interviewData }: TextInterviewPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      content: `Hello! I'm excited to interview you for the ${interviewData.jobTitle} position${interviewData.company ? ` at ${interviewData.company}` : ""}. Let's start with a simple question: Can you tell me a bit about yourself?`,
      timestamp: new Date(),
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage: Message = {
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const aiMessage: Message = {
        type: "ai",
        content:
          "That's great! Can you tell me about a challenging project you've worked on recently and how you overcame the obstacles?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate("interview-mode")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Text Interview</h1>
          <p className="text-sm text-gray-600">
            {interviewData.jobTitle} {interviewData.company && `at ${interviewData.company}`}
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">AI is typing...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !currentMessage.trim()} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => onNavigate("progress")} variant="outline" className="w-full">
        End Interview
      </Button>
    </div>
  )
}

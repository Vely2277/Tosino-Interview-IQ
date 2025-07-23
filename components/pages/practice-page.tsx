"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import { interviewAPI } from "@/lib/api"

interface PracticePageProps {
  onNavigate: (page: string) => void
  setInterviewData: (data: { jobTitle: string; company: string; sessionId?: string }) => void
}

export default function PracticePage({ onNavigate, setInterviewData }: PracticePageProps) {
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")

  const handleStartInterview = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title")
      return
    }

    try {
      // Initialize interview session with backend
      const sessionData = await interviewAPI.startInterview({
        jobTitle,
        company,
        mode: "text", // Default mode, will be updated in interview-mode page
      })

      // Store session data for use in interview components
      setInterviewData({
        jobTitle,
        company,
        sessionId: sessionData.sessionId, // Add session ID for API calls
      })

      onNavigate("interview-mode")
    } catch (error) {
      console.error("Failed to start interview session:", error)
      // Fallback to original behavior if API fails
      setInterviewData({ jobTitle, company })
      onNavigate("interview-mode")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Practice Interview</h1>
        <p className="text-gray-600">Set up your interview session</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interview Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Frontend Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              placeholder="e.g., Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleStartInterview} className="w-full bg-green-600 hover:bg-green-700" size="lg">
        <CheckCircle className="mr-2 h-5 w-5" />
        Start Interview
      </Button>
    </div>
  )
}

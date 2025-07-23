"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, CheckCircle, Clock } from "lucide-react"
import { progressAPI } from "@/lib/api"
import { useState, useEffect } from "react"

export default function ProgressPage() {
  const [stats, setStats] = useState([
    { label: "Total Sessions", value: "Loading...", icon: Clock },
    { label: "Overall Score", value: "Loading...", icon: TrendingUp },
    { label: "Questions Answered", value: "Loading...", icon: Users },
    { label: "Completed", value: "Loading...", icon: CheckCircle },
  ])

  const [jobHistory, setJobHistory] = useState<Array<{ title: string; sessions: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        // Use centralized API instead of static data
        const [statsResult, historyResult] = await Promise.all([progressAPI.getStats(), progressAPI.getHistory()])

        setStats([
          { label: "Total Sessions", value: statsResult.totalSessions?.toString() || "4", icon: Clock },
          { label: "Overall Score", value: statsResult.overallScore || "40%", icon: TrendingUp },
          { label: "Questions Answered", value: statsResult.questionsAnswered?.toString() || "1", icon: Users },
          { label: "Completed", value: statsResult.completed?.toString() || "1", icon: CheckCircle },
        ])

        setJobHistory(
          historyResult.jobHistory || [
            { title: "Website developer", sessions: 3 },
            { title: "Web developer", sessions: 1 },
          ],
        )
      } catch (error) {
        console.error("Progress API error:", error)
        // Keep default values on error
        setStats([
          { label: "Total Sessions", value: "4", icon: Clock },
          { label: "Overall Score", value: "40%", icon: TrendingUp },
          { label: "Questions Answered", value: "1", icon: Users },
          { label: "Completed", value: "1", icon: CheckCircle },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgressData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-600">Track your interview performance and improvement over time</p>
        <p className="text-lg font-medium text-blue-600">Welcome back, Vely Mand</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Over Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Complete more sessions to see your progress chart.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Titles History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobHistory.map((job, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{job.title}</span>
              <span className="text-sm text-gray-600">{job.sessions} sessions</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

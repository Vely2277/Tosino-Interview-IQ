"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Users, DollarSign } from "lucide-react"
import { hubAPI } from "@/lib/api"

export default function HubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [insights, setInsights] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      // Use centralized API instead of mock setTimeout
      const result = await hubAPI.getInsights(searchQuery.trim())

      setInsights({
        role: searchQuery,
        marketDemand: result.marketDemand || "High",
        averageSalary: result.averageSalary || "$75,000 - $120,000",
        commonRequirements: result.commonRequirements || [
          "JavaScript/TypeScript",
          "React or Vue.js",
          "HTML/CSS",
          "Git version control",
          "Problem-solving skills",
        ],
        summary:
          result.summary ||
          `${searchQuery} roles are in high demand across the tech industry. Companies are looking for candidates with strong technical skills and the ability to work in collaborative environments.`,
      })
    } catch (error) {
      console.error("Hub insights error:", error)
      setInsights({
        role: searchQuery,
        marketDemand: "Data unavailable",
        averageSalary: "Contact for details",
        commonRequirements: ["Unable to fetch requirements"],
        summary: "Sorry, we couldn't fetch insights for this role. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Career Hub</h1>
        <p className="text-gray-600">Get AI-powered insights into the job market for any role</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type any role (e.g. Data Analyst)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Analyzing job market data...</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Market Overview: {insights.role}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-green-800">Market Demand</p>
                  <p className="text-green-600">{insights.marketDemand}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-blue-800">Salary Range</p>
                  <p className="text-blue-600 text-sm">{insights.averageSalary}</p>
                </div>
              </div>
              <p className="text-gray-700">{insights.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.commonRequirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{req}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

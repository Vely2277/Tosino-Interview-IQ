"use client"

import { useState } from "react"
import BottomNav from "@/components/bottom-nav"
import HomePage from "@/components/pages/home-page"
import PracticePage from "@/components/pages/practice-page"
import ProgressPage from "@/components/pages/progress-page"
import CvPage from "@/components/pages/cv-page"
import CreateCvPage from "@/components/pages/create-cv-page"
import HubPage from "@/components/pages/hub-page"
import PricingPage from "@/components/pages/pricing-page"
import InterviewModePage from "@/components/pages/interview-mode-page"
import VoiceInterviewPage from "@/components/pages/voice-interview-page"
import TextInterviewPage from "@/components/pages/text-interview-page"

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [interviewData, setInterviewData] = useState({ jobTitle: "", company: "" })

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />
      case "practice":
        return <PracticePage onNavigate={setCurrentPage} setInterviewData={setInterviewData} />
      case "interview-mode":
        return <InterviewModePage onNavigate={setCurrentPage} interviewData={interviewData} />
      case "voice-interview":
        return <VoiceInterviewPage onNavigate={setCurrentPage} interviewData={interviewData} />
      case "text-interview":
        return <TextInterviewPage onNavigate={setCurrentPage} interviewData={interviewData} />
      case "progress":
        return <ProgressPage />
      case "cv":
        return <CvPage onNavigate={setCurrentPage} />
      case "create-cv":
        return <CreateCvPage onNavigate={setCurrentPage} />
      case "hub":
        return <HubPage />
      case "pricing":
        return <PricingPage />
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">{renderPage()}</main>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

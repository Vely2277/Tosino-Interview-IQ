"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, Wrench, Sparkles } from "lucide-react"

interface CvPageProps {
  onNavigate: (page: string) => void
}

export default function CvPage({ onNavigate }: CvPageProps) {
  const [cvText, setCvText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleOptimizeCV = async () => {
    if (!cvText.trim() && !selectedFile) {
      alert("Please paste CV text or upload a file")
      return
    }

    setIsOptimizing(true)
    // Simulate API call
    setTimeout(() => {
      alert("CV optimization complete! Check your email for the improved version.")
      setIsOptimizing(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CV Optimizer</h1>
        <p className="text-gray-600">Improve your CV with AI-powered suggestions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Option 1: Paste CV Text</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="cvText">Paste your CV text here</Label>
            <Textarea
              id="cvText"
              placeholder="Paste your CV content here..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Option 2: Upload File</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="cvFile">Upload CV file</Label>
            <Input id="cvFile" type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
            {selectedFile && <p className="text-sm text-green-600">Selected: {selectedFile.name}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={handleOptimizeCV}
          disabled={isOptimizing}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Wrench className="mr-2 h-5 w-5" />
          {isOptimizing ? "Optimizing CV..." : "Optimize CV"}
        </Button>

        <Button onClick={() => onNavigate("create-cv")} variant="outline" className="w-full" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Create CV
        </Button>
      </div>
    </div>
  )
}

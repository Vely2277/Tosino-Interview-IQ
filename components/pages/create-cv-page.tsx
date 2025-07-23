"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, Sparkles } from "lucide-react"
import { cvAPI } from "@/lib/api"

interface CreateCvPageProps {
  onNavigate: (page: string) => void
}

export default function CreateCvPage({ onNavigate }: CreateCvPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    workExperience: "",
    skills: "",
    education: "",
    previousCompanies: "",
    achievements: "",
  })
  const [generatedCV, setGeneratedCV] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerateCV = async () => {
    if (!formData.name || !formData.role) {
      alert("Please fill in at least Name and Role")
      return
    }

    setIsGenerating(true)
    try {
      // Use centralized API instead of mock setTimeout
      const result = await cvAPI.generateCV({
        name: formData.name,
        role: formData.role,
        workExperience: formData.workExperience,
        skills: formData.skills,
        education: formData.education,
        previousCompanies: formData.previousCompanies,
        achievements: formData.achievements,
      })

      setGeneratedCV(
        result.generatedCV ||
          `
${formData.name}
${formData.role}

PROFESSIONAL SUMMARY
${result.summary || `Experienced ${formData.role} with a proven track record of delivering high-quality solutions.`}

WORK EXPERIENCE
${formData.workExperience || "Professional experience in various roles"}

SKILLS
${formData.skills || "Technical and soft skills relevant to the role"}

EDUCATION
${formData.education || "Educational background and certifications"}

PREVIOUS COMPANIES
${formData.previousCompanies || "Experience with leading organizations"}

KEY ACHIEVEMENTS
${formData.achievements || "Notable accomplishments and contributions"}
    `,
      )
    } catch (error) {
      console.error("CV generation error:", error)
      alert("Sorry, there was an error generating your CV. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = () => {
    // In a real app, you'd use jsPDF here
    alert("PDF download feature would be implemented with jsPDF library")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => onNavigate("cv")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create CV</h1>
          <p className="text-gray-600">AI-generated CV from your input</p>
        </div>
      </div>

      {!generatedCV ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    placeholder="e.g., Frontend Developer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workExperience">Work Experience</Label>
                <Textarea
                  id="workExperience"
                  value={formData.workExperience}
                  onChange={(e) => handleInputChange("workExperience", e.target.value)}
                  placeholder="Describe your work experience..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="List your technical and soft skills..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange("education", e.target.value)}
                  placeholder="Your educational background..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousCompanies">Previous Companies</Label>
                <Textarea
                  id="previousCompanies"
                  value={formData.previousCompanies}
                  onChange={(e) => handleInputChange("previousCompanies", e.target.value)}
                  placeholder="Companies you've worked for..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievements">Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange("achievements", e.target.value)}
                  placeholder="Your key achievements and accomplishments..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerateCV}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {isGenerating ? "Generating CV..." : "Generate CV"}
          </Button>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Generated CV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button onClick={handleDownloadPDF} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Download as PDF
            </Button>

            <Button onClick={() => setGeneratedCV("")} variant="outline" className="w-full">
              Edit CV
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

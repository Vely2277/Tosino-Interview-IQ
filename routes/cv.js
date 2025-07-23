const express = require("express")
const multer = require("multer")
const { generateAIResponse } = require("../config/openai")

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."))
    }
  },
})

// Optimize CV
router.post("/optimize", upload.single("file"), async (req, res) => {
  try {
    const { cvText } = req.body
    const file = req.file

    if (!cvText && !file) {
      return res.status(400).json({ error: "Either CV text or file is required" })
    }

    let contentToOptimize = cvText

    // If file is uploaded, extract text (simplified - in production, use proper PDF/DOC parsers)
    if (file) {
      if (file.mimetype === "text/plain") {
        contentToOptimize = file.buffer.toString("utf-8")
      } else {
        // For PDF/DOC files, you'd use libraries like pdf-parse or mammoth
        contentToOptimize = `[File uploaded: ${file.originalname}] - Content extraction would be implemented with appropriate libraries`
      }
    }

    // Generate CV optimization suggestions
    const optimizationPrompt = `As an expert CV reviewer, analyze the following CV and provide specific, actionable suggestions for improvement. Focus on:
    1. Content structure and organization
    2. Skills presentation
    3. Experience descriptions
    4. Keywords for ATS systems
    5. Overall professional presentation

    CV Content:
    ${contentToOptimize}

    Provide a detailed analysis with specific recommendations.`

    const optimization = await generateAIResponse(
      [
        {
          role: "system",
          content:
            "You are an expert CV reviewer and career coach with 10+ years of experience helping candidates improve their resumes.",
        },
        { role: "user", content: optimizationPrompt },
      ],
      {
        maxTokens: 800,
        temperature: 0.7,
      },
    )

    res.json({
      message: "CV optimization completed successfully",
      optimization,
      originalLength: contentToOptimize.length,
      suggestions: optimization,
    })
  } catch (error) {
    console.error("CV optimization error:", error)
    res.status(500).json({ error: "Failed to optimize CV" })
  }
})

// Generate CV
router.post("/generate", async (req, res) => {
  try {
    const { name, role, workExperience, skills, education, previousCompanies, achievements } = req.body

    if (!name || !role) {
      return res.status(400).json({ error: "Name and role are required" })
    }

    // Generate professional CV
    const cvPrompt = `Create a professional CV for the following person:

    Name: ${name}
    Target Role: ${role}
    Work Experience: ${workExperience || "Not specified"}
    Skills: ${skills || "Not specified"}
    Education: ${education || "Not specified"}
    Previous Companies: ${previousCompanies || "Not specified"}
    Achievements: ${achievements || "Not specified"}

    Generate a well-structured, professional CV with:
    1. Professional summary
    2. Core competencies
    3. Professional experience (with bullet points)
    4. Education
    5. Key achievements
    6. Skills section

    Format it professionally and make it ATS-friendly.`

    const generatedCV = await generateAIResponse(
      [
        {
          role: "system",
          content:
            "You are an expert CV writer who creates professional, ATS-friendly resumes that help candidates land interviews.",
        },
        { role: "user", content: cvPrompt },
      ],
      {
        maxTokens: 1000,
        temperature: 0.6,
      },
    )

    // Generate a professional summary
    const summaryPrompt = `Based on the role "${role}" and the provided information, create a compelling 2-3 sentence professional summary that highlights key strengths and value proposition.`

    const summary = await generateAIResponse(
      [
        { role: "system", content: "You are an expert at writing compelling professional summaries for CVs." },
        { role: "user", content: summaryPrompt },
      ],
      {
        maxTokens: 150,
        temperature: 0.7,
      },
    )

    res.json({
      message: "CV generated successfully",
      generatedCV,
      summary,
      targetRole: role,
      candidateName: name,
    })
  } catch (error) {
    console.error("CV generation error:", error)
    res.status(500).json({ error: "Failed to generate CV" })
  }
})

// Upload CV for analysis
router.post("/upload", upload.single("cv"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" })
    }

    const file = req.file
    let extractedText = ""

    // Extract text based on file type
    if (file.mimetype === "text/plain") {
      extractedText = file.buffer.toString("utf-8")
    } else {
      // For production, implement proper PDF/DOC parsing
      extractedText = `File uploaded: ${file.originalname} (${file.size} bytes)`
    }

    // Analyze the CV
    const analysisPrompt = `Analyze this CV and provide:
    1. Overall assessment (score out of 10)
    2. Strengths
    3. Areas for improvement
    4. Missing elements
    5. ATS compatibility score

    CV Content:
    ${extractedText}`

    const analysis = await generateAIResponse(
      [
        { role: "system", content: "You are an expert CV analyzer who provides detailed, constructive feedback." },
        { role: "user", content: analysisPrompt },
      ],
      {
        maxTokens: 600,
        temperature: 0.6,
      },
    )

    res.json({
      message: "CV uploaded and analyzed successfully",
      fileName: file.originalname,
      fileSize: file.size,
      analysis,
      extractedText: extractedText.substring(0, 500) + "...", // Preview
    })
  } catch (error) {
    console.error("CV upload error:", error)
    res.status(500).json({ error: "Failed to upload and analyze CV" })
  }
})

module.exports = router

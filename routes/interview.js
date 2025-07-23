const express = require("express")
const { v4: uuidv4 } = require("uuid")
const { generateAIResponse } = require("../config/openai")

const router = express.Router()

// In-memory session storage (use Redis/Database in production)
const interviewSessions = new Map()

// Start interview session
router.post("/start", async (req, res) => {
  try {
    const { jobTitle, company, mode } = req.body

    if (!jobTitle) {
      return res.status(400).json({ error: "Job title is required" })
    }

    const sessionId = uuidv4()
    const session = {
      id: sessionId,
      jobTitle,
      company: company || "",
      mode: mode || "text",
      messages: [],
      startTime: new Date(),
      status: "active",
    }

    // Generate initial AI greeting
    const systemPrompt = `You are an experienced HR interviewer conducting a job interview for the position of ${jobTitle}${company ? ` at ${company}` : ""}. 
    Be professional, friendly, and ask relevant questions about the candidate's experience, skills, and fit for the role. 
    Start with a warm greeting and an opening question.`

    const initialMessage = await generateAIResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Please start the interview with a greeting and first question." },
    ])

    session.messages.push({
      role: "assistant",
      content: initialMessage,
      timestamp: new Date(),
    })

    interviewSessions.set(sessionId, session)

    res.json({
      sessionId,
      message: "Interview session started successfully",
      initialMessage,
    })
  } catch (error) {
    console.error("Start interview error:", error)
    res.status(500).json({ error: "Failed to start interview session" })
  }
})

// Handle interview responses
router.post("/respond", async (req, res) => {
  try {
    const { sessionId, userResponse, mode } = req.body

    if (!sessionId || !userResponse) {
      return res.status(400).json({ error: "Session ID and user response are required" })
    }

    const session = interviewSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" })
    }

    // Add user response to session
    session.messages.push({
      role: "user",
      content: userResponse,
      timestamp: new Date(),
    })

    // Generate AI response
    const systemPrompt = `You are an experienced HR interviewer for the position of ${session.jobTitle}${session.company ? ` at ${session.company}` : ""}. 
    Continue the interview naturally, ask follow-up questions, and provide constructive feedback. 
    Keep responses concise and professional.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...session.messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    ]

    const aiResponse = await generateAIResponse(messages, {
      maxTokens: 300,
      temperature: 0.8,
    })

    // Add AI response to session
    session.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    })

    // Update session
    interviewSessions.set(sessionId, session)

    res.json({
      aiResponse,
      sessionId,
      messageCount: session.messages.length,
    })
  } catch (error) {
    console.error("Interview respond error:", error)
    res.status(500).json({ error: "Failed to process interview response" })
  }
})

// End interview session
router.post("/end", async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" })
    }

    const session = interviewSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" })
    }

    // Generate interview summary
    const summaryPrompt = `Based on this interview conversation, provide a brief summary of the candidate's performance, strengths, and areas for improvement. Keep it constructive and helpful.`

    const messages = [
      { role: "system", content: summaryPrompt },
      ...session.messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    ]

    const summary = await generateAIResponse(messages, {
      maxTokens: 200,
      temperature: 0.6,
    })

    // Mark session as completed
    session.status = "completed"
    session.endTime = new Date()
    session.summary = summary
    session.duration = session.endTime - session.startTime

    interviewSessions.set(sessionId, session)

    res.json({
      message: "Interview session ended successfully",
      summary,
      duration: Math.round(session.duration / 1000 / 60), // minutes
      messageCount: session.messages.length,
    })
  } catch (error) {
    console.error("End interview error:", error)
    res.status(500).json({ error: "Failed to end interview session" })
  }
})

// Get interview session details
router.get("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params
    const session = interviewSessions.get(sessionId)

    if (!session) {
      return res.status(404).json({ error: "Interview session not found" })
    }

    res.json({
      sessionId: session.id,
      jobTitle: session.jobTitle,
      company: session.company,
      status: session.status,
      startTime: session.startTime,
      endTime: session.endTime,
      messageCount: session.messages.length,
      summary: session.summary,
    })
  } catch (error) {
    console.error("Get session error:", error)
    res.status(500).json({ error: "Failed to retrieve session details" })
  }
})

module.exports = router

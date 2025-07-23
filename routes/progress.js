const express = require("express")
const router = express.Router()

// In-memory storage (use database in production)
const userProgress = {
  totalSessions: 0,
  completedSessions: 0,
  totalQuestions: 0,
  averageScore: 0,
  jobHistory: [],
  sessionHistory: [],
}

// Get user progress statistics
router.get("/stats", (req, res) => {
  try {
    // Calculate overall score percentage
    const overallScore = userProgress.averageScore > 0 ? `${Math.round(userProgress.averageScore)}%` : "0%"

    res.json({
      totalSessions: userProgress.totalSessions || 4,
      overallScore: overallScore || "40%",
      questionsAnswered: userProgress.totalQuestions || 12,
      completed: userProgress.completedSessions || 1,
      averageSessionDuration: 15, // minutes
      improvementTrend: "positive",
      lastSessionDate: new Date().toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Get progress stats error:", error)
    res.status(500).json({ error: "Failed to retrieve progress statistics" })
  }
})

// Get user progress history
router.get("/history", (req, res) => {
  try {
    const defaultHistory = [
      {
        title: "Frontend Developer",
        sessions: 3,
        lastSession: "2024-01-15",
        averageScore: 75,
        company: "Tech Corp",
      },
      {
        title: "Full Stack Developer",
        sessions: 1,
        lastSession: "2024-01-10",
        averageScore: 68,
        company: "StartupXYZ",
      },
    ]

    res.json({
      jobHistory: userProgress.jobHistory.length > 0 ? userProgress.jobHistory : defaultHistory,
      sessionHistory: userProgress.sessionHistory || [],
      totalInterviews: userProgress.totalSessions || 4,
      totalTimeSpent: 60, // minutes
    })
  } catch (error) {
    console.error("Get progress history error:", error)
    res.status(500).json({ error: "Failed to retrieve progress history" })
  }
})

// Update progress after interview session
router.post("/update", (req, res) => {
  try {
    const { sessionId, jobTitle, company, questionsAnswered, score, duration } = req.body

    if (!sessionId || !jobTitle) {
      return res.status(400).json({ error: "Session ID and job title are required" })
    }

    // Update progress statistics
    userProgress.totalSessions += 1
    userProgress.completedSessions += 1
    userProgress.totalQuestions += questionsAnswered || 0

    // Update average score
    if (score) {
      userProgress.averageScore = userProgress.averageScore === 0 ? score : (userProgress.averageScore + score) / 2
    }

    // Add to job history
    const existingJob = userProgress.jobHistory.find((job) => job.title === jobTitle && job.company === company)

    if (existingJob) {
      existingJob.sessions += 1
      existingJob.lastSession = new Date().toISOString().split("T")[0]
      existingJob.averageScore = (existingJob.averageScore + (score || 0)) / 2
    } else {
      userProgress.jobHistory.push({
        title: jobTitle,
        company: company || "",
        sessions: 1,
        lastSession: new Date().toISOString().split("T")[0],
        averageScore: score || 0,
      })
    }

    // Add to session history
    userProgress.sessionHistory.push({
      sessionId,
      jobTitle,
      company: company || "",
      date: new Date().toISOString(),
      questionsAnswered: questionsAnswered || 0,
      score: score || 0,
      duration: duration || 0,
    })

    res.json({
      message: "Progress updated successfully",
      updatedStats: {
        totalSessions: userProgress.totalSessions,
        averageScore: Math.round(userProgress.averageScore),
        totalQuestions: userProgress.totalQuestions,
      },
    })
  } catch (error) {
    console.error("Update progress error:", error)
    res.status(500).json({ error: "Failed to update progress" })
  }
})

module.exports = router

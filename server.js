const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import routes
const interviewRoutes = require("./routes/interview")
const cvRoutes = require("./routes/cv")
const progressRoutes = require("./routes/progress")
const hubRoutes = require("./routes/hub")

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "InterviewIQ Backend is running!",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/interview", interviewRoutes)
app.use("/api/cv", cvRoutes)
app.use("/api/progress", progressRoutes)
app.use("/api/hub", hubRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong!",
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InterviewIQ Backend running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? "✅ Connected" : "❌ Missing API Key"}`)
})

module.exports = app

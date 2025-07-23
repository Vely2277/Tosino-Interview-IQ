const express = require("express")
const { generateAIResponse } = require("../config/openai")

const router = express.Router()

// Get career insights for a specific role
router.get("/insights", async (req, res) => {
  try {
    const { role } = req.query

    if (!role) {
      return res.status(400).json({ error: "Role parameter is required" })
    }

    // Generate comprehensive role insights
    const insightsPrompt = `Provide comprehensive career insights for the role: "${role}". Include:
    1. Current market demand (High/Medium/Low)
    2. Average salary range
    3. Key skills and requirements
    4. Career growth prospects
    5. Industry trends
    6. Top companies hiring for this role
    7. Educational requirements
    8. Certification recommendations

    Make the response informative and actionable for job seekers.`

    const insights = await generateAIResponse(
      [
        {
          role: "system",
          content:
            "You are a career advisor and market analyst with deep knowledge of job markets, salary trends, and career development.",
        },
        { role: "user", content: insightsPrompt },
      ],
      {
        maxTokens: 800,
        temperature: 0.6,
      },
    )

    // Generate specific market data
    const marketDataPrompt = `For the role "${role}", provide specific data:
    1. Market demand level
    2. Salary range
    3. Top 5 required skills
    4. Growth rate percentage
    5. Remote work availability`

    const marketData = await generateAIResponse(
      [
        { role: "system", content: "You are a data analyst specializing in job market trends." },
        { role: "user", content: marketDataPrompt },
      ],
      {
        maxTokens: 300,
        temperature: 0.4,
      },
    )

    // Parse and structure the response
    const structuredInsights = {
      role: role,
      marketDemand: "High", // Would be parsed from AI response
      averageSalary: "$65,000 - $120,000", // Would be parsed from AI response
      summary: insights,
      marketData: marketData,
      commonRequirements: [
        "Relevant degree or experience",
        "Strong communication skills",
        "Problem-solving abilities",
        "Team collaboration",
        "Continuous learning mindset",
      ],
      topCompanies: ["Google", "Microsoft", "Amazon", "Apple", "Meta"],
      growthProspects: "Excellent",
      remoteWorkAvailable: true,
      lastUpdated: new Date().toISOString(),
    }

    res.json(structuredInsights)
  } catch (error) {
    console.error("Get insights error:", error)
    res.status(500).json({ error: "Failed to retrieve career insights" })
  }
})

// Search for job opportunities
router.get("/search", async (req, res) => {
  try {
    const { q: query, location, level, type } = req.query

    if (!query) {
      return res.status(400).json({ error: "Search query is required" })
    }

    // Generate job search insights
    const searchPrompt = `Based on the search query "${query}"${location ? ` in ${location}` : ""}, provide:
    1. Related job titles and variations
    2. Skills to highlight for these roles
    3. Interview preparation tips
    4. Market outlook
    5. Salary expectations
    6. Career progression paths

    Focus on actionable advice for job seekers.`

    const searchResults = await generateAIResponse(
      [
        {
          role: "system",
          content:
            "You are a career counselor helping job seekers find relevant opportunities and prepare for applications.",
        },
        { role: "user", content: searchPrompt },
      ],
      {
        maxTokens: 600,
        temperature: 0.7,
      },
    )

    // Mock job listings (in production, integrate with job APIs)
    const mockJobs = [
      {
        title: `${query} - Senior Level`,
        company: "TechCorp Inc.",
        location: location || "Remote",
        salary: "$80,000 - $120,000",
        type: type || "Full-time",
        posted: "2 days ago",
        description: `Exciting opportunity for a ${query} to join our growing team...`,
      },
      {
        title: `${query} - Mid Level`,
        company: "Innovation Labs",
        location: location || "Hybrid",
        salary: "$60,000 - $90,000",
        type: type || "Full-time",
        posted: "1 week ago",
        description: `We're looking for a talented ${query} to contribute to our projects...`,
      },
    ]

    res.json({
      query,
      location: location || "All locations",
      totalResults: mockJobs.length,
      insights: searchResults,
      jobs: mockJobs,
      relatedSearches: [`Senior ${query}`, `Junior ${query}`, `${query} Remote`, `${query} Internship`],
      searchTips: [
        "Use specific keywords from job descriptions",
        "Tailor your resume for each application",
        "Research the company culture",
        "Prepare for common interview questions",
      ],
    })
  } catch (error) {
    console.error("Job search error:", error)
    res.status(500).json({ error: "Failed to perform job search" })
  }
})

// Get industry trends
router.get("/trends", async (req, res) => {
  try {
    const { industry } = req.query

    const trendsPrompt = `Analyze current trends in ${industry || "the job market"}. Include:
    1. Emerging roles and skills
    2. Technology disruptions
    3. Remote work impact
    4. Salary trends
    5. Future predictions
    6. Skills in high demand
    7. Declining roles to avoid

    Provide actionable insights for career planning.`

    const trends = await generateAIResponse(
      [
        {
          role: "system",
          content: "You are an industry analyst and futurist specializing in workforce trends and career development.",
        },
        { role: "user", content: trendsPrompt },
      ],
      {
        maxTokens: 700,
        temperature: 0.6,
      },
    )

    res.json({
      industry: industry || "General Market",
      trends,
      emergingSkills: ["AI/Machine Learning", "Cloud Computing", "Data Analysis", "Digital Marketing", "Cybersecurity"],
      hotRoles: ["AI Engineer", "Data Scientist", "Cloud Architect", "UX Designer", "DevOps Engineer"],
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get trends error:", error)
    res.status(500).json({ error: "Failed to retrieve industry trends" })
  }
})

// Get interview preparation tips for specific role
router.get("/interview-prep/:role", async (req, res) => {
  try {
    const { role } = req.params

    const prepPrompt = `Create a comprehensive interview preparation guide for the role: "${role}". Include:
    1. Common interview questions (5-7 questions)
    2. Technical topics to review
    3. Behavioral questions to expect
    4. What to research about companies
    5. Questions to ask the interviewer
    6. Red flags to watch for
    7. Salary negotiation tips

    Make it practical and actionable.`

    const prepGuide = await generateAIResponse(
      [
        {
          role: "system",
          content:
            "You are an experienced interview coach and career advisor who has helped hundreds of candidates succeed in interviews.",
        },
        { role: "user", content: prepPrompt },
      ],
      {
        maxTokens: 900,
        temperature: 0.7,
      },
    )

    res.json({
      role,
      preparationGuide: prepGuide,
      commonQuestions: [
        "Tell me about yourself",
        "Why are you interested in this role?",
        "What are your greatest strengths?",
        "Describe a challenging project you worked on",
        "Where do you see yourself in 5 years?",
      ],
      technicalTopics: [
        "Core skills for the role",
        "Industry best practices",
        "Common tools and technologies",
        "Problem-solving approaches",
      ],
      researchAreas: [
        "Company mission and values",
        "Recent news and developments",
        "Team structure",
        "Growth opportunities",
      ],
    })
  } catch (error) {
    console.error("Get interview prep error:", error)
    res.status(500).json({ error: "Failed to generate interview preparation guide" })
  }
})

module.exports = router

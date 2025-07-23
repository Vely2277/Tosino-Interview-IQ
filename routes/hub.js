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

module.exports = router

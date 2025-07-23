const OpenAI = require("openai")

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is required but not found in environment variables")
  process.exit(1)
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Test OpenAI connection
async function testOpenAIConnection() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5,
    })
    console.log("✅ OpenAI connection successful")
    return true
  } catch (error) {
    console.error("❌ OpenAI connection failed:", error.message)
    return false
  }
}

// Helper function to generate AI responses
async function generateAIResponse(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || "gpt-3.5-turbo",
      messages: messages,
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
      ...options,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error("OpenAI API Error:", error)
    throw new Error("Failed to generate AI response")
  }
}

module.exports = {
  openai,
  testOpenAIConnection,
  generateAIResponse,
}

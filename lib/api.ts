// 🔧 CONFIGURATION - Update this section with your backend details
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  ENDPOINTS: {
    // Interview endpoints
    INTERVIEW_START: "/api/interview/start",
    INTERVIEW_RESPOND: "/api/interview/respond",
    INTERVIEW_END: "/api/interview/end",

    // CV endpoints
    CV_OPTIMIZE: "/api/cv/optimize",
    CV_GENERATE: "/api/cv/generate",
    CV_UPLOAD: "/api/cv/upload",

    // Progress endpoints
    PROGRESS_STATS: "/api/progress/stats",
    PROGRESS_HISTORY: "/api/progress/history",

    // Hub endpoints
    HUB_INSIGHTS: "/api/hub/insights",
    HUB_SEARCH: "/api/hub/search",
  },
}

// 🛠️ Base API function with error handling
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      // Add auth headers here if needed
      // 'Authorization': `Bearer ${getAuthToken()}`,
    },
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

// 🎤 INTERVIEW API FUNCTIONS
export const interviewAPI = {
  startInterview: async (data: { jobTitle: string; company?: string; mode: "voice" | "text" }) => {
    return apiCall(API_CONFIG.ENDPOINTS.INTERVIEW_START, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  sendResponse: async (data: { sessionId: string; userResponse: string; mode: "voice" | "text" }) => {
    return apiCall(API_CONFIG.ENDPOINTS.INTERVIEW_RESPOND, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  endInterview: async (sessionId: string) => {
    return apiCall(API_CONFIG.ENDPOINTS.INTERVIEW_END, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
  },
}

// 📄 CV API FUNCTIONS
export const cvAPI = {
  optimizeCV: async (data: { cvText?: string; file?: File }) => {
    const formData = new FormData()
    if (data.cvText) formData.append("cvText", data.cvText)
    if (data.file) formData.append("file", data.file)

    return apiCall(API_CONFIG.ENDPOINTS.CV_OPTIMIZE, {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type for FormData
    })
  },

  generateCV: async (data: {
    name: string
    role: string
    workExperience?: string
    skills?: string
    education?: string
    previousCompanies?: string
    achievements?: string
  }) => {
    return apiCall(API_CONFIG.ENDPOINTS.CV_GENERATE, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}

// 📊 PROGRESS API FUNCTIONS
export const progressAPI = {
  getStats: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.PROGRESS_STATS, {
      method: "GET",
    })
  },

  getHistory: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.PROGRESS_HISTORY, {
      method: "GET",
    })
  },
}

// 🌐 HUB API FUNCTIONS
export const hubAPI = {
  getInsights: async (role: string) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.HUB_INSIGHTS}?role=${encodeURIComponent(role)}`, {
      method: "GET",
    })
  },

  searchJobs: async (query: string) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.HUB_SEARCH}?q=${encodeURIComponent(query)}`, {
      method: "GET",
    })
  },
}

// 🔧 Utility function to update base URL (for testing different environments)
export const updateAPIBaseURL = (newBaseURL: string) => {
  API_CONFIG.BASE_URL = newBaseURL
}

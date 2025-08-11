// Utility to get the WebSocket URL for voice interview streaming
export const getVoiceWebSocketUrl = () => {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable must be set for WebSocket connection.");
  }
  // Remove any trailing slash for consistency
  const cleanBackendUrl = backendUrl.replace(/\/$/, "");
  return cleanBackendUrl.replace(/^http/, "ws") + "/api/voice/webrtcSignaling";
};
import { createSupabaseClient } from './supabase';

// Get the backend URL from environment
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

// Get the current session and access token
const getAuthHeaders = async () => {
  try {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw new Error('Authentication required');
  }
};

// Generic API call function with authentication
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const headers = await getAuthHeaders();
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Interview API calls
export const interviewAPI = {
  start: async (jobTitle: string, company: string, mode: 'text' | 'voice' = 'text') => {
    return apiCall('/api/interview/start', {
      method: 'POST',
      body: JSON.stringify({ jobTitle, company, mode }),
    });
  },

  respond: async (sessionId: string, userResponse: string, mode: 'text' | 'voice' = 'text') => {
    return apiCall('/api/interview/respond', {
      method: 'POST',
      body: JSON.stringify({ sessionId, userResponse, mode }),
    });
  },

  end: async (sessionId: string) => {
    return apiCall('/api/interview/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  getSession: async (sessionId: string) => {
    return apiCall(`/api/interview/session/${sessionId}`, {
      method: 'GET',
    });
  },
};

// Progress API calls
export const progressAPI = {
  getStats: async () => {
    return apiCall('/api/progress/stats', {
      method: 'GET',
    });
  },

  getHistory: async () => {
    return apiCall('/api/progress/history', {
      method: 'GET',
    });
  },

  getInterviewHistory: async () => {
    return apiCall('/api/progress/history/interview', {
      method: 'GET',
    });
  },

  update: async (sessionId: string, jobTitle: string, company: string, questionsAnswered: number, score: number, duration: number) => {
    return apiCall('/api/progress/update', {
      method: 'POST',
      body: JSON.stringify({ sessionId, jobTitle, company, questionsAnswered, score, duration }),
    });
  },
};

// CV API calls
export const cvAPI = {
  generate: async (data: {
    name: string;
    role: string;
    workExperience: string;
    skills: string;
    education: string;
    previousCompanies: string;
    achievements: string;
  }) => {
    return apiCall('/api/cv/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  optimize: async (cvText?: string, file?: File) => {
    const formData = new FormData();
    if (cvText) formData.append('cvText', cvText);
    if (file) formData.append('file', file);

    try {
      const headers = await getAuthHeaders();
      // Remove Content-Type for FormData (browser will set it automatically with boundary)
      delete (headers as any)['Content-Type'];
      const backendUrl = getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/cv/optimize`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('CV optimize API call failed:', error);
      throw error;
    }
  },
};

// Hub API calls
export const hubAPI = {
  getInsights: async (role: string) => {
    return apiCall(`/api/hub/insights?role=${encodeURIComponent(role)}`, {
      method: 'GET',
    });
  },

  search: async (query: string, location: string = 'Remote', level: string = 'All levels', type: string = 'Full-time') => {
    const params = new URLSearchParams({
      q: query,
      location,
      level,
      type,
    });
    
    return apiCall(`/api/hub/search?${params.toString()}`, {
      method: 'GET',
    });
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    return apiCall('/api/users/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (profileData: any) => {
    return apiCall('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Auth API calls
export const authAPI = {
  getStatus: async () => {
    return apiCall('/api/auth/status', {
      method: 'GET',
    });
  },
};

// Health check (public endpoint - no auth required)
export const healthAPI = {
  check: async () => {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/health`);
    return response.json();
  },
};

// Google Cloud Talent Solution API Client
// This client communicates with our backend proxy server

interface JobSearchFilters {
  query?: string;
  location?: string;
  radius?: number;
  companies?: string[];
  specialization?: string;
  certifications?: string[];
  clearanceLevel?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  pageSize?: number;
  offset?: number;
}

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  specialization: string;
  posted: string;
  description: string;
  certifications: string[];
  clearance: string;
  matchScore: number;
  applicationUrl: string;
}

interface MarketInsights {
  totalJobs: number;
  averageSalary: string;
  topLocation: string;
  weeklyGrowth: number;
  salaryTrends: {
    specialization: string;
    averageSalary: number;
    jobCount: number;
  }[];
  topSkills: {
    skill: string;
    demandGrowth: number;
    jobCount: number;
  }[];
  companyActivity: {
    company: string;
    openings: number;
    weeklyChange: number;
    avgTimeToFill: string;
  }[];
}

// Backend server URL - change this for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to get or create user ID
const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Search for data center jobs
export const searchDataCenterJobs = async (
  filters: JobSearchFilters,
  pageToken?: string
): Promise<{ jobs: JobResult[]; nextPageToken?: string; totalResults: number }> => {
  try {
    // Convert pageToken to offset
    const offset = pageToken ? parseInt(pageToken) : 0;
    
    const requestBody = {
      ...filters,
      offset,
      userId: getUserId(),
      pageSize: filters.pageSize || 20
    };
    
    console.log('Sending request to backend:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/api/jobs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error:', error);
      
      // Fall back to mock data if backend is unavailable
      if (response.status === 404 || response.status === 502) {
        console.log('Backend unavailable, using mock data');
        const { searchDataCenterJobs: mockSearch } = await import('./googleJobsApiProxy');
        return mockSearch(filters, pageToken);
      }
      
      throw new Error(error.message || 'Failed to search jobs');
    }
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    // Convert offset back to pageToken for pagination
    const nextOffset = offset + (data.jobs?.length || 0);
    const hasMore = nextOffset < data.totalResults;
    
    return {
      jobs: data.jobs || [],
      nextPageToken: hasMore ? nextOffset.toString() : undefined,
      totalResults: data.totalResults || 0
    };
    
  } catch (error) {
    console.error('Error calling backend:', error);
    
    // Fall back to mock data on any error
    console.log('Using fallback mock data due to error');
    const { searchDataCenterJobs: mockSearch } = await import('./googleJobsApiProxy');
    return mockSearch(filters, pageToken);
  }
};

// Get job details
export const getJobDetails = async (jobId: string): Promise<JobResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${encodeURIComponent(jobId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get job details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting job details:', error);
    throw error;
  }
};

// Get market insights
export const getMarketInsights = async (filters?: any): Promise<MarketInsights> => {
  try {
    const queryParams = new URLSearchParams(filters || {});
    const response = await fetch(`${API_BASE_URL}/api/insights?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      // Fall back to mock insights
      const { getMarketInsights: mockInsights } = await import('./googleJobsApiProxy');
      return mockInsights();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting market insights:', error);
    
    // Fall back to mock insights
    const { getMarketInsights: mockInsights } = await import('./googleJobsApiProxy');
    return mockInsights();
  }
};

// Check backend health
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export default {
  searchDataCenterJobs,
  getJobDetails,
  getMarketInsights,
  checkBackendHealth
};
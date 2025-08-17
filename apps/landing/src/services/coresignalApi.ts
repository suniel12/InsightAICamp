// Coresignal API Client for Frontend
// This client communicates with our backend proxy server for Coresignal data

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
  limit?: number;
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
  source: string;
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

// Backend server URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Search for data center jobs via Coresignal
export const searchCoresignalJobs = async (
  filters: JobSearchFilters
): Promise<{ jobs: JobResult[]; totalResults: number; source: string }> => {
  try {
    console.log('Searching Coresignal for jobs with filters:', filters);
    
    const response = await fetch(`${API_BASE_URL}/api/coresignal/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Coresignal backend error:', error);
      
      // Fall back to mock data if backend is unavailable
      if (response.status === 404 || response.status === 502) {
        console.log('Backend unavailable, using mock data');
        const { searchDataCenterJobs: mockSearch } = await import('./googleJobsApiProxy');
        return {
          jobs: (await mockSearch(filters)).jobs,
          totalResults: (await mockSearch(filters)).totalResults,
          source: 'Mock Data'
        };
      }
      
      throw new Error(error.message || 'Failed to search jobs');
    }
    
    const data = await response.json();
    console.log('Coresignal response:', data);
    
    return {
      jobs: data.jobs || [],
      totalResults: data.totalResults || 0,
      source: data.source || 'Coresignal'
    };
    
  } catch (error) {
    console.error('Error calling Coresignal backend:', error);
    
    // Fall back to mock data on any error
    console.log('Using fallback mock data due to error');
    const { searchDataCenterJobs: mockSearch } = await import('./googleJobsApiProxy');
    const mockResult = await mockSearch(filters);
    return {
      jobs: mockResult.jobs,
      totalResults: mockResult.totalResults,
      source: 'Mock Data (Fallback)'
    };
  }
};

// Get job market analytics from Coresignal
export const getCoresignalAnalytics = async (): Promise<MarketInsights> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coresignal/analytics`, {
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
    console.error('Error getting Coresignal analytics:', error);
    
    // Fall back to mock insights
    const { getMarketInsights: mockInsights } = await import('./googleJobsApiProxy');
    return mockInsights();
  }
};

// Check backend health
export const checkCoresignalHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Coresignal health check failed:', error);
    return false;
  }
};

export default {
  searchCoresignalJobs,
  getCoresignalAnalytics,
  checkCoresignalHealth
};
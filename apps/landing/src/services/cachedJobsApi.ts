// Cached Jobs API Client for Frontend
// This client communicates with our backend to fetch jobs from the SQLite database cache

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
  page?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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
  latitude?: number;
  longitude?: number;
  category?: string;
}

interface JobSearchResponse {
  jobs: JobResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  source: string;
}

interface DatabaseStats {
  total_jobs: number;
  unique_companies: number;
  unique_locations: number;
  unique_specializations: number;
  oldest_job: string;
  newest_job: string;
  specializationBreakdown: {
    specialization: string;
    count: number;
  }[];
  topCompanies: {
    company: string;
    count: number;
  }[];
  latestSync?: {
    id: number;
    sync_started_at: string;
    sync_completed_at: string;
    total_jobs_fetched: number;
    source: string;
    status: string;
    error_message?: string;
    created_at: string;
  };
}

// Backend server URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Search for cached jobs from database
export const searchCachedJobs = async (
  filters: JobSearchFilters = {}
): Promise<JobSearchResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.specialization && filters.specialization !== 'All Specializations') {
      params.append('specialization', filters.specialization);
    }
    if (filters.companies && filters.companies.length > 0 && filters.companies[0] !== 'All Companies') {
      params.append('company', filters.companies[0]);
    }
    if (filters.location) params.append('location', filters.location);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(`${API_BASE_URL}/api/jobs/cached?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cached jobs: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Map database fields to frontend format
    return {
      jobs: data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        specialization: job.specialization,
        posted: job.posted,
        description: job.description,
        certifications: job.certifications || [],
        clearance: job.clearance,
        matchScore: job.matchScore || job.match_score,
        applicationUrl: job.application_url || job.applicationUrl,
        source: job.source,
        latitude: job.latitude,
        longitude: job.longitude,
        category: job.category
      })),
      pagination: data.pagination,
      source: data.source || 'Database Cache'
    };
    
  } catch (error) {
    console.error('Error fetching cached jobs:', error);
    throw error;
  }
};

// Get database statistics
export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/db-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch database stats: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error fetching database stats:', error);
    throw error;
  }
};

// Trigger a test sync (50 jobs)
export const triggerTestSync = async (clearExisting = false): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/sync-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clearExisting })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger test sync: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error triggering test sync:', error);
    throw error;
  }
};

// Trigger a full sync (configurable number of jobs)
export const triggerFullSync = async (totalJobs = 1000, clearExisting = false): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ totalJobs, clearExisting })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger full sync: ${response.statusText}`);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error triggering full sync:', error);
    throw error;
  }
};

// Check if cached data is available
export const checkCachedDataStatus = async (): Promise<{ available: boolean; jobCount: number; lastSync?: string }> => {
  try {
    const stats = await getDatabaseStats();
    
    return {
      available: stats.total_jobs > 0,
      jobCount: stats.total_jobs,
      lastSync: stats.latestSync?.sync_completed_at
    };
    
  } catch (error) {
    console.error('Error checking cached data status:', error);
    return {
      available: false,
      jobCount: 0
    };
  }
};
// Adzuna API Client for Frontend
// This client communicates with our backend proxy server for Adzuna data

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
  country?: string;
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
  totalResults: number;
  source: string;
  page?: number;
  totalPages?: number;
  mean?: number;
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
  source?: string;
}

// Backend server URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Search for data center jobs via Adzuna
export const searchAdzunaJobs = async (
  filters: JobSearchFilters
): Promise<JobSearchResponse> => {
  try {
    console.log('Searching Adzuna for jobs with filters:', filters);
    
    const response = await fetch(`${API_BASE_URL}/api/adzuna/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Adzuna backend error:', error);
      
      // Fall back to mock data if backend is unavailable
      if (response.status === 404 || response.status === 502) {
        console.log('Adzuna backend unavailable, using mock data');
        return getMockJobData(filters);
      }
      
      throw new Error(error.message || 'Failed to search jobs');
    }
    
    const data = await response.json();
    console.log('Adzuna response:', data);
    
    return {
      jobs: data.jobs || [],
      totalResults: data.totalResults || 0,
      source: data.source || 'Adzuna',
      page: data.page,
      totalPages: data.totalPages,
      mean: data.mean
    };
    
  } catch (error) {
    console.error('Error calling Adzuna backend:', error);
    
    // Fall back to mock data on any error
    console.log('Using fallback mock data due to error');
    return getMockJobData(filters);
  }
};

// Get job market analytics from Adzuna
export const getAdzunaAnalytics = async (): Promise<MarketInsights> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/adzuna/analytics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      // Fall back to mock insights
      return getMockAnalytics();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting Adzuna analytics:', error);
    
    // Fall back to mock insights
    return getMockAnalytics();
  }
};

// Check Adzuna API configuration status
export const checkAdzunaStatus = async (): Promise<{ configured: boolean; status: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/adzuna/status`);
    
    if (!response.ok) {
      return { configured: false, status: 'error' };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Adzuna status check failed:', error);
    return { configured: false, status: 'error' };
  }
};

// Mock data fallback
function getMockJobData(filters: JobSearchFilters): JobSearchResponse {
  const mockJobs: JobResult[] = [
    {
      id: 'adzuna-mock-1',
      title: 'Senior Data Center Engineer',
      company: 'Global Tech Solutions',
      location: 'Austin, TX',
      salary: '$95,000 - $120,000',
      type: 'Full-time, Permanent',
      specialization: 'Facilities/Mechanical',
      posted: '2 days ago',
      description: 'Lead data center operations team in maintaining critical infrastructure including HVAC, power, and cooling systems.',
      certifications: ['DCCA', 'EPI CDCP'],
      clearance: 'None',
      matchScore: 88,
      applicationUrl: '#',
      source: 'Mock Data (Adzuna)',
      category: 'Engineering'
    },
    {
      id: 'adzuna-mock-2',
      title: 'Network Operations Center Technician',
      company: 'CloudScale Inc',
      location: 'Ashburn, VA',
      salary: '$70,000 - $85,000',
      type: 'Full-time',
      specialization: 'Network Operations',
      posted: '5 days ago',
      description: 'Monitor and maintain network infrastructure in 24/7 NOC environment. Troubleshoot connectivity issues and coordinate with field teams.',
      certifications: ['CCNA', 'Network+'],
      clearance: 'Secret',
      matchScore: 82,
      applicationUrl: '#',
      source: 'Mock Data (Adzuna)',
      category: 'IT & Telecoms'
    },
    {
      id: 'adzuna-mock-3',
      title: 'Critical Power Systems Engineer',
      company: 'DataCenter Pro',
      location: 'Phoenix, AZ',
      salary: '$100,000 - $130,000',
      type: 'Full-time, Permanent',
      specialization: 'Electrical/Power',
      posted: '1 week ago',
      description: 'Design and maintain UPS systems, generators, and power distribution for mission-critical data center operations.',
      certifications: ['PE License', 'DCEP'],
      clearance: 'None',
      matchScore: 90,
      applicationUrl: '#',
      source: 'Mock Data (Adzuna)',
      category: 'Engineering'
    }
  ];
  
  // Filter mock data based on filters
  let filtered = [...mockJobs];
  
  if (filters.specialization && filters.specialization !== 'All Specializations') {
    filtered = filtered.filter(job => job.specialization === filters.specialization);
  }
  
  if (filters.location) {
    filtered = filtered.filter(job => 
      job.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  return {
    jobs: filtered,
    totalResults: filtered.length,
    source: 'Mock Data (Adzuna)',
    page: 1,
    totalPages: 1
  };
}

// Mock analytics fallback
function getMockAnalytics(): MarketInsights {
  return {
    totalJobs: 3842,
    averageSalary: '$94,500',
    topLocation: 'Northern Virginia',
    weeklyGrowth: 28,
    salaryTrends: [
      { specialization: 'Electrical/Power', averageSalary: 98000, jobCount: 845 },
      { specialization: 'Network Operations', averageSalary: 108000, jobCount: 768 },
      { specialization: 'Facilities/Mechanical', averageSalary: 88000, jobCount: 692 },
      { specialization: 'DCIM/BMS Controls', averageSalary: 102000, jobCount: 576 },
      { specialization: 'Security/Compliance', averageSalary: 95000, jobCount: 499 },
      { specialization: 'Critical Systems', averageSalary: 91000, jobCount: 462 }
    ],
    topSkills: [
      { skill: 'Cloud Infrastructure', demandGrowth: 52, jobCount: 612 },
      { skill: 'Python', demandGrowth: 48, jobCount: 543 },
      { skill: 'DCIM Software', demandGrowth: 41, jobCount: 487 },
      { skill: 'Critical Power', demandGrowth: 35, jobCount: 924 },
      { skill: 'Automation', demandGrowth: 46, jobCount: 502 }
    ],
    companyActivity: [
      { company: 'Amazon', openings: 156, weeklyChange: 18, avgTimeToFill: '23 days' },
      { company: 'Microsoft', openings: 128, weeklyChange: 12, avgTimeToFill: '26 days' },
      { company: 'Google', openings: 105, weeklyChange: -5, avgTimeToFill: '29 days' },
      { company: 'Meta', openings: 82, weeklyChange: 20, avgTimeToFill: '21 days' },
      { company: 'Oracle', openings: 58, weeklyChange: 7, avgTimeToFill: '34 days' },
      { company: 'Equinix', openings: 47, weeklyChange: 4, avgTimeToFill: '27 days' }
    ],
    source: 'Mock Data (Adzuna)'
  };
}

export default {
  searchAdzunaJobs,
  getAdzunaAnalytics,
  checkAdzunaStatus
};
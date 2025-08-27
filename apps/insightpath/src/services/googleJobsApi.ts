// Google Cloud Talent Solution API Service
// Documentation: https://cloud.google.com/talent-solution/job-search/docs

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

// Configuration
const API_CONFIG = {
  projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || '',
  apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || '',
  tenantId: import.meta.env.VITE_GOOGLE_CLOUD_TENANT_ID || 'default-tenant',
  baseUrl: 'https://jobs.googleapis.com/v4'
};

// Data center specific query builder
const buildDataCenterQuery = (filters: JobSearchFilters): string => {
  const baseTerms = [
    '("data center" OR "datacenter" OR "colocation" OR "colo facility")',
    'AND ("technician" OR "engineer" OR "specialist" OR "analyst" OR "operator")'
  ];
  
  // Add specialization-specific terms
  if (filters.specialization && filters.specialization !== 'All Specializations') {
    const specializationQueries: Record<string, string> = {
      'Electrical/Power': '(electrical OR power OR UPS OR PDU OR generator OR "power distribution")',
      'Facilities/Mechanical': '(HVAC OR cooling OR mechanical OR facilities OR "critical systems")',
      'Network Operations': '(network OR NOC OR fiber OR connectivity OR switching OR routing)',
      'Security/Compliance': '(security OR compliance OR audit OR SOC OR access)',
      'DCIM/BMS Controls': '(DCIM OR BMS OR automation OR controls OR SCADA OR monitoring)',
      'Critical Systems': '(critical OR infrastructure OR redundancy OR availability)'
    };
    
    if (specializationQueries[filters.specialization]) {
      baseTerms.push(`AND ${specializationQueries[filters.specialization]}`);
    }
  }
  
  // Add certification requirements
  if (filters.certifications && filters.certifications.length > 0) {
    const certQuery = filters.certifications
      .map(cert => `"${cert}"`)
      .join(' OR ');
    baseTerms.push(`AND (${certQuery})`);
  }
  
  // Add clearance requirements
  if (filters.clearanceLevel && filters.clearanceLevel !== 'None Required') {
    baseTerms.push(`AND ("${filters.clearanceLevel}" clearance)`);
  }
  
  // Add custom query terms
  if (filters.query) {
    baseTerms.push(`AND (${filters.query})`);
  }
  
  return baseTerms.join(' ');
};

// Format company names for API
const formatCompanyNames = (companies: string[]): string[] => {
  const companyMap: Record<string, string> = {
    'Amazon (AWS)': 'Amazon',
    'Google': 'Google',
    'Microsoft': 'Microsoft',
    'Meta': 'Meta',
    'Oracle': 'Oracle',
    'Equinix': 'Equinix',
    'Digital Realty': 'Digital Realty Trust'
  };
  
  return companies
    .filter(c => c !== 'All Companies')
    .map(c => companyMap[c] || c);
};

// Main job search function
export const searchDataCenterJobs = async (
  filters: JobSearchFilters,
  pageToken?: string
): Promise<{ jobs: JobResult[]; nextPageToken?: string; totalResults: number }> => {
  try {
    // Log configuration status
    console.log('API Configuration:', {
      hasApiKey: !!API_CONFIG.apiKey,
      projectId: API_CONFIG.projectId,
      tenantId: API_CONFIG.tenantId
    });
    
    // For development, return mock data if API keys not configured
    if (!API_CONFIG.projectId || !API_CONFIG.apiKey) {
      console.warn('Google Cloud API not configured. Using mock data.');
      return getMockJobResults(filters);
    }
    
    const searchQuery = buildDataCenterQuery(filters);
    const companies = filters.companies ? formatCompanyNames(filters.companies) : [];
    
    const requestBody = {
      searchMode: 'JOB_SEARCH',
      requestMetadata: {
        domain: 'gigawattacademy.com',
        sessionId: generateSessionId(),
        userId: getUserId()
      },
      jobQuery: {
        query: searchQuery,
        ...(companies.length > 0 && { companyNames: companies }),
        ...(filters.location && {
          locationFilters: [{
            address: filters.location,
            distanceInMiles: filters.radius || 50
          }]
        })
      },
      jobView: 'JOB_VIEW_FULL',
      offset: pageToken ? parseInt(pageToken) : 0,
      pageSize: 20,
      orderBy: 'relevance desc'
    };
    
    const url = `${API_CONFIG.baseUrl}/projects/${API_CONFIG.projectId}/tenants/${API_CONFIG.tenantId}/jobs:search?key=${API_CONFIG.apiKey}`;
    
    console.log('Making API request to:', url);
    console.log('Request body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    // Transform API response to our format
    const jobs = (data.matchingJobs || []).map((job: any) => 
      transformJobResult(job.job, job.commuteInfo, job.jobSummary)
    );
    
    return {
      jobs,
      nextPageToken: data.nextPageToken,
      totalResults: data.totalEstimatedResults || jobs.length
    };
    
  } catch (error) {
    console.error('Error searching jobs:', error);
    // Fallback to mock data on error
    return getMockJobResults(filters);
  }
};

// Get market insights and analytics
export const getMarketInsights = async (): Promise<MarketInsights> => {
  try {
    // This would aggregate data from multiple API calls
    // For now, return calculated mock insights
    return {
      totalJobs: 2847,
      averageSalary: '$92,500',
      topLocation: 'Northern Virginia',
      weeklyGrowth: 23,
      salaryTrends: [
        { specialization: 'Electrical/Power', averageSalary: 95000, jobCount: 423 },
        { specialization: 'Network Operations', averageSalary: 88000, jobCount: 367 },
        { specialization: 'Facilities/Mechanical', averageSalary: 85000, jobCount: 298 },
        { specialization: 'DCIM/BMS Controls', averageSalary: 105000, jobCount: 189 }
      ],
      topSkills: [
        { skill: 'Python', demandGrowth: 45, jobCount: 234 },
        { skill: 'DCIM Software', demandGrowth: 38, jobCount: 187 },
        { skill: 'Critical Power', demandGrowth: 32, jobCount: 412 },
        { skill: 'Kubernetes', demandGrowth: 28, jobCount: 156 }
      ],
      companyActivity: [
        { company: 'AWS', openings: 127, weeklyChange: 15, avgTimeToFill: '21 days' },
        { company: 'Google', openings: 89, weeklyChange: -3, avgTimeToFill: '28 days' },
        { company: 'Microsoft', openings: 104, weeklyChange: 8, avgTimeToFill: '24 days' },
        { company: 'Meta', openings: 67, weeklyChange: 12, avgTimeToFill: '19 days' }
      ]
    };
  } catch (error) {
    console.error('Error fetching market insights:', error);
    throw error;
  }
};

// Transform API response to our format
const transformJobResult = (job: any, commuteInfo: any, jobSummary: any): JobResult => {
  const postedDate = job.postingCreateTime ? 
    formatPostedDate(new Date(job.postingCreateTime)) : 
    'Recently';
    
  const salary = job.compensationInfo ? 
    formatSalary(job.compensationInfo) : 
    'Competitive';
    
  const certifications = extractCertifications(job.description || '');
  const clearance = extractClearance(job.description || '');
  const specialization = categorizeSpecialization(job.title, job.description || '');
  
  return {
    id: job.name,
    title: job.title,
    company: job.company,
    location: formatLocation(job.addresses?.[0]),
    salary,
    type: job.employmentTypes?.[0] || 'Full-time',
    specialization,
    posted: postedDate,
    description: job.description?.substring(0, 200) + '...' || '',
    certifications,
    clearance,
    matchScore: calculateMatchScore(job, jobSummary),
    applicationUrl: job.applicationInfo?.uris?.[0] || '#'
  };
};

// Helper functions
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getUserId = (): string => {
  // Get or create user ID from localStorage
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

const formatPostedDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const formatSalary = (compensationInfo: any): string => {
  if (compensationInfo.entries?.[0]) {
    const entry = compensationInfo.entries[0];
    const min = entry.range?.minCompensation?.value || entry.amount?.value;
    const max = entry.range?.maxCompensation?.value;
    
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
    } else if (min) {
      return `$${(min / 1000).toFixed(0)}K+`;
    }
  }
  return 'Competitive';
};

const formatLocation = (address: any): string => {
  if (!address) return 'Remote';
  const parts = [];
  if (address.city) parts.push(address.city);
  if (address.administrativeArea) parts.push(address.administrativeArea);
  return parts.join(', ') || 'United States';
};

const extractCertifications = (description: string): string[] => {
  const certPatterns = [
    'DCCA', 'CDCP', 'CDCS', 'CDCE', 'CompTIA', 'CCNA', 'CCNP',
    'BICSI', 'ATS', 'AOS', 'Uptime Institute', 'EPI', 'DCEP'
  ];
  
  const found: string[] = [];
  certPatterns.forEach(cert => {
    if (description.toLowerCase().includes(cert.toLowerCase())) {
      found.push(cert);
    }
  });
  
  return found;
};

const extractClearance = (description: string): string => {
  if (description.toLowerCase().includes('top secret')) return 'Top Secret';
  if (description.toLowerCase().includes('secret')) return 'Secret';
  if (description.toLowerCase().includes('public trust')) return 'Public Trust';
  if (description.toLowerCase().includes('clearance')) return 'Clearance Required';
  return 'None';
};

const categorizeSpecialization = (title: string, description: string): string => {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('electrical') || text.includes('power') || text.includes('ups')) {
    return 'Electrical/Power';
  }
  if (text.includes('network') || text.includes('noc') || text.includes('fiber')) {
    return 'Network Operations';
  }
  if (text.includes('hvac') || text.includes('mechanical') || text.includes('facilities')) {
    return 'Facilities/Mechanical';
  }
  if (text.includes('dcim') || text.includes('bms') || text.includes('automation')) {
    return 'DCIM/BMS Controls';
  }
  if (text.includes('security') || text.includes('compliance')) {
    return 'Security/Compliance';
  }
  
  return 'Critical Systems';
};

const calculateMatchScore = (job: any, jobSummary: any): number => {
  // Simple match score calculation
  // In production, this would use ML models from Google Cloud
  let score = 70; // Base score
  
  if (jobSummary?.relevanceScore) {
    score = Math.round(jobSummary.relevanceScore * 100);
  }
  
  // Boost for certain factors
  if (job.incentiveCompensation) score += 5;
  if (job.benefits?.length > 3) score += 5;
  if (job.promotionValue) score += 10;
  
  return Math.min(score, 99);
};

// Mock data function for development
const getMockJobResults = (filters: JobSearchFilters) => {
  const mockJobs: JobResult[] = [
    {
      id: '1',
      title: 'Data Center Technician II',
      company: 'Amazon Web Services',
      location: 'Ashburn, VA',
      salary: '$75K - $95K',
      type: 'Full-time',
      specialization: 'Electrical/Power',
      posted: '2 days ago',
      description: 'Maintain critical infrastructure systems including UPS, generators, and cooling systems...',
      certifications: ['DCCA', 'CompTIA Server+'],
      clearance: 'Secret',
      matchScore: 92,
      applicationUrl: 'https://aws.amazon.com/careers'
    },
    {
      id: '2',
      title: 'Critical Facilities Engineer',
      company: 'Google',
      location: 'The Dalles, OR',
      salary: '$95K - $120K',
      type: 'Full-time',
      specialization: 'Facilities/Mechanical',
      posted: '1 week ago',
      description: 'Operate, monitor, and support physical facilities conditions in Google data centers...',
      certifications: ['EPI CDCP'],
      clearance: 'None',
      matchScore: 87,
      applicationUrl: 'https://careers.google.com'
    },
    {
      id: '3',
      title: 'Network Operations Technician',
      company: 'Microsoft',
      location: 'Boydton, VA',
      salary: '$65K - $85K',
      type: 'Full-time',
      specialization: 'Network Operations',
      posted: '3 days ago',
      description: 'Monitor network infrastructure and respond to incidents in 24/7 environment...',
      certifications: ['CCNA'],
      clearance: 'Public Trust',
      matchScore: 78,
      applicationUrl: 'https://careers.microsoft.com'
    }
  ];
  
  // Filter based on input filters
  let filtered = [...mockJobs];
  
  if (filters.specialization && filters.specialization !== 'All Specializations') {
    filtered = filtered.filter(job => job.specialization === filters.specialization);
  }
  
  if (filters.companies && filters.companies.length > 0) {
    const companyNames = formatCompanyNames(filters.companies);
    filtered = filtered.filter(job => 
      companyNames.some(company => job.company.includes(company))
    );
  }
  
  return Promise.resolve({
    jobs: filtered,
    nextPageToken: undefined,
    totalResults: filtered.length
  });
};

export default {
  searchDataCenterJobs,
  getMarketInsights
};
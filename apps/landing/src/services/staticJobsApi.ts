// Static Jobs API - Reads from pre-exported JSON file
// No backend server required!

import cachedJobsData from '@/data/cachedJobs.json';

export interface JobFilters {
  query?: string;
  location?: string;
  companies?: string[];
  specialization?: string;
  clearanceLevel?: string;
  experienceLevel?: string;
  page?: number;
  limit?: number;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  specialization: string;
  posted: string;
  postedRelative: string;
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

export interface JobSearchResponse {
  jobs: JobResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata: {
    total: number;
    lastSync: string;
    syncStatus: string;
    source: string;
    generatedAt: string;
  };
  filters: {
    companies: string[];
    locations: string[];
    specializations: string[];
    clearanceLevels: string[];
    categories: string[];
  };
}

// Search and filter jobs from static data
export function searchStaticJobs(filters: JobFilters = {}): JobSearchResponse {
  const { 
    query = '', 
    location = '',
    companies = [],
    specialization = '',
    clearanceLevel = '',
    experienceLevel = '',
    page = 1, 
    limit = 20 
  } = filters;

  // Start with all jobs
  let filteredJobs = [...cachedJobsData.jobs];

  // Apply search query
  if (query) {
    const searchLower = query.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title?.toLowerCase().includes(searchLower) ||
      job.company?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.location?.toLowerCase().includes(searchLower)
    );
  }

  // Apply location filter
  if (location && location !== 'All Locations') {
    filteredJobs = filteredJobs.filter(job =>
      job.location?.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Apply company filter
  if (companies.length > 0 && !companies.includes('All Companies')) {
    filteredJobs = filteredJobs.filter(job =>
      companies.some(company => job.company?.includes(company))
    );
  }

  // Apply specialization filter
  if (specialization && specialization !== 'All Specializations') {
    filteredJobs = filteredJobs.filter(job =>
      job.specialization === specialization
    );
  }

  // Apply clearance filter
  if (clearanceLevel && clearanceLevel !== 'All Levels') {
    filteredJobs = filteredJobs.filter(job =>
      job.clearance === clearanceLevel
    );
  }

  // Apply experience level filter (basic implementation)
  if (experienceLevel && experienceLevel !== 'All Levels') {
    const titleLower = (job: JobResult) => job.title.toLowerCase();
    switch (experienceLevel) {
      case 'Entry Level':
        filteredJobs = filteredJobs.filter(job => 
          titleLower(job).includes('entry') || 
          titleLower(job).includes('junior') ||
          titleLower(job).includes('i ') ||
          !titleLower(job).includes('senior') && !titleLower(job).includes('lead')
        );
        break;
      case 'Mid Level':
        filteredJobs = filteredJobs.filter(job => 
          titleLower(job).includes('ii') ||
          titleLower(job).includes('mid') ||
          (!titleLower(job).includes('entry') && 
           !titleLower(job).includes('junior') && 
           !titleLower(job).includes('senior'))
        );
        break;
      case 'Senior Level':
        filteredJobs = filteredJobs.filter(job => 
          titleLower(job).includes('senior') || 
          titleLower(job).includes('lead') ||
          titleLower(job).includes('iii') ||
          titleLower(job).includes('principal')
        );
        break;
    }
  }

  // Calculate pagination
  const total = filteredJobs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  return {
    jobs: paginatedJobs,
    pagination: {
      page,
      limit,
      total,
      totalPages
    },
    metadata: cachedJobsData.metadata,
    filters: cachedJobsData.filters
  };
}

// Get available filter options
export function getFilterOptions() {
  return cachedJobsData.filters;
}

// Get metadata about the cached data
export function getCacheMetadata() {
  return cachedJobsData.metadata;
}

// Check if data is stale (older than 7 days)
export function isDataStale(): boolean {
  const lastSync = new Date(cachedJobsData.metadata.lastSync);
  const now = new Date();
  const daysSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceSync > 7;
}

// Get featured/recommended jobs (top scored)
export function getFeaturedJobs(limit = 5): JobResult[] {
  return cachedJobsData.jobs
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, limit);
}

// Get jobs by company
export function getJobsByCompany(company: string): JobResult[] {
  return cachedJobsData.jobs.filter(job => 
    job.company?.toLowerCase().includes(company.toLowerCase())
  );
}

// Get job statistics
export function getJobStatistics() {
  const jobs = cachedJobsData.jobs;
  
  return {
    totalJobs: jobs.length,
    companiesHiring: cachedJobsData.filters.companies.length,
    locations: cachedJobsData.filters.locations.length,
    averageMatchScore: Math.round(
      jobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / jobs.length
    ),
    jobsBySpecialization: cachedJobsData.filters.specializations.map(spec => ({
      specialization: spec,
      count: jobs.filter(j => j.specialization === spec).length
    })),
    lastUpdated: cachedJobsData.metadata.lastSync
  };
}
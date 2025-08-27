// Google Cloud Talent Solution API - Proxy Implementation
// This uses a proxy server to handle OAuth authentication

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

// For now, we'll use a hybrid approach - mock data with realistic structure
// This can be replaced with actual API calls once backend proxy is set up

const DATA_CENTER_JOBS_DATABASE = [
  {
    id: 'aws-dc-tech-001',
    title: 'Data Center Technician II',
    company: 'Amazon Web Services',
    location: 'Ashburn, VA',
    salary: '$75,000 - $95,000',
    type: 'Full-time',
    specialization: 'Electrical/Power',
    posted: '2 days ago',
    description: 'AWS Infrastructure Services owns the design, planning, delivery, and operation of all AWS global infrastructure. We support all AWS data centers and all of the servers, storage, networking, power, and cooling equipment.',
    certifications: ['DCCA', 'CompTIA Server+'],
    clearance: 'Secret',
    matchScore: 92,
    applicationUrl: 'https://www.amazon.jobs/en/jobs/2543876'
  },
  {
    id: 'google-crit-eng-002',
    title: 'Critical Facilities Engineer',
    company: 'Google',
    location: 'The Dalles, OR',
    salary: '$95,000 - $120,000',
    type: 'Full-time',
    specialization: 'Facilities/Mechanical',
    posted: '1 week ago',
    description: 'Google is seeking a Critical Facilities Engineer to operate, monitor, and support physical facilities conditions including cooling systems, electrical systems, and mechanical systems.',
    certifications: ['EPI CDCP', 'DCCA'],
    clearance: 'None',
    matchScore: 87,
    applicationUrl: 'https://careers.google.com/jobs/results/142633688361608902'
  },
  {
    id: 'ms-network-ops-003',
    title: 'Network Operations Technician',
    company: 'Microsoft',
    location: 'Boydton, VA',
    salary: '$65,000 - $85,000',
    type: 'Full-time',
    specialization: 'Network Operations',
    posted: '3 days ago',
    description: 'Microsoft is looking for a Network Operations Technician to monitor network infrastructure and respond to incidents in our 24/7 environment.',
    certifications: ['CCNA', 'Network+'],
    clearance: 'Public Trust',
    matchScore: 78,
    applicationUrl: 'https://careers.microsoft.com/professionals/us/en/job/1523456'
  },
  {
    id: 'meta-power-sys-004',
    title: 'Power Systems Engineer',
    company: 'Meta',
    location: 'Prineville, OR',
    salary: '$110,000 - $140,000',
    type: 'Full-time',
    specialization: 'Electrical/Power',
    posted: '5 days ago',
    description: 'Meta is seeking a Power Systems Engineer to design and maintain critical power infrastructure including UPS systems, generators, and power distribution units.',
    certifications: ['PE License', 'DCEP'],
    clearance: 'None',
    matchScore: 85,
    applicationUrl: 'https://www.metacareers.com/jobs/823456789'
  },
  {
    id: 'oracle-dcim-spec-005',
    title: 'DCIM Specialist',
    company: 'Oracle',
    location: 'Austin, TX',
    salary: '$85,000 - $105,000',
    type: 'Full-time',
    specialization: 'DCIM/BMS Controls',
    posted: '1 day ago',
    description: 'Oracle Cloud Infrastructure is looking for a DCIM Specialist to manage and optimize data center infrastructure management systems.',
    certifications: ['DCCA', 'CDCP'],
    clearance: 'None',
    matchScore: 83,
    applicationUrl: 'https://careers.oracle.com/jobs/#en/sites/jobsearch/job/234567'
  },
  {
    id: 'equinix-mech-tech-006',
    title: 'Mechanical Systems Technician',
    company: 'Equinix',
    location: 'San Jose, CA',
    salary: '$70,000 - $90,000',
    type: 'Full-time',
    specialization: 'Facilities/Mechanical',
    posted: '4 days ago',
    description: 'Equinix is hiring a Mechanical Systems Technician to maintain HVAC, cooling, and mechanical systems in our colocation facilities.',
    certifications: ['HVAC Certification', 'EPA Universal'],
    clearance: 'None',
    matchScore: 76,
    applicationUrl: 'https://careers.equinix.com/jobs/mechanical-tech-345678'
  },
  {
    id: 'aws-sec-analyst-007',
    title: 'Data Center Security Analyst',
    company: 'Amazon Web Services',
    location: 'Sterling, VA',
    salary: '$80,000 - $100,000',
    type: 'Full-time',
    specialization: 'Security/Compliance',
    posted: '1 week ago',
    description: 'AWS is seeking a Security Analyst to ensure physical and logical security compliance in our data center facilities.',
    certifications: ['Security+', 'CISSP'],
    clearance: 'Top Secret',
    matchScore: 88,
    applicationUrl: 'https://www.amazon.jobs/en/jobs/2543877'
  },
  {
    id: 'google-net-eng-008',
    title: 'Network Engineer, Data Center',
    company: 'Google',
    location: 'Council Bluffs, IA',
    salary: '$105,000 - $130,000',
    type: 'Full-time',
    specialization: 'Network Operations',
    posted: '2 days ago',
    description: 'Design, deploy and maintain network infrastructure in Google data centers. Work with cutting-edge networking technologies.',
    certifications: ['CCNP', 'JNCIE'],
    clearance: 'None',
    matchScore: 90,
    applicationUrl: 'https://careers.google.com/jobs/results/142633688361608903'
  },
  {
    id: 'ms-elec-tech-009',
    title: 'Electrical Technician',
    company: 'Microsoft',
    location: 'Des Moines, IA',
    salary: '$60,000 - $80,000',
    type: 'Full-time',
    specialization: 'Electrical/Power',
    posted: '6 days ago',
    description: 'Microsoft is looking for an Electrical Technician to maintain and troubleshoot electrical systems in our data centers.',
    certifications: ['Journeyman Electrician'],
    clearance: 'None',
    matchScore: 74,
    applicationUrl: 'https://careers.microsoft.com/professionals/us/en/job/1523457'
  },
  {
    id: 'digital-realty-crit-010',
    title: 'Critical Systems Specialist',
    company: 'Digital Realty',
    location: 'Phoenix, AZ',
    salary: '$75,000 - $95,000',
    type: 'Full-time',
    specialization: 'Critical Systems',
    posted: '3 days ago',
    description: 'Digital Realty seeks a Critical Systems Specialist to ensure 100% uptime of mission-critical infrastructure.',
    certifications: ['AOS', 'DCCA'],
    clearance: 'None',
    matchScore: 81,
    applicationUrl: 'https://careers.digitalrealty.com/jobs/456789'
  }
];

// Enhanced search function with filtering
export const searchDataCenterJobs = async (
  filters: JobSearchFilters,
  pageToken?: string
): Promise<{ jobs: JobResult[]; nextPageToken?: string; totalResults: number }> => {
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredJobs = [...DATA_CENTER_JOBS_DATABASE];
  
  // Apply filters
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query)
    );
  }
  
  if (filters.specialization && filters.specialization !== 'All Specializations') {
    filteredJobs = filteredJobs.filter(job => 
      job.specialization === filters.specialization
    );
  }
  
  if (filters.companies && filters.companies.length > 0) {
    const companyNames = filters.companies.map(c => {
      if (c.includes('AWS') || c.includes('Amazon')) return 'Amazon Web Services';
      if (c.includes('Google')) return 'Google';
      if (c.includes('Microsoft')) return 'Microsoft';
      if (c.includes('Meta')) return 'Meta';
      if (c.includes('Oracle')) return 'Oracle';
      if (c.includes('Equinix')) return 'Equinix';
      if (c.includes('Digital')) return 'Digital Realty';
      return c;
    });
    
    filteredJobs = filteredJobs.filter(job => 
      companyNames.some(company => job.company.includes(company))
    );
  }
  
  if (filters.location) {
    const location = filters.location.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location)
    );
  }
  
  if (filters.clearanceLevel && filters.clearanceLevel !== 'None Required') {
    filteredJobs = filteredJobs.filter(job => 
      job.clearance === filters.clearanceLevel
    );
  }
  
  // Pagination
  const pageSize = 5;
  const startIndex = pageToken ? parseInt(pageToken) : 0;
  const endIndex = startIndex + pageSize;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
  
  // Calculate next page token
  const hasMore = endIndex < filteredJobs.length;
  const nextToken = hasMore ? endIndex.toString() : undefined;
  
  return {
    jobs: paginatedJobs,
    nextPageToken: nextToken,
    totalResults: filteredJobs.length
  };
};

// Market insights with realistic data
export const getMarketInsights = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    totalJobs: 2847,
    averageSalary: '$92,500',
    topLocation: 'Northern Virginia',
    weeklyGrowth: 23,
    salaryTrends: [
      { specialization: 'Electrical/Power', averageSalary: 95000, jobCount: 423 },
      { specialization: 'Network Operations', averageSalary: 105000, jobCount: 367 },
      { specialization: 'Facilities/Mechanical', averageSalary: 85000, jobCount: 298 },
      { specialization: 'DCIM/BMS Controls', averageSalary: 95000, jobCount: 189 },
      { specialization: 'Security/Compliance', averageSalary: 90000, jobCount: 156 },
      { specialization: 'Critical Systems', averageSalary: 88000, jobCount: 234 }
    ],
    topSkills: [
      { skill: 'Python', demandGrowth: 45, jobCount: 234 },
      { skill: 'DCIM Software', demandGrowth: 38, jobCount: 187 },
      { skill: 'Critical Power', demandGrowth: 32, jobCount: 412 },
      { skill: 'Kubernetes', demandGrowth: 28, jobCount: 156 },
      { skill: 'Automation', demandGrowth: 42, jobCount: 198 }
    ],
    companyActivity: [
      { company: 'AWS', openings: 127, weeklyChange: 15, avgTimeToFill: '21 days' },
      { company: 'Google', openings: 89, weeklyChange: -3, avgTimeToFill: '28 days' },
      { company: 'Microsoft', openings: 104, weeklyChange: 8, avgTimeToFill: '24 days' },
      { company: 'Meta', openings: 67, weeklyChange: 12, avgTimeToFill: '19 days' },
      { company: 'Oracle', openings: 45, weeklyChange: 5, avgTimeToFill: '32 days' },
      { company: 'Equinix', openings: 38, weeklyChange: 2, avgTimeToFill: '25 days' }
    ]
  };
};

export default {
  searchDataCenterJobs,
  getMarketInsights
};
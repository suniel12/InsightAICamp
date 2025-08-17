import { useState, useEffect } from 'react';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_COLORS } from '@/constants/styles';
import { searchAdzunaJobs, checkAdzunaStatus } from '@/services/adzunaApi';
import { searchCachedJobs, checkCachedDataStatus } from '@/services/cachedJobsApi';
import { 
  // Search, 
  MapPin, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  // Filter,
  // BookmarkPlus,
  ExternalLink,
  Briefcase,
  Award
} from 'lucide-react';

// Mock data for initial development - will be replaced with API data
const mockJobs = [
  {
    id: '1',
    title: 'Data Center Technician',
    company: 'Amazon Web Services',
    location: 'Ashburn, VA',
    salary: '$75,000 - $95,000',
    type: 'Full-time',
    specialization: 'Electrical/Power',
    posted: '2 days ago',
    description: 'Maintain critical infrastructure systems including UPS, generators, and cooling systems.',
    certifications: ['DCCA', 'CompTIA Server+'],
    clearance: 'Secret',
    matchScore: 92
  },
  {
    id: '2',
    title: 'Critical Facilities Engineer',
    company: 'Google',
    location: 'The Dalles, OR',
    salary: '$95,000 - $120,000',
    type: 'Full-time',
    specialization: 'Facilities/Mechanical',
    posted: '1 week ago',
    description: 'Operate, monitor, and support physical facilities conditions in Google data centers.',
    certifications: ['EPI CDCP'],
    clearance: 'None',
    matchScore: 87
  },
  {
    id: '3',
    title: 'Network Operations Technician',
    company: 'Microsoft',
    location: 'Boydton, VA',
    salary: '$65,000 - $85,000',
    type: 'Full-time',
    specialization: 'Network Operations',
    posted: '3 days ago',
    description: 'Monitor network infrastructure and respond to incidents in 24/7 environment.',
    certifications: ['CCNA'],
    clearance: 'Public Trust',
    matchScore: 78
  }
];

const specializations = [
  'All Specializations',
  'Facilities/Mechanical',
  'Electrical/Power',
  'Network Operations',
  'Security/Compliance',
  'DCIM/BMS Controls',
  'Critical Systems'
];

const companies = [
  'All Companies',
  'Amazon',
  'Google',
  'Microsoft',
  'Oracle',
  'Meta',
  'IBM',
  'TEKsystems'
];

const experienceLevels = [
  'All Levels',
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (5+ years)',
  'Lead/Principal'
];

const JobsPage = () => {
  // const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [dataSource, setDataSource] = useState<string>('Loading...');
  const [apiProvider, setApiProvider] = useState<'cached' | 'adzuna'>('cached');
  const [currentPage, setCurrentPage] = useState(1);

  // Load initial jobs on mount
  useEffect(() => {
    checkBackend();
    loadJobs();
  }, []);

  const checkBackend = async () => {
    if (apiProvider === 'cached') {
      const status = await checkCachedDataStatus();
      setBackendStatus(status.available ? 'online' : 'offline');
    } else {
      const status = await checkAdzunaStatus();
      setBackendStatus(status.configured ? 'online' : 'offline');
    }
  };


  const loadJobs = async (append = false) => {
    setIsLoading(true);
    try {
      const filters = {
        // query: searchQuery,
        // specialization: selectedSpecialization,
        // companies: selectedCompany !== 'All Companies' ? [selectedCompany] : [],
        // experienceLevel: selectedExperience,
        page: currentPage,
        limit: 50
      };
      
      const result = apiProvider === 'cached'
        ? await searchCachedJobs(filters)
        : await searchAdzunaJobs(filters);
      
      if (append) {
        setJobs(prev => [...prev, ...result.jobs]);
      } else {
        setJobs(result.jobs);
      }
      
      // Handle pagination differently for each provider
      if (apiProvider === 'cached' && result.pagination && result.pagination.totalPages > currentPage) {
        setNextPageToken('next');
      } else if (apiProvider === 'adzuna' && result.totalPages && result.totalPages > currentPage) {
        setNextPageToken('next');
      } else {
        setNextPageToken(undefined);
      }
      
      // Update data source
      setDataSource(result.source || (apiProvider === 'cached' ? 'Database Cache' : 'Adzuna'));
      
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Fallback to mock data on error
      setJobs(mockJobs);
      setDataSource('Mock Data');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSearch = () => {
  //   loadJobs();
  // };

  const handleFilterChange = () => {
    loadJobs();
  };

  // Trigger search when filters change
  useEffect(() => {
    if (selectedSpecialization || selectedCompany || selectedExperience) {
      handleFilterChange();
    }
  }, [selectedSpecialization, selectedCompany, selectedExperience]);

  // Reload when API provider changes
  useEffect(() => {
    setCurrentPage(1);
    checkBackend();
    loadJobs();
  }, [apiProvider]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Curated Data Center Jobs
              </h1>
            </div>
          </div>
        </section>
        
        {/* Filters Section - Commented out for curated experience */}
        {/* <section className="py-8 px-6 border-b border-slate-700">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Data Source:</span>
                <Select value={apiProvider} onValueChange={(value: 'cached' | 'adzuna') => setApiProvider(value)}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cached">Cached (Fast)</SelectItem>
                    <SelectItem value="adzuna">Live Adzuna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map(spec => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section> */}
        
        {/* Job Listings */}
        <section className="py-4 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isLoading ? 'Loading...' : 'Featured Opportunities'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Showing {jobs.length} curated positions
                </p>
              </div>
              {/* Save Search button removed */}
            </div>
            
            <div className="grid gap-6">
              {jobs.map(job => (
                <Card key={job.id} className="bg-slate-800/60 border-slate-700 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-white mb-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.posted}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {job.matchScore}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">{job.specialization}</Badge>
                      <Badge variant="secondary">{job.type}</Badge>
                      {job.clearance !== 'None' && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {job.clearance} Clearance
                        </Badge>
                      )}
                      {job.certifications.map(cert => (
                        <Badge key={cert} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-accent">{job.salary}</span>
                      {(job.applicationUrl || job.application_url) ? (
                        <Button 
                          className="text-white hover:scale-105 transition-transform"
                          style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                          onClick={() => {
                            window.open(job.applicationUrl || job.application_url, '_blank', 'noopener,noreferrer');
                          }}
                          title="Apply on employer's site (opens in new tab)"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          className="opacity-50 cursor-not-allowed"
                          disabled
                          title="Application link not available"
                        >
                          Apply Now
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Load More */}
            {nextPageToken && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  className="border-slate-700 text-slate-300"
                  disabled={isLoading}
                  onClick={() => {
                    setCurrentPage(prev => prev + 1);
                    loadJobs(true);
                  }}
                >
                  Load More Jobs
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 px-6 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-y border-slate-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready for These Opportunities?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              These positions require specialized skills and certifications. Let us help you get qualified.
            </p>
            <Button
              size="lg"
              className="text-white font-bold"
              style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
            >
              Start Your Journey
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobsPage;
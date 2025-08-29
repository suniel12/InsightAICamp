import { useState, useEffect, useMemo } from 'react';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BRAND_COLORS } from '@/constants/styles';
import { 
  searchStaticJobs, 
  getFilterOptions, 
  getCacheMetadata, 
  isDataStale,
  getJobStatistics 
} from '@/services/staticJobsApi';
import { 
  Search, 
  MapPin, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  Filter,
  ExternalLink,
  Briefcase,
  Award,
  RefreshCw,
  Database
} from 'lucide-react';

const experienceLevels = [
  'All Levels',
  'Entry Level',
  'Mid Level',
  'Senior Level'
];

const JobsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [currentPage, setCurrentPage] = useState(1);
  const [isStale, setIsStale] = useState(false);
  
  // Get filter options and metadata on mount
  const filterOptions = useMemo(() => getFilterOptions(), []);
  const metadata = useMemo(() => getCacheMetadata(), []);
  const statistics = useMemo(() => getJobStatistics(), []);
  
  // Check if data is stale
  useEffect(() => {
    setIsStale(isDataStale());
  }, []);
  
  // Perform search with current filters
  const searchResults = useMemo(() => {
    return searchStaticJobs({
      query: searchQuery,
      specialization: selectedSpecialization,
      companies: selectedCompany !== 'All Companies' ? [selectedCompany] : [],
      experienceLevel: selectedExperience,
      page: currentPage,
      limit: 20
    });
  }, [searchQuery, selectedSpecialization, selectedCompany, selectedExperience, currentPage]);
  
  const { jobs, pagination } = searchResults;
  
  // Format relative time for display
  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 px-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Data Center Jobs Board
                </h1>
              </div>
              
              {/* Data Source Badge */}
              <div className="text-right">
                {isStale && (
                  <p className="text-sm text-yellow-500 flex items-center justify-end mt-1">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Data may be outdated
                  </p>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search job titles, companies, or keywords..."
                    className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Specializations">All Specializations</SelectItem>
                    {filterOptions.specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Companies">All Companies</SelectItem>
                    {filterOptions.companies.slice(0, 20).map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>
                  Showing {jobs.length} of {pagination.total} jobs
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-slate-300">
                    <Filter className="w-3 h-3 mr-1" />
                    {selectedSpecialization !== 'All Specializations' ? 1 : 0}
                    {selectedCompany !== 'All Companies' ? 1 : 0}
                    {selectedExperience !== 'All Levels' ? 1 : 0}
                    {' filters'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs Grid */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {jobs.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-400 text-lg">
                    No jobs found matching your criteria. Try adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-white mb-2">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="text-slate-300 space-y-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" style={{ color: BRAND_COLORS.PRIMARY }} />
                                {job.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {job.location}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.salary && (
                          <Badge variant="outline" className="text-slate-300">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {job.salary}
                          </Badge>
                        )}
                        {job.type && (
                          <Badge variant="outline" className="text-slate-300">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.type}
                          </Badge>
                        )}
                        {job.specialization && (
                          <Badge variant="outline" className="text-slate-300">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {job.specialization}
                          </Badge>
                        )}
                        {job.clearance && job.clearance !== 'None' && (
                          <Badge variant="outline" className="text-slate-300">
                            <Award className="w-3 h-3 mr-1" />
                            {job.clearance} Clearance
                          </Badge>
                        )}
                      </div>
                      
                      {job.certifications && job.certifications.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-slate-400">Required:</span>
                          {job.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="secondary">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          Source: {job.source}
                        </span>
                        {job.applicationUrl && (
                          <Button
                            variant="default"
                            size="sm"
                            style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                            onClick={() => window.open(job.applicationUrl, '_blank')}
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
            )}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={pageNum === currentPage ? "" : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"}
                        style={pageNum === currentPage ? { backgroundColor: BRAND_COLORS.PRIMARY } : {}}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Top Hiring Company</p>
                      <p className="text-white text-lg font-semibold">
                        {statistics.jobsBySpecialization[0]?.specialization || 'N/A'}
                      </p>
                    </div>
                    <Users className="w-8 h-8" style={{ color: BRAND_COLORS.PRIMARY }} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Locations Available</p>
                      <p className="text-white text-lg font-semibold">
                        {statistics.locations}
                      </p>
                    </div>
                    <MapPin className="w-8 h-8" style={{ color: BRAND_COLORS.PRIMARY }} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Avg Match Score</p>
                      <p className="text-white text-lg font-semibold">
                        {statistics.averageMatchScore}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8" style={{ color: BRAND_COLORS.PRIMARY }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobsPage;
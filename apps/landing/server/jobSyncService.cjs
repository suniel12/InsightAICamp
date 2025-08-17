const { searchDataCenterJobs: searchAdzunaJobs } = require('./adzunaApi.cjs');
const { 
  bulkInsertJobs, 
  recordSyncStart, 
  recordSyncComplete,
  clearAllJobs,
  getStats 
} = require('./databaseService.cjs');

// Sync jobs from Adzuna API to database
async function syncJobs(options = {}) {
  const {
    limit = 50,  // Start with 50 for testing
    clearExisting = false,
    source = 'adzuna'
  } = options;

  console.log(`Starting job sync from ${source}...`);
  console.log(`Options: limit=${limit}, clearExisting=${clearExisting}`);

  // Record sync start
  const syncId = recordSyncStart(source);
  let totalJobsSynced = 0;
  let error = null;

  try {
    // Clear existing jobs if requested
    if (clearExisting) {
      const cleared = clearAllJobs();
      console.log(`Cleared ${cleared} existing jobs from database`);
    }

    // Fetch jobs from Adzuna
    console.log(`Fetching ${limit} jobs from Adzuna API...`);
    
    const searchFilters = {
      query: 'data center',  // Broader query
      limit: limit,
      page: 1,
      country: 'us'
    };

    const result = await searchAdzunaJobs(searchFilters);
    
    if (!result.jobs || result.jobs.length === 0) {
      throw new Error('No jobs returned from Adzuna API');
    }

    console.log(`Received ${result.jobs.length} jobs from Adzuna`);
    console.log(`Total available: ${result.totalResults}`);

    // Prepare jobs for database insertion
    const jobsToInsert = result.jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type,
      specialization: job.specialization,
      posted: job.posted,
      description: job.description,
      certifications: job.certifications,
      clearance: job.clearance,
      match_score: job.matchScore,
      application_url: job.applicationUrl,
      source: job.source,
      latitude: job.latitude,
      longitude: job.longitude,
      category: job.category
    }));

    // Insert jobs into database
    console.log('Inserting jobs into database...');
    const insertResult = bulkInsertJobs(jobsToInsert);
    
    if (insertResult.success) {
      totalJobsSynced = insertResult.count;
      console.log(`Successfully synced ${totalJobsSynced} jobs to database`);
    } else {
      throw new Error(insertResult.error);
    }

    // Get database stats after sync
    const stats = getStats();
    console.log('Database stats after sync:');
    console.log(`- Total jobs: ${stats.total_jobs}`);
    console.log(`- Unique companies: ${stats.unique_companies}`);
    console.log(`- Unique locations: ${stats.unique_locations}`);

  } catch (err) {
    error = err.message;
    console.error('Error during job sync:', error);
  }

  // Record sync completion
  recordSyncComplete(syncId, totalJobsSynced, error);

  return {
    success: !error,
    syncId,
    totalJobsSynced,
    error,
    timestamp: new Date().toISOString()
  };
}

// Sync jobs with pagination (for larger fetches)
async function syncJobsPaginated(options = {}) {
  const {
    totalJobs = 1000,  // Total jobs to fetch
    jobsPerPage = 50,  // Jobs per API call (Adzuna limit)
    clearExisting = false,
    source = 'adzuna'
  } = options;

  console.log(`Starting paginated job sync: ${totalJobs} total jobs, ${jobsPerPage} per page`);

  // Record sync start
  const syncId = recordSyncStart(source);
  let totalJobsSynced = 0;
  let error = null;
  const pages = Math.ceil(totalJobs / jobsPerPage);

  try {
    // Clear existing jobs if requested
    if (clearExisting) {
      const cleared = clearAllJobs();
      console.log(`Cleared ${cleared} existing jobs from database`);
    }

    // Fetch jobs page by page
    for (let page = 1; page <= pages; page++) {
      console.log(`\nFetching page ${page} of ${pages}...`);
      
      const searchFilters = {
        query: 'data center technician engineer specialist operations facilities',
        limit: jobsPerPage,
        page: page,
        country: 'us'
      };

      try {
        const result = await searchAdzunaJobs(searchFilters);
        
        if (!result.jobs || result.jobs.length === 0) {
          console.log(`No jobs returned for page ${page}, stopping pagination`);
          break;
        }

        console.log(`Page ${page}: Received ${result.jobs.length} jobs`);

        // Prepare and insert jobs
        const jobsToInsert = result.jobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type,
          specialization: job.specialization,
          posted: job.posted,
          description: job.description,
          certifications: job.certifications,
          clearance: job.clearance,
          match_score: job.matchScore,
          application_url: job.applicationUrl,
          source: job.source,
          latitude: job.latitude,
          longitude: job.longitude,
          category: job.category
        }));

        const insertResult = bulkInsertJobs(jobsToInsert);
        
        if (insertResult.success) {
          totalJobsSynced += insertResult.count;
          console.log(`Page ${page}: Inserted ${insertResult.count} jobs (Total: ${totalJobsSynced})`);
        } else {
          console.error(`Page ${page}: Failed to insert jobs:`, insertResult.error);
        }

        // Add delay between API calls to be respectful
        if (page < pages) {
          console.log('Waiting 1 second before next API call...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (pageError) {
        console.error(`Error fetching page ${page}:`, pageError.message);
        // Continue with next page despite error
      }

      // Stop if we've synced enough jobs
      if (totalJobsSynced >= totalJobs) {
        console.log(`Reached target of ${totalJobs} jobs, stopping`);
        break;
      }
    }

    // Get final database stats
    const stats = getStats();
    console.log('\n=== Final Database Stats ===');
    console.log(`Total jobs in database: ${stats.total_jobs}`);
    console.log(`Unique companies: ${stats.unique_companies}`);
    console.log(`Unique locations: ${stats.unique_locations}`);
    console.log(`Unique specializations: ${stats.unique_specializations}`);
    
    if (stats.topCompanies && stats.topCompanies.length > 0) {
      console.log('\nTop companies:');
      stats.topCompanies.slice(0, 5).forEach(company => {
        console.log(`  - ${company.company}: ${company.count} jobs`);
      });
    }

  } catch (err) {
    error = err.message;
    console.error('Error during paginated job sync:', error);
  }

  // Record sync completion
  recordSyncComplete(syncId, totalJobsSynced, error);

  return {
    success: !error,
    syncId,
    totalJobsSynced,
    targetJobs: totalJobs,
    error,
    timestamp: new Date().toISOString()
  };
}

// Test function for initial 50 jobs
async function testSync() {
  console.log('\n=== Testing Job Sync with 50 Jobs ===\n');
  
  const result = await syncJobs({
    limit: 50,
    clearExisting: true  // Clear existing for clean test
  });

  if (result.success) {
    console.log('\n✅ Test sync completed successfully!');
    console.log(`Synced ${result.totalJobsSynced} jobs`);
    
    // Get and display stats
    const stats = getStats();
    console.log('\nDatabase Statistics:');
    console.log(`- Total jobs: ${stats.total_jobs}`);
    console.log(`- Companies: ${stats.unique_companies}`);
    console.log(`- Locations: ${stats.unique_locations}`);
    
    if (stats.specializationBreakdown) {
      console.log('\nJobs by Specialization:');
      stats.specializationBreakdown.forEach(spec => {
        console.log(`  - ${spec.specialization}: ${spec.count}`);
      });
    }
  } else {
    console.log('\n❌ Test sync failed:', result.error);
  }

  return result;
}

module.exports = {
  syncJobs,
  syncJobsPaginated,
  testSync
};
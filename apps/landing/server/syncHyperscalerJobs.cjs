const { searchDataCenterJobs: searchAdzunaJobs } = require('./adzunaApi.cjs');
const { 
  bulkInsertJobs, 
  recordSyncStart, 
  recordSyncComplete,
  getStats 
} = require('./databaseService.cjs');

// Hyperscaler companies and their variations
const hyperscalerQueries = [
  { query: 'Amazon AWS data center', company: 'Amazon' },
  { query: 'Google cloud data center', company: 'Google' },
  { query: 'Microsoft Azure data center', company: 'Microsoft' },
  { query: 'Meta Facebook data center', company: 'Meta' },
  { query: 'Oracle cloud data center', company: 'Oracle' },
  { query: 'IBM cloud data center', company: 'IBM' },
  { query: 'Alibaba cloud data center', company: 'Alibaba' },
  { query: 'data center technician', company: null },
  { query: 'data center engineer', company: null },
  { query: 'critical facilities', company: null }
];

async function syncHyperscalerJobs(options = {}) {
  const {
    maxJobs = 200,  // Stay under 250 daily limit
    jobsPerQuery = 20  // Jobs per search query
  } = options;

  console.log(`\n=== Syncing Hyperscaler Jobs ===`);
  console.log(`Target: ${maxJobs} jobs (Daily limit: 250)`);
  
  // Check current stats
  const statsBefore = getStats();
  console.log(`Current jobs in database: ${statsBefore.total_jobs}`);
  
  // Record sync start
  const syncId = recordSyncStart('adzuna-hyperscalers');
  let totalJobsSynced = 0;
  let totalAPICallsMade = 0;
  let error = null;
  const allJobs = [];

  try {
    // Fetch jobs for each query
    for (const searchConfig of hyperscalerQueries) {
      if (totalAPICallsMade * jobsPerQuery >= maxJobs) {
        console.log(`Reached target of ${maxJobs} jobs, stopping`);
        break;
      }

      console.log(`\nSearching: "${searchConfig.query}"`);
      
      const searchFilters = {
        query: searchConfig.query,
        limit: jobsPerQuery,
        page: 1,
        country: 'us'
      };

      try {
        const result = await searchAdzunaJobs(searchFilters);
        totalAPICallsMade++;
        
        if (result.jobs && result.jobs.length > 0) {
          console.log(`  Found ${result.jobs.length} jobs`);
          
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

          allJobs.push(...jobsToInsert);
        } else {
          console.log(`  No jobs found for this query`);
        }

        // Add delay between API calls to be respectful
        console.log('  Waiting 2 seconds before next search...');
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (queryError) {
        console.error(`  Error searching for "${searchConfig.query}":`, queryError.message);
      }
    }

    // Bulk insert all collected jobs
    if (allJobs.length > 0) {
      console.log(`\nInserting ${allJobs.length} jobs into database...`);
      const insertResult = bulkInsertJobs(allJobs);
      
      if (insertResult.success) {
        totalJobsSynced = insertResult.count;
        console.log(`Successfully synced ${totalJobsSynced} jobs`);
      } else {
        throw new Error(insertResult.error);
      }
    }

    // Get final database stats
    const statsAfter = getStats();
    console.log('\n=== Sync Results ===');
    console.log(`Jobs before sync: ${statsBefore.total_jobs}`);
    console.log(`Jobs after sync: ${statsAfter.total_jobs}`);
    console.log(`New jobs added: ${statsAfter.total_jobs - statsBefore.total_jobs}`);
    console.log(`API calls made: ${totalAPICallsMade}`);
    console.log(`Unique companies: ${statsAfter.unique_companies}`);
    console.log(`Unique locations: ${statsAfter.unique_locations}`);
    
    // Show top companies
    if (statsAfter.topCompanies && statsAfter.topCompanies.length > 0) {
      console.log('\nTop Companies:');
      statsAfter.topCompanies.slice(0, 10).forEach(company => {
        console.log(`  ${company.company}: ${company.count} jobs`);
      });
    }

  } catch (err) {
    error = err.message;
    console.error('Error during hyperscaler job sync:', error);
  }

  // Record sync completion
  recordSyncComplete(syncId, totalJobsSynced, error);

  return {
    success: !error,
    syncId,
    totalJobsSynced,
    jobsBefore: statsBefore.total_jobs,
    jobsAfter: getStats().total_jobs,
    apiCallsMade: totalAPICallsMade,
    error,
    timestamp: new Date().toISOString()
  };
}

// Run the sync if called directly
if (require.main === module) {
  syncHyperscalerJobs({
    maxJobs: 200  // Stay well under 250 daily limit
  }).then(result => {
    console.log('\n=== Final Result ===');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = {
  syncHyperscalerJobs
};
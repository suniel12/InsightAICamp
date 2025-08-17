#!/usr/bin/env node

const { syncHyperscalerJobs } = require('./syncHyperscalerJobs.cjs');
const { getStats } = require('./databaseService.cjs');

// Track daily API usage to stay under 250 limit
const DAILY_API_LIMIT = 250;
const JOBS_PER_API_CALL = 20; // We fetch 20 jobs per API call
const MAX_API_CALLS = Math.floor(DAILY_API_LIMIT / JOBS_PER_API_CALL); // 12 calls max

async function runDailySync() {
  console.log('\n═══════════════════════════════════════════');
  console.log('     DAILY JOB SYNC - HYPERSCALERS         ');
  console.log('═══════════════════════════════════════════');
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
  console.log(`Daily API Limit: ${DAILY_API_LIMIT} jobs`);
  console.log(`Max API Calls: ${MAX_API_CALLS}`);
  console.log('═══════════════════════════════════════════\n');

  // Get current stats
  const statsBefore = getStats();
  console.log('📊 Current Database Status:');
  console.log(`   • Total Jobs: ${statsBefore.total_jobs}`);
  console.log(`   • Companies: ${statsBefore.unique_companies}`);
  console.log(`   • Locations: ${statsBefore.unique_locations}`);
  
  if (statsBefore.latestSync) {
    const lastSyncDate = new Date(statsBefore.latestSync.sync_completed_at);
    console.log(`   • Last Sync: ${lastSyncDate.toLocaleString()}`);
  }
  
  // Calculate how many more jobs we can add today
  const remainingCapacity = MAX_API_CALLS * JOBS_PER_API_CALL;
  console.log(`\n🎯 Today's Target: Add up to ${remainingCapacity} new jobs`);
  
  // Run the sync
  const result = await syncHyperscalerJobs({
    maxJobs: remainingCapacity
  });
  
  // Display results
  console.log('\n═══════════════════════════════════════════');
  console.log('              SYNC RESULTS                 ');
  console.log('═══════════════════════════════════════════');
  
  if (result.success) {
    console.log('✅ Sync completed successfully!');
    console.log(`   • New Jobs Added: ${result.jobsAfter - result.jobsBefore}`);
    console.log(`   • Total Jobs Now: ${result.jobsAfter}`);
    console.log(`   • API Calls Used: ${result.apiCallsMade}`);
    console.log(`   • Daily Budget Used: ${(result.apiCallsMade * JOBS_PER_API_CALL / DAILY_API_LIMIT * 100).toFixed(1)}%`);
  } else {
    console.log('❌ Sync failed:', result.error);
  }
  
  // Get updated top companies
  const statsAfter = getStats();
  if (statsAfter.topCompanies && statsAfter.topCompanies.length > 0) {
    console.log('\n📈 Top Employers:');
    statsAfter.topCompanies.slice(0, 8).forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.company}: ${company.count} jobs`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════\n');
  
  return result;
}

// Run if called directly
if (require.main === module) {
  runDailySync()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runDailySync };
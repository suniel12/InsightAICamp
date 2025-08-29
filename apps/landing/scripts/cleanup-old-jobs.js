import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanupOldJobs() {
  console.log('\n═══════════════════════════════════════════');
  console.log('       JOB DATABASE CLEANUP UTILITY        ');
  console.log('═══════════════════════════════════════════');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════\n');

  // Open the database
  const db = await open({
    filename: path.join(__dirname, '../data/datacenter_jobs.db'),
    driver: sqlite3.Database
  });

  try {
    // Get current job count
    const beforeCount = await db.get('SELECT COUNT(*) as count FROM datacenter_jobs');
    console.log(`📊 Current Status:`);
    console.log(`   • Total jobs in database: ${beforeCount.count}`);
    console.log(`   • Jobs to keep: 93 (most recent)`);
    console.log(`   • Jobs to remove: ${Math.max(0, beforeCount.count - 93)}`);
    
    if (beforeCount.count <= 93) {
      console.log('\n✅ No cleanup needed - database has 93 or fewer jobs');
      await db.close();
      return;
    }

    console.log('\n🔄 Starting cleanup process...');
    
    // Delete all jobs except the 93 most recent based on fetched_at
    const result = await db.run(`
      DELETE FROM datacenter_jobs 
      WHERE id NOT IN (
        SELECT id FROM datacenter_jobs 
        ORDER BY fetched_at DESC, posted DESC 
        LIMIT 93
      )
    `);

    // Get new count
    const afterCount = await db.get('SELECT COUNT(*) as count FROM datacenter_jobs');
    
    console.log('\n═══════════════════════════════════════════');
    console.log('            CLEANUP RESULTS                ');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Cleanup completed successfully!`);
    console.log(`   • Jobs before cleanup: ${beforeCount.count}`);
    console.log(`   • Jobs deleted: ${result.changes}`);
    console.log(`   • Jobs after cleanup: ${afterCount.count}`);
    
    // Get date range of remaining jobs
    const dateRange = await db.get(`
      SELECT 
        MIN(posted) as oldest,
        MAX(posted) as newest,
        MIN(fetched_at) as oldest_fetch,
        MAX(fetched_at) as newest_fetch
      FROM datacenter_jobs
    `);
    
    if (dateRange) {
      console.log(`\n📅 Remaining Jobs Date Range:`);
      console.log(`   • Posted dates: ${dateRange.oldest} to ${dateRange.newest}`);
      console.log(`   • Fetched dates: ${dateRange.oldest_fetch?.split('T')[0]} to ${dateRange.newest_fetch?.split('T')[0]}`);
    }

    // Update sync status
    await db.run(`
      INSERT INTO job_sync_status (
        sync_started_at,
        sync_completed_at,
        total_jobs_fetched,
        source,
        status
      ) VALUES (
        datetime('now'),
        datetime('now'),
        ?,
        'cleanup',
        'completed'
      )
    `, afterCount.count);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Run "npm run export:jobs" to export cleaned data to JSON');
    console.log('   2. Commit the updated JSON file');
    console.log('   3. Deploy changes to see updated job listings\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    throw error;
  } finally {
    await db.close();
  }
}

// Run the cleanup
cleanupOldJobs().catch(console.error);
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportJobsToJSON() {
  // Open the database
  const db = await open({
    filename: path.join(__dirname, '../data/datacenter_jobs.db'),
    driver: sqlite3.Database
  });

  try {
    // Get all jobs from the database
    const jobs = await db.all(`
      SELECT 
        id,
        title,
        company,
        location,
        salary,
        type,
        specialization,
        posted,
        description,
        certifications,
        clearance,
        match_score as matchScore,
        application_url as applicationUrl,
        source,
        latitude,
        longitude,
        category,
        fetched_at,
        last_updated
      FROM datacenter_jobs
      ORDER BY posted DESC
    `);

    // Get sync status
    const syncStatus = await db.get(`
      SELECT * FROM job_sync_status 
      ORDER BY sync_completed_at DESC 
      LIMIT 1
    `);

    // Process jobs data
    const processedJobs = jobs.map(job => ({
      ...job,
      // Parse JSON fields if they're stored as strings
      certifications: job.certifications ? 
        (typeof job.certifications === 'string' ? JSON.parse(job.certifications) : job.certifications) : [],
      // Convert posted date to relative time
      postedRelative: getRelativeTime(job.posted),
      // Ensure proper data types
      matchScore: job.matchScore || 0
    }));

    // Create the full data object
    const jobsData = {
      jobs: processedJobs,
      metadata: {
        total: processedJobs.length,
        lastSync: syncStatus?.sync_completed_at || new Date().toISOString(),
        syncStatus: syncStatus?.status || 'unknown',
        source: 'Adzuna API (Cached)',
        generatedAt: new Date().toISOString()
      },
      filters: {
        companies: [...new Set(processedJobs.map(j => j.company).filter(Boolean))].sort(),
        locations: [...new Set(processedJobs.map(j => j.location).filter(Boolean))].sort(),
        specializations: [...new Set(processedJobs.map(j => j.specialization).filter(Boolean))].sort(),
        clearanceLevels: [...new Set(processedJobs.map(j => j.clearance).filter(Boolean))].sort(),
        categories: [...new Set(processedJobs.map(j => j.category).filter(Boolean))].sort()
      }
    };

    // Write to JSON file
    const outputPath = path.join(__dirname, '../src/data/cachedJobs.json');
    fs.writeFileSync(outputPath, JSON.stringify(jobsData, null, 2));

    console.log(`✅ Exported ${processedJobs.length} jobs to ${outputPath}`);
    console.log(`📊 Metadata:`, jobsData.metadata);
    console.log(`🏢 Companies: ${jobsData.filters.companies.length}`);
    console.log(`📍 Locations: ${jobsData.filters.locations.length}`);

    return jobsData;
  } catch (error) {
    console.error('Error exporting jobs:', error);
    throw error;
  } finally {
    await db.close();
  }
}

function getRelativeTime(dateString) {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

// Run the export
exportJobsToJSON().catch(console.error);
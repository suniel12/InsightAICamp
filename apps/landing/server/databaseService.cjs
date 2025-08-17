const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'datacenter_jobs.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
const createTables = () => {
  // Jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS datacenter_jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT,
      location TEXT,
      salary TEXT,
      type TEXT,
      specialization TEXT,
      posted TEXT,
      description TEXT,
      certifications TEXT,
      clearance TEXT,
      match_score INTEGER,
      application_url TEXT,
      source TEXT,
      latitude REAL,
      longitude REAL,
      category TEXT,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_company ON datacenter_jobs(company);
    CREATE INDEX IF NOT EXISTS idx_location ON datacenter_jobs(location);
    CREATE INDEX IF NOT EXISTS idx_specialization ON datacenter_jobs(specialization);
    CREATE INDEX IF NOT EXISTS idx_fetched_at ON datacenter_jobs(fetched_at);
  `);

  // Sync status table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_started_at DATETIME,
      sync_completed_at DATETIME,
      total_jobs_fetched INTEGER,
      source TEXT,
      status TEXT,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables created/verified');
};

// Initialize tables on module load
createTables();

// Insert or update a job
const upsertJob = (job) => {
  const stmt = db.prepare(`
    INSERT INTO datacenter_jobs (
      id, title, company, location, salary, type, specialization,
      posted, description, certifications, clearance, match_score,
      application_url, source, latitude, longitude, category
    ) VALUES (
      @id, @title, @company, @location, @salary, @type, @specialization,
      @posted, @description, @certifications, @clearance, @match_score,
      @application_url, @source, @latitude, @longitude, @category
    )
    ON CONFLICT(id) DO UPDATE SET
      title = @title,
      company = @company,
      location = @location,
      salary = @salary,
      type = @type,
      specialization = @specialization,
      posted = @posted,
      description = @description,
      certifications = @certifications,
      clearance = @clearance,
      match_score = @match_score,
      application_url = @application_url,
      source = @source,
      latitude = @latitude,
      longitude = @longitude,
      category = @category,
      last_updated = CURRENT_TIMESTAMP
  `);

  // Convert arrays to JSON strings for storage
  const jobData = {
    ...job,
    certifications: Array.isArray(job.certifications) 
      ? JSON.stringify(job.certifications) 
      : job.certifications,
    match_score: job.matchScore || job.match_score
  };

  return stmt.run(jobData);
};

// Bulk insert jobs
const bulkInsertJobs = (jobs) => {
  const insertMany = db.transaction((jobs) => {
    for (const job of jobs) {
      upsertJob(job);
    }
    return jobs.length;
  });

  try {
    const count = insertMany(jobs);
    console.log(`Successfully inserted/updated ${count} jobs`);
    return { success: true, count };
  } catch (error) {
    console.error('Error bulk inserting jobs:', error);
    return { success: false, error: error.message };
  }
};

// Get jobs with pagination and filters
const getJobs = (options = {}) => {
  const {
    page = 1,
    limit = 50,
    specialization,
    company,
    location,
    sortBy = 'fetched_at',
    sortOrder = 'DESC'
  } = options;

  let query = 'SELECT * FROM datacenter_jobs WHERE 1=1';
  const params = {};

  if (specialization && specialization !== 'All Specializations') {
    query += ' AND specialization = @specialization';
    params.specialization = specialization;
  }

  if (company && company !== 'All Companies') {
    query += ' AND company LIKE @company';
    params.company = `%${company}%`;
  }

  if (location) {
    query += ' AND location LIKE @location';
    params.location = `%${location}%`;
  }

  // Add sorting
  const allowedSortColumns = ['fetched_at', 'match_score', 'posted', 'title', 'company'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'fetched_at';
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortColumn} ${order}`;

  // Add pagination
  const offset = (page - 1) * limit;
  query += ' LIMIT @limit OFFSET @offset';
  params.limit = limit;
  params.offset = offset;

  const stmt = db.prepare(query);
  const jobs = stmt.all(params);

  // Parse certifications back to arrays
  const formattedJobs = jobs.map(job => ({
    ...job,
    certifications: job.certifications 
      ? JSON.parse(job.certifications) 
      : [],
    matchScore: job.match_score
  }));

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM datacenter_jobs WHERE 1=1';
  const countParams = {};

  if (specialization && specialization !== 'All Specializations') {
    countQuery += ' AND specialization = @specialization';
    countParams.specialization = specialization;
  }

  if (company && company !== 'All Companies') {
    countQuery += ' AND company LIKE @company';
    countParams.company = `%${company}%`;
  }

  if (location) {
    countQuery += ' AND location LIKE @location';
    countParams.location = `%${location}%`;
  }

  const countStmt = db.prepare(countQuery);
  const { total } = countStmt.get(countParams);

  return {
    jobs: formattedJobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Get job by ID
const getJobById = (id) => {
  const stmt = db.prepare('SELECT * FROM datacenter_jobs WHERE id = ?');
  const job = stmt.get(id);
  
  if (job && job.certifications) {
    job.certifications = JSON.parse(job.certifications);
    job.matchScore = job.match_score;
  }
  
  return job;
};

// Delete old jobs (older than X days)
const deleteOldJobs = (daysOld = 30) => {
  const stmt = db.prepare(`
    DELETE FROM datacenter_jobs 
    WHERE fetched_at < datetime('now', '-' || ? || ' days')
  `);
  
  const result = stmt.run(daysOld);
  return result.changes;
};

// Get database statistics
const getStats = () => {
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_jobs,
      COUNT(DISTINCT company) as unique_companies,
      COUNT(DISTINCT location) as unique_locations,
      COUNT(DISTINCT specialization) as unique_specializations,
      MIN(fetched_at) as oldest_job,
      MAX(fetched_at) as newest_job
    FROM datacenter_jobs
  `).get();

  const specializationBreakdown = db.prepare(`
    SELECT specialization, COUNT(*) as count
    FROM datacenter_jobs
    GROUP BY specialization
    ORDER BY count DESC
  `).all();

  const topCompanies = db.prepare(`
    SELECT company, COUNT(*) as count
    FROM datacenter_jobs
    GROUP BY company
    ORDER BY count DESC
    LIMIT 10
  `).all();

  const latestSync = db.prepare(`
    SELECT * FROM job_sync_status
    ORDER BY created_at DESC
    LIMIT 1
  `).get();

  return {
    ...stats,
    specializationBreakdown,
    topCompanies,
    latestSync
  };
};

// Record sync status
const recordSyncStart = (source) => {
  const stmt = db.prepare(`
    INSERT INTO job_sync_status (sync_started_at, source, status)
    VALUES (CURRENT_TIMESTAMP, ?, 'in_progress')
  `);
  
  const result = stmt.run(source);
  return result.lastInsertRowid;
};

const recordSyncComplete = (syncId, totalJobs, error = null) => {
  const stmt = db.prepare(`
    UPDATE job_sync_status
    SET 
      sync_completed_at = CURRENT_TIMESTAMP,
      total_jobs_fetched = ?,
      status = ?,
      error_message = ?
    WHERE id = ?
  `);
  
  const status = error ? 'failed' : 'completed';
  stmt.run(totalJobs, status, error, syncId);
};

// Clear all jobs (useful for testing)
const clearAllJobs = () => {
  const stmt = db.prepare('DELETE FROM datacenter_jobs');
  const result = stmt.run();
  return result.changes;
};

// Close database connection (for cleanup)
const close = () => {
  db.close();
};

module.exports = {
  db,
  upsertJob,
  bulkInsertJobs,
  getJobs,
  getJobById,
  deleteOldJobs,
  getStats,
  recordSyncStart,
  recordSyncComplete,
  clearAllJobs,
  close
};
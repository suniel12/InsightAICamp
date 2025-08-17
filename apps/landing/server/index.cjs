const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Only Adzuna API and Database services are active
const { searchDataCenterJobs: searchAdzunaJobs, getJobMarketAnalytics: getAdzunaAnalytics, isConfigured: isAdzunaConfigured } = require('./adzunaApi.cjs');
const { getJobs, getStats } = require('./databaseService.cjs');
const { syncJobs, syncJobsPaginated, testSync } = require('./jobSyncService.cjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'], // Allow Vite dev server
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Job Data API Server'
  });
});

// ===== ADZUNA API ENDPOINTS =====

// Adzuna job search endpoint
app.post('/api/adzuna/search', async (req, res) => {
  try {
    console.log('Adzuna search request:', req.body);
    const results = await searchAdzunaJobs(req.body);
    res.json(results);
  } catch (error) {
    console.error('Adzuna search error:', error);
    res.status(500).json({ 
      error: 'Failed to search jobs via Adzuna',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Adzuna market analytics endpoint
app.get('/api/adzuna/analytics', async (req, res) => {
  try {
    const analytics = await getAdzunaAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Adzuna analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to get Adzuna market analytics',
      message: error.message
    });
  }
});

// Check Adzuna configuration status
app.get('/api/adzuna/status', (req, res) => {
  res.json({
    configured: isAdzunaConfigured(),
    status: isAdzunaConfigured() ? 'ready' : 'missing_credentials'
  });
});

// ===== DATABASE ENDPOINTS =====

// Get cached jobs from database
app.get('/api/jobs/cached', async (req, res) => {
  try {
    const { page, limit, specialization, company, location, sortBy, sortOrder } = req.query;
    
    const result = getJobs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      specialization,
      company,
      location,
      sortBy,
      sortOrder
    });
    
    res.json({
      jobs: result.jobs,
      pagination: result.pagination,
      source: 'Database Cache'
    });
  } catch (error) {
    console.error('Error fetching cached jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cached jobs',
      message: error.message
    });
  }
});

// Get database statistics
app.get('/api/jobs/db-status', async (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting database stats:', error);
    res.status(500).json({ 
      error: 'Failed to get database statistics',
      message: error.message
    });
  }
});

// Sync jobs - TEST endpoint (50 jobs)
app.post('/api/jobs/sync-test', async (req, res) => {
  try {
    console.log('Starting test sync (50 jobs)...');
    
    const result = await syncJobs({
      limit: 50,
      clearExisting: req.body.clearExisting || false
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error during test sync:', error);
    res.status(500).json({ 
      error: 'Failed to sync jobs',
      message: error.message
    });
  }
});

// Sync jobs - FULL endpoint (configurable)
app.post('/api/jobs/sync', async (req, res) => {
  try {
    const { totalJobs = 1000, clearExisting = false } = req.body;
    
    console.log(`Starting job sync: ${totalJobs} jobs, clearExisting: ${clearExisting}`);
    
    const result = await syncJobsPaginated({
      totalJobs,
      clearExisting
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error during job sync:', error);
    res.status(500).json({ 
      error: 'Failed to sync jobs',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Job Data API Server
📍 Running on http://localhost:${PORT}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
🔑 Adzuna API: ${isAdzunaConfigured() ? 'Configured' : 'Not configured'}
📊 Database: SQLite (datacenter_jobs.db)
  `);
});
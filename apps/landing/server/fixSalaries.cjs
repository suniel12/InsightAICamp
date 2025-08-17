const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '..', 'data', 'datacenter_jobs.db');
const db = new Database(dbPath);

// Function to fix salary formatting
function fixSalaryFormat(salary) {
  if (!salary) return 'Competitive';
  
  // Check if it's already in the format "$X - $X" where both X are the same
  const rangeMatch = salary.match(/^\$([0-9,]+)\s*-\s*\$([0-9,]+)$/);
  if (rangeMatch) {
    const min = rangeMatch[1].replace(/,/g, '');
    const max = rangeMatch[2].replace(/,/g, '');
    
    // If min and max are the same, return single value
    if (min === max) {
      return `$${rangeMatch[1]}`;
    }
  }
  
  // Return unchanged if it doesn't match the pattern or is already correct
  return salary;
}

// Get all jobs with duplicate salary ranges
const jobs = db.prepare(`
  SELECT id, salary 
  FROM datacenter_jobs 
  WHERE salary LIKE '$% - $%'
`).all();

console.log(`Found ${jobs.length} jobs to check`);

let updatedCount = 0;
const updateStmt = db.prepare('UPDATE datacenter_jobs SET salary = ? WHERE id = ?');

// Use a transaction for better performance
const updateMany = db.transaction((jobs) => {
  for (const job of jobs) {
    const newSalary = fixSalaryFormat(job.salary);
    if (newSalary !== job.salary) {
      updateStmt.run(newSalary, job.id);
      updatedCount++;
      console.log(`Updated job ${job.id}: "${job.salary}" -> "${newSalary}"`);
    }
  }
});

// Run the updates
updateMany(jobs);

console.log(`\n✅ Fixed ${updatedCount} job salaries`);

// Show some examples of the fixed data
const examples = db.prepare(`
  SELECT title, company, salary 
  FROM datacenter_jobs 
  LIMIT 10
`).all();

console.log('\nExample jobs after fix:');
examples.forEach(job => {
  console.log(`  ${job.company}: ${job.salary} - ${job.title.substring(0, 40)}...`);
});

db.close();
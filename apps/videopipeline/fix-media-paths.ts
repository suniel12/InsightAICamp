#!/usr/bin/env tsx

import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

async function fixMediaPaths(sessionId: string) {
  console.log(chalk.cyan('🔧 Fixing Media Paths for Session: ' + sessionId));
  
  const timelineDir = path.join('pipeline-data/sessions', sessionId, 'stage-10-content-aware-timeline');
  const mediaDir = path.join('pipeline-data/sessions', sessionId, 'stage-06-ai-media');
  
  // Load the current timeline
  const timelineFile = path.join(timelineDir, 'timeline.json');
  const timelineData = await fs.readFile(timelineFile, 'utf-8');
  const timeline = JSON.parse(timelineData);
  
  console.log(chalk.yellow('📝 Fixing media paths...'));
  
  // Fix the timeline events
  for (const event of timeline.events) {
    if (event.type === 'ai-video' && event.content.videoPath) {
      // Fix video path to full path
      const fullPath = path.join(process.cwd(), mediaDir, 'videos', event.content.videoPath);
      event.content.videoPath = fullPath;
      console.log(chalk.gray(`  Fixed video path: ${path.basename(fullPath)}`));
    }
    
    if (event.type === 'ai-image' && event.content.imagePath) {
      // Fix image path to full path
      const fullPath = path.join(process.cwd(), mediaDir, 'images', event.content.imagePath);
      event.content.imagePath = fullPath;
      console.log(chalk.gray(`  Fixed image path: ${path.basename(fullPath)}`));
    }
  }
  
  // Save the fixed timeline
  await fs.writeFile(timelineFile, JSON.stringify(timeline, null, 2));
  console.log(chalk.green('✅ Timeline media paths fixed'));
  
  // Also update the simplified timeline
  const simplifiedFile = path.join(timelineDir, 'timeline-simplified.json');
  const simplifiedData = await fs.readFile(simplifiedFile, 'utf-8');
  const simplified = JSON.parse(simplifiedData);
  
  // Fix simplified events similarly
  for (const event of simplified.events) {
    if (event.type === 'ai-video' && event.content?.videoPath) {
      const fullPath = path.join(process.cwd(), mediaDir, 'videos', event.content.videoPath);
      event.content.videoPath = fullPath;
    }
    
    if (event.type === 'ai-image' && event.content?.imagePath) {
      const fullPath = path.join(process.cwd(), mediaDir, 'images', event.content.imagePath);
      event.content.imagePath = fullPath;
    }
  }
  
  await fs.writeFile(simplifiedFile, JSON.stringify(simplified, null, 2));
  console.log(chalk.green('✅ Simplified timeline media paths also fixed'));
}

// Run the fix
const sessionId = process.argv[2] || 'ps_f573d96a24';
fixMediaPaths(sessionId).catch(console.error);
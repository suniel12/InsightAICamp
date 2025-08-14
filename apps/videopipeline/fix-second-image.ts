#!/usr/bin/env tsx

import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

async function fixSecondImage(sessionId: string) {
  console.log(chalk.cyan('🔧 Fixing Second AI Image Reference for Session: ' + sessionId));
  
  const timelineDir = path.join('pipeline-data/sessions', sessionId, 'stage-10-content-aware-timeline');
  const mediaDir = path.join('pipeline-data/sessions', sessionId, 'stage-06-ai-media');
  
  // Load the current timeline
  const timelineFile = path.join(timelineDir, 'timeline.json');
  const timelineData = await fs.readFile(timelineFile, 'utf-8');
  const timeline = JSON.parse(timelineData);
  
  console.log(chalk.yellow('📝 Fixing second AI image reference...'));
  
  // Find the second AI image event (segment 6) and fix it
  let imageCount = 0;
  for (const event of timeline.events) {
    if (event.type === 'ai-image') {
      imageCount++;
      if (imageCount === 2) {
        // This is the second AI image appearance - use helpdesk_img2.png
        const fullPath = path.join(process.cwd(), mediaDir, 'images', 'helpdesk_img2.png');
        event.content.imagePath = fullPath;
        console.log(chalk.gray(`  Fixed segment ${event.id}: Now using helpdesk_img2.png`));
      }
    }
  }
  
  // Save the fixed timeline
  await fs.writeFile(timelineFile, JSON.stringify(timeline, null, 2));
  console.log(chalk.green('✅ Timeline fixed with second image'));
  
  // Also update the simplified timeline
  const simplifiedFile = path.join(timelineDir, 'timeline-simplified.json');
  const simplifiedData = await fs.readFile(simplifiedFile, 'utf-8');
  const simplified = JSON.parse(simplifiedData);
  
  // Fix simplified events similarly
  imageCount = 0;
  for (const event of simplified.events) {
    if (event.type === 'ai-image') {
      imageCount++;
      if (imageCount === 2) {
        const fullPath = path.join(process.cwd(), mediaDir, 'images', 'helpdesk_img2.png');
        event.content.imagePath = fullPath;
      }
    }
  }
  
  await fs.writeFile(simplifiedFile, JSON.stringify(simplified, null, 2));
  console.log(chalk.green('✅ Simplified timeline also fixed'));
}

// Run the fix
const sessionId = process.argv[2] || 'ps_f573d96a24';
fixSecondImage(sessionId).catch(console.error);
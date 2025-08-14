#!/usr/bin/env tsx

import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

async function fixSlideMappings(sessionId: string) {
  console.log(chalk.cyan('🔧 Fixing Slide Mappings for Session: ' + sessionId));
  
  const timelineDir = path.join('pipeline-data/sessions', sessionId, 'stage-10-content-aware-timeline');
  const segmentsFile = path.join('pipeline-data/sessions', sessionId, 'stage-08-segmentation/narration-segments.json');
  
  // Load segments to get correct slide numbers
  const segmentsData = await fs.readFile(segmentsFile, 'utf-8');
  const segments = JSON.parse(segmentsData);
  
  // Create a mapping of segment IDs to slide numbers
  const segmentSlideMap = new Map();
  segments.forEach((segment: any) => {
    segmentSlideMap.set(segment.id, segment.slideNumber);
  });
  
  // Load the current timeline
  const timelineFile = path.join(timelineDir, 'timeline.json');
  const timelineData = await fs.readFile(timelineFile, 'utf-8');
  const timeline = JSON.parse(timelineData);
  
  console.log(chalk.yellow('📝 Fixing slide numbers and paths...'));
  
  // Fix the timeline events
  for (const event of timeline.events) {
    if (event.type === 'transition') continue;
    
    const correctSlideNumber = segmentSlideMap.get(event.id);
    
    if (event.type === 'slide' && correctSlideNumber) {
      event.content.slideNumber = correctSlideNumber;
      event.content.slidePath = `slide_${correctSlideNumber}.png`;
      event.content.description = `Slide ${correctSlideNumber}`;
      console.log(chalk.gray(`  Fixed ${event.id}: Slide ${correctSlideNumber}`));
    }
  }
  
  // Save the fixed timeline
  await fs.writeFile(timelineFile, JSON.stringify(timeline, null, 2));
  console.log(chalk.green('✅ Timeline slide mappings fixed'));
  
  // Also update the simplified timeline
  const simplifiedFile = path.join(timelineDir, 'timeline-simplified.json');
  const simplifiedData = await fs.readFile(simplifiedFile, 'utf-8');
  const simplified = JSON.parse(simplifiedData);
  
  // Fix simplified events similarly
  for (const event of simplified.events) {
    if (event.type === 'transition') continue;
    
    const correctSlideNumber = segmentSlideMap.get(event.id);
    
    if (event.type === 'slide' && correctSlideNumber) {
      event.content.slideNumber = correctSlideNumber;
      event.content.slidePath = `slide_${correctSlideNumber}.png`;
      event.content.description = `Slide ${correctSlideNumber}`;
    }
  }
  
  await fs.writeFile(simplifiedFile, JSON.stringify(simplified, null, 2));
  console.log(chalk.green('✅ Simplified timeline slide mappings also fixed'));
}

// Run the fix
const sessionId = process.argv[2] || 'ps_f573d96a24';
fixSlideMappings(sessionId).catch(console.error);
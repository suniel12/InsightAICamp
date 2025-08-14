#!/usr/bin/env tsx

import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

async function fixTimeline(sessionId: string) {
  console.log(chalk.cyan('🔧 Fixing Timeline for Session: ' + sessionId));
  
  const timelineDir = path.join('pipeline-data/sessions', sessionId, 'stage-10-content-aware-timeline');
  const segmentsFile = path.join('pipeline-data/sessions', sessionId, 'stage-08-segmentation/narration-segments.json');
  
  // Load the current timeline
  const timelineFile = path.join(timelineDir, 'timeline.json');
  const timelineData = await fs.readFile(timelineFile, 'utf-8');
  const timeline = JSON.parse(timelineData);
  
  // Load segments to understand content types
  const segmentsData = await fs.readFile(segmentsFile, 'utf-8');
  const segments = JSON.parse(segmentsData);
  
  // Create a mapping of segment IDs to content types
  const segmentTypeMap = new Map();
  segments.forEach((segment: any) => {
    segmentTypeMap.set(segment.id, segment.contentType);
  });
  
  console.log(chalk.yellow('📝 Fixing event types...'));
  
  // Fix the timeline events
  for (const event of timeline.events) {
    if (event.type === 'transition') {
      // Transitions are already correct
      continue;
    }
    
    // Determine the correct type based on segment content
    const segmentType = segmentTypeMap.get(event.id);
    
    if (segmentType === 'slide') {
      event.type = 'slide';
      // Also fix the slide path to use correct naming
      if (event.content && event.content.slideNumber) {
        event.content.slidePath = `slide_${event.content.slideNumber}.png`;
      }
    } else if (segmentType === 'video') {
      event.type = 'ai-video';
      // Set the video path
      event.content = event.content || {};
      event.content.videoPath = 'slide4_vid1.mp4';
      event.content.description = 'Data center walkthrough';
    } else if (segmentType === 'image') {
      event.type = 'ai-image';
      // Set the image path
      event.content = event.content || {};
      event.content.imagePath = 'helpdesk_img1.png';
      event.content.description = 'Helpdesk technician perspective';
    }
    
    console.log(chalk.gray(`  Fixed ${event.id}: ${event.type}`));
  }
  
  // Save the fixed timeline
  await fs.writeFile(timelineFile, JSON.stringify(timeline, null, 2));
  console.log(chalk.green('✅ Timeline fixed and saved'));
  
  // Also update the simplified timeline
  const simplifiedFile = path.join(timelineDir, 'timeline-simplified.json');
  const simplifiedData = await fs.readFile(simplifiedFile, 'utf-8');
  const simplified = JSON.parse(simplifiedData);
  
  // Fix simplified events similarly
  for (const event of simplified.events) {
    if (event.type === 'transition') continue;
    
    const segmentType = segmentTypeMap.get(event.id);
    
    if (segmentType === 'slide') {
      event.type = 'slide';
      if (event.content && event.content.slideNumber) {
        event.content.slidePath = `slide_${event.content.slideNumber}.png`;
      }
    } else if (segmentType === 'video') {
      event.type = 'ai-video';
      event.content = event.content || {};
      event.content.videoPath = 'slide4_vid1.mp4';
    } else if (segmentType === 'image') {
      event.type = 'ai-image';
      event.content = event.content || {};
      event.content.imagePath = 'helpdesk_img1.png';
    }
  }
  
  await fs.writeFile(simplifiedFile, JSON.stringify(simplified, null, 2));
  console.log(chalk.green('✅ Simplified timeline also fixed'));
}

// Run the fix
const sessionId = process.argv[2] || 'ps_f573d96a24';
fixTimeline(sessionId).catch(console.error);
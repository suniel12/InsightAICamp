#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_ID = 'ps_mNLd3DCJ';

async function testPipelineStages() {
  console.log(chalk.bold.cyan('🧪 Testing Pipeline Stages Data'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Test Stage 5 data
  console.log(chalk.yellow('\n📝 Stage 5: Script & Video Planning'));
  const narrationPath = path.join(sessionDir, 'stage-05-script-video-planning/complete-narration.md');
  const narrationContent = await fs.readFile(narrationPath, 'utf-8');
  
  // Parse segments
  const segments = parseNarrationSegments(narrationContent);
  console.log(`  Found ${segments.length} segments:`);
  segments.forEach(seg => {
    console.log(`    Slide ${seg.slideNumber}: ${seg.narration.substring(0, 50)}... (${Math.round(seg.duration)}s)`);
  });
  
  // Test Stage 6 data
  console.log(chalk.yellow('\n🎨 Stage 6: Media Manifest'));
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  console.log(`  Images: ${mediaManifest.images.length}`);
  console.log(`  Videos: ${mediaManifest.videos.length}`);
  
  // Check actual files
  console.log(chalk.yellow('\n📁 Media Files'));
  for (const img of mediaManifest.images) {
    const imgPath = path.join(sessionDir, 'stage-06-ai-media/images', img.file);
    try {
      await fs.access(imgPath);
      console.log(chalk.green(`  ✓ ${img.file}`));
    } catch {
      console.log(chalk.red(`  ✗ ${img.file} - Not found`));
    }
  }
  
  for (const vid of mediaManifest.videos) {
    const vidPath = path.join(sessionDir, 'stage-06-ai-media/videos', vid.file);
    try {
      await fs.access(vidPath);
      console.log(chalk.green(`  ✓ ${vid.file}`));
    } catch {
      console.log(chalk.red(`  ✗ ${vid.file} - Not found`));
    }
  }
  
  // Test slide images
  console.log(chalk.yellow('\n🖼️  Slide Images'));
  const slideImages = [
    'public/Slide1.png',
    'public/Slide2.png',
    'public/Slide3.png',
    'public/Slide4.png',
    'public/Slide5.png',
  ];
  
  for (const img of slideImages) {
    try {
      await fs.access(img);
      console.log(chalk.green(`  ✓ ${img}`));
    } catch {
      console.log(chalk.red(`  ✗ ${img} - Not found`));
    }
  }
}

function parseNarrationSegments(narrationContent: string) {
  const segments = [];
  
  // Debug: Show what we're parsing
  console.log(chalk.gray('\n  Parsing narration content...'));
  
  // Try different patterns
  const slidePatterns = [
    /## Slide \d+[\s\S]*?(?=## Slide|\n## Summary|$)/g,
    /### Slide \d+[\s\S]*?(?=### Slide|\n## |$)/g,
  ];
  
  let slideMatches = null;
  for (const pattern of slidePatterns) {
    slideMatches = narrationContent.match(pattern);
    if (slideMatches && slideMatches.length > 0) {
      console.log(chalk.gray(`  Found ${slideMatches.length} slides with pattern: ${pattern.source.substring(0, 30)}...`));
      break;
    }
  }
  
  if (!slideMatches) {
    console.log(chalk.yellow('  No slides found with standard patterns'));
    // Show first 500 chars to debug
    console.log(chalk.gray('  Content preview:'));
    console.log(chalk.gray(narrationContent.substring(0, 500)));
    return segments;
  }
  
  for (const slideContent of slideMatches) {
    const slideNumMatch = slideContent.match(/Slide (\d+)/);
    if (!slideNumMatch) continue;
    
    const slideNumber = parseInt(slideNumMatch[1]);
    
    // Try different narration patterns
    const narrationPatterns = [
      /\*\*Personalized Narration:\*\*\s*([\s\S]*?)(?=\n\n|\*\*|$)/,
      /\*\*Narration:\*\*\s*([\s\S]*?)(?=\n\n|\*\*|$)/,
      /Narration:\s*([\s\S]*?)(?=\n\n|##|$)/,
    ];
    
    let narration = '';
    for (const pattern of narrationPatterns) {
      const narrationMatch = slideContent.match(pattern);
      if (narrationMatch && narrationMatch[1]) {
        narration = narrationMatch[1].trim();
        break;
      }
    }
    
    if (!narration) {
      console.log(chalk.yellow(`  No narration found for Slide ${slideNumber}`));
      continue;
    }
    
    // Estimate duration based on word count (150 WPM)
    const wordCount = narration.split(/\s+/).length;
    const duration = (wordCount / 150) * 60;
    
    segments.push({
      slideNumber,
      narration,
      duration,
      visualDescription: `Slide ${slideNumber} visuals`,
      keyPoints: []
    });
  }
  
  return segments;
}

// Run the test
testPipelineStages().catch(error => {
  console.error(chalk.red('❌ Test failed:'), error);
  process.exit(1);
});
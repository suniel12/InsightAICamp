#!/usr/bin/env tsx

import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function debugNarration() {
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  const narrationPath = path.join(sessionDir, 'stage-05-script-video-planning/complete-narration.md');
  const narrationContent = await fs.readFile(narrationPath, 'utf-8');
  
  console.log(chalk.yellow('📝 Narration Content Analysis'));
  console.log(chalk.gray('─'.repeat(60)));
  
  // Show first 1000 chars
  console.log('\nFirst 1000 characters:');
  console.log(chalk.gray(narrationContent.substring(0, 1000)));
  
  // Try to find slides
  const slidePatterns = [
    /\(SLIDE \d+:/g,
    /## Slide \d+/g,
    /### Slide \d+/g,
    /Slide \d+:/g,
  ];
  
  console.log('\n' + chalk.yellow('Pattern Matching:'));
  for (const pattern of slidePatterns) {
    const matches = narrationContent.match(pattern);
    if (matches && matches.length > 0) {
      console.log(chalk.green(`✓ Pattern ${pattern.source}: Found ${matches.length} matches`));
      console.log('  Matches:', matches.join(', '));
    } else {
      console.log(chalk.red(`✗ Pattern ${pattern.source}: No matches`));
    }
  }
  
  // Parse with working pattern
  console.log('\n' + chalk.yellow('Parsing Segments:'));
  const segments = parseNarrationSegments(narrationContent);
  console.log(`Found ${segments.length} segments:`);
  
  segments.forEach(seg => {
    console.log(chalk.cyan(`\nSlide ${seg.slideNumber}:`));
    console.log(`  Duration: ${seg.duration}s`);
    console.log(`  Word count: ${seg.narration.split(/\s+/).filter(w => w.length > 0).length}`);
    console.log(`  First 100 chars: ${seg.narration.substring(0, 100)}...`);
  });
  
  // Calculate total duration
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
  console.log(chalk.green(`\nTotal Duration: ${totalDuration}s (${Math.round(totalDuration/60)} minutes)`));
}

function parseNarrationSegments(narrationContent: string) {
  const segments = [];
  
  // Split by (SLIDE X: pattern
  const slideMatches = narrationContent.match(/\(SLIDE \d+:[\s\S]*?(?=\(SLIDE|\[SLIDE TRANSITION\]|---|\n## |$)/g) || [];
  
  console.log(chalk.gray(`  Found ${slideMatches.length} slide matches`));
  
  for (const slideContent of slideMatches) {
    const slideNumMatch = slideContent.match(/\(SLIDE (\d+):/);
    if (!slideNumMatch) continue;
    
    const slideNumber = parseInt(slideNumMatch[1]);
    
    // Extract the narration text (everything after the slide header)
    const narrationText = slideContent
      .replace(/\(SLIDE \d+:[^)]*\)/, '') // Remove slide header
      .replace(/\(Video Begins\)[\s\S]*?\(Video Ends\)/g, '') // Remove video sections
      .trim();
    
    // Estimate duration based on word count (150 WPM)
    const wordCount = narrationText.split(/\s+/).filter(w => w.length > 0).length;
    const duration = Math.max(10, (wordCount / 150) * 60); // Minimum 10 seconds per slide
    
    segments.push({
      slideNumber,
      narration: narrationText,
      duration,
      visualDescription: `Slide ${slideNumber} visuals`,
      keyPoints: []
    });
  }
  
  return segments;
}

debugNarration().catch(console.error);
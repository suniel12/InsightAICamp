#!/usr/bin/env tsx

import { ContentAwareTimelinePlanner } from './src/stages/timeline/planner';
import { SegmentedAudioCollection } from './src/types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

async function runStage10(sessionId: string) {
  console.log(chalk.cyan('🎬 Running Stage 10: Content-Aware Timeline'));
  console.log(chalk.gray('─'.repeat(50)));

  const sessionDir = path.join(process.cwd(), 'pipeline-data', 'sessions', sessionId);
  
  // Load the segmented audio collection from Stage 9
  const audioCollectionPath = path.join(sessionDir, 'stage-09-segmented-tts', 'segmented-audio-collection.json');
  
  try {
    const audioCollectionData = await fs.readFile(audioCollectionPath, 'utf-8');
    const audioCollection: SegmentedAudioCollection = JSON.parse(audioCollectionData);
    
    console.log(chalk.green(`✓ Loaded ${audioCollection.segments.length} audio segments`));
    console.log(chalk.gray(`  Total duration: ${audioCollection.totalDuration.toFixed(1)}s`));
    
    // Create timeline planner
    const planner = new ContentAwareTimelinePlanner({
      sessionId,
      sessionDir,
      transitionDuration: 1.0, // 1 second fade transitions
      outputFormat: sessionId
    });
    
    // Generate timeline
    console.log(chalk.yellow('\n⏱️  Generating timeline...'));
    const timeline = await planner.createTimeline(audioCollection);
    
    // Save timeline
    const timelineOutputPath = await planner.saveTimeline(timeline);
    
    // Display overview
    planner.displayTimelineOverview(timeline);
    
    console.log(chalk.green(`\n✅ Stage 10 completed successfully!`));
    console.log(chalk.white(`📁 Timeline saved to: ${timelineOutputPath}`));
    
  } catch (error) {
    console.error(chalk.red('❌ Stage 10 failed:'));
    console.error(error);
    process.exit(1);
  }
}

// Get session ID from command line args
const sessionId = process.argv[2];
if (!sessionId) {
  console.error(chalk.red('❌ Please provide a session ID'));
  console.error(chalk.gray('Usage: tsx run-stage10.ts <session-id>'));
  process.exit(1);
}

runStage10(sessionId).catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
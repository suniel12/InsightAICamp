#!/usr/bin/env tsx

import { SegmentedAssemblyStage } from './src/stages/assembly';
import { ContentAwareTimeline } from './src/stages/timeline/planner';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

async function runStage11(sessionId: string) {
  console.log(chalk.cyan('🎬 Running Stage 11: Final Video Assembly'));
  console.log(chalk.gray('─'.repeat(50)));

  const sessionDir = path.join(process.cwd(), 'pipeline-data', 'sessions', sessionId);
  
  try {
    // Load the timeline from Stage 10
    const timelineePath = path.join(sessionDir, 'stage-10-content-aware-timeline', 'timeline.json');
    const timelineData = await fs.readFile(timelineePath, 'utf-8');
    const timeline: ContentAwareTimeline = JSON.parse(timelineData);
    
    console.log(chalk.green(`✓ Loaded timeline with ${timeline.events.length} events`));
    console.log(chalk.gray(`  Total duration: ${timeline.totalDuration.toFixed(1)}s`));
    
    // Collect slide images from the correct pipeline directory
    const slideImages: string[] = [];
    const slidesDir = path.join(sessionDir, 'stage-04-enhanced-ppt', 'slides');
    
    // Check for slide images in the stage-04 enhanced slides directory
    for (let i = 1; i <= 9; i++) {
      const slideImagePath = path.join(slidesDir, `Slide${i}.png`);
      try {
        await fs.access(slideImagePath);
        slideImages.push(slideImagePath);
        console.log(chalk.gray(`  ✓ Found slide image: Slide${i}.png`));
      } catch {
        console.log(chalk.yellow(`  ⚠️  Missing slide image: Slide${i}.png`));
      }
    }
    
    if (slideImages.length === 0) {
      console.error(chalk.red('❌ No slide images found in pipeline directory'));
      console.error(chalk.gray(`Expected in: ${slidesDir}`));
      process.exit(1);
    }

    // Create assembly stage
    const assembler = new SegmentedAssemblyStage({
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    });
    
    // Collect AI videos and images if they exist
    const aiVideos: any[] = [];
    const aiImages: string[] = [];
    
    // Check for AI media from timeline events
    for (const event of timeline.events) {
      if (event.type === 'ai-video' && event.content.videoPath) {
        try {
          await fs.access(event.content.videoPath);
          aiVideos.push({
            url: event.content.videoPath,
            slideNumber: event.content.slideNumber || 1,
            description: event.content.description
          });
          console.log(chalk.gray(`  ✓ Found AI video: ${path.basename(event.content.videoPath)}`));
        } catch {
          console.log(chalk.yellow(`  ⚠️  Missing AI video: ${event.content.videoPath}`));
        }
      }
      
      if (event.type === 'ai-image' && event.content.imagePath) {
        try {
          await fs.access(event.content.imagePath);
          aiImages.push(event.content.imagePath);
          console.log(chalk.gray(`  ✓ Found AI image: ${path.basename(event.content.imagePath)}`));
        } catch {
          console.log(chalk.yellow(`  ⚠️  Missing AI image: ${event.content.imagePath}`));
        }
      }
    }
    
    console.log(chalk.yellow('\n🎬 Assembling final video...'));
    console.log(chalk.gray(`  Slide images: ${slideImages.length}`));
    console.log(chalk.gray(`  AI videos: ${aiVideos.length}`));
    console.log(chalk.gray(`  AI images: ${aiImages.length}`));
    console.log(chalk.gray(`  Audio segments: ${timeline.audioCollection.segments.length}`));
    
    // Assemble the final video
    const finalVideoPath = await assembler.assemble({
      timeline,
      slideImages,
      aiVideos,
      aiImages
    });
    
    console.log(chalk.green(`\n✅ Stage 11 completed successfully!`));
    console.log(chalk.white(`📁 Final video saved to: ${finalVideoPath}`));
    
    // Display video info
    console.log(chalk.cyan('\n📊 Video Information:'));
    console.log(chalk.gray(`  Duration: ${timeline.totalDuration.toFixed(1)}s (${Math.floor(timeline.totalDuration / 60)}:${String(Math.floor(timeline.totalDuration % 60)).padStart(2, '0')})`));
    console.log(chalk.gray(`  Resolution: 1080p (1920x1080)`));
    console.log(chalk.gray(`  FPS: 30`));
    console.log(chalk.gray(`  Format: MP4`));
    
  } catch (error) {
    console.error(chalk.red('❌ Stage 11 failed:'));
    console.error(error);
    process.exit(1);
  }
}

// Get session ID from command line args
const sessionId = process.argv[2];
if (!sessionId) {
  console.error(chalk.red('❌ Please provide a session ID'));
  console.error(chalk.gray('Usage: tsx run-stage11.ts <session-id>'));
  process.exit(1);
}

runStage11(sessionId).catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
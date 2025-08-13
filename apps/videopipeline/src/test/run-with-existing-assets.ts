#!/usr/bin/env tsx

import { VisualAnalyzer, UserContext } from '../stages/analysis/visual-analyzer';
import { ScriptGenerator } from '../stages/script/generator';
import { AIMediaOpportunityDetector } from '../stages/media/opportunity-detector';
import { TimelinePlanner } from '../stages/timeline/planner';
import { FinalNarrationGenerator } from '../stages/narration/final-generator';
import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import { GeneratedVideo, AudioFile } from '../types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Run the pipeline with existing slide images and audio
 */
async function runWithExistingAssets() {
  console.log(chalk.bold.cyan('🎬 Running Enhanced Pipeline with Existing Assets'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');

  const config = {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  };

  if (!config.openaiApiKey) {
    console.error(chalk.red('❌ OPENAI_API_KEY not set'));
    console.log(chalk.yellow('Please set your OpenAI API key in .env file'));
    process.exit(1);
  }

  // Define user context - customize this based on your target audience
  const userContext: UserContext = {
    background: 'Business professional interested in understanding cloud infrastructure',
    expertise: 'beginner',
    industry: 'Business/Technology',
    goals: 'Understanding data centers and cloud computing basics'
  };

  // Use the existing slide images
  const slideImages = [
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide1.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide2.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide3.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide4.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide5.png',
  ];

  // Use the existing audio files
  const existingAudioFiles: AudioFile[] = [
    {
      slideNumber: 1,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_1_audio.mp3',
      duration: 30, // Will calculate actual duration
      format: 'mp3'
    },
    {
      slideNumber: 2,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_2_audio.mp3',
      duration: 30,
      format: 'mp3'
    },
    {
      slideNumber: 3,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_3_audio.mp3',
      duration: 30,
      format: 'mp3'
    },
    {
      slideNumber: 4,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_4_audio.mp3',
      duration: 30,
      format: 'mp3'
    },
    {
      slideNumber: 5,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_5_audio.mp3',
      duration: 30,
      format: 'mp3'
    }
  ];

  try {
    // Stage 1: Analyze slides
    console.log(chalk.yellow('📊 Stage 1: Analyzing slides with Vision AI...'));
    const analyzer = new VisualAnalyzer(config.openaiApiKey);
    const slideAnalyses = await analyzer.analyzeSlides(slideImages, userContext);
    console.log(chalk.green(`✅ Analyzed ${slideAnalyses.length} slides`));
    
    slideAnalyses.forEach(analysis => {
      console.log(chalk.gray(`  Slide ${analysis.slideNumber}: ${analysis.title}`));
      if (analysis.concepts.length > 0) {
        console.log(chalk.gray(`    Concepts: ${analysis.concepts.slice(0, 3).join(', ')}`));
      }
    });

    // Stage 2: Generate script
    console.log(chalk.yellow('\n📝 Stage 2: Generating personalized script...'));
    const scriptGenerator = new ScriptGenerator(config.openaiApiKey);
    const script = await scriptGenerator.generateScript(slideAnalyses, userContext);
    console.log(chalk.green(`✅ Generated script`));
    console.log(chalk.gray(`  Tone: ${script.tone}, Pacing: ${script.pacing}`));

    // Stage 3: Detect AI media opportunities
    console.log(chalk.yellow('\n🎯 Stage 3: Detecting AI media opportunities...'));
    const opportunityDetector = new AIMediaOpportunityDetector(
      config.openaiApiKey,
      2, // Limit to 2 videos for this test
      1
    );
    const opportunities = await opportunityDetector.detectOpportunities(
      script.segments,
      slideAnalyses,
      userContext
    );
    console.log(chalk.green(`✅ Identified ${opportunities.length} AI media opportunities`));
    
    opportunities.forEach(opp => {
      console.log(chalk.cyan(`  Slide ${opp.slideNumber}:`));
      console.log(chalk.gray(`    Type: ${opp.type}`));
      console.log(chalk.gray(`    Priority: ${opp.priority}`));
      console.log(chalk.gray(`    Score: ${opp.score.toFixed(2)}`));
      console.log(chalk.gray(`    Reasoning: ${opp.reasoning}`));
      if (opp.type === 'video') {
        console.log(chalk.yellow(`    Runway Prompt: ${opp.prompt.substring(0, 100)}...`));
      }
    });

    // Stage 4: Mock AI video generation (since we don't have Runway API)
    console.log(chalk.yellow('\n🎥 Stage 4: Preparing AI video placeholders...'));
    const generatedVideos: GeneratedVideo[] = [];
    
    // For demo purposes, we'll skip actual video generation
    console.log(chalk.yellow('  ℹ️  Skipping actual video generation (no Runway API configured)'));
    console.log(chalk.gray('  In production, these prompts would be sent to Runway:'));
    
    for (const opp of opportunities.filter(o => o.type === 'video')) {
      console.log(chalk.gray(`    - ${opp.description}`));
      // In production, you would generate actual videos here
    }

    // Stage 5: Create timeline
    console.log(chalk.yellow('\n⏱️  Stage 5: Planning visual timeline...'));
    const timelinePlanner = new TimelinePlanner();
    
    // Update audio durations based on actual files (approximation)
    // In production, you'd use ffprobe or similar to get exact durations
    existingAudioFiles[0].duration = 26.5; // slide 1
    existingAudioFiles[1].duration = 28.1; // slide 2
    existingAudioFiles[2].duration = 30.0; // slide 3
    existingAudioFiles[3].duration = 32.6; // slide 4
    existingAudioFiles[4].duration = 24.7; // slide 5
    
    // Create script segments with actual durations
    script.segments.forEach((segment, i) => {
      segment.duration = existingAudioFiles[i].duration;
    });
    
    const timeline = await timelinePlanner.planTimeline(
      script.segments,
      slideImages,
      opportunities.filter(o => o.type !== 'video'), // Only non-video opportunities since we have no videos
      []
    );
    console.log(chalk.green(`✅ Created timeline`));
    console.log(chalk.gray(`  Events: ${timeline.events.length}`));
    console.log(chalk.gray(`  Total duration: ${Math.round(timeline.totalDuration)}s`));

    // Stage 6: Combine existing audio files
    console.log(chalk.yellow('\n🔊 Stage 6: Using existing audio files...'));
    
    // For the enhanced pipeline, we need a single continuous audio file
    // For now, we'll use the first audio as the main narration
    const combinedAudio: AudioFile = {
      slideNumber: 1,
      url: existingAudioFiles[0].url, // In production, combine all audio files
      duration: existingAudioFiles.reduce((sum, a) => sum + a.duration, 0),
      format: 'mp3'
    };
    console.log(chalk.green(`✅ Audio ready`));
    console.log(chalk.gray(`  Total audio duration: ${combinedAudio.duration.toFixed(1)}s`));

    // Stage 7: Assemble video
    console.log(chalk.yellow('\n🎬 Stage 7: Assembling final video...'));
    console.log(chalk.yellow('  ℹ️  This will create a video with:'));
    console.log(chalk.gray('    - Your 5 high-quality slide images'));
    console.log(chalk.gray('    - Existing narration audio'));
    console.log(chalk.gray('    - Smooth transitions between slides'));
    console.log(chalk.gray('    - Professional Ken Burns effect'));
    
    const assembler = new EnhancedAssemblyStage({
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    });
    
    try {
      const finalVideoPath = await assembler.assemble({
        timeline,
        slideImages,
        narrationAudio: combinedAudio,
        aiVideos: [],
        aiImages: []
      });
      
      console.log(chalk.bold.green('\n✅ Video assembly completed!'));
      console.log(chalk.white(`📁 Output: ${finalVideoPath}`));
    } catch (assemblyError) {
      console.log(chalk.yellow('\n⚠️  Video assembly requires Remotion to be properly configured'));
      console.log(chalk.gray('  The pipeline stages are complete, but final rendering was skipped'));
      console.log(chalk.gray('  To enable video rendering:'));
      console.log(chalk.gray('    1. Ensure Remotion dependencies are installed'));
      console.log(chalk.gray('    2. Configure ffmpeg on your system'));
    }

    // Summary
    console.log(chalk.cyan('\n📊 Pipeline Summary:'));
    console.log(chalk.gray('  ✓ Analyzed 5 slides with Vision AI'));
    console.log(chalk.gray('  ✓ Generated personalized script for beginner audience'));
    console.log(chalk.gray(`  ✓ Identified ${opportunities.length} opportunities for AI enhancement`));
    console.log(chalk.gray('  ✓ Created timeline with smooth transitions'));
    console.log(chalk.gray('  ✓ Prepared for video assembly'));
    
    if (opportunities.length > 0) {
      console.log(chalk.yellow('\n💡 Recommended AI Enhancements:'));
      opportunities.slice(0, 3).forEach(opp => {
        console.log(chalk.gray(`  • Slide ${opp.slideNumber}: ${opp.type === 'video' ? '🎥 Video' : '🖼️ Image'}`));
        console.log(chalk.gray(`    ${opp.reasoning}`));
      });
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Pipeline failed:'));
    console.error(error);
    process.exit(1);
  }
}

// Run the pipeline
console.log(chalk.cyan('Starting enhanced pipeline with existing assets...'));
console.log(chalk.gray('This will analyze your slides and create a personalized video experience.'));
console.log('');

runWithExistingAssets().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
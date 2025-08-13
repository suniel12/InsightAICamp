#!/usr/bin/env tsx

import { VisualAnalyzer, UserContext } from '../stages/analysis/visual-analyzer';
import { ScriptGenerator } from '../stages/script/generator';
import { AIMediaOpportunityDetector } from '../stages/media/opportunity-detector';
import { TimelinePlanner } from '../stages/timeline/planner';
import { FinalNarrationGenerator } from '../stages/narration/final-generator';
import { TTSStage } from '../stages/tts';
import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import { GeneratedVideo } from '../types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test script for the enhanced video pipeline
 * This demonstrates the complete flow from slide images to final video
 */
async function runEnhancedPipelineTest() {
  console.log(chalk.bold.cyan('🎬 Enhanced Video Pipeline Test'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');

  // Configuration
  const config = {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
    runwayApiKey: process.env.RUNWAY_API_KEY || '',
  };

  // Validate API keys
  if (!config.openaiApiKey) {
    console.error(chalk.red('❌ OPENAI_API_KEY not set'));
    process.exit(1);
  }

  // Define user context for personalization
  const userContext: UserContext = {
    background: 'Software engineer with 5 years of experience in web development',
    expertise: 'intermediate',
    industry: 'Technology',
    goals: 'Understanding cloud infrastructure and data center operations'
  };

  // Define slide images (you need to have these ready)
  const slideImages = [
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide1.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide2.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide3.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide4.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide5.png',
  ];

  // Verify slide images exist
  console.log(chalk.yellow('📁 Verifying slide images...'));
  for (const imagePath of slideImages) {
    try {
      await fs.access(imagePath);
      console.log(chalk.green(`  ✓ ${path.basename(imagePath)}`));
    } catch {
      console.error(chalk.red(`  ✗ Missing: ${imagePath}`));
      console.log(chalk.yellow('  Please ensure slide images are exported to the public folder'));
      process.exit(1);
    }
  }

  try {
    // Stage 1: Analyze slide images with Vision AI
    console.log(chalk.yellow('\n📊 Stage 1: Analyzing slides with Vision AI...'));
    const analyzer = new VisualAnalyzer(config.openaiApiKey);
    const slideAnalyses = await analyzer.analyzeSlides(slideImages, userContext);
    console.log(chalk.green(`  ✓ Analyzed ${slideAnalyses.length} slides`));
    
    // Display analysis summary
    slideAnalyses.forEach(analysis => {
      console.log(chalk.gray(`    Slide ${analysis.slideNumber}: ${analysis.title}`));
    });

    // Stage 2: Generate initial script
    console.log(chalk.yellow('\n📝 Stage 2: Generating personalized script...'));
    const scriptGenerator = new ScriptGenerator(config.openaiApiKey);
    const script = await scriptGenerator.generateScript(slideAnalyses, userContext);
    console.log(chalk.green(`  ✓ Generated script with ${script.segments.length} segments`));
    console.log(chalk.gray(`    Tone: ${script.tone}, Pacing: ${script.pacing}`));
    console.log(chalk.gray(`    Total duration: ${Math.round(script.totalDuration)}s`));

    // Stage 3: Detect AI media opportunities
    console.log(chalk.yellow('\n🎯 Stage 3: Detecting AI media opportunities...'));
    const opportunityDetector = new AIMediaOpportunityDetector(
      config.openaiApiKey,
      3, // max 3 videos
      1  // max 1 per slide
    );
    const opportunities = await opportunityDetector.detectOpportunities(
      script.segments,
      slideAnalyses,
      userContext
    );
    console.log(chalk.green(`  ✓ Identified ${opportunities.length} AI media opportunities`));
    
    // Display opportunities
    opportunities.forEach(opp => {
      console.log(chalk.gray(`    Slide ${opp.slideNumber}: ${opp.type} (${opp.priority}, score: ${opp.score.toFixed(2)})`));
      console.log(chalk.gray(`      ${opp.reasoning}`));
    });

    // Stage 4: Generate AI videos (mock for testing)
    console.log(chalk.yellow('\n🎥 Stage 4: Generating AI videos...'));
    const generatedVideos: GeneratedVideo[] = [];
    
    if (config.runwayApiKey) {
      // In production, actually generate videos with Runway
      console.log(chalk.yellow('  Would generate videos with Runway API'));
    } else {
      // Mock videos for testing
      console.log(chalk.yellow('  ⚠️  No Runway API key - using mock videos'));
      for (const opp of opportunities.filter(o => o.type === 'video')) {
        generatedVideos.push({
          id: `video-${opp.slideNumber}`,
          slideNumber: opp.slideNumber,
          url: '/path/to/mock/video.mp4', // Would be actual video path
          duration: opp.duration || 5,
          prompt: opp.prompt,
          provider: 'runway',
          cost: 0.25
        });
      }
    }
    console.log(chalk.green(`  ✓ Generated ${generatedVideos.length} videos`));

    // Stage 5: Create visual timeline
    console.log(chalk.yellow('\n⏱️  Stage 5: Planning visual timeline...'));
    const timelinePlanner = new TimelinePlanner();
    const timeline = await timelinePlanner.planTimeline(
      script.segments,
      slideImages,
      opportunities,
      generatedVideos
    );
    console.log(chalk.green(`  ✓ Created timeline with ${timeline.events.length} events`));
    console.log(chalk.gray(`    Total duration: ${Math.round(timeline.totalDuration)}s`));
    
    // Display timeline summary
    const timelineDesc = timelinePlanner.generateTimelineDescription(timeline);
    console.log(chalk.gray('\n' + timelineDesc));

    // Stage 6: Generate final narration
    console.log(chalk.yellow('\n🎙️  Stage 6: Generating final continuous narration...'));
    const narrationGenerator = new FinalNarrationGenerator(config.openaiApiKey);
    const finalNarration = await narrationGenerator.generateFinalNarration(
      timeline,
      script.segments,
      userContext
    );
    console.log(chalk.green(`  ✓ Generated final narration`));
    console.log(chalk.gray(`    Word count: ${finalNarration.fullScript.split(' ').length}`));
    console.log(chalk.gray(`    WPM: ${Math.round(finalNarration.wordsPerMinute)}`));

    // Stage 7: Generate TTS audio
    console.log(chalk.yellow('\n🔊 Stage 7: Generating text-to-speech audio...'));
    
    let audioFile;
    if (config.elevenLabsApiKey) {
      const ttsStage = new TTSStage({
        provider: 'elevenlabs',
        voiceId: config.elevenLabsVoiceId,
        apiKey: config.elevenLabsApiKey
      });
      
      // Convert to format expected by TTS stage
      const narrationScripts = [{
        slideNumber: 1,
        mainNarration: finalNarration.fullScript,
        duration: finalNarration.totalDuration
      }];
      
      const audioFiles = await ttsStage.generateAudio(narrationScripts);
      audioFile = audioFiles[0];
      console.log(chalk.green(`  ✓ Generated audio file (${audioFile.duration}s)`));
    } else {
      console.log(chalk.yellow('  ⚠️  No ElevenLabs API key - skipping TTS'));
      // Create mock audio file
      audioFile = {
        slideNumber: 1,
        url: '/path/to/mock/audio.mp3',
        duration: finalNarration.totalDuration,
        format: 'mp3' as const
      };
    }

    // Stage 8: Assemble final video
    console.log(chalk.yellow('\n🎬 Stage 8: Assembling final video...'));
    const assembler = new EnhancedAssemblyStage({
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    });
    
    const finalVideoPath = await assembler.assemble({
      timeline,
      slideImages,
      narrationAudio: audioFile,
      aiVideos: generatedVideos,
      aiImages: [] // Would include generated images
    });
    
    console.log(chalk.green(`  ✓ Video assembled successfully`));
    console.log(chalk.bold.green(`\n✅ Pipeline test completed!`));
    console.log(chalk.white(`📁 Output: ${finalVideoPath}`));
    
    // Display cost summary
    const totalCost = generatedVideos.reduce((sum, v) => sum + v.cost, 0);
    console.log(chalk.cyan('\n💰 Cost Summary:'));
    console.log(chalk.gray(`  AI Videos: $${totalCost.toFixed(2)}`));
    console.log(chalk.gray(`  TTS: ~$0.05`));
    console.log(chalk.yellow(`  Total: $${(totalCost + 0.05).toFixed(2)}`));

  } catch (error) {
    console.error(chalk.red('\n❌ Pipeline test failed:'));
    console.error(error);
    process.exit(1);
  }
}

// Run the test
console.log(chalk.cyan('\nStarting enhanced pipeline test...'));
console.log(chalk.gray('This will test the complete flow without actual API calls if keys are missing.'));
console.log('');

runEnhancedPipelineTest().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import { TimelinePlanner } from '../stages/timeline/planner';
import { FinalNarrationGenerator } from '../stages/narration/final-generator';
import { TTSStage } from '../stages/tts';
import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStages7To10() {
  console.log(chalk.bold.cyan('🎬 Running Stages 7-10 for Video Pipeline'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionManager = new PipelineSession(SESSION_ID);
  await sessionManager.load();
  console.log(chalk.green(`✅ Session loaded: ${SESSION_ID}`));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Load required data from previous stages
  const narrationPath = path.join(sessionDir, 'stage-05-script-video-planning/complete-narration.md');
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaPlansPath = path.join(sessionDir, 'stage-05-script-video-planning/media-plan-simplified.json');
  
  const narrationContent = await fs.readFile(narrationPath, 'utf-8');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  const mediaPlans = JSON.parse(await fs.readFile(mediaPlansPath, 'utf-8'));
  
  // Parse narration segments from markdown
  const segments = parseNarrationSegments(narrationContent);
  
  // Stage 7: Timeline Orchestration
  console.log(chalk.yellow('\n⏱️  Stage 7: Timeline Orchestration'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const timelinePlanner = new TimelinePlanner();
  
  // Prepare slide images
  const slideImages = [
    path.join(process.cwd(), 'public/Slide1.png'),
    path.join(process.cwd(), 'public/Slide2.png'),
    path.join(process.cwd(), 'public/Slide3.png'),
    path.join(process.cwd(), 'public/Slide4.png'),
    path.join(process.cwd(), 'public/Slide5.png'),
  ];
  
  // Convert media manifest to timeline format
  const generatedVideos = mediaManifest.videos.map((v: any) => {
    // Parse duration - could be "8 seconds" or just "8"
    let duration = 8; // default
    if (typeof v.duration === 'string') {
      const match = v.duration.match(/(\d+)/);
      if (match) duration = parseInt(match[1]);
    } else if (typeof v.duration === 'number') {
      duration = v.duration;
    }
    
    return {
      id: v.file,
      slideNumber: v.slide,
      url: path.join(sessionDir, 'stage-06-ai-media/videos', v.file),
      duration,
      prompt: v.purpose,
      provider: 'user-provided',
      cost: 0
    };
  });
  
  const opportunities = mediaPlans.opportunities.map((plan: any) => {
    // Parse duration for opportunities too
    let duration = undefined;
    if (plan.duration) {
      if (typeof plan.duration === 'string') {
        const match = plan.duration.match(/(\d+)/);
        if (match) duration = parseInt(match[1]);
      } else if (typeof plan.duration === 'number') {
        duration = plan.duration;
      }
    }
    
    return {
      slideNumber: plan.slideNumber,
      type: plan.type,
      timing: plan.timing,
      duration,
      prompt: plan.prompt || plan.purpose,
      priority: 'high' as const,
      score: 1.0,
      reasoning: plan.purpose
    };
  });
  
  // Debug segments before timeline
  console.log(chalk.gray(`  Segments: ${segments.length}, Total duration: ${segments.reduce((s, seg) => s + seg.duration, 0)}s`));
  segments.forEach(seg => {
    console.log(chalk.gray(`    Slide ${seg.slideNumber}: ${seg.duration}s`));
  });
  
  const timeline = await timelinePlanner.planTimeline(
    segments,
    slideImages,
    opportunities,
    generatedVideos
  );
  
  // Fix NaN duration if needed
  if (isNaN(timeline.totalDuration)) {
    const calculatedDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    timeline.totalDuration = calculatedDuration || 300; // Default 5 minutes
    console.log(chalk.yellow(`  Fixed timeline duration: ${timeline.totalDuration}s`));
  }
  
  // Save timeline
  const stage7Dir = path.join(sessionDir, 'stage-07-timeline');
  await fs.mkdir(stage7Dir, { recursive: true });
  await fs.writeFile(
    path.join(stage7Dir, 'timeline.json'),
    JSON.stringify(timeline, null, 2)
  );
  
  console.log(chalk.green(`✅ Timeline created with ${timeline.events.length} events`));
  console.log(chalk.gray(`   Total duration: ${Math.round(timeline.totalDuration)}s`));
  
  // Stage 8: Final Narration Generation
  console.log(chalk.yellow('\n🎙️  Stage 8: Final Narration Generation'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const narrationGenerator = new FinalNarrationGenerator(process.env.OPENAI_API_KEY!);
  
  const userContext = {
    background: 'Biology graduate with laboratory research experience',
    expertise: 'intermediate',
    industry: 'Life Sciences/Research',
    goals: 'Understanding data centers through biological analogies'
  };
  
  const finalNarration = await narrationGenerator.generateFinalNarration(
    timeline,
    segments,
    userContext
  );
  
  // Save final narration
  const stage8Dir = path.join(sessionDir, 'stage-08-final-narration');
  await fs.mkdir(stage8Dir, { recursive: true });
  await fs.writeFile(
    path.join(stage8Dir, 'narration.json'),
    JSON.stringify(finalNarration, null, 2)
  );
  await fs.writeFile(
    path.join(stage8Dir, 'narration.txt'),
    finalNarration.fullScript
  );
  
  console.log(chalk.green(`✅ Final narration generated`));
  console.log(chalk.gray(`   Word count: ${finalNarration.fullScript.split(' ').length}`));
  console.log(chalk.gray(`   Duration: ${Math.round(finalNarration.totalDuration)}s`));
  
  // Stage 9: Text-to-Speech
  console.log(chalk.yellow('\n🔊 Stage 9: Text-to-Speech Audio Generation'));
  console.log(chalk.gray('─'.repeat(60)));
  
  let audioFile;
  const stage9Dir = path.join(sessionDir, 'stage-09-tts-audio');
  await fs.mkdir(stage9Dir, { recursive: true });
  
  // Generate real audio with ElevenLabs
  if (process.env.ELEVENLABS_API_KEY) {
    console.log(chalk.cyan('🎙️  Generating audio with ElevenLabs...'));
    
    const ttsStage = new TTSStage({
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
      apiKey: process.env.ELEVENLABS_API_KEY
    });
    
    const narrationScripts = [{
      slideNumber: 1,
      mainNarration: finalNarration.fullScript,
      duration: finalNarration.totalDuration
    }];
    
    try {
      const audioFiles = await ttsStage.generateAudio(narrationScripts);
      audioFile = audioFiles[0];
      
      // Copy audio file to stage directory
      const audioPath = path.join(stage9Dir, 'narration.mp3');
      if (audioFile.url && audioFile.url !== audioPath) {
        await fs.copyFile(audioFile.url, audioPath);
        audioFile.url = audioPath;
      }
      
      console.log(chalk.green(`✅ Audio generated successfully (${audioFile.duration}s)`));
    } catch (error: any) {
      console.log(chalk.yellow(`⚠️  ElevenLabs failed: ${error.message}`));
      console.log(chalk.yellow('  Creating silent audio fallback...'));
      
      // Create silent audio as fallback
      const mockAudioPath = path.join(stage9Dir, 'narration.mp3');
      const totalDuration = finalNarration.totalDuration || 300;
      
      // Create silent audio file using ffmpeg
      const { execSync } = require('child_process');
      try {
        execSync(`ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${Math.ceil(totalDuration)} -q:a 9 -acodec libmp3lame "${mockAudioPath}" -y`, { stdio: 'pipe' });
        
        audioFile = {
          slideNumber: 1,
          url: mockAudioPath,
          duration: totalDuration,
          format: 'mp3' as const
        };
        
        console.log(chalk.green(`✅ Silent audio created (${audioFile.duration}s)`));
      } catch (ffmpegError) {
        throw new Error('Failed to create audio file');
      }
    }
  } else {
    throw new Error('No ElevenLabs API key configured');
  }
  
  // Stage 10: Final Video Assembly
  console.log(chalk.yellow('\n🎬 Stage 10: Final Video Assembly'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const assembler = new EnhancedAssemblyStage({
    format: 'mp4',
    resolution: '1080p',
    fps: 30
  });
  
  // Prepare AI images from media manifest
  const aiImages = mediaManifest.images.map((img: any) => 
    path.join(sessionDir, 'stage-06-ai-media/images', img.file)
  );
  
  const stage10Dir = path.join(sessionDir, 'stage-10-final-video');
  await fs.mkdir(stage10Dir, { recursive: true });
  
  const finalVideoPath = await assembler.assemble({
    timeline,
    slideImages,
    narrationAudio: audioFile,
    aiVideos: generatedVideos,
    aiImages
  });
  
  // Update session status
  await sessionManager.updateStageStatus(SESSION_ID, 7, 'completed');
  await sessionManager.updateStageStatus(SESSION_ID, 8, 'completed');
  await sessionManager.updateStageStatus(SESSION_ID, 9, 'completed');
  await sessionManager.updateStageStatus(SESSION_ID, 10, 'completed');
  
  console.log(chalk.green(`✅ Video assembled successfully!`));
  console.log(chalk.bold.cyan(`\n🎉 Pipeline Complete!`));
  console.log(chalk.white(`📁 Final video: ${finalVideoPath}`));
  
  // Display summary
  console.log(chalk.cyan('\n📊 Pipeline Summary:'));
  console.log(chalk.gray(`  Session ID: ${SESSION_ID}`));
  console.log(chalk.gray(`  Total Duration: ${Math.round(timeline.totalDuration)}s`));
  console.log(chalk.gray(`  Slides: 5`));
  console.log(chalk.gray(`  AI Images: ${aiImages.length}`));
  console.log(chalk.gray(`  AI Videos: ${generatedVideos.length}`));
}

function parseNarrationSegments(narrationContent: string) {
  const segments = [];
  
  // Split by (SLIDE X: pattern
  const slideMatches = narrationContent.match(/\(SLIDE \d+:[\s\S]*?(?=\(SLIDE|\[SLIDE TRANSITION\]|---|\n## |$)/g) || [];
  
  for (const slideContent of slideMatches) {
    const slideNumMatch = slideContent.match(/\(SLIDE (\d+):/);
    if (!slideNumMatch) continue;
    
    const slideNumber = parseInt(slideNumMatch[1]);
    
    // Extract the narration text (everything after the slide header)
    const narrationText = slideContent
      .replace(/\(SLIDE \d+:[^)]*\)/, '') // Remove slide header
      .replace(/\(Video Begins\)[\s\S]*?\(Video Ends\)/g, '') // Remove video sections for now
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

// Run the pipeline
runStages7To10().catch(error => {
  console.error(chalk.red('❌ Pipeline failed:'), error);
  process.exit(1);
});
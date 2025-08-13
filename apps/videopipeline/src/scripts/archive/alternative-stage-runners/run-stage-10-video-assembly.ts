#!/usr/bin/env tsx

import { PipelineSession } from '../lib/session-manager';
import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStage10VideoAssembly() {
  console.log(chalk.bold.cyan('🎬 Stage 10: Final Video Assembly'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionManager = new PipelineSession(SESSION_ID);
  await sessionManager.load();
  console.log(chalk.green(`✅ Session loaded: ${SESSION_ID}`));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Load all required data from previous stages
  console.log(chalk.yellow('\n📚 Loading pipeline outputs...'));
  
  // Stage 7: Timeline
  const timelinePath = path.join(sessionDir, 'stage-07-timeline/timeline.json');
  const timeline = JSON.parse(await fs.readFile(timelinePath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Timeline: ${timeline.events.length} events, ${timeline.totalDuration.toFixed(1)}s`));
  
  // Stage 9: Audio
  const audioPath = path.join(sessionDir, 'stage-09-tts-audio/narration.mp3');
  const audioMetadataPath = path.join(sessionDir, 'stage-09-tts-audio/audio-metadata.json');
  const audioMetadata = JSON.parse(await fs.readFile(audioMetadataPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Audio: ${audioMetadata.duration.toFixed(1)}s`));
  
  // Stage 6: Media files
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Media: ${mediaManifest.images.length} images, ${mediaManifest.videos.length} videos`));
  
  // Prepare slide images
  const slideImages = [
    path.join(process.cwd(), 'public/Slide1.png'),
    path.join(process.cwd(), 'public/Slide2.png'),
    path.join(process.cwd(), 'public/Slide3.png'),
    path.join(process.cwd(), 'public/Slide4.png'),
    path.join(process.cwd(), 'public/Slide5.png'),
  ];
  
  // Prepare AI images (user-provided)
  const aiImages = mediaManifest.images.map((img: any) => 
    path.join(sessionDir, 'stage-06-ai-media/images', img.file)
  );
  
  // Prepare AI videos (user-provided)
  const aiVideos = mediaManifest.videos.map((vid: any) => ({
    id: vid.file,
    slideNumber: vid.slide,
    url: path.join(sessionDir, 'stage-06-ai-media/videos', vid.file),
    duration: typeof vid.duration === 'string' ? 
      parseInt(vid.duration.match(/\d+/)?.[0] || '8') : 
      vid.duration,
    prompt: vid.purpose,
    provider: 'user-provided',
    cost: 0
  }));
  
  // Prepare audio file
  const narrationAudio = {
    slideNumber: 1,
    url: audioPath,
    duration: audioMetadata.duration,
    format: 'mp3' as const
  };
  
  // Create Stage 10 output directory
  const stage10Dir = path.join(sessionDir, 'stage-10-final-video');
  await fs.mkdir(stage10Dir, { recursive: true });
  
  console.log(chalk.yellow('\n🎬 Assembling final video...'));
  console.log(chalk.gray(`  Format: MP4`));
  console.log(chalk.gray(`  Resolution: 1080p`));
  console.log(chalk.gray(`  FPS: 30`));
  console.log(chalk.gray(`  Duration: ${Math.max(timeline.totalDuration, audioMetadata.duration).toFixed(1)}s`));
  
  // Initialize assembly stage
  const assembler = new EnhancedAssemblyStage({
    format: 'mp4',
    resolution: '1080p',
    fps: 30
  });
  
  try {
    // Assemble the video
    const outputPath = await assembler.assemble({
      timeline,
      slideImages,
      narrationAudio,
      aiVideos,
      aiImages
    });
    
    // Copy video to Stage 10 directory
    const finalVideoPath = path.join(stage10Dir, 'final-video.mp4');
    await fs.copyFile(outputPath, finalVideoPath);
    
    // Get video metadata
    const videoStats = await fs.stat(finalVideoPath);
    const videoSizeMB = (videoStats.size / 1024 / 1024).toFixed(2);
    
    // Save assembly metadata
    const assemblyMetadata = {
      sessionId: SESSION_ID,
      createdAt: new Date().toISOString(),
      videoPath: finalVideoPath,
      format: 'mp4',
      resolution: '1080p',
      fps: 30,
      duration: Math.max(timeline.totalDuration, audioMetadata.duration),
      fileSize: videoStats.size,
      fileSizeMB: videoSizeMB,
      components: {
        slides: slideImages.length,
        aiImages: aiImages.length,
        aiVideos: aiVideos.length,
        audioDuration: audioMetadata.duration,
        timelineEvents: timeline.events.length
      },
      renderSettings: {
        codec: 'h264',
        pixelFormat: 'yuv420p',
        crf: 18,
        preset: 'medium'
      }
    };
    
    await fs.writeFile(
      path.join(stage10Dir, 'assembly-metadata.json'),
      JSON.stringify(assemblyMetadata, null, 2)
    );
    
    console.log(chalk.green('\n✅ Stage 10 completed successfully!'));
    console.log(chalk.gray(`  Output: ${stage10Dir}`));
    console.log(chalk.gray(`  Video file: final-video.mp4`));
    console.log(chalk.gray(`  File size: ${videoSizeMB} MB`));
    console.log(chalk.gray(`  Duration: ${assemblyMetadata.duration.toFixed(1)}s`));
    
    console.log(chalk.bold.cyan('\n🎉 Pipeline Complete!'));
    console.log(chalk.green('The educational video has been successfully generated.'));
    console.log(chalk.white(`\n📹 Final video location:`));
    console.log(chalk.yellow(`   ${finalVideoPath}`));
    
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Video assembly failed: ${error.message}`));
    
    // Save error information
    await fs.writeFile(
      path.join(stage10Dir, 'assembly-error.json'),
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
    
    throw error;
  }
}

// Run the script
runStage10VideoAssembly().catch(error => {
  console.error(chalk.red('❌ Stage 10 failed:'), error);
  process.exit(1);
});
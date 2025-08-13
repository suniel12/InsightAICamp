#!/usr/bin/env tsx

import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStage10Final() {
  console.log(chalk.bold.cyan('🎬 Stage 10: Final Video Assembly (with Intelligent Timeline)'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  // Use the NEW intelligent timeline
  console.log(chalk.yellow('\n📚 Loading intelligent timeline...'));
  const timelinePath = path.join(sessionDir, 'stage-10-audio-based-timeline/timeline.json');
  const timeline = JSON.parse(await fs.readFile(timelinePath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Timeline: ${timeline.events.length} events, ${timeline.totalDuration.toFixed(1)}s`));
  
  // Load audio
  const audioPath = path.join(sessionDir, 'stage-09-tts-audio/narration.mp3');
  const audioMetadataPath = path.join(sessionDir, 'stage-09-tts-audio/audio-metadata.json');
  const audioMetadata = JSON.parse(await fs.readFile(audioMetadataPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Audio: ${audioMetadata.duration.toFixed(1)}s at ${audioMetadata.narrationStats.actualWPM.toFixed(0)} WPM`));
  
  // Load media manifest
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Media: ${mediaManifest.images.length} images, ${mediaManifest.videos.length} videos`));
  
  // Prepare assets
  const slideImages = [
    path.join(process.cwd(), 'public/Slide1.png'),
    path.join(process.cwd(), 'public/Slide2.png'),
    path.join(process.cwd(), 'public/Slide3.png'),
    path.join(process.cwd(), 'public/Slide4.png'),
    path.join(process.cwd(), 'public/Slide5.png'),
  ];
  
  const aiImages = mediaManifest.images.map((img: any) => 
    path.join(sessionDir, 'stage-06-ai-media/images', img.file)
  );
  
  const aiVideos = mediaManifest.videos.map((vid: any) => ({
    id: vid.file,
    slideNumber: vid.slide,
    url: path.join(sessionDir, 'stage-06-ai-media/videos', vid.file),
    duration: 8,
    prompt: vid.purpose,
    provider: 'user-provided',
    cost: 0
  }));
  
  const narrationAudio = {
    slideNumber: 1,
    url: audioPath,
    duration: audioMetadata.duration,
    format: 'mp3' as const
  };
  
  // Create output directory
  const stage10Dir = path.join(sessionDir, 'stage-10-final-video');
  await fs.mkdir(stage10Dir, { recursive: true });
  
  // Create a progress log file
  const progressLogPath = path.join(stage10Dir, 'render-progress.log');
  await fs.writeFile(progressLogPath, `Render started at ${new Date().toISOString()}\n`);
  
  console.log(chalk.yellow('\n🎬 Starting video assembly...'));
  console.log(chalk.gray(`  Output directory: ${stage10Dir}`));
  console.log(chalk.gray(`  Progress log: ${progressLogPath}`));
  console.log(chalk.cyan('\n  Monitor progress with:'));
  console.log(chalk.white(`    tail -f ${progressLogPath}`));
  console.log(chalk.gray('\n  Or in a new terminal:'));
  console.log(chalk.white(`    watch cat ${progressLogPath}`));
  
  // Display timeline overview
  console.log(chalk.yellow('\n📊 Timeline Overview:'));
  for (const event of timeline.events) {
    if (event.type !== 'transition') {
      const start = event.startTime.toFixed(1);
      const end = event.endTime.toFixed(1);
      const duration = event.duration.toFixed(1);
      console.log(chalk.gray(`  ${start}s-${end}s (${duration}s): ${event.type} - ${event.narrationContent || event.content.description}`));
    }
  }
  
  console.log(chalk.yellow('\n🚀 Rendering video...'));
  console.log(chalk.gray('  This will take several minutes for a 5-minute video.'));
  console.log(chalk.gray('  Check the progress log file for updates.'));
  
  const assembler = new EnhancedAssemblyStage({
    format: 'mp4',
    resolution: '1080p',
    fps: 30
  });
  
  try {
    // Start rendering with progress tracking
    const startTime = Date.now();
    let lastProgress = 0;
    
    // Set up progress monitoring
    const progressInterval = setInterval(async () => {
      const progress = `Progress update at ${new Date().toISOString()}: Rendering...\n`;
      await fs.appendFile(progressLogPath, progress);
    }, 10000); // Update every 10 seconds
    
    // Assemble the video
    const outputPath = await assembler.assemble({
      timeline,
      slideImages,
      narrationAudio,
      aiVideos,
      aiImages
    });
    
    clearInterval(progressInterval);
    
    // Copy to final location
    const finalVideoPath = path.join(stage10Dir, 'final-video.mp4');
    await fs.copyFile(outputPath, finalVideoPath);
    
    const renderTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    const videoStats = await fs.stat(finalVideoPath);
    const videoSizeMB = (videoStats.size / 1024 / 1024).toFixed(2);
    
    // Update progress log
    await fs.appendFile(progressLogPath, `\nRender completed at ${new Date().toISOString()}\n`);
    await fs.appendFile(progressLogPath, `Total render time: ${renderTime} minutes\n`);
    await fs.appendFile(progressLogPath, `Output file: ${finalVideoPath}\n`);
    await fs.appendFile(progressLogPath, `File size: ${videoSizeMB} MB\n`);
    
    // Save metadata
    const metadata = {
      sessionId: SESSION_ID,
      createdAt: new Date().toISOString(),
      renderTime: `${renderTime} minutes`,
      videoPath: finalVideoPath,
      format: 'mp4',
      resolution: '1080p',
      fps: 30,
      duration: timeline.totalDuration,
      fileSize: videoStats.size,
      fileSizeMB: videoSizeMB,
      timeline: {
        events: timeline.events.length,
        duration: timeline.totalDuration,
        method: 'intelligent-audio-based'
      }
    };
    
    await fs.writeFile(
      path.join(stage10Dir, 'video-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(chalk.green('\n✅ Video assembly completed!'));
    console.log(chalk.gray(`  Render time: ${renderTime} minutes`));
    console.log(chalk.gray(`  File size: ${videoSizeMB} MB`));
    console.log(chalk.gray(`  Duration: ${timeline.totalDuration.toFixed(1)}s`));
    
    console.log(chalk.bold.cyan('\n🎉 Final Video Ready!'));
    console.log(chalk.white(`\n📹 Video location:`));
    console.log(chalk.yellow(`   ${finalVideoPath}`));
    console.log(chalk.white(`\n▶️  Play with:`));
    console.log(chalk.yellow(`   open ${finalVideoPath}`));
    
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Video assembly failed: ${error.message}`));
    await fs.appendFile(progressLogPath, `\nError: ${error.message}\n`);
    throw error;
  }
}

// Run the script
runStage10Final().catch(error => {
  console.error(chalk.red('❌ Stage 10 failed:'), error);
  process.exit(1);
});
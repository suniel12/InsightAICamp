#!/usr/bin/env tsx

import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

const SESSION_ID = 'ps_mNLd3DCJ';

async function runStage10Enhanced() {
  console.log(chalk.bold.cyan('🎬 Stage 10: Final Video Assembly (Enhanced Slides)'));
  console.log(chalk.gray('─'.repeat(60)));
  
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  const outputDir = `output-${SESSION_ID}`;
  
  // Use the NEW enhanced timeline
  console.log(chalk.yellow('\n📚 Loading enhanced timeline...'));
  const timelinePath = path.join(outputDir, 'timeline-content-aware.json');
  const timeline = JSON.parse(await fs.readFile(timelinePath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Timeline: ${timeline.events.length} events, ${timeline.totalDuration.toFixed(1)}s`));
  
  // Load audio (same as before)
  const audioPath = path.join(sessionDir, 'stage-09-tts-audio/narration.mp3');
  const audioMetadataPath = path.join(sessionDir, 'stage-09-tts-audio/audio-metadata.json');
  const audioMetadata = JSON.parse(await fs.readFile(audioMetadataPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Audio: ${audioMetadata.duration.toFixed(1)}s at ${audioMetadata.narrationStats.actualWPM.toFixed(0)} WPM`));
  
  // Load media manifest
  const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
  const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));
  console.log(chalk.gray(`  ✓ Media: ${mediaManifest.images.length} images, ${mediaManifest.videos.length} videos`));
  
  // Prepare assets - using ENHANCED slides from output directory
  const slideImages = [
    path.join(process.cwd(), outputDir, 'public/Slide1.png'),
    path.join(process.cwd(), outputDir, 'public/Slide2.png'),
    path.join(process.cwd(), outputDir, 'public/Slide3.png'),
    path.join(process.cwd(), outputDir, 'public/Slide4.png'),
    path.join(process.cwd(), outputDir, 'public/Slide5.png'),
    path.join(process.cwd(), outputDir, 'public/Slide6.png'), // Added Slide 6
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
  const stage10Dir = path.join(sessionDir, 'stage-10-final-video-enhanced');
  await fs.mkdir(stage10Dir, { recursive: true });
  
  // Create a progress log file
  const progressLogPath = path.join(stage10Dir, 'render-progress.log');
  await fs.writeFile(progressLogPath, `Render started at ${new Date().toISOString()}\n`);
  
  // Setup monitoring interval
  const monitorInterval = setInterval(async () => {
    const progress = `Progress update at ${new Date().toISOString()}: Rendering...\n`;
    await fs.appendFile(progressLogPath, progress);
  }, 10000);
  
  console.log(chalk.yellow('\n🎬 Starting video assembly with enhanced slides...'));
  console.log(chalk.gray(`  Output directory: ${stage10Dir}`));
  console.log(chalk.gray(`  Progress log: ${progressLogPath}`));
  console.log(chalk.cyan('\n  Monitor progress with:'));
  console.log(chalk.white(`    tail -f ${progressLogPath}`));
  
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
    const startTime = Date.now();
    
    const finalVideo = await assembler.assemble({
      slideImages,  // Array of slide image paths
      narrationAudio,  // Single audio file, not array
      aiVideos,
      aiImages,  // AI-generated images
      timeline
    });
    
    clearInterval(monitorInterval);
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const completionLog = `\nRender completed at ${new Date().toISOString()}\nTotal render time: ${Math.round(totalTime / 60 * 10) / 10} minutes\nOutput file: ${finalVideo}\n`;
    await fs.appendFile(progressLogPath, completionLog);
    
    // Check file size
    const stats = await fs.stat(finalVideo);
    const fileSizeMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
    await fs.appendFile(progressLogPath, `File size: ${fileSizeMB} MB\n`);
    
    // Save metadata
    const metadata = {
      sessionId: SESSION_ID,
      createdAt: new Date().toISOString(),
      duration: timeline.totalDuration,
      audioFile: audioPath,
      timeline: timelinePath,
      outputVideo: finalVideo,
      renderTime: totalTime,
      fileSize: fileSizeMB,
      slides: 6,
      aiImages: aiImages.length,
      aiVideos: aiVideos.length
    };
    
    const metadataPath = path.join(stage10Dir, 'video-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log(chalk.bold.green(`\n✅ Stage 10 Complete!`));
    console.log(chalk.white(`  Final video: ${finalVideo}`));
    console.log(chalk.gray(`  Duration: ${timeline.totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  Size: ${fileSizeMB} MB`));
    console.log(chalk.gray(`  Render time: ${Math.round(totalTime / 60 * 10) / 10} minutes`));
    console.log(chalk.yellow('\n📺 To play the video:'));
    console.log(chalk.white(`    open "${finalVideo}"`));
    
  } catch (error) {
    clearInterval(monitorInterval);
    console.error(chalk.red('\n❌ Error:'), error);
    
    const errorLog = `\nRender failed at ${new Date().toISOString()}\nError: ${error}\n`;
    await fs.appendFile(progressLogPath, errorLog);
    
    throw error;
  }
}

// Run the script
runStage10Enhanced().catch(console.error);
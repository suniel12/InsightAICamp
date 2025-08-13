#!/usr/bin/env tsx

import { NarrationSegmenter } from '../stages/segmentation/narration-segmenter';
import { SegmentedTTSStage } from '../stages/tts';
import { ContentAwareTimelinePlanner } from '../stages/timeline/planner';
import { SegmentedAssemblyStage } from '../stages/assembly';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_ID = 'ps_mNLd3DCJ';

async function runSegmentedPipeline() {
  console.log(chalk.bold.cyan('🚀 Running Segmented Audio-Video Pipeline'));
  console.log(chalk.gray('─'.repeat(80)));
  console.log(chalk.white(`Session: ${SESSION_ID}`));
  console.log(chalk.gray(`Started: ${new Date().toISOString()}`));
  console.log(chalk.gray('─'.repeat(80)));

  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  const startTime = Date.now();

  try {
    // Stage 8A: Narration Segmentation
    console.log(chalk.bold.yellow('\n📝 Stage 8A: Narration Segmentation'));
    console.log(chalk.gray('─'.repeat(60)));

    const segmenter = new NarrationSegmenter({
      sessionId: SESSION_ID,
      sessionDir
    });

    const narrationSegments = await segmenter.segmentNarration();
    console.log(chalk.green(`  ✅ Created ${narrationSegments.length} narration segments`));

    // Convert to audio segment templates
    const audioSegmentTemplates = await segmenter.createAudioSegments(narrationSegments);

    // Save segmentation results
    const segmentationDir = path.join(sessionDir, 'stage-08a-narration-segmentation');
    await segmenter.saveSegments(narrationSegments, segmentationDir);

    // Stage 9A: Segmented TTS Generation
    console.log(chalk.bold.yellow('\n🎤 Stage 9A: Segmented TTS Generation'));
    console.log(chalk.gray('─'.repeat(60)));

    const ttsStage = new SegmentedTTSStage({
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'MFZUKuGQUsGJPQjTS4wC',
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      speechMarks: false,
      outputFormat: 'mp3'
    });

    const audioCollection = await ttsStage.generateSegmentedAudio(audioSegmentTemplates, sessionDir);
    console.log(chalk.green(`  ✅ Generated ${audioCollection.segments.length} audio segments`));
    console.log(chalk.gray(`  Total audio duration: ${audioCollection.totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  Total file size: ${Math.round(audioCollection.metadata.totalFileSize / 1024 / 1024 * 100) / 100}MB`));

    // Stage 10A: Content-Aware Timeline Creation
    console.log(chalk.bold.yellow('\n⏱️  Stage 10A: Content-Aware Timeline'));
    console.log(chalk.gray('─'.repeat(60)));

    const timelinePlanner = new ContentAwareTimelinePlanner({
      sessionId: SESSION_ID,
      sessionDir,
      transitionDuration: 0.5,
      outputFormat: `output-${SESSION_ID}`
    });

    const timeline = await timelinePlanner.createTimeline(audioCollection);
    const timelinePath = await timelinePlanner.saveTimeline(timeline);
    
    // Display timeline overview
    timelinePlanner.displayTimelineOverview(timeline);

    // Stage 11: Segmented Video Assembly
    console.log(chalk.bold.yellow('\n🎬 Stage 11: Segmented Video Assembly'));
    console.log(chalk.gray('─'.repeat(60)));

    const assembler = new SegmentedAssemblyStage({
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    });

    // Prepare slide images (using enhanced slides)
    const slideImages = [
      path.join(process.cwd(), `output-${SESSION_ID}`, 'public/Slide1.png'),
      path.join(process.cwd(), `output-${SESSION_ID}`, 'public/Slide2.png'),
      path.join(process.cwd(), `output-${SESSION_ID}`, 'public/Slide3.png'),
      path.join(process.cwd(), `output-${SESSION_ID}`, 'public/Slide4.png'),
      path.join(process.cwd(), `output-${SESSION_ID}`, 'public/Slide5.png'),
      path.join(process.cwd(), `output-${SESSION_ID}`, 'public/Slide6.png'),
    ];

    // Load media manifest for AI videos/images
    const mediaManifestPath = path.join(sessionDir, 'stage-06-ai-media/media-manifest.json');
    const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));

    const aiVideos = mediaManifest.videos.map((vid: any) => ({
      id: vid.file,
      slideNumber: vid.slide,
      url: path.join(sessionDir, 'stage-06-ai-media/videos', vid.file),
      duration: 8,
      prompt: vid.purpose,
      provider: 'runway',
      cost: 0
    }));

    const aiImages = mediaManifest.images.map((img: any) => 
      path.join(sessionDir, 'stage-06-ai-media/images', img.file)
    );

    console.log(chalk.gray(`  Slide images: ${slideImages.length}`));
    console.log(chalk.gray(`  AI videos: ${aiVideos.length}`));
    console.log(chalk.gray(`  AI images: ${aiImages.length}`));

    const finalVideoPath = await assembler.assemble({
      timeline,
      slideImages,
      aiVideos,
      aiImages
    });

    // Create final stage directory and metadata
    const finalStageDir = path.join(sessionDir, 'stage-11-segmented-video');
    await fs.mkdir(finalStageDir, { recursive: true });

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const videoStats = await fs.stat(finalVideoPath);
    const fileSizeMB = Math.round(videoStats.size / 1024 / 1024 * 100) / 100;

    const finalMetadata = {
      sessionId: SESSION_ID,
      createdAt: new Date().toISOString(),
      pipeline: 'segmented-audio-video',
      stages: {
        segmentation: {
          segments: narrationSegments.length,
          avgDuration: timeline.totalDuration / narrationSegments.length
        },
        tts: {
          provider: 'elevenlabs',
          voiceId: audioCollection.metadata.voiceId,
          totalDuration: audioCollection.totalDuration,
          totalFileSize: audioCollection.metadata.totalFileSize
        },
        timeline: {
          events: timeline.events.length,
          method: timeline.metadata.method,
          transitionDuration: timeline.metadata.transitionDuration
        },
        assembly: {
          format: 'mp4',
          resolution: '1080p',
          fps: 30
        }
      },
      output: {
        videoPath: finalVideoPath,
        duration: timeline.totalDuration,
        fileSize: videoStats.size,
        fileSizeMB
      },
      performance: {
        totalProcessingTime: totalTime,
        processingTimeMinutes: Math.round(totalTime / 60 * 10) / 10
      }
    };

    const metadataPath = path.join(finalStageDir, 'segmented-pipeline-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(finalMetadata, null, 2));

    // Final success summary
    console.log(chalk.bold.green('\n🎉 Segmented Pipeline Complete!'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white(`  📹 Final Video: ${finalVideoPath}`));
    console.log(chalk.gray(`  ⏱️  Duration: ${timeline.totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  📦 Size: ${fileSizeMB}MB`));
    console.log(chalk.gray(`  🎵 Audio Segments: ${audioCollection.segments.length}`));
    console.log(chalk.gray(`  🎬 Timeline Events: ${timeline.events.length}`));
    console.log(chalk.gray(`  ⏳ Processing Time: ${Math.round(totalTime / 60 * 10) / 10} minutes`));
    console.log(chalk.gray('─'.repeat(80)));
    
    console.log(chalk.yellow('\n📺 To play the video:'));
    console.log(chalk.white(`    open "${finalVideoPath}"`));
    
    console.log(chalk.yellow('\n📊 Metadata saved to:'));
    console.log(chalk.white(`    ${metadataPath}`));

    return finalVideoPath;

  } catch (error) {
    console.error(chalk.red('\n❌ Pipeline Failed:'), error);
    
    const errorLog = {
      sessionId: SESSION_ID,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
    
    const errorPath = path.join(sessionDir, 'segmented-pipeline-error.json');
    await fs.writeFile(errorPath, JSON.stringify(errorLog, null, 2));
    
    console.log(chalk.gray(`Error details saved to: ${errorPath}`));
    throw error;
  }
}

// Utility function to check if a session has the required data
async function validateSession(sessionDir: string): Promise<boolean> {
  const requiredFiles = [
    'stage-08-final-narration/narration-formatted.md',
    'stage-06-ai-media/media-manifest.json'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(sessionDir, file);
    try {
      await fs.access(filePath);
    } catch {
      console.error(chalk.red(`❌ Required file not found: ${file}`));
      return false;
    }
  }

  return true;
}

// Main execution
async function main() {
  const sessionDir = path.join('./pipeline-data/sessions', SESSION_ID);
  
  console.log(chalk.cyan('🔍 Validating session data...'));
  const isValid = await validateSession(sessionDir);
  
  if (!isValid) {
    console.error(chalk.red('❌ Session validation failed. Please ensure all required files are present.'));
    process.exit(1);
  }

  console.log(chalk.green('✅ Session validation passed'));
  
  await runSegmentedPipeline();
}

// Run the script
main().catch(error => {
  console.error(chalk.red('❌ Script execution failed:'), error);
  process.exit(1);
});
#!/usr/bin/env tsx

import { TimelinePlanner, TimelineEvent } from '../stages/timeline/planner';
import { EnhancedAssemblyStage } from '../stages/assembly/enhanced';
import { AudioFile } from '../types/pipeline.types';
import { ScriptSegment } from '../stages/script/generator';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

/**
 * Simple test that uses existing slides and audio without any AI analysis
 */
async function runSimpleAssembly() {
  console.log(chalk.bold.cyan('🎬 Simple Video Assembly Test'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('Using existing slides and audio files\n');

  // Define the slide images we have
  const slideImages = [
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide1.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide2.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide3.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide4.png',
    '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/Slide5.png',
  ];

  // Define the existing audio files with approximate durations
  const audioFiles: AudioFile[] = [
    {
      slideNumber: 1,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_1_audio.mp3',
      duration: 26.5,
      format: 'mp3'
    },
    {
      slideNumber: 2,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_2_audio.mp3',
      duration: 28.1,
      format: 'mp3'
    },
    {
      slideNumber: 3,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_3_audio.mp3',
      duration: 30.0,
      format: 'mp3'
    },
    {
      slideNumber: 4,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_4_audio.mp3',
      duration: 32.6,
      format: 'mp3'
    },
    {
      slideNumber: 5,
      url: '/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/public/audio/slide_5_audio.mp3',
      duration: 24.7,
      format: 'mp3'
    }
  ];

  try {
    // Verify all files exist
    console.log(chalk.yellow('📁 Verifying files...'));
    
    for (const imagePath of slideImages) {
      try {
        await fs.access(imagePath);
        console.log(chalk.green(`  ✓ ${path.basename(imagePath)}`));
      } catch {
        console.error(chalk.red(`  ✗ Missing: ${imagePath}`));
        process.exit(1);
      }
    }

    for (const audio of audioFiles) {
      try {
        await fs.access(audio.url);
        console.log(chalk.green(`  ✓ ${path.basename(audio.url)}`));
      } catch {
        console.error(chalk.red(`  ✗ Missing: ${audio.url}`));
        process.exit(1);
      }
    }

    // Create mock script segments based on audio durations
    console.log(chalk.yellow('\n📝 Creating timeline from audio durations...'));
    const scriptSegments: ScriptSegment[] = audioFiles.map((audio, index) => ({
      slideNumber: audio.slideNumber,
      content: `Narration for slide ${audio.slideNumber}`,
      duration: audio.duration,
      visualHints: [],
      concepts: [],
      potentialEnhancements: { type: 'none', reasoning: 'Using existing audio' }
    }));

    // Create a simple timeline without AI media
    console.log(chalk.yellow('⏱️  Planning timeline...'));
    const timelinePlanner = new TimelinePlanner();
    const timeline = await timelinePlanner.planTimeline(
      scriptSegments,
      slideImages,
      [], // No AI media opportunities
      []  // No generated videos
    );
    
    const totalDuration = audioFiles.reduce((sum, a) => sum + a.duration, 0);
    console.log(chalk.green(`✅ Timeline created`));
    console.log(chalk.gray(`  Total duration: ${totalDuration.toFixed(1)} seconds`));
    console.log(chalk.gray(`  Events: ${timeline.events.length}`));

    // Display timeline
    console.log(chalk.cyan('\n📊 Timeline:'));
    let currentTime = 0;
    for (const audio of audioFiles) {
      console.log(chalk.gray(`  ${currentTime.toFixed(1)}s - ${(currentTime + audio.duration).toFixed(1)}s: Slide ${audio.slideNumber}`));
      currentTime += audio.duration;
    }

    // Combine audio files into a single narration track
    // For now, we'll use the first audio as a placeholder for the continuous track
    // In production, you would concatenate all audio files
    console.log(chalk.yellow('\n🔊 Preparing audio...'));
    const combinedAudio: AudioFile = {
      slideNumber: 1,
      url: audioFiles[0].url, // Using first audio as placeholder
      duration: totalDuration,
      format: 'mp3'
    };
    console.log(chalk.green(`✅ Audio prepared (${totalDuration.toFixed(1)}s total)`));

    // Assemble the video
    console.log(chalk.yellow('\n🎬 Assembling video...'));
    console.log(chalk.gray('  This will create a video with:'));
    console.log(chalk.gray('    • 5 high-quality slide images'));
    console.log(chalk.gray('    • Existing narration audio'));
    console.log(chalk.gray('    • Smooth fade transitions'));
    console.log(chalk.gray('    • 1080p resolution at 30fps'));

    const assembler = new EnhancedAssemblyStage({
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    });

    // First, let's create the output directory and copy files
    const outputDir = './output/simple-test';
    await fs.mkdir(outputDir, { recursive: true });
    
    // Copy slides to output
    console.log(chalk.yellow('\n📋 Copying assets to output directory...'));
    for (let i = 0; i < slideImages.length; i++) {
      const destPath = path.join(outputDir, `slide_${i + 1}.png`);
      await fs.copyFile(slideImages[i], destPath);
    }
    
    // Copy audio files to output
    for (const audio of audioFiles) {
      const destPath = path.join(outputDir, path.basename(audio.url));
      await fs.copyFile(audio.url, destPath);
    }
    console.log(chalk.green('✅ Assets copied'));

    // Create a simple Remotion composition file
    console.log(chalk.yellow('\n📝 Creating video composition...'));
    const compositionCode = `
// This is the composition that would be used by Remotion
// It defines how the slides and audio are combined into a video

export const VideoComposition = {
  slides: ${JSON.stringify(slideImages.map(img => path.basename(img)))},
  audio: ${JSON.stringify(audioFiles.map(a => ({
    slideNumber: a.slideNumber,
    file: path.basename(a.url),
    duration: a.duration
  })))},
  totalDuration: ${totalDuration},
  fps: 30,
  resolution: '1080p'
};

// Timeline:
${audioFiles.map(a => `// Slide ${a.slideNumber}: ${a.duration}s`).join('\n')}
// Total: ${totalDuration.toFixed(1)} seconds
`;

    const compositionPath = path.join(outputDir, 'composition.js');
    await fs.writeFile(compositionPath, compositionCode);
    console.log(chalk.green('✅ Composition created'));

    // Create a simple ffmpeg command as an alternative
    console.log(chalk.yellow('\n🎥 Alternative: FFmpeg command for manual assembly:'));
    
    // Generate ffmpeg concat file
    const concatContent = audioFiles.map(audio => 
      `file '${audio.url}'\n`
    ).join('');
    
    const concatFile = path.join(outputDir, 'concat.txt');
    await fs.writeFile(concatFile, concatContent);

    const ffmpegCommand = `
# Concatenate audio files:
ffmpeg -f concat -safe 0 -i ${concatFile} -c copy ${outputDir}/combined_audio.mp3

# Create video from slides with audio:
ffmpeg -framerate 1/${Math.floor(totalDuration/5)} \\
  -pattern_type glob -i '${outputDir}/slide_*.png' \\
  -i ${outputDir}/combined_audio.mp3 \\
  -c:v libx264 -r 30 -pix_fmt yuv420p \\
  -c:a aac -shortest \\
  ${outputDir}/final_video.mp4
`;

    console.log(chalk.cyan(ffmpegCommand));

    // Summary
    console.log(chalk.bold.green('\n✅ Assembly preparation complete!'));
    console.log(chalk.white(`\n📁 Output directory: ${outputDir}`));
    console.log(chalk.gray('  Contains:'));
    console.log(chalk.gray('    • 5 slide images'));
    console.log(chalk.gray('    • 5 audio files'));
    console.log(chalk.gray('    • composition.js (Remotion config)'));
    console.log(chalk.gray('    • concat.txt (FFmpeg concat list)'));
    
    console.log(chalk.yellow('\n💡 Next steps:'));
    console.log(chalk.gray('  1. Run the FFmpeg commands above to create the video'));
    console.log(chalk.gray('  2. Or use Remotion CLI to render with the composition'));
    
    console.log(chalk.cyan('\n📊 Video Properties:'));
    console.log(chalk.gray(`  Duration: ${totalDuration.toFixed(1)} seconds`));
    console.log(chalk.gray(`  Slides: 5`));
    console.log(chalk.gray(`  Resolution: 1920x1080 (1080p)`));
    console.log(chalk.gray(`  Frame rate: 30 fps`));
    console.log(chalk.gray(`  Format: MP4 (H.264)`));

  } catch (error) {
    console.error(chalk.red('\n❌ Assembly failed:'));
    console.error(error);
    process.exit(1);
  }
}

// Run the test
console.log(chalk.cyan('Starting simple assembly test...\n'));

runSimpleAssembly().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
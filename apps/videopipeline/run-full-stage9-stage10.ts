#!/usr/bin/env tsx

import { NarrationSegmenter } from './src/stages/segmentation/narration-segmenter';
import { SegmentedTTSStage } from './src/stages/tts';
import { ContentAwareTimelinePlanner } from './src/stages/timeline/planner';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_ID = 'ps_3B69a_go';
const SESSION_DIR = path.join(__dirname, 'pipeline-data/sessions', SESSION_ID);

async function runFullStage9And10() {
  console.log(chalk.bold.cyan('🎬 Running Full Stage 9 + Stage 10 Pipeline'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log(chalk.white(`Session: ${SESSION_ID}`));
  console.log(chalk.gray('Generating ALL segments + Timeline'));
  console.log(chalk.gray('─'.repeat(70)));

  try {
    // Clean up existing audio files
    console.log(chalk.yellow('\n🧹 Cleaning up existing audio files...'));
    const ttsDir = path.join(SESSION_DIR, 'stage-09-segmented-tts');
    try {
      await fs.rm(ttsDir, { recursive: true, force: true });
      console.log(chalk.gray('  ✓ Removed existing TTS directory'));
    } catch (error) {
      console.log(chalk.gray('  ✓ TTS directory already clean'));
    }

    // ========== STAGE 8: NARRATION SEGMENTATION ==========
    console.log(chalk.yellow('\n📝 Stage 8: Narration Segmentation'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const segmenter = new NarrationSegmenter({
      sessionId: SESSION_ID,
      sessionDir: SESSION_DIR
    });

    console.log(chalk.gray('  🔄 Segmenting formatted narration...'));
    const narrationSegments = await segmenter.segmentNarration();
    console.log(chalk.green(`  ✓ Found ${narrationSegments.length} segments`));

    console.log(chalk.gray('  🔄 Creating audio segment templates...'));
    const audioSegmentTemplates = await segmenter.createAudioSegments(narrationSegments);
    console.log(chalk.green(`  ✓ Created ${audioSegmentTemplates.length} audio templates`));

    // Save segmentation results
    const segmentationDir = path.join(SESSION_DIR, 'stage-08-segmentation');
    await segmenter.saveSegments(narrationSegments, segmentationDir);

    console.log(chalk.green('✅ Stage 8 Complete'));
    console.log(chalk.gray(`  📋 Segments: ${audioSegmentTemplates.length}`));
    console.log(chalk.gray(`  📊 Total estimated duration: ${audioSegmentTemplates[audioSegmentTemplates.length - 1]?.endTime || 0}s`));

    // ========== STAGE 9: SEGMENTED TTS GENERATION ==========
    console.log(chalk.yellow('\n🎤 Stage 9: Segmented TTS Generation'));
    console.log(chalk.gray('─'.repeat(50)));

    const ttsStage = new SegmentedTTSStage({
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || '',
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      outputFormat: 'mp3'
    });

    console.log(chalk.gray('  🔄 Generating TTS for ALL segments...'));
    const audioCollection = await ttsStage.generateSegmentedAudio(audioSegmentTemplates, SESSION_DIR);

    console.log(chalk.green('✅ Stage 9 Complete'));
    console.log(chalk.gray(`  🎵 Audio segments: ${audioCollection.segments.length}`));
    console.log(chalk.gray(`  ⏱️  Total duration: ${audioCollection.totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  💾 Total size: ${Math.round(audioCollection.metadata.totalFileSize / 1024 / 1024 * 100) / 100}MB`));

    // Display segment summary
    console.log(chalk.cyan('\n📋 Segment Summary:'));
    audioCollection.segments.forEach((segment, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${segment.id} (${segment.type}) - ${segment.duration.toFixed(1)}s`));
    });

    // ========== STAGE 10: CONTENT-AWARE TIMELINE ==========
    console.log(chalk.yellow('\n⏱️  Stage 10: Content-Aware Timeline Creation'));
    console.log(chalk.gray('─'.repeat(50)));

    const timelinePlanner = new ContentAwareTimelinePlanner({
      sessionId: SESSION_ID,
      sessionDir: SESSION_DIR,
      transitionDuration: 0.5,
      outputFormat: `output-${SESSION_ID}`
    });

    console.log(chalk.gray('  🔄 Creating timeline from audio collection...'));
    const timeline = await timelinePlanner.createTimeline(audioCollection);
    
    console.log(chalk.gray('  🔄 Saving timeline...'));
    const timelinePath = await timelinePlanner.saveTimeline(timeline);
    
    console.log(chalk.gray('  📊 Timeline overview:'));
    timelinePlanner.displayTimelineOverview(timeline);

    console.log(chalk.green('✅ Stage 10 Complete'));
    console.log(chalk.gray(`  🎬 Timeline events: ${timeline.events.length}`));
    console.log(chalk.gray(`  ⏱️  Total duration: ${timeline.totalDuration.toFixed(1)}s`));
    console.log(chalk.gray(`  📁 Timeline saved: ${timelinePath}`));

    // ========== FINAL RESULTS ==========
    console.log(chalk.bold.green('\n🎉 Pipeline Stages 8-10 Complete!'));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(chalk.white(`📁 Session: ${SESSION_ID}`));
    console.log(chalk.white(`🎵 Audio Collection: ${audioCollection.segments.length} segments (${audioCollection.totalDuration.toFixed(1)}s)`));
    console.log(chalk.white(`🎬 Timeline: ${timeline.events.length} events (${timeline.totalDuration.toFixed(1)}s)`));
    console.log(chalk.white(`💾 Audio Size: ${Math.round(audioCollection.metadata.totalFileSize / 1024 / 1024 * 100) / 100}MB`));
    console.log(chalk.gray('─'.repeat(70)));
    console.log(chalk.cyan('📂 Ready for Stage 11: Video Assembly'));

    return {
      audioCollection,
      timeline,
      timelinePath
    };

  } catch (error) {
    console.log(chalk.red('\n❌ Pipeline Failed'));
    console.error(error);
    throw error;
  }
}

runFullStage9And10().catch(console.error);
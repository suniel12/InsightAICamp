#!/usr/bin/env tsx

import { SegmentedTTSStage } from './src/stages/tts';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runStage9(sessionId: string) {
  const SESSION_DIR = path.join(__dirname, 'pipeline-data/sessions', sessionId);
  
  console.log(chalk.bold.cyan('🎙️  Stage 9: Segmented TTS Generation'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log(chalk.white(`Session: ${sessionId}`));
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

    // ========== STAGE 9: SEGMENTED TTS ==========
    console.log(chalk.yellow('\n🎙️  Stage 9: Segmented TTS Generation'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const ttsStage = new SegmentedTTSStage({
      provider: 'elevenlabs',
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
      apiKey: process.env.ELEVENLABS_API_KEY!,
      outputFormat: 'mp3'
    });

    console.log(chalk.gray('  🔄 Loading narration segments...'));
    
    // Load the segments from our Stage 8 output
    const segmentsFile = path.join(SESSION_DIR, 'stage-08-segmentation/narration-segments.json');
    const segmentsData = await fs.readFile(segmentsFile, 'utf-8');
    const segments = JSON.parse(segmentsData);
    
    console.log(chalk.green(`  ✓ Found ${segments.length} segments to process`));

    console.log(chalk.gray('  🎤 Generating TTS audio for all segments...'));
    const audioCollection = await ttsStage.generateSegmentedAudio(segments, SESSION_DIR);
    console.log(chalk.green(`  ✓ TTS generation completed successfully!`));

    // Load the generated collection file to display summary
    const collectionFile = path.join(SESSION_DIR, 'stage-09-segmented-tts/segmented-audio-collection.json');
    const collectionData = await fs.readFile(collectionFile, 'utf-8');
    const collection = JSON.parse(collectionData);

    // Display summary
    console.log(chalk.cyan('\n📊 TTS Generation Summary:'));
    console.log(chalk.gray(`  Total segments: ${collection.totalSegments}`));
    console.log(chalk.gray(`  Audio files generated: ${collection.audioFiles.length}`));
    console.log(chalk.gray(`  Total duration: ${collection.totalDuration.toFixed(2)}s`));
    console.log(chalk.gray(`  Average segment duration: ${(collection.totalDuration / collection.totalSegments).toFixed(2)}s`));

    console.log(chalk.cyan('\n📁 Generated Files:'));
    collection.audioFiles.forEach((file: any) => {
      console.log(chalk.gray(`  • ${file.filename} (${file.duration.toFixed(2)}s)`));
    });

    console.log(chalk.bold.green('\n✅ Stage 9 Complete!'));
    console.log(chalk.yellow(`📍 Audio files saved to: ${ttsDir}`));
    console.log('');
    console.log(chalk.cyan('🎬 Next Steps:'));
    console.log(chalk.gray('  1. Create timeline (Stage 10)'));
    console.log(chalk.gray('  2. Assemble final video (Stage 11)'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error in Stage 9:'), error);
    throw error;
  }
}

// Get session ID from command line
const sessionId = process.argv[2];
if (!sessionId) {
  console.error(chalk.red('❌ Please provide a session ID'));
  console.log(chalk.yellow('Usage: npx tsx run-stage9-working.ts <session_id>'));
  process.exit(1);
}

runStage9(sessionId).catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});
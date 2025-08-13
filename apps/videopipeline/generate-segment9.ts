#!/usr/bin/env tsx

import { NarrationSegmenter } from './src/stages/segmentation/narration-segmenter';
import { SegmentedTTSStage } from './src/stages/tts';
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

async function generateSegment9() {
  console.log(chalk.bold.cyan('🎤 Generating Missing Segment 9'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`Session: ${SESSION_ID}`));
  console.log(chalk.gray('Adding segment 9 to existing collection'));
  console.log(chalk.gray('─'.repeat(50)));

  try {
    // Re-segment the narration to pick up segment 9
    console.log(chalk.yellow('\n📝 Re-segmenting narration...'));
    const segmenter = new NarrationSegmenter({
      sessionId: SESSION_ID,
      sessionDir: SESSION_DIR
    });

    const narrationSegments = await segmenter.segmentNarration();
    console.log(chalk.green(`  ✓ Found ${narrationSegments.length} segments`));

    if (narrationSegments.length <= 8) {
      throw new Error('Segment 9 still not found in narration');
    }

    const audioSegmentTemplates = await segmenter.createAudioSegments(narrationSegments);
    
    // Get segment 9
    const segment9 = audioSegmentTemplates[8]; // Index 8 = segment 9
    if (!segment9) {
      throw new Error('Segment 9 not found in audio templates');
    }

    console.log(chalk.green(`  ✓ Found segment 9: ${segment9.id}`));
    console.log(chalk.gray(`    Type: ${segment9.type}`));
    console.log(chalk.gray(`    Text: "${segment9.narrationText.substring(0, 80)}..."`));

    // Generate TTS for segment 9 only
    console.log(chalk.yellow('\n🎤 Generating TTS for segment 9...'));
    const ttsStage = new SegmentedTTSStage({
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || '',
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      outputFormat: 'mp3'
    });

    const newCollection = await ttsStage.generateSegmentedAudio([segment9], SESSION_DIR);
    const newSegment = newCollection.segments[0];

    console.log(chalk.green(`  ✓ Generated: ${newSegment.audioFile}`));
    console.log(chalk.gray(`    Duration: ${newSegment.duration.toFixed(1)}s`));

    // Load existing collection
    console.log(chalk.yellow('\n🔄 Updating existing audio collection...'));
    const existingCollectionPath = path.join(SESSION_DIR, 'stage-09-segmented-tts/segmented-audio-collection.json');
    const existingCollection = JSON.parse(await fs.readFile(existingCollectionPath, 'utf-8'));

    // Update timing for segment 9 based on the last segment's end time
    const lastSegment = existingCollection.segments[existingCollection.segments.length - 1];
    newSegment.startTime = lastSegment.endTime;
    newSegment.endTime = newSegment.startTime + newSegment.duration;

    // Add segment 9 to the collection
    existingCollection.segments.push(newSegment);
    existingCollection.totalDuration = newSegment.endTime;
    existingCollection.metadata.segmentCount = existingCollection.segments.length;
    existingCollection.metadata.totalFileSize += newSegment.metadata.fileSize;

    // Save updated collection
    await fs.writeFile(existingCollectionPath, JSON.stringify(existingCollection, null, 2));

    console.log(chalk.green('✅ Segment 9 Added Successfully!'));
    console.log(chalk.gray(`  📁 Audio file: ${newSegment.audioFile}`));
    console.log(chalk.gray(`  ⏱️  Duration: ${newSegment.duration.toFixed(1)}s`));
    console.log(chalk.gray(`  📊 Total segments: ${existingCollection.segments.length}`));
    console.log(chalk.gray(`  🎵 Total duration: ${existingCollection.totalDuration.toFixed(1)}s`));

    return existingCollection;

  } catch (error) {
    console.log(chalk.red('\n❌ Failed to generate segment 9'));
    console.error(error);
    throw error;
  }
}

generateSegment9().catch(console.error);
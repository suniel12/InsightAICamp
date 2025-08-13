#!/usr/bin/env tsx

import { NarrationSegmenter } from './src/stages/segmentation/narration-segmenter';
import { SegmentedTTSStage } from './src/stages/tts';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_ID = 'ps_3B69a_go';
const SESSION_DIR = path.join(__dirname, 'pipeline-data/sessions', SESSION_ID);

async function testStage9Segment1() {
  console.log(chalk.bold.cyan('🎬 Testing Stage 9 Pipeline - Segment 1 Only'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white(`Session: ${SESSION_ID}`));
  console.log(chalk.gray('Using actual Stage 9 pipeline components'));
  console.log(chalk.gray('─'.repeat(60)));

  try {
    // Step 1: Initialize the Narration Segmenter (Stage 8)
    console.log(chalk.yellow('\n📝 Stage 8: Initializing Narration Segmenter...'));
    const segmenter = new NarrationSegmenter({
      sessionId: SESSION_ID,
      sessionDir: SESSION_DIR
    });

    // Step 2: Segment the narration
    console.log(chalk.yellow('  🔄 Segmenting formatted narration...'));
    const narrationSegments = await segmenter.segmentNarration();
    console.log(chalk.gray(`  ✓ Found ${narrationSegments.length} segments`));

    // Step 3: Create audio segment templates
    console.log(chalk.yellow('  🔄 Creating audio segment templates...'));
    const audioSegmentTemplates = await segmenter.createAudioSegments(narrationSegments);
    console.log(chalk.gray(`  ✓ Created ${audioSegmentTemplates.length} audio templates`));

    // Step 4: Extract only the first segment
    const firstSegment = audioSegmentTemplates[0];
    if (!firstSegment) {
      throw new Error('No segments found');
    }

    console.log(chalk.green('\n✅ Stage 8 Complete'));
    console.log(chalk.gray(`  First segment: ${firstSegment.id}`));
    console.log(chalk.gray(`  Segment type: ${firstSegment.type}`));
    console.log(chalk.gray(`  Visual content: ${firstSegment.visualContent?.type} - ${firstSegment.visualContent?.resource}`));
    console.log(chalk.gray(`  Pace: ${firstSegment.metadata?.pace || 'default'}`));
    console.log(chalk.gray(`  Duration estimate: ${firstSegment.endTime - firstSegment.startTime}s`));

    // Step 5: Initialize Stage 9 TTS
    console.log(chalk.yellow('\n🎤 Stage 9: Initializing Segmented TTS...'));
    const ttsStage = new SegmentedTTSStage({
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || '',
      apiKey: process.env.ELEVENLABS_API_KEY || '',
      outputFormat: 'mp3'
    });

    // Step 6: Generate audio for the first segment only
    console.log(chalk.yellow('  🔄 Generating TTS for segment 1...'));
    const audioCollection = await ttsStage.generateSegmentedAudio([firstSegment], SESSION_DIR);

    console.log(chalk.green('\n🎉 Stage 9 Test Complete!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`📁 Audio file: ${audioCollection.segments[0].audioFile}`));
    console.log(chalk.white(`⏱️  Actual duration: ${audioCollection.segments[0].duration}s`));
    console.log(chalk.white(`💾 File size: ${Math.round(audioCollection.metadata.totalFileSize / 1024)}KB`));
    console.log(chalk.white(`🎵 Provider: ${audioCollection.metadata.provider}`));
    console.log(chalk.white(`🗣️  Voice: ${audioCollection.metadata.voiceId}`));
    console.log(chalk.white(`📊 Collection: ${audioCollection.segments.length} segment(s)`));
    
    // Display segment details
    const segment = audioCollection.segments[0];
    console.log(chalk.gray('\n📋 Segment Details:'));
    console.log(chalk.gray(`  ID: ${segment.id}`));
    console.log(chalk.gray(`  Type: ${segment.type}`));
    console.log(chalk.gray(`  Visual: ${segment.visualContent?.type} - ${segment.visualContent?.resource}`));
    console.log(chalk.gray(`  Pace: ${segment.metadata?.pace || 'default'}`));
    console.log(chalk.gray(`  Key terms: ${segment.metadata?.keyTerms?.join(', ') || 'none'}`));
    console.log(chalk.gray(`  Start: ${segment.startTime}s`));
    console.log(chalk.gray(`  End: ${segment.endTime}s`));
    console.log(chalk.gray(`  Text: "${segment.narrationText.substring(0, 100)}..."`));

    return audioCollection;

  } catch (error) {
    console.log(chalk.red('\n❌ Stage 9 Test Failed'));
    console.error(error);
    throw error;
  }
}

testStage9Segment1().catch(console.error);
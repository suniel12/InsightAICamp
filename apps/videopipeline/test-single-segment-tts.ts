#!/usr/bin/env tsx

import { SegmentedTTSStage, SegmentedTTSConfig } from './src/stages/tts/index';
import { AudioSegment } from './src/types/pipeline.types';
import chalk from 'chalk';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_ID = 'ps_3B69a_go';
const SESSION_DIR = path.join(__dirname, 'pipeline-data/sessions', SESSION_ID);

async function testSingleSegmentTTS() {
  console.log(chalk.bold.cyan('🎤 Testing Single Segment TTS Generation'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`Session: ${SESSION_ID}`));
  console.log(chalk.gray('Testing Segment 1: Video Opening'));
  console.log(chalk.gray('─'.repeat(50)));

  // Create first segment based on the updated formatted narration
  const firstSegment: AudioSegment = {
    id: 'segment_1',
    type: 'ai-video',
    narrationText: "Welcome to the physical heart of our digital world. Endless corridors of servers—hundreds, or even thousands of them—all humming in unison, processing and storing the vast amounts of information we create and consume every second.",
    startTime: 0.0,
    endTime: 18.2,
    duration: 18.2,
    visualContent: {
      type: 'video',
      resource: 'slide4_vid1.mp4',
      slide: 4
    },
    metadata: {
      pace: 'slow',
      keyTerms: ['data center', 'servers', 'digital']
    }
  };

  const ttsConfig: SegmentedTTSConfig = {
    provider: 'elevenlabs',
    voiceId: process.env.ELEVENLABS_VOICE_ID || '',
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    speechMarks: false,
    outputFormat: 'mp3'
  };

  try {
    const ttsStage = new SegmentedTTSStage(ttsConfig);
    const result = await ttsStage.generateSegmentedAudio([firstSegment], SESSION_DIR);

    console.log(chalk.green('\n🎉 Single Segment TTS Test Successful!'));
    console.log(chalk.white(`📁 Audio file: ${result.segments[0].audioFile}`));
    console.log(chalk.white(`⏱️  Duration: ${result.segments[0].duration}s`));
    console.log(chalk.white(`💾 File size: ${Math.round(result.metadata.totalFileSize / 1024)}KB`));

  } catch (error) {
    console.log(chalk.red('\n❌ Single Segment TTS Test Failed'));
    console.error(error);
  }
}

testSingleSegmentTTS().catch(console.error);
#!/usr/bin/env tsx

import { UnifiedPipelineOrchestrator, UnifiedPipelineConfig } from './src/pipeline/unified-orchestrator';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_ID = 'ps_3B69a_go';

async function testNewSession() {
  console.log(chalk.bold.cyan('🧪 Testing New Session'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.white(`Session: ${SESSION_ID}`));
  console.log(chalk.gray('Architecture: Segmented Audio with Full-Screen AI Images'));
  console.log(chalk.gray('─'.repeat(50)));

  const config: UnifiedPipelineConfig = {
    sessionId: SESSION_ID,
    userContext: {
      expertiseLevel: 'intermediate',
      background: 'biologist',
      learningGoals: 'Understand data center infrastructure for research'
    },
    providers: {
      llm: {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4'
      },
      tts: {
        provider: 'elevenlabs',
        apiKey: process.env.ELEVENLABS_API_KEY || '',
        voiceId: process.env.ELEVENLABS_VOICE_ID || ''
      },
      aiMedia: {
        runway: { apiKey: process.env.RUNWAY_API_KEY || '' },
        openai: { apiKey: process.env.OPENAI_API_KEY || '' }
      }
    },
    output: {
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    }
  };

  const orchestrator = new UnifiedPipelineOrchestrator(config);
  const result = await orchestrator.execute();

  if (result.success) {
    console.log(chalk.bold.green('\n🎉 New Session Test Successful!'));
    console.log(chalk.white(`📹 Final Video: ${result.finalVideoPath}`));
  } else {
    console.log(chalk.red('\n❌ New Session Test Failed'));
  }

  return result;
}

testNewSession().catch(console.error);
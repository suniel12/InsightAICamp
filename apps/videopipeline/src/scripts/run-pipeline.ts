#!/usr/bin/env tsx

import { UnifiedPipelineOrchestrator, UnifiedPipelineConfig } from '../pipeline/unified-orchestrator';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const SESSION_ID = 'ps_mNLd3DCJ';

async function runUnifiedPipeline() {
  console.log(chalk.bold.cyan('🎯 Running Unified Segmented Pipeline'));
  console.log(chalk.gray('─'.repeat(80)));
  console.log(chalk.white(`Target Session: ${SESSION_ID}`));
  console.log(chalk.gray(`Architecture: Segmented Audio with Audio-Driven Timeline`));
  console.log(chalk.gray('─'.repeat(80)));

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
        voiceId: process.env.ELEVENLABS_VOICE_ID || 'MFZUKuGQUsGJPQjTS4wC'
      },
      aiMedia: {
        runway: { apiKey: process.env.RUNWAY_API_KEY || '' },
        imagen: { apiKey: process.env.GOOGLE_API_KEY || '' },
        openai: { apiKey: process.env.OPENAI_API_KEY || '' }
      }
    },
    output: {
      format: 'mp4',
      resolution: '1080p',
      fps: 30
    }
  };

  // Validate required environment variables
  const requiredEnvVars = [
    { key: 'ELEVENLABS_API_KEY', value: config.providers.tts.apiKey },
  ];

  const missingEnvVars = requiredEnvVars.filter(env => !env.value);
  if (missingEnvVars.length > 0) {
    console.error(chalk.red('❌ Missing required environment variables:'));
    missingEnvVars.forEach(env => {
      console.error(chalk.red(`  - ${env.key}`));
    });
    process.exit(1);
  }

  try {
    const orchestrator = new UnifiedPipelineOrchestrator(config);
    const result = await orchestrator.execute();

    if (result.success) {
      console.log(chalk.bold.green('\n🎉 Pipeline Execution Successful!'));
      console.log(chalk.gray('─'.repeat(80)));
      console.log(chalk.white(`📹 Final Video: ${result.finalVideoPath}`));
      console.log(chalk.gray(`⏱️  Total Duration: ${Math.round(result.totalDuration / 60000 * 10) / 10} minutes`));
      console.log(chalk.gray(`🎵 Audio Segments: ${result.metadata.audioSegments}`));
      console.log(chalk.gray(`🎬 Timeline Events: ${result.metadata.timelineEvents}`));
      console.log(chalk.gray(`📹 Video Duration: ${result.metadata.finalVideoDuration?.toFixed(1)}s`));
      console.log(chalk.gray(`📦 File Size: ${result.metadata.fileSizeMB}MB`));
      console.log(chalk.gray('─'.repeat(80)));
      
      console.log(chalk.yellow('\n📺 To play the video:'));
      console.log(chalk.white(`    open "${result.finalVideoPath}"`));
      
      // Stage completion summary
      console.log(chalk.yellow('\n📊 Stage Summary:'));
      const stageNames = {
        segmentation: 'Stage 8: Narration Segmentation',
        tts: 'Stage 9: Segmented TTS',
        timeline: 'Stage 10: Content-Aware Timeline',
        assembly: 'Stage 11: Video Assembly'
      };
      
      Object.entries(result.stages).forEach(([stage, stageResult]) => {
        const name = stageNames[stage as keyof typeof stageNames] || stage;
        const status = stageResult.success ? chalk.green('✅') : chalk.red('❌');
        const duration = Math.round(stageResult.duration / 1000);
        console.log(`  ${status} ${name} (${duration}s)`);
      });

    } else {
      console.log(chalk.red('\n❌ Pipeline Execution Failed'));
      console.log(chalk.gray('─'.repeat(80)));
      
      const failedStages = Object.entries(result.stages)
        .filter(([_, stage]) => !stage.success)
        .map(([name, stage]) => ({ name, error: stage.error }));
      
      console.log(chalk.red(`Failed Stages: ${failedStages.length}`));
      failedStages.forEach(({ name, error }) => {
        console.log(chalk.red(`  ❌ ${name}: ${error}`));
      });
      
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('\n💥 Pipeline Execution Error:'), error);
    process.exit(1);
  }
}

// Pre-flight checks
async function validateSessionData(sessionId: string): Promise<boolean> {
  console.log(chalk.cyan('🔍 Validating session prerequisites...'));
  
  const sessionDir = `./pipeline-data/sessions/${sessionId}`;
  const requiredFiles = [
    'stage-08-final-narration/narration-formatted.md',
    'stage-06-ai-media/media-manifest.json'
  ];

  let allValid = true;
  
  for (const file of requiredFiles) {
    try {
      const { access } = await import('fs/promises');
      await access(`${sessionDir}/${file}`);
      console.log(chalk.green(`  ✅ ${file}`));
    } catch {
      console.log(chalk.red(`  ❌ ${file} - Missing`));
      allValid = false;
    }
  }

  if (!allValid) {
    console.log(chalk.red('\n❌ Session validation failed. Please ensure stages 1-7 are completed.'));
    console.log(chalk.yellow('\nTo complete missing stages, run:'));
    console.log(chalk.white('  1. Extract and analyze PowerPoint'));
    console.log(chalk.white('  2. Export slide images manually'));
    console.log(chalk.white('  3. Generate personalized narration'));
    console.log(chalk.white('  4. Create enhanced PowerPoint'));
    console.log(chalk.white('  5. Generate script with media planning'));
    console.log(chalk.white('  6. Generate AI media assets'));
    console.log(chalk.white('  7. Prepare final narration'));
  }

  return allValid;
}

// Main execution
async function main() {
  console.log(chalk.bold.cyan('🎬 Unified Pipeline Runner'));
  console.log(chalk.gray('Streamlined segmented audio architecture for perfect sync'));
  console.log(chalk.gray('─'.repeat(80)));
  
  // Validate session data first
  const isValidSession = await validateSessionData(SESSION_ID);
  
  if (!isValidSession) {
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Session validation passed\n'));
  
  // Run the unified pipeline
  await runUnifiedPipeline();
}

// Run the script
main().catch(error => {
  console.error(chalk.red('❌ Script execution failed:'), error);
  process.exit(1);
});
#!/usr/bin/env tsx

import { PipelineOrchestrator, PipelineConfig } from '../src/pipeline/orchestrator';
import { configManager } from '../src/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

// Test script to run the pipeline with sample data
async function runTest() {
  console.log(chalk.bold.cyan('🧪 Testing Video Pipeline'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log('');

  try {
    // Step 1: Create sample PowerPoint content
    console.log(chalk.yellow('📄 Creating sample presentation...'));
    const samplePPT = await createSamplePowerPoint();
    console.log(chalk.green('✓ Sample PowerPoint created'));

    // Step 2: Create test configuration
    console.log(chalk.yellow('\n⚙️  Creating test configuration...'));
    const config = await createTestConfig(samplePPT);
    console.log(chalk.green('✓ Configuration ready'));

    // Step 3: Validate configuration
    console.log(chalk.yellow('\n✅ Validating configuration...'));
    const validation = configManager.validateConfig(config);
    
    if (!validation.valid) {
      console.log(chalk.red('❌ Configuration errors:'));
      validation.errors.forEach(e => console.log(chalk.red(`  - ${e}`)));
      process.exit(1);
    }
    
    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Configuration warnings:'));
      validation.warnings.forEach(w => console.log(chalk.yellow(`  - ${w}`)));
    }
    
    console.log(chalk.green('✓ Configuration validated'));

    // Step 4: Estimate costs
    console.log(chalk.yellow('\n💰 Estimating costs...'));
    const estimate = configManager.estimateCost(config, 5); // 5 slides
    console.log(chalk.cyan('Cost Breakdown:'));
    estimate.breakdown.forEach(line => console.log(chalk.gray(`  ${line}`)));
    console.log(chalk.bold(`  Total: $${estimate.total.toFixed(2)}`));

    // Step 5: Run pipeline
    console.log(chalk.yellow('\n🚀 Running pipeline...'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const pipeline = new PipelineOrchestrator(config);
    const result = await pipeline.run();
    
    console.log(chalk.gray('─'.repeat(50)));

    // Step 6: Display results
    if (result.success) {
      console.log(chalk.bold.green('\n✅ Test completed successfully!'));
      console.log(chalk.white(`📁 Output: ${result.outputPath}`));
      
      if (result.metrics) {
        console.log(chalk.cyan('\n📊Metrics:'));
        console.log(chalk.gray(`  Total time: ${Math.round(result.metrics.totalDuration / 1000)}s`));
        
        console.log(chalk.gray('  Stage durations:'));
        Object.entries(result.metrics.stageDurations).forEach(([stage, duration]) => {
          console.log(chalk.gray(`    ${stage}: ${Math.round(duration / 1000)}s`));
        });
        
        if (result.metrics.costs) {
          console.log(chalk.gray(`  Actual costs:));
          console.log(chalk.gray(`    TTS: $${result.metrics.costs.tts.toFixed(2)}`));
          console.log(chalk.gray(`    Video: $${result.metrics.costs.video.toFixed(2)}`));
          console.log(chalk.yellow(`    Total: $${result.metrics.costs.total.toFixed(2)}`));
        }
      }
    } else {
      console.log(chalk.bold.red('\n❌ Test failed'));
      console.log(chalk.red(`Error: ${result.error}`));
    }

    // Cleanup
    await pipeline.cleanup();
    console.log(chalk.gray('\n🧹 Cleanup completed'));

  } catch (error) {
    console.error(chalk.red('\n❌ Test failed with error:'), error);
    process.exit(1);
  }
}

async function createSamplePowerPoint(): Promise<string> {
  // Create a test directory
  const testDir = path.join(process.cwd(), 'test-data');
  await fs.mkdir(testDir, { recursive: true });
  
  // Create a simple JSON representation of a PowerPoint
  // In production, this would be a real PPTX file
  const sampleContent = {
    title: 'Introduction to Data Centers',
    slides: [
      {
        number: 1,
        title: 'Welcome to Data Centers',
        bullets: [
          'Physical facilities for computing infrastructure',
          'Houses servers, storage, and networking equipment',
          'Critical for modern digital services',
        ],
        speakerNotes: 'Start with an overview of what data centers are and their importance.',
      },
      {
        number: 2,
        title: 'Key Components',
        bullets: [
          'Server racks and compute hardware',
          'Cooling and HVAC systems',
          'Power distribution and backup',
          'Network infrastructure',
          'Security systems',
        ],
        speakerNotes: 'Explain each component and how they work together.',
      },
      {
        number: 3,
        title: 'Data Center Tiers',
        bullets: [
          'Tier 1: Basic capacity (99.671% uptime)',
          'Tier 2: Redundant capacity (99.741% uptime)',
          'Tier 3: Concurrent maintainability (99.982% uptime)',
          'Tier 4: Fault tolerance (99.995% uptime)',
        ],
        speakerNotes: 'Discuss the tier classification system and what each level means.',
      },
      {
        number: 4,
        title: 'Energy Efficiency',
        bullets: [
          'Power Usage Effectiveness (PUE) metrics',
          'Renewable energy adoption',
          'Cooling optimization techniques',
          'Server virtualization benefits',
        ],
        speakerNotes: 'Focus on sustainability and efficiency improvements.',
      },
      {
        number: 5,
        title: 'Future Trends',
        bullets: [
          'Edge computing growth',
          'AI-driven optimization',
          'Liquid cooling adoption',
          'Modular data center designs',
        ],
        speakerNotes: 'Look at emerging trends and future directions.',
      },
    ],
  };
  
  const filePath = path.join(testDir, 'sample.json');
  await fs.writeFile(filePath, JSON.stringify(sampleContent, null, 2));
  
  // Also create a minimal PPTX file (placeholder)
  const pptxPath = path.join(testDir, 'sample.pptx');
  await fs.writeFile(pptxPath, Buffer.from('PPTX placeholder'));
  
  return pptxPath;
}

async function createTestConfig(pptPath: string): Promise<PipelineConfig> {
  // Get preset configuration
  const preset = configManager.getPreset('basic');
  
  // Create test configuration
  const config: PipelineConfig = {
    input: {
      pptPath,
    },
    output: {
      dir: path.join(process.cwd(), 'test-output'),
      format: preset.output?.format || 'mp4',
      resolution: preset.output?.resolution || '720p',
    },
    stages: {
      narration: {
        enabled: false, // Disable for testing without API keys
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        apiKey: '',
      },
      tts: {
        enabled: false, // Disable for testing without API keys
        provider: 'elevenlabs',
        voiceId: 'test-voice',
        apiKey: '',
      },
      video: {
        enabled: false, // Disable for testing without API keys
        provider: 'runway',
        apiKey: '',
        maxVideos: 3,
        quality: 'standard',
      },
      slides: {
        enhance: true,
      },
    },
    performance: {
      parallel: false,
      maxConcurrency: 1,
      cacheEnabled: false,
    },
  };
  
  return config;
}

// Run the test
runTest().catch(console.error);
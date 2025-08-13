#!/usr/bin/env node

import { Command } from 'commander';
import { PipelineOrchestrator, PipelineConfig } from '../pipeline/orchestrator';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('videopipeline')
  .description('Convert PowerPoint presentations to professional educational videos')
  .version('1.0.0');

program
  .command('convert <input>')
  .description('Convert a PowerPoint file to video')
  .option('-o, --output <dir>', 'Output directory', './output')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--format <format>', 'Output format (mp4/webm)', 'mp4')
  .option('--resolution <res>', 'Output resolution (720p/1080p/4k)', '1080p')
  .option('--no-narration', 'Skip narration generation')
  .option('--no-tts', 'Skip text-to-speech')
  .option('--no-video', 'Skip AI video generation')
  .option('--no-enhance', 'Skip slide enhancement')
  .option('--voice <id>', 'ElevenLabs voice ID')
  .option('--use-cached-images', 'Use existing exported images without re-exporting')
  .option('--parallel', 'Enable parallel processing', true)
  .option('--cache', 'Enable caching', true)
  .action(async (input, options) => {
    const spinner = ora();
    
    try {
      // Validate input file
      spinner.start('Validating input file...');
      const inputPath = path.resolve(input);
      
      try {
        await fs.access(inputPath);
      } catch {
        spinner.fail(chalk.red(`Input file not found: ${inputPath}`));
        process.exit(1);
      }
      
      if (!inputPath.endsWith('.pptx') && !inputPath.endsWith('.ppt')) {
        spinner.fail(chalk.red('Input must be a PowerPoint file (.pptx or .ppt)'));
        process.exit(1);
      }
      
      spinner.succeed(chalk.green('Input file validated'));

      // Load or create configuration
      let config: PipelineConfig;
      
      if (options.config) {
        spinner.start('Loading configuration...');
        const configPath = path.resolve(options.config);
        const configData = await fs.readFile(configPath, 'utf-8');
        config = JSON.parse(configData);
        spinner.succeed(chalk.green('Configuration loaded'));
      } else {
        config = await buildConfig(inputPath, options);
      }

      // Validate API keys
      validateApiKeys(config);

      // Create pipeline orchestrator
      const pipeline = new PipelineOrchestrator(config);

      // Run pipeline
      console.log('');
      console.log(chalk.bold.cyan('🎬 Starting Video Pipeline'));
      console.log(chalk.gray('─'.repeat(50)));
      
      const result = await pipeline.run();
      
      console.log(chalk.gray('─'.repeat(50)));
      
      if (result.success) {
        console.log('');
        console.log(chalk.bold.green('✅ Success!'));
        console.log(chalk.white(`Video saved to: ${chalk.underline(result.outputPath)}`));
        
        if (result.metrics) {
          console.log('');
          console.log(chalk.bold('Metrics:'));
          console.log(chalk.gray(`  Total time: ${Math.round(result.metrics.totalDuration / 1000)}s`));
          
          if (result.metrics.costs) {
            console.log(chalk.gray(`  TTS cost: $${result.metrics.costs.tts.toFixed(2)}`));
            console.log(chalk.gray(`  Video cost: $${result.metrics.costs.video.toFixed(2)}`));
            console.log(chalk.yellow(`  Total cost: $${result.metrics.costs.total.toFixed(2)}`));
          }
        }
      } else {
        console.log('');
        console.log(chalk.bold.red('❌ Pipeline failed'));
        console.log(chalk.red(`Error: ${result.error}`));
        process.exit(1);
      }

      // Cleanup
      await pipeline.cleanup();
      
    } catch (error) {
      spinner.fail(chalk.red('Pipeline failed'));
      console.error(error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Create or update configuration file')
  .option('-o, --output <file>', 'Output file path', './videopipeline.config.json')
  .action(async (options) => {
    console.log(chalk.bold.cyan('Video Pipeline Configuration'));
    console.log('');
    
    const response = await prompts([
      {
        type: 'select',
        name: 'narrationProvider',
        message: 'Select narration provider',
        choices: [
          { title: 'OpenAI GPT-4', value: 'openai' },
          { title: 'Anthropic Claude', value: 'claude' },
        ],
      },
      {
        type: 'text',
        name: 'narrationApiKey',
        message: 'Enter narration API key',
        initial: process.env.OPENAI_API_KEY || '',
      },
      {
        type: 'select',
        name: 'ttsProvider',
        message: 'Select TTS provider',
        choices: [
          { title: 'ElevenLabs', value: 'elevenlabs' },
          { title: 'Google Cloud', value: 'google' },
          { title: 'Azure', value: 'azure' },
        ],
      },
      {
        type: 'text',
        name: 'ttsApiKey',
        message: 'Enter TTS API key',
        initial: process.env.ELEVENLABS_API_KEY || '',
      },
      {
        type: 'text',
        name: 'ttsVoiceId',
        message: 'Enter voice ID',
        initial: 'EXAVITQu4vr4xnSDxMaL', // Default to Sarah voice
      },
      {
        type: 'select',
        name: 'videoProvider',
        message: 'Select AI video provider',
        choices: [
          { title: 'Runway Gen-3', value: 'runway' },
          { title: 'Google Veo', value: 'veo' },
          { title: 'Pika Labs', value: 'pika' },
        ],
      },
      {
        type: 'text',
        name: 'videoApiKey',
        message: 'Enter video API key',
        initial: process.env.RUNWAY_API_KEY || '',
      },
      {
        type: 'number',
        name: 'maxVideos',
        message: 'Maximum videos per course',
        initial: 5,
        min: 1,
        max: 20,
      },
      {
        type: 'select',
        name: 'resolution',
        message: 'Output resolution',
        choices: [
          { title: '720p', value: '720p' },
          { title: '1080p', value: '1080p' },
          { title: '4K', value: '4k' },
        ],
      },
    ]);

    const config: Partial<PipelineConfig> = {
      stages: {
        narration: {
          enabled: true,
          provider: response.narrationProvider,
          model: response.narrationProvider === 'openai' ? 'gpt-4-turbo-preview' : 'claude-3-opus',
          apiKey: response.narrationApiKey,
        },
        tts: {
          enabled: true,
          provider: response.ttsProvider,
          voiceId: response.ttsVoiceId,
          apiKey: response.ttsApiKey,
        },
        video: {
          enabled: true,
          provider: response.videoProvider,
          apiKey: response.videoApiKey,
          maxVideos: response.maxVideos,
          quality: 'high',
        },
        slides: {
          enhance: true,
        },
      },
      output: {
        format: 'mp4',
        resolution: response.resolution,
        dir: './output',
      },
      performance: {
        parallel: true,
        maxConcurrency: 5,
        cacheEnabled: true,
      },
    };

    // Save configuration
    await fs.writeFile(
      options.output,
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    console.log('');
    console.log(chalk.green(`✅ Configuration saved to ${options.output}`));
  });

program
  .command('test')
  .description('Test pipeline with sample content')
  .action(async () => {
    console.log(chalk.bold.cyan('Running test pipeline...'));
    
    // Create sample PowerPoint
    const samplePath = await createSamplePresentation();
    
    // Run pipeline with minimal configuration
    const config: PipelineConfig = {
      input: {
        pptPath: samplePath,
      },
      output: {
        dir: './test-output',
        format: 'mp4',
        resolution: '720p',
      },
      stages: {
        narration: {
          enabled: false,
        },
        tts: {
          enabled: false,
        },
        video: {
          enabled: false,
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

    const pipeline = new PipelineOrchestrator(config);
    const result = await pipeline.run();
    
    if (result.success) {
      console.log(chalk.green(`✅ Test completed successfully!`));
      console.log(chalk.white(`Output: ${result.outputPath}`));
    } else {
      console.log(chalk.red(`❌ Test failed: ${result.error}`));
    }
    
    await pipeline.cleanup();
  });

// Helper functions
async function buildConfig(inputPath: string, options: any): Promise<PipelineConfig> {
  return {
    input: {
      pptPath: inputPath,
    },
    output: {
      dir: path.resolve(options.output),
      format: options.format,
      resolution: options.resolution,
    },
    stages: {
      narration: {
        enabled: options.narration === true || options.narration === undefined,
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        apiKey: process.env.OPENAI_API_KEY || '',
      },
      tts: {
        enabled: options.tts === true || options.tts === undefined,
        provider: 'elevenlabs',
        voiceId: options.voice || process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
        apiKey: process.env.ELEVENLABS_API_KEY || '',
      },
      video: {
        enabled: options.video === true || options.video === undefined,
        provider: 'runway',
        apiKey: process.env.RUNWAY_API_KEY || '',
        maxVideos: 5,
        quality: 'high',
      },
      slides: {
        enhance: options.enhance === true || options.enhance === undefined,
      },
    },
    performance: {
      parallel: options.parallel,
      maxConcurrency: 5,
      cacheEnabled: options.cache,
    },
  };
}

function validateApiKeys(config: PipelineConfig) {
  const warnings: string[] = [];
  
  if (config.stages.narration.enabled && !config.stages.narration.apiKey) {
    warnings.push('Narration API key not set (use OPENAI_API_KEY env var)');
  }
  
  if (config.stages.tts.enabled && !config.stages.tts.apiKey) {
    warnings.push('TTS API key not set (use ELEVENLABS_API_KEY env var)');
  }
  
  if (config.stages.video.enabled && !config.stages.video.apiKey) {
    warnings.push('Video API key not set (use RUNWAY_API_KEY env var)');
  }
  
  if (warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:'));
    warnings.forEach(w => console.log(chalk.yellow(`  - ${w}`)));
    console.log('');
  }
}

async function createSamplePresentation(): Promise<string> {
  // Create a simple sample PowerPoint for testing
  // This would normally use python-pptx to create a real file
  const samplePath = '/tmp/sample.pptx';
  
  // For now, just create a placeholder
  await fs.writeFile(samplePath, Buffer.from('Sample PowerPoint'), 'utf-8');
  
  return samplePath;
}

program.parse();
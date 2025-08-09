import * as fs from 'fs/promises';
import * as path from 'path';
import { PipelineConfig } from '../pipeline/orchestrator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class ConfigManager {
  private static instance: ConfigManager;
  private config: PipelineConfig | null = null;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(process.cwd(), 'videopipeline.config.json');
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadConfig(customPath?: string): Promise<PipelineConfig> {
    const configPath = customPath || this.configPath;
    
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      this.config = JSON.parse(configData);
      
      // Merge with environment variables
      this.config = this.mergeWithEnv(this.config);
      
      return this.config;
    } catch (error) {
      // If config file doesn't exist, create default
      return this.getDefaultConfig();
    }
  }

  async saveConfig(config: PipelineConfig, customPath?: string): Promise<void> {
    const configPath = customPath || this.configPath;
    
    // Remove sensitive data before saving
    const sanitizedConfig = this.sanitizeConfig(config);
    
    await fs.writeFile(
      configPath,
      JSON.stringify(sanitizedConfig, null, 2),
      'utf-8'
    );
    
    this.config = config;
  }

  getDefaultConfig(): PipelineConfig {
    return {
      input: {
        pptPath: '',
      },
      output: {
        dir: './output',
        format: 'mp4',
        resolution: '1080p',
      },
      stages: {
        narration: {
          enabled: true,
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          apiKey: process.env.OPENAI_API_KEY || '',
        },
        tts: {
          enabled: true,
          provider: 'elevenlabs',
          voiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
          apiKey: process.env.ELEVENLABS_API_KEY || '',
        },
        video: {
          enabled: true,
          provider: 'runway',
          apiKey: process.env.RUNWAY_API_KEY || '',
          maxVideos: 5,
          quality: 'high',
        },
        slides: {
          enhance: true,
        },
      },
      performance: {
        parallel: true,
        maxConcurrency: 5,
        cacheEnabled: true,
      },
    };
  }

  private mergeWithEnv(config: PipelineConfig): PipelineConfig {
    // Override with environment variables if they exist
    if (process.env.OPENAI_API_KEY && !config.stages.narration.apiKey) {
      config.stages.narration.apiKey = process.env.OPENAI_API_KEY;
    }
    
    if (process.env.ELEVENLABS_API_KEY && !config.stages.tts.apiKey) {
      config.stages.tts.apiKey = process.env.ELEVENLABS_API_KEY;
    }
    
    if (process.env.ELEVENLABS_VOICE_ID && !config.stages.tts.voiceId) {
      config.stages.tts.voiceId = process.env.ELEVENLABS_VOICE_ID;
    }
    
    if (process.env.RUNWAY_API_KEY && !config.stages.video.apiKey) {
      config.stages.video.apiKey = process.env.RUNWAY_API_KEY;
    }
    
    return config;
  }

  private sanitizeConfig(config: PipelineConfig): any {
    // Create a deep copy and remove API keys
    const sanitized = JSON.parse(JSON.stringify(config));
    
    // Replace API keys with placeholders
    if (sanitized.stages.narration.apiKey) {
      sanitized.stages.narration.apiKey = '***';
    }
    
    if (sanitized.stages.tts.apiKey) {
      sanitized.stages.tts.apiKey = '***';
    }
    
    if (sanitized.stages.video.apiKey) {
      sanitized.stages.video.apiKey = '***';
    }
    
    return sanitized;
  }

  validateConfig(config: PipelineConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate input
    if (!config.input?.pptPath) {
      errors.push('Input PowerPoint path is required');
    }
    
    // Validate API keys for enabled stages
    if (config.stages.narration.enabled && !config.stages.narration.apiKey) {
      warnings.push('Narration is enabled but API key is missing');
    }
    
    if (config.stages.tts.enabled && !config.stages.tts.apiKey) {
      warnings.push('TTS is enabled but API key is missing');
    }
    
    if (config.stages.video.enabled && !config.stages.video.apiKey) {
      warnings.push('Video generation is enabled but API key is missing');
    }
    
    // Validate output settings
    const validFormats = ['mp4', 'webm'];
    if (!validFormats.includes(config.output.format)) {
      errors.push(`Invalid output format: ${config.output.format}`);
    }
    
    const validResolutions = ['720p', '1080p', '4k'];
    if (!validResolutions.includes(config.output.resolution)) {
      errors.push(`Invalid resolution: ${config.output.resolution}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Preset configurations for common use cases
  getPreset(preset: 'basic' | 'professional' | 'premium'): Partial<PipelineConfig> {
    const presets = {
      basic: {
        stages: {
          narration: { enabled: false },
          tts: { enabled: false },
          video: { enabled: false },
          slides: { enhance: true },
        },
        output: {
          resolution: '720p' as const,
          format: 'mp4' as const,
        },
        performance: {
          parallel: false,
          maxConcurrency: 1,
          cacheEnabled: true,
        },
      },
      professional: {
        stages: {
          narration: { enabled: true },
          tts: { enabled: true },
          video: { enabled: false },
          slides: { enhance: true },
        },
        output: {
          resolution: '1080p' as const,
          format: 'mp4' as const,
        },
        performance: {
          parallel: true,
          maxConcurrency: 3,
          cacheEnabled: true,
        },
      },
      premium: {
        stages: {
          narration: { enabled: true },
          tts: { enabled: true },
          video: { 
            enabled: true,
            maxVideos: 10,
            quality: 'high' as const,
          },
          slides: { enhance: true },
        },
        output: {
          resolution: '4k' as const,
          format: 'mp4' as const,
        },
        performance: {
          parallel: true,
          maxConcurrency: 5,
          cacheEnabled: true,
        },
      },
    };
    
    return presets[preset];
  }

  // Cost estimation based on configuration
  estimateCost(config: PipelineConfig, slideCount: number): {
    tts: number;
    video: number;
    total: number;
    breakdown: string[];
  } {
    let ttsCost = 0;
    let videoCost = 0;
    const breakdown: string[] = [];
    
    // TTS cost estimation
    if (config.stages.tts.enabled) {
      const charactersPerSlide = 500; // Average estimate
      const totalCharacters = slideCount * charactersPerSlide;
      
      if (config.stages.tts.provider === 'elevenlabs') {
        // ElevenLabs pricing: ~$0.15 per 1000 characters
        ttsCost = (totalCharacters / 1000) * 0.15;
        breakdown.push(`TTS (ElevenLabs): ${totalCharacters} chars @ $0.15/1k = $${ttsCost.toFixed(2)}`);
      }
    }
    
    // Video cost estimation
    if (config.stages.video.enabled) {
      const videoCount = Math.min(config.stages.video.maxVideos, Math.ceil(slideCount * 0.3));
      const secondsPerVideo = 5; // Average
      
      if (config.stages.video.provider === 'runway') {
        // Runway Gen-3: $0.05 per second
        videoCost = videoCount * secondsPerVideo * 0.05;
        breakdown.push(`Video (Runway): ${videoCount} videos × ${secondsPerVideo}s @ $0.05/s = $${videoCost.toFixed(2)}`);
      }
    }
    
    // Narration cost (GPT-4)
    if (config.stages.narration.enabled) {
      const tokensPerSlide = 1000; // Estimate
      const totalTokens = slideCount * tokensPerSlide;
      const narrationCost = (totalTokens / 1000) * 0.03; // GPT-4 pricing
      breakdown.push(`Narration (GPT-4): ${totalTokens} tokens @ $0.03/1k = $${narrationCost.toFixed(2)}`);
      ttsCost += narrationCost; // Add to TTS cost for simplicity
    }
    
    return {
      tts: ttsCost,
      video: videoCost,
      total: ttsCost + videoCost,
      breakdown,
    };
  }
}

export const configManager = ConfigManager.getInstance();
import { PPTExtractor } from '../stages/extraction/ppt-extractor';
import { NarrationStage } from '../stages/narration';
import { SlidesStage } from '../stages/slides';
import { TTSStage } from '../stages/tts';
import { VideoStage } from '../stages/video';
import { AssemblyStage } from '../stages/assembly';
import { CourseContent, NarrationScript, AudioFile, GeneratedVideo } from '../types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface PipelineConfig {
  input: {
    pptPath: string;
    scriptPath?: string;
  };
  output: {
    dir: string;
    format: 'mp4' | 'webm';
    resolution: '720p' | '1080p' | '4k';
  };
  stages: {
    narration: {
      enabled: boolean;
      provider: 'openai' | 'claude';
      model: string;
      apiKey: string;
    };
    tts: {
      enabled: boolean;
      provider: 'elevenlabs' | 'google' | 'azure';
      voiceId: string;
      apiKey: string;
    };
    video: {
      enabled: boolean;
      provider: 'runway' | 'veo' | 'pika';
      apiKey: string;
      maxVideos: number;
      quality: 'standard' | 'high';
    };
    slides: {
      enhance: boolean;
    };
  };
  performance: {
    parallel: boolean;
    maxConcurrency: number;
    cacheEnabled: boolean;
  };
}

export class PipelineOrchestrator {
  private config: PipelineConfig;
  private stages: {
    extraction: PPTExtractor;
    narration?: NarrationStage;
    slides?: SlidesStage;
    tts?: TTSStage;
    video?: VideoStage;
    assembly: AssemblyStage;
  };
  private cache: Map<string, any>;

  constructor(config: PipelineConfig) {
    this.config = config;
    this.cache = new Map();
    this.initializeStages();
  }

  private initializeStages() {
    // Initialize extraction stage
    this.stages = {
      extraction: new PPTExtractor(),
      assembly: new AssemblyStage({
        format: this.config.output.format,
        resolution: this.config.output.resolution,
        fps: 30,
      }),
    };

    // Initialize optional stages
    if (this.config.stages.narration.enabled) {
      this.stages.narration = new NarrationStage({
        provider: this.config.stages.narration.provider,
        model: this.config.stages.narration.model,
        apiKey: this.config.stages.narration.apiKey,
      });
    }

    if (this.config.stages.tts.enabled) {
      this.stages.tts = new TTSStage({
        provider: this.config.stages.tts.provider,
        voiceId: this.config.stages.tts.voiceId,
        apiKey: this.config.stages.tts.apiKey,
      });
    }

    if (this.config.stages.video.enabled) {
      this.stages.video = new VideoStage({
        provider: this.config.stages.video.provider,
        apiKey: this.config.stages.video.apiKey,
        maxVideosPerCourse: this.config.stages.video.maxVideos,
        maxDurationPerVideo: 10,
        quality: this.config.stages.video.quality,
      });
    }

    if (this.config.stages.slides.enhance) {
      this.stages.slides = new SlidesStage();
    }
  }

  async run(): Promise<{
    success: boolean;
    outputPath?: string;
    error?: string;
    metrics?: {
      totalDuration: number;
      stageDurations: Record<string, number>;
      costs?: {
        tts: number;
        video: number;
        total: number;
      };
    };
  }> {
    const startTime = Date.now();
    const stageDurations: Record<string, number> = {};
    let costs = { tts: 0, video: 0, total: 0 };

    try {
      console.log('🚀 Starting video pipeline...');

      // Stage 1: Extract content from PowerPoint
      console.log('\n📊 Stage 1: Extracting content from PowerPoint...');
      const extractionStart = Date.now();
      const courseContent = await this.extractContent();
      stageDurations.extraction = Date.now() - extractionStart;
      console.log(`✅ Extracted ${courseContent.slides.length} slides in ${stageDurations.extraction}ms`);

      // Stage 2: Generate narrations
      let narrations: NarrationScript[] = [];
      if (this.stages.narration) {
        console.log('\n🎙️ Stage 2: Generating narrations...');
        const narrationStart = Date.now();
        narrations = await this.generateNarrations(courseContent);
        stageDurations.narration = Date.now() - narrationStart;
        console.log(`✅ Generated narrations for ${narrations.length} slides in ${stageDurations.narration}ms`);
      }

      // Stage 3: Enhance slides
      if (this.stages.slides) {
        console.log('\n🎨 Stage 3: Enhancing slides...');
        const slidesStart = Date.now();
        const enhanced = await this.stages.slides.enhance(courseContent.slides);
        stageDurations.slides = Date.now() - slidesStart;
        
        // Update slide content with enhanced versions
        enhanced.forEach(e => {
          const slide = courseContent.slides.find(s => s.number === e.slideNumber);
          if (slide && e.enhancedImageUrl) {
            (slide as any).enhancedImageUrl = e.enhancedImageUrl;
          }
        });
        console.log(`✅ Enhanced ${enhanced.length} slides in ${stageDurations.slides}ms`);
      }

      // Stage 4: Generate audio
      let audioFiles: AudioFile[] = [];
      if (this.stages.tts && narrations.length > 0) {
        console.log('\n🔊 Stage 4: Generating audio...');
        const ttsStart = Date.now();
        audioFiles = await this.stages.tts.generateAudio(narrations);
        stageDurations.tts = Date.now() - ttsStart;
        
        // Calculate TTS costs
        costs.tts = audioFiles.length * 0.015; // Approximate cost per audio
        console.log(`✅ Generated ${audioFiles.length} audio files in ${stageDurations.tts}ms`);
      }

      // Stage 5: Generate AI videos
      let videos: GeneratedVideo[] = [];
      if (this.stages.video && narrations.length > 0) {
        console.log('\n🎬 Stage 5: Generating AI videos...');
        const videoStart = Date.now();
        const opportunities = await this.stages.video.identifyOpportunities(courseContent, narrations);
        videos = await this.stages.video.generateVideos(opportunities);
        stageDurations.video = Date.now() - videoStart;
        
        // Calculate video costs
        costs.video = videos.reduce((sum, v) => sum + (v.cost || 0), 0);
        console.log(`✅ Generated ${videos.length} videos in ${stageDurations.video}ms`);
      }

      // Stage 6: Assemble final video
      console.log('\n🎞️ Stage 6: Assembling final video...');
      const assemblyStart = Date.now();
      const outputPath = await this.stages.assembly.assemble({
        slides: courseContent.slides,
        audio: audioFiles,
        videos,
        narrations,
      });
      stageDurations.assembly = Date.now() - assemblyStart;
      console.log(`✅ Assembled final video in ${stageDurations.assembly}ms`);

      // Move to output directory
      const finalPath = await this.moveToOutput(outputPath);

      costs.total = costs.tts + costs.video;
      const totalDuration = Date.now() - startTime;

      console.log('\n✨ Pipeline completed successfully!');
      console.log(`📁 Output: ${finalPath}`);
      console.log(`⏱️ Total time: ${Math.round(totalDuration / 1000)}s`);
      console.log(`💰 Total cost: $${costs.total.toFixed(2)}`);

      return {
        success: true,
        outputPath: finalPath,
        metrics: {
          totalDuration,
          stageDurations,
          costs,
        },
      };
    } catch (error) {
      console.error('\n❌ Pipeline failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metrics: {
          totalDuration: Date.now() - startTime,
          stageDurations,
        },
      };
    }
  }

  private async extractContent(): Promise<CourseContent> {
    const cacheKey = `extraction_${this.config.input.pptPath}`;
    
    if (this.config.performance.cacheEnabled && this.cache.has(cacheKey)) {
      console.log('  📦 Using cached extraction');
      return this.cache.get(cacheKey);
    }

    const content = await this.stages.extraction.extract(this.config.input.pptPath);
    
    if (this.config.performance.cacheEnabled) {
      this.cache.set(cacheKey, content);
    }

    return content;
  }

  private async generateNarrations(content: CourseContent): Promise<NarrationScript[]> {
    if (!this.stages.narration) {
      return [];
    }

    const cacheKey = `narration_${JSON.stringify(content.slides.map(s => s.title))}`;
    
    if (this.config.performance.cacheEnabled && this.cache.has(cacheKey)) {
      console.log('  📦 Using cached narrations');
      return this.cache.get(cacheKey);
    }

    let narrations: NarrationScript[];
    
    if (this.config.performance.parallel) {
      // Process in parallel batches
      const batchSize = this.config.performance.maxConcurrency;
      narrations = [];
      
      for (let i = 0; i < content.slides.length; i += batchSize) {
        const batch = content.slides.slice(i, i + batchSize);
        const batchContent = { ...content, slides: batch };
        const batchNarrations = await this.stages.narration.generate(batchContent);
        narrations.push(...batchNarrations);
        console.log(`  ⚡ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(content.slides.length / batchSize)}`);
      }
    } else {
      narrations = await this.stages.narration.generate(content);
    }

    if (this.config.performance.cacheEnabled) {
      this.cache.set(cacheKey, narrations);
    }

    return narrations;
  }

  private async moveToOutput(tempPath: string): Promise<string> {
    await fs.mkdir(this.config.output.dir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `course_video_${timestamp}.${this.config.output.format}`;
    const finalPath = path.join(this.config.output.dir, filename);
    
    await fs.rename(tempPath, finalPath);
    
    return finalPath;
  }

  // Progress tracking methods
  async getProgress(): Promise<{
    stage: string;
    progress: number;
    message: string;
  }> {
    // Implementation for real-time progress tracking
    return {
      stage: 'processing',
      progress: 0.5,
      message: 'Processing slides...',
    };
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    // Clean up temporary files
    const tempDirs = ['/tmp/tts-output', '/tmp/enhanced-slides', '/tmp/video-output'];
    
    for (const dir of tempDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    this.cache.clear();
  }
}
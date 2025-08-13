import { PipelineStage, SegmentedAudioCollection, AudioSegment } from '../types/pipeline.types';
import { NarrationSegmenter } from '../stages/segmentation/narration-segmenter';
import { SegmentedTTSStage } from '../stages/tts';
import { ContentAwareTimelinePlanner } from '../stages/timeline/planner';
import { SegmentedAssemblyStage } from '../stages/assembly';
import { PipelineSession } from '../lib/session-manager';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

export interface UnifiedPipelineConfig {
  sessionId: string;
  userContext?: {
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
    background: string;
    learningGoals?: string;
  };
  providers: {
    llm: {
      provider: 'openai' | 'anthropic';
      apiKey: string;
      model?: string;
    };
    tts: {
      provider: 'elevenlabs';
      apiKey: string;
      voiceId: string;
    };
    aiMedia: {
      runway?: { apiKey: string };
      imagen?: { apiKey: string };
      openai?: { apiKey: string };
    };
  };
  output: {
    format: 'mp4';
    resolution: '720p' | '1080p' | '4k';
    fps: 24 | 30 | 60;
  };
}

export interface StageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PipelineResult {
  success: boolean;
  sessionId: string;
  finalVideoPath?: string;
  stages: Record<PipelineStage, StageResult>;
  totalDuration: number;
  metadata: {
    createdAt: string;
    completedAt?: string;
    audioSegments?: number;
    timelineEvents?: number;
    finalVideoDuration?: number;
    fileSizeMB?: number;
  };
}

export class UnifiedPipelineOrchestrator {
  private config: UnifiedPipelineConfig;
  private session: PipelineSession;
  private sessionDir: string;

  constructor(config: UnifiedPipelineConfig) {
    this.config = config;
    this.session = new PipelineSession(config.sessionId);
    this.sessionDir = path.join('./pipeline-data/sessions', config.sessionId);
  }

  async execute(): Promise<PipelineResult> {
    const startTime = Date.now();
    const result: PipelineResult = {
      success: false,
      sessionId: this.config.sessionId,
      stages: {} as Record<PipelineStage, StageResult>,
      totalDuration: 0,
      metadata: {
        createdAt: new Date().toISOString()
      }
    };

    console.log(chalk.bold.cyan('🚀 Starting Unified Pipeline Execution'));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white(`Session: ${this.config.sessionId}`));
    console.log(chalk.gray(`Started: ${result.metadata.createdAt}`));
    console.log(chalk.gray('─'.repeat(80)));

    try {
      // Load session
      await this.session.load();

      // Execute stages 1-7 (assumed to be already completed)
      await this.validatePrerequisiteStages();

      // Stage 8: Narration Segmentation
      result.stages.segmentation = await this.executeStage8();

      // Stage 9: Segmented TTS
      result.stages.tts = await this.executeStage9(result);

      // Stage 10: Content-Aware Timeline
      result.stages.timeline = await this.executeStage10(result);

      // Stage 11: Video Assembly
      result.stages.assembly = await this.executeStage11(result);

      // Calculate final metrics
      const totalTime = Date.now() - startTime;
      result.totalDuration = totalTime;
      result.success = Object.values(result.stages).every(stage => stage.success);
      result.metadata.completedAt = new Date().toISOString();

      if (result.success) {
        console.log(chalk.bold.green('\n🎉 Pipeline Execution Complete!'));
        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.white(`  📹 Final Video: ${result.finalVideoPath}`));
        console.log(chalk.gray(`  ⏱️  Total Time: ${Math.round(totalTime / 60000 * 10) / 10} minutes`));
        console.log(chalk.gray(`  🎵 Audio Segments: ${result.metadata.audioSegments}`));
        console.log(chalk.gray(`  🎬 Timeline Events: ${result.metadata.timelineEvents}`));
        console.log(chalk.gray('─'.repeat(80)));
      } else {
        console.log(chalk.red('\n❌ Pipeline Execution Failed'));
        const failedStages = Object.entries(result.stages)
          .filter(([_, stage]) => !stage.success)
          .map(([name, _]) => name);
        console.log(chalk.gray(`Failed stages: ${failedStages.join(', ')}`));
      }

      return result;

    } catch (error) {
      console.error(chalk.red('\n💥 Pipeline Execution Error:'), error);
      result.success = false;
      result.metadata.completedAt = new Date().toISOString();
      result.totalDuration = Date.now() - startTime;
      return result;
    }
  }

  private async validatePrerequisiteStages(): Promise<void> {
    const requiredFiles = [
      'stage-08-final-narration/narration-formatted.md',
      'stage-06-ai-media/media-manifest.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.sessionDir, file);
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`Required file not found: ${file}. Please complete stages 1-7 first.`);
      }
    }

    console.log(chalk.green('✅ Prerequisite stages validated'));
  }

  private async executeStage8(): Promise<StageResult> {
    console.log(chalk.yellow('\n📝 Stage 8: Narration Segmentation'));
    console.log(chalk.gray('─'.repeat(60)));

    const startTime = Date.now();

    try {
      const segmenter = new NarrationSegmenter({
        sessionId: this.config.sessionId,
        sessionDir: this.sessionDir
      });

      const narrationSegments = await segmenter.segmentNarration();
      const audioSegmentTemplates = await segmenter.createAudioSegments(narrationSegments);

      const outputDir = path.join(this.sessionDir, 'stage-08-segmentation');
      await segmenter.saveSegments(narrationSegments, outputDir);

      const duration = Date.now() - startTime;

      console.log(chalk.green(`✅ Stage 8 Complete (${Math.round(duration / 1000)}s)`));

      return {
        success: true,
        data: audioSegmentTemplates,
        duration,
        metadata: {
          segmentCount: narrationSegments.length,
          totalDuration: narrationSegments[narrationSegments.length - 1]?.endTime || 0
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(chalk.red('❌ Stage 8 Failed:'), error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
    }
  }

  private async executeStage9(result: PipelineResult): Promise<StageResult> {
    console.log(chalk.yellow('\n🎤 Stage 9: Segmented TTS Generation'));
    console.log(chalk.gray('─'.repeat(60)));

    const startTime = Date.now();

    try {
      const audioSegmentTemplates = result.stages.segmentation?.data;
      if (!audioSegmentTemplates) {
        throw new Error('Stage 8 data not available');
      }

      const ttsStage = new SegmentedTTSStage({
        provider: this.config.providers.tts.provider,
        voiceId: this.config.providers.tts.voiceId,
        apiKey: this.config.providers.tts.apiKey,
        outputFormat: 'mp3'
      });

      const audioCollection = await ttsStage.generateSegmentedAudio(
        audioSegmentTemplates,
        this.sessionDir
      );

      const duration = Date.now() - startTime;

      console.log(chalk.green(`✅ Stage 9 Complete (${Math.round(duration / 1000)}s)`));

      return {
        success: true,
        data: audioCollection,
        duration,
        metadata: {
          segmentCount: audioCollection.segments.length,
          totalDuration: audioCollection.totalDuration,
          totalFileSize: audioCollection.metadata.totalFileSize
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(chalk.red('❌ Stage 9 Failed:'), error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
    }
  }

  private async executeStage10(result: PipelineResult): Promise<StageResult> {
    console.log(chalk.yellow('\n⏱️  Stage 10: Content-Aware Timeline Creation'));
    console.log(chalk.gray('─'.repeat(60)));

    const startTime = Date.now();

    try {
      const audioCollection = result.stages.tts?.data as SegmentedAudioCollection;
      if (!audioCollection) {
        throw new Error('Stage 9 data not available');
      }

      const timelinePlanner = new ContentAwareTimelinePlanner({
        sessionId: this.config.sessionId,
        sessionDir: this.sessionDir,
        transitionDuration: 0.5,
        outputFormat: `output-${this.config.sessionId}`
      });

      const timeline = await timelinePlanner.createTimeline(audioCollection);
      const timelinePath = await timelinePlanner.saveTimeline(timeline);
      timelinePlanner.displayTimelineOverview(timeline);

      const duration = Date.now() - startTime;

      console.log(chalk.green(`✅ Stage 10 Complete (${Math.round(duration / 1000)}s)`));

      return {
        success: true,
        data: timeline,
        duration,
        metadata: {
          eventCount: timeline.events.length,
          totalDuration: timeline.totalDuration,
          timelinePath
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(chalk.red('❌ Stage 10 Failed:'), error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
    }
  }

  private async executeStage11(result: PipelineResult): Promise<StageResult> {
    console.log(chalk.yellow('\n🎬 Stage 11: Segmented Video Assembly'));
    console.log(chalk.gray('─'.repeat(60)));

    const startTime = Date.now();

    try {
      const timeline = result.stages.timeline?.data;
      if (!timeline) {
        throw new Error('Stage 10 data not available');
      }

      const assembler = new SegmentedAssemblyStage({
        format: this.config.output.format,
        resolution: this.config.output.resolution,
        fps: this.config.output.fps
      });

      // Prepare slide images
      const slideImages = [
        path.join(process.cwd(), `output-${this.config.sessionId}`, 'public/Slide1.png'),
        path.join(process.cwd(), `output-${this.config.sessionId}`, 'public/Slide2.png'),
        path.join(process.cwd(), `output-${this.config.sessionId}`, 'public/Slide3.png'),
        path.join(process.cwd(), `output-${this.config.sessionId}`, 'public/Slide4.png'),
        path.join(process.cwd(), `output-${this.config.sessionId}`, 'public/Slide5.png'),
        path.join(process.cwd(), `output-${this.config.sessionId}`, 'public/Slide6.png'),
      ];

      // Load media manifest
      const mediaManifestPath = path.join(this.sessionDir, 'stage-06-ai-media/media-manifest.json');
      const mediaManifest = JSON.parse(await fs.readFile(mediaManifestPath, 'utf-8'));

      const aiVideos = mediaManifest.videos?.map((vid: any) => ({
        id: vid.file,
        slideNumber: vid.slide,
        url: path.join(this.sessionDir, 'stage-06-ai-media/videos', vid.file),
        duration: 8,
        prompt: vid.purpose,
        provider: 'runway',
        cost: 0
      })) || [];

      const aiImages = mediaManifest.images?.map((img: any) => 
        path.join(this.sessionDir, 'stage-06-ai-media/images', img.file)
      ) || [];

      const finalVideoPath = await assembler.assemble({
        timeline,
        slideImages,
        aiVideos,
        aiImages
      });

      // Get video file stats
      const videoStats = await fs.stat(finalVideoPath);
      const fileSizeMB = Math.round(videoStats.size / 1024 / 1024 * 100) / 100;

      const duration = Date.now() - startTime;

      console.log(chalk.green(`✅ Stage 11 Complete (${Math.round(duration / 1000)}s)`));

      // Update result with final video info
      result.finalVideoPath = finalVideoPath;
      result.metadata.audioSegments = timeline.audioCollection.segments.length;
      result.metadata.timelineEvents = timeline.events.length;
      result.metadata.finalVideoDuration = timeline.totalDuration;
      result.metadata.fileSizeMB = fileSizeMB;

      return {
        success: true,
        data: { videoPath: finalVideoPath },
        duration,
        metadata: {
          videoPath: finalVideoPath,
          fileSizeMB,
          videoDuration: timeline.totalDuration
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(chalk.red('❌ Stage 11 Failed:'), error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
    }
  }

}
import { SegmentedAudioCollection, AudioSegment } from '../../types/pipeline.types';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

export interface ContentAwareTimelineEvent {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'slide' | 'ai-image' | 'ai-video' | 'slide-with-overlay' | 'transition';
  audioSegment?: AudioSegment;
  content: {
    slideNumber?: number;
    slidePath?: string;
    imagePath?: string;
    videoPath?: string;
    overlayPath?: string;
    description?: string;
    transition?: string;
  };
  narrationContent?: string;
}

export interface ContentAwareTimeline {
  events: ContentAwareTimelineEvent[];
  totalDuration: number;
  audioCollection: SegmentedAudioCollection;
  metadata: {
    createdAt: string;
    method: 'content-aware-segmented';
    segmentCount: number;
    transitionDuration: number;
  };
}

export interface TimelinePlannerConfig {
  sessionId: string;
  sessionDir: string;
  transitionDuration: number; // Duration for transitions in seconds
  outputFormat: string; // e.g., 'ps_mNLd3DCJ'
}

export class ContentAwareTimelinePlanner {
  private config: TimelinePlannerConfig;

  constructor(config: TimelinePlannerConfig) {
    this.config = config;
  }

  async createTimeline(audioCollection: SegmentedAudioCollection): Promise<ContentAwareTimeline> {
    console.log(chalk.cyan('⏱️  Creating content-aware timeline...'));
    console.log(chalk.gray(`  Segments: ${audioCollection.segments.length}`));
    console.log(chalk.gray(`  Total duration: ${audioCollection.totalDuration.toFixed(1)}s`));

    // Load media manifest for content mapping
    const mediaManifest = await this.loadMediaManifest();
    
    // Load slide information
    const slideInfo = await this.loadSlideInfo();

    const events: ContentAwareTimelineEvent[] = [];
    let currentTime = 0;

    for (let i = 0; i < audioCollection.segments.length; i++) {
      const segment = audioCollection.segments[i];
      
      // Create content events (may be multiple for AI images)
      const contentEvents = await this.createContentEvent(segment, currentTime, mediaManifest, slideInfo);
      events.push(...contentEvents);
      
      currentTime += segment.duration;

      // Add transition between segments (except for the last one)
      if (i < audioCollection.segments.length - 1) {
        const transitionEvent = this.createTransitionEvent(currentTime, i + 1);
        events.push(transitionEvent);
        currentTime += this.config.transitionDuration;
      }
    }

    const timeline: ContentAwareTimeline = {
      events,
      totalDuration: currentTime,
      audioCollection,
      metadata: {
        createdAt: new Date().toISOString(),
        method: 'content-aware-segmented',
        segmentCount: audioCollection.segments.length,
        transitionDuration: this.config.transitionDuration
      }
    };

    console.log(chalk.green('✅ Content-aware timeline created!'));
    console.log(chalk.gray(`  Events: ${events.length}`));
    console.log(chalk.gray(`  Final duration: ${currentTime.toFixed(1)}s`));

    return timeline;
  }

  private async createContentEvent(
    segment: AudioSegment,
    startTime: number,
    mediaManifest: any,
    slideInfo: any
  ): Promise<ContentAwareTimelineEvent[]> {
    const slideNumber = typeof segment.contentId === 'number' ? segment.contentId : parseInt(segment.contentId.toString());
    const events: ContentAwareTimelineEvent[] = [];

    // Check for AI video first - videos take full duration
    const aiVideo = mediaManifest?.videos?.find((vid: any) => vid.slide === slideNumber);
    if (aiVideo && segment.contentType === 'ai-video') {
      events.push({
        id: `ai-video-${slideNumber}-${startTime.toFixed(1)}`,
        startTime,
        endTime: startTime + segment.duration,
        duration: segment.duration,
        type: 'ai-video',
        audioSegment: segment,
        content: {
          slideNumber,
          videoPath: path.join(this.config.sessionDir, 'stage-06-ai-media/videos', aiVideo.file),
          description: aiVideo.purpose || `AI video for slide ${slideNumber}`,
          transition: 'fade'
        },
        narrationContent: this.truncateNarration(segment.narrationText, 80)
      });
    } else {
      // Check for AI image - create separate slide and AI image events
      const aiImage = mediaManifest?.images?.find((img: any) => img.slide === slideNumber);
      
      if (aiImage) {
        // Split the segment: 20% for slide, 80% for AI image
        const slideDuration = segment.duration * 0.2;
        const imageDuration = segment.duration * 0.8;
        
        // First: Slide event
        events.push({
          id: `slide-${slideNumber}`,
          startTime,
          endTime: startTime + slideDuration,
          duration: slideDuration,
          type: 'slide',
          audioSegment: {
            ...segment,
            duration: slideDuration
          },
          content: {
            slideNumber,
            slidePath: this.getSlideImagePath(slideNumber),
            description: `Slide ${slideNumber}`,
            transition: 'fade'
          },
          narrationContent: this.truncateNarration(segment.narrationText, 80)
        });

        // Second: AI image event (full-screen)
        events.push({
          id: `ai-image-${slideNumber}`,
          startTime: startTime + slideDuration,
          endTime: startTime + segment.duration,
          duration: imageDuration,
          type: 'ai-image',
          audioSegment: {
            ...segment,
            startTime: startTime + slideDuration,
            duration: imageDuration
          },
          content: {
            imagePath: path.join(this.config.sessionDir, 'stage-06-ai-media/images', aiImage.file),
            description: aiImage.purpose || `AI generated image for slide ${slideNumber}`,
            transition: 'dissolve'
          },
          narrationContent: this.truncateNarration(segment.narrationText, 80)
        });
      } else {
        // Regular slide - full duration
        events.push({
          id: `slide-${slideNumber}`,
          startTime,
          endTime: startTime + segment.duration,
          duration: segment.duration,
          type: 'slide',
          audioSegment: segment,
          content: {
            slideNumber,
            slidePath: this.getSlideImagePath(slideNumber),
            description: `Slide ${slideNumber}`,
            transition: 'fade'
          },
          narrationContent: this.truncateNarration(segment.narrationText, 80)
        });
      }
    }

    return events;
  }

  private createTransitionEvent(startTime: number, transitionNumber: number): ContentAwareTimelineEvent {
    return {
      id: `transition-${transitionNumber}-${startTime.toFixed(1)}`,
      startTime,
      endTime: startTime + this.config.transitionDuration,
      duration: this.config.transitionDuration,
      type: 'transition',
      content: {
        transition: 'dissolve'
      }
    };
  }

  private getSlideImagePath(slideNumber: number): string {
    // Return path to the enhanced slide image
    return path.join(process.cwd(), `output-${this.config.sessionId}`, 'public', `Slide${slideNumber}.png`);
  }

  private truncateNarration(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
  }

  private async loadMediaManifest(): Promise<any> {
    try {
      const manifestPath = path.join(this.config.sessionDir, 'stage-06-ai-media/media-manifest.json');
      const content = await fs.readFile(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(chalk.yellow('  ⚠️  Could not load media manifest'));
      return { images: [], videos: [] };
    }
  }

  private async loadSlideInfo(): Promise<any> {
    try {
      // Try to load slide information from various possible locations
      const possiblePaths = [
        path.join(this.config.sessionDir, 'stage-02-images/output.json'),
        path.join(this.config.sessionDir, 'stage-04-enhanced-ppt/output.json')
      ];

      for (const slidePath of possiblePaths) {
        try {
          const content = await fs.readFile(slidePath, 'utf-8');
          return JSON.parse(content);
        } catch (e) {
          continue;
        }
      }
      
      console.warn(chalk.yellow('  ⚠️  Could not load slide information'));
      return {};
    } catch (error) {
      return {};
    }
  }

  async saveTimeline(timeline: ContentAwareTimeline): Promise<string> {
    const outputDir = path.join(this.config.sessionDir, 'stage-10-content-aware-timeline');
    await fs.mkdir(outputDir, { recursive: true });

    const timelineOutputPath = path.join(outputDir, 'timeline.json');
    await fs.writeFile(timelineOutputPath, JSON.stringify(timeline, null, 2));

    // Also create a simplified timeline for compatibility
    const simplifiedTimeline = {
      events: timeline.events.map(event => ({
        id: event.id,
        startTime: event.startTime,
        endTime: event.endTime,
        duration: event.duration,
        type: event.type,
        content: event.content,
        narrationContent: event.narrationContent,
        audioFile: event.audioSegment?.audioFile
      })),
      totalDuration: timeline.totalDuration,
      metadata: timeline.metadata
    };

    const simplifiedPath = path.join(outputDir, 'timeline-simplified.json');
    await fs.writeFile(simplifiedPath, JSON.stringify(simplifiedTimeline, null, 2));

    console.log(chalk.green(`  ✓ Timeline saved to ${timelineOutputPath}`));
    console.log(chalk.gray(`  ✓ Simplified version: ${simplifiedPath}`));

    return timelineOutputPath;
  }

  displayTimelineOverview(timeline: ContentAwareTimeline): void {
    console.log(chalk.yellow('\n📊 Timeline Overview:'));
    console.log(chalk.gray('─'.repeat(80)));

    for (const event of timeline.events) {
      if (event.type !== 'transition') {
        const start = event.startTime.toFixed(1).padStart(6);
        const end = event.endTime.toFixed(1).padStart(6);
        const duration = event.duration.toFixed(1).padStart(5);
        const type = event.type.padEnd(18);
        const audioFile = event.audioSegment?.audioFile ? path.basename(event.audioSegment.audioFile) : 'none';
        
        console.log(chalk.gray(`  ${start}s-${end}s (${duration}s) ${type} | ${audioFile}`));
        
        if (event.narrationContent) {
          console.log(chalk.dim(`    "${event.narrationContent}"`));
        }
      }
    }
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white(`  Total: ${timeline.totalDuration.toFixed(1)}s | Segments: ${timeline.audioCollection.segments.length} | Events: ${timeline.events.length}`));
  }
}
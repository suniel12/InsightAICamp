import { SegmentedAudioCollection } from '../../types/pipeline.types';
import { ContentAwareTimeline, ContentAwareTimelineEvent } from '../timeline/planner';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import * as path from 'path';
import * as fs from 'fs/promises';
import chalk from 'chalk';

export interface SegmentedAssemblyConfig {
  format: 'mp4' | 'webm';
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
}

export interface SegmentedAssemblyInput {
  timeline: ContentAwareTimeline;
  slideImages: string[];
  aiVideos?: any[];
  aiImages?: string[];
}

export class SegmentedAssemblyStage {
  private config: SegmentedAssemblyConfig;
  private outputDir: string;

  constructor(config: SegmentedAssemblyConfig) {
    this.config = config;
    this.outputDir = './output/video-output';
  }

  async assemble(input: SegmentedAssemblyInput): Promise<string> {
    console.log(chalk.cyan('🎬 Assembling video with segmented audio...'));
    console.log(chalk.gray(`  Timeline events: ${input.timeline.events.length}`));
    console.log(chalk.gray(`  Audio segments: ${input.timeline.audioCollection.segments.length}`));
    console.log(chalk.gray(`  Total duration: ${input.timeline.totalDuration.toFixed(1)}s`));
    
    await this.ensureOutputDir();
    
    // Copy all media files to public directory
    await this.copyMediaFiles(input);
    
    // Create segmented Remotion composition
    const compositionPath = await this.createSegmentedComposition(input);
    
    // Bundle the composition
    const bundleLocation = await this.bundleComposition(compositionPath);
    
    // Render the final video
    const outputPath = await this.renderVideo(bundleLocation, input);
    
    console.log(chalk.green(`  ✅ Video assembled: ${outputPath}`));
    
    return outputPath;
  }

  private async createSegmentedComposition(input: SegmentedAssemblyInput): Promise<string> {
    const { timeline } = input;
    
    // Convert timeline events to Remotion sequences
    const sequences: string[] = [];
    const audioSequences: string[] = [];
    
    const totalDuration = timeline.totalDuration;
    const totalFrames = Math.ceil(totalDuration * this.config.fps);

    console.log(chalk.yellow('  🔄 Creating segmented composition...'));
    console.log(chalk.gray(`    Total frames: ${totalFrames} at ${this.config.fps}fps`));

    // Process each timeline event
    for (const event of timeline.events) {
      if (event.type === 'transition') continue;

      const startFrame = Math.floor(event.startTime * this.config.fps);
      const durationFrames = Math.ceil(event.duration * this.config.fps);
      
      console.log(chalk.gray(`    Event: ${event.type} | Frames: ${startFrame}-${startFrame + durationFrames} (${durationFrames})`));

      // Create visual sequence
      const visualSequence = this.createVisualSequence(event, startFrame, durationFrames);
      sequences.push(visualSequence);

      // Create corresponding audio sequence if audio segment exists
      if (event.audioSegment?.audioFile) {
        const audioFileName = path.basename(event.audioSegment.audioFile);
        const audioSequence = this.createAudioSequence(event, startFrame, durationFrames, audioFileName);
        audioSequences.push(audioSequence);
      }
    }

    // Generate the complete Remotion composition with segmented audio
    const compositionCode = this.generateCompositionCode(sequences, audioSequences, totalFrames);
    
    const compositionPath = path.join(this.outputDir, 'SegmentedComposition.tsx');
    await fs.writeFile(compositionPath, compositionCode);
    
    console.log(chalk.green(`  ✓ Segmented composition created: ${compositionPath}`));
    
    return compositionPath;
  }

  private createVisualSequence(event: ContentAwareTimelineEvent, startFrame: number, durationFrames: number): string {
    const { content } = event;
    
    switch (event.type) {
      case 'slide':
        return `
      {/* Slide ${content.slideNumber} */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <SlideDisplay 
          src={staticFile('slide_${content.slideNumber}.png')}
          duration={${durationFrames}}
          transition="${content.transition || 'fade'}"
        />
      </Sequence>`;

      case 'slide-with-overlay':
        return `
      {/* Slide ${content.slideNumber} with overlay */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <SlideWithOverlay 
          slideSrc={staticFile('slide_${content.slideNumber}.png')}
          overlaySrc={staticFile('overlay_${content.slideNumber}.png')}
          duration={${durationFrames}}
          transition="${content.transition || 'fade'}"
        />
      </Sequence>`;

      case 'ai-video':
        return `
      {/* AI Video for slide ${content.slideNumber} */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <AIVideoClip 
          src={staticFile('video_${content.slideNumber}.mp4')}
          duration={${durationFrames}}
          description="${content.description || ''}"
          transition="${content.transition || 'fade'}"
        />
      </Sequence>`;

      case 'ai-image':
        // For ai-image events, the content has imagePath instead of slideNumber
        const aiImageFileName = content.imagePath ? path.basename(content.imagePath) : `ai_image_${content.slideNumber || 'unknown'}.png`;
        return `
      {/* AI Generated Image */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <AIImageDisplay 
          src={staticFile('${aiImageFileName}')}
          duration={${durationFrames}}
          description="${content.description || ''}"
          transition="${content.transition || 'dissolve'}"
        />
      </Sequence>`;

      default:
        return `
      {/* Default content */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <div>Unknown content type: ${event.type}</div>
      </Sequence>`;
    }
  }

  private createAudioSequence(event: ContentAwareTimelineEvent, startFrame: number, durationFrames: number, audioFileName: string): string {
    return `
      {/* Audio for ${event.id} */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <Audio src={staticFile('${audioFileName}')} />
      </Sequence>`;
  }

  private generateCompositionCode(sequences: string[], audioSequences: string[], totalFrames: number): string {
    return `
import React from 'react';
import {
  Composition,
  Sequence,
  Audio,
  Video,
  Img,
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  staticFile,
} from 'remotion';

// Enhanced slide component with smooth transitions
const SlideDisplay = ({ src, duration, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Smooth fade in/out
  const fadeFrames = fps * 0.3; // 0.3 second fade
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Subtle Ken Burns effect (very minimal zoom)
  const scale = interpolate(
    frame,
    [0, duration],
    [1, 1.02], // Only 2% zoom over entire duration
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity,
          transform: \`scale(\${scale})\`,
        }}
      >
        <Img 
          src={src} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain' 
          }} 
        />
      </div>
    </AbsoluteFill>
  );
};

// Slide with AI overlay component
const SlideWithOverlay = ({ slideSrc, overlaySrc, duration, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const fadeFrames = fps * 0.3;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Overlay animation - fade in after slide is established
  const overlayStart = fps * 1.0; // Start overlay after 1 second
  const overlayOpacity = interpolate(
    frame,
    [0, overlayStart, overlayStart + fadeFrames, duration - fadeFrames, duration],
    [0, 0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Base slide */}
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity,
        }}
      >
        <Img 
          src={slideSrc} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain' 
          }} 
        />
      </div>
      
      {/* AI overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '30%',
          height: '30%',
          opacity: overlayOpacity,
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <Img 
          src={overlaySrc} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </div>
    </AbsoluteFill>
  );
};

// AI Video component
const AIVideoClip = ({ src, duration, description, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const fadeFrames = fps * 0.5;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity,
        }}
      >
        <Video 
          src={src} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain' 
          }} 
        />
      </div>
    </AbsoluteFill>
  );
};

// AI Image display component
const AIImageDisplay = ({ src, duration, description, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const fadeFrames = fps * 0.4;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Slow zoom effect
  const scale = interpolate(
    frame,
    [0, duration],
    [1, 1.1],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity,
          transform: \`scale(\${scale})\`,
        }}
      >
        <Img 
          src={src} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain' 
          }} 
        />
      </div>
    </AbsoluteFill>
  );
};

// Main composition with segmented audio
const SegmentedVideoComposition = () => {
  return (
    <AbsoluteFill>
      {/* Visual sequences */}
      ${sequences.join('')}
      
      {/* Segmented audio sequences */}
      ${audioSequences.join('')}
    </AbsoluteFill>
  );
};

export default SegmentedVideoComposition;

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SegmentedVideo"
        component={SegmentedVideoComposition}
        durationInFrames={${totalFrames}}
        fps={${this.config.fps}}
        width={${this.getResolutionWidth()}}
        height={${this.getResolutionHeight()}}
      />
    </>
  );
};

// Register the root composition
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);
`;
  }

  private getResolutionWidth(): number {
    switch (this.config.resolution) {
      case '720p': return 1280;
      case '1080p': return 1920;
      case '4k': return 3840;
      default: return 1920;
    }
  }

  private getResolutionHeight(): number {
    switch (this.config.resolution) {
      case '720p': return 720;
      case '1080p': return 1080;
      case '4k': return 2160;
      default: return 1080;
    }
  }

  private async copyMediaFiles(input: SegmentedAssemblyInput): Promise<void> {
    console.log(chalk.yellow('  📁 Copying media files...'));
    
    const publicDir = path.join(this.outputDir, 'public');
    await fs.mkdir(publicDir, { recursive: true });

    // Copy slide images
    for (const slideImage of input.slideImages) {
      if (await this.fileExists(slideImage)) {
        const fileName = `slide_${input.slideImages.indexOf(slideImage) + 1}.png`;
        const destPath = path.join(publicDir, fileName);
        await fs.copyFile(slideImage, destPath);
        console.log(chalk.gray(`    ✓ Slide: ${fileName}`));
      }
    }

    // Copy audio segments
    for (const segment of input.timeline.audioCollection.segments) {
      if (segment.audioFile && await this.fileExists(segment.audioFile)) {
        const fileName = path.basename(segment.audioFile);
        const destPath = path.join(publicDir, fileName);
        await fs.copyFile(segment.audioFile, destPath);
        console.log(chalk.gray(`    ✓ Audio: ${fileName}`));
      }
    }

    // Copy AI images from timeline events
    for (const event of input.timeline.events) {
      if (event.type === 'ai-image' && event.content.imagePath) {
        if (await this.fileExists(event.content.imagePath)) {
          const fileName = path.basename(event.content.imagePath);
          const destPath = path.join(publicDir, fileName);
          await fs.copyFile(event.content.imagePath, destPath);
          console.log(chalk.gray(`    ✓ AI Image: ${fileName}`));
        }
      }
    }

    // Copy AI videos and images if they exist
    if (input.aiVideos) {
      for (const video of input.aiVideos) {
        if (video.url && await this.fileExists(video.url)) {
          const fileName = `video_${video.slideNumber}.mp4`;
          const destPath = path.join(publicDir, fileName);
          await fs.copyFile(video.url, destPath);
          console.log(chalk.gray(`    ✓ Video: ${fileName}`));
        }
      }
    }

    if (input.aiImages) {
      for (let i = 0; i < input.aiImages.length; i++) {
        const imagePath = input.aiImages[i];
        if (await this.fileExists(imagePath)) {
          const fileName = `overlay_${i + 1}.png`;
          const destPath = path.join(publicDir, fileName);
          await fs.copyFile(imagePath, destPath);
          console.log(chalk.gray(`    ✓ Overlay: ${fileName}`));
        }
      }
    }

    console.log(chalk.green('  ✅ Media files copied to public directory'));
  }

  private async bundleComposition(compositionPath: string): Promise<string> {
    console.log(chalk.yellow('  📦 Bundling composition...'));
    
    const bundleLocation = await bundle({
      entryPoint: compositionPath,
      publicDir: path.join(this.outputDir, 'public'),
      webpackOverride: (config) => {
        return {
          ...config,
          module: {
            ...config.module,
            rules: [
              ...(config.module?.rules ?? []),
              {
                test: /\.(png|jpg|jpeg|gif|mp4|webm|mp3|wav)$/,
                type: 'asset/resource',
              },
            ],
          },
        };
      },
    });
    
    console.log(chalk.green(`  ✓ Bundle created: ${bundleLocation}`));
    return bundleLocation;
  }

  private async renderVideo(bundleLocation: string, input: SegmentedAssemblyInput): Promise<string> {
    console.log(chalk.yellow('  🎬 Rendering final video...'));
    
    const outputPath = path.join(
      this.outputDir,
      `segmented_video_${new Date().toISOString().replace(/[:.]/g, '-')}.${this.config.format}`
    );

    await renderMedia({
      composition: await selectComposition({
        serveUrl: bundleLocation,
        id: 'SegmentedVideo',
      }),
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      codec: 'h264',
    });

    console.log(chalk.green(`  ✅ Video rendered: ${outputPath}`));
    return outputPath;
  }

  private async ensureOutputDir(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'public'), { recursive: true });
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
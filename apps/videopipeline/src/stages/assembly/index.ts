import { AudioFile, GeneratedVideo, NarrationScript } from '../../types/pipeline.types';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import * as path from 'path';
import * as fs from 'fs/promises';

interface AssemblyConfig {
  format: 'mp4' | 'webm' | 'interactive';
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
}

interface AssemblyInput {
  slides: any[];
  audio: AudioFile[];
  videos: GeneratedVideo[];
  narrations: NarrationScript[];
}

export class AssemblyStage {
  private config: AssemblyConfig;
  private outputDir: string;

  constructor(config: AssemblyConfig) {
    this.config = config;
    this.outputDir = './output/video-output';
  }

  async assemble(input: AssemblyInput): Promise<string> {
    await this.ensureOutputDir();
    
    // Copy slide images to output directory for Remotion access
    await this.copySlideImages(input.slides);
    
    // Create Remotion composition
    const compositionPath = await this.createComposition(input);
    
    // Bundle the composition
    const bundleLocation = await this.bundleComposition(compositionPath);
    
    // Render the final video
    const outputPath = await this.renderVideo(bundleLocation, input);
    
    // Optional: Add post-processing
    await this.postProcess(outputPath);
    
    return outputPath;
  }

  private async createComposition(input: AssemblyInput): Promise<string> {
    // Pre-calculate all the frame positions
    let currentFrame = 90; // Opening title (3 seconds at 30fps)
    const sequences: string[] = [];
    
    // Generate sequences for each slide
    input.slides.forEach((slide, index) => {
      const audioFile = input.audio.find(a => a.slideNumber === slide.number);
      const videoFile = input.videos.find(v => v.slideNumber === slide.number);
      const duration = audioFile ? Math.ceil(audioFile.duration * 30) : 150; // frames
      
      // Add audio if available
      if (audioFile) {
        sequences.push(`
      <Sequence from={${currentFrame}} durationInFrames={${duration}}>
        <Audio src="${audioFile.url}" />
      </Sequence>`);
      }
      
      // Add video or slide
      if (videoFile) {
        const videoDuration = Math.min(videoFile.duration * 30, duration);
        sequences.push(`
      <Sequence from={${currentFrame}} durationInFrames={${videoDuration}}>
        <AIVideo src="${videoFile.url}" duration={${videoDuration}} />
      </Sequence>`);
        
        // Show slide for remaining duration
        if (videoDuration < duration) {
          sequences.push(`
      <Sequence from={${currentFrame + videoDuration}} durationInFrames={${duration - videoDuration}}>
        <Slide src={staticFile('slide_${slide.number}.png')} duration={${duration - videoDuration}} />
      </Sequence>`);
        }
      } else {
        sequences.push(`
      <Sequence from={${currentFrame}} durationInFrames={${duration}}>
        <Slide src={staticFile('slide_${slide.number}.png')} duration={${duration}} />
      </Sequence>`);
      }
      
      currentFrame += duration;
    });

    // Generate a Remotion composition dynamically based on input
    const compositionCode = `
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

// Slide component with transitions (no zoom)
const Slide = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Fade in/out transitions
  const opacity = interpolate(
    frame,
    [0, fps * 0.5, duration - fps * 0.5, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // No zoom - keep scale at 1
  const scale = 1;
  
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
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    </AbsoluteFill>
  );
};

// AI Video component with smooth transitions
const AIVideo = ({ src, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Smooth fade transition
  const opacity = interpolate(
    frame,
    [0, fps * 0.3, duration - fps * 0.3, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity }}>
      <Video src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </AbsoluteFill>
  );
};

// Title card for sections (no zoom)
const TitleCard = ({ title, subtitle, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // No zoom animation - keep scale at 1
  const titleScale = 1;
  
  const opacity = interpolate(
    frame,
    [0, fps * 0.5, duration - fps * 0.5, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: 'bold',
          color: '#fff',
          transform: \`scale(\${titleScale})\`,
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 40, color: '#aaa', textAlign: 'center' }}>{subtitle}</p>
      )}
    </AbsoluteFill>
  );
};

// Main composition
export const CourseVideo = ({ slides, audio, videos }) => {
  return (
    <>
      {/* Opening title */}
      <Sequence from={0} durationInFrames={90}>
        <TitleCard
          title="${input.slides[0]?.title || 'Course Title'}"
          subtitle="Professional Training"
          duration={90}
        />
      </Sequence>
      
      {/* Main content */}
      ${sequences.join('')}
      
      {/* Closing */}
      <Sequence from={${currentFrame}} durationInFrames={90}>
        <TitleCard
          title="Thank You"
          subtitle="Continue Learning"
          duration={90}
        />
      </Sequence>
    </>
  );
};

// Export composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="CourseVideo"
      component={CourseVideo}
      durationInFrames={${currentFrame + 90}}
      fps={${this.config.fps}}
      width={${this.getWidth()}}
      height={${this.getHeight()}}
      defaultProps={{
        slides: ${JSON.stringify(input.slides)},
        audio: ${JSON.stringify(input.audio)},
        videos: ${JSON.stringify(input.videos)},
      }}
    />
  );
};

// Register the root
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);
`;

    // Save composition to file
    const compositionPath = path.join(this.outputDir, 'composition.tsx');
    await fs.writeFile(compositionPath, compositionCode);
    
    return compositionPath;
  }

  private async bundleComposition(compositionPath: string): Promise<string> {
    // Bundle the Remotion composition
    const bundleLocation = await bundle({
      entryPoint: compositionPath,
      publicDir: path.join(this.outputDir, 'public'),
      // Use webpack config optimized for video rendering
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
    
    return bundleLocation;
  }

  private async renderVideo(bundleLocation: string, input: AssemblyInput): Promise<string> {
    const outputPath = path.join(this.outputDir, `course_${Date.now()}.${this.config.format}`);
    
    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CourseVideo',
      inputProps: {
        slides: input.slides,
        audio: input.audio,
        videos: input.videos,
      },
    });
    
    // Render with optimal settings
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      codec: this.getCodec(),
      // Best practice: Use CRF for quality-based encoding
      crf: this.config.resolution === '4k' ? 18 : 23,
      audioBitrate: '128k',
      // Parallel rendering for speed
      concurrency: 4, // Reduced for testing
      onProgress: (progress) => {
        console.log(`Rendering: ${Math.round(progress.progress * 100)}%`);
      },
    });
    
    return outputPath;
  }

  private async postProcess(videoPath: string): Promise<void> {
    // Optional post-processing steps
    
    // 1. Add captions/subtitles if available
    await this.addCaptions(videoPath);
    
    // 2. Optimize file size
    await this.optimizeVideo(videoPath);
    
    // 3. Generate preview thumbnail
    await this.generateThumbnail(videoPath);
    
    // 4. Create adaptive bitrate versions for streaming
    if (this.config.format === 'interactive') {
      await this.createAdaptiveVersions(videoPath);
    }
  }

  private async addCaptions(videoPath: string): Promise<void> {
    // In production, use ffmpeg to add captions
    // For now, this is a placeholder
    console.log('Adding captions to video...');
  }

  private async optimizeVideo(videoPath: string): Promise<void> {
    // Use ffmpeg for optimization
    console.log('Optimizing video file size...');
  }

  private async generateThumbnail(videoPath: string): Promise<void> {
    // Extract frame at 10% of video duration as thumbnail
    console.log('Generating video thumbnail...');
  }

  private async createAdaptiveVersions(videoPath: string): Promise<void> {
    // Create HLS or DASH versions for adaptive streaming
    console.log('Creating adaptive bitrate versions...');
  }

  private calculateTotalFrames(input: AssemblyInput): number {
    let totalFrames = 90; // Opening (3 seconds)
    
    input.audio.forEach(audio => {
      totalFrames += Math.ceil(audio.duration * this.config.fps);
    });
    
    totalFrames += 90; // Closing (3 seconds)
    
    return totalFrames;
  }

  private getCodec(): string {
    switch (this.config.format) {
      case 'mp4':
        return 'h264';
      case 'webm':
        return 'vp8';
      default:
        return 'h264';
    }
  }

  private getWidth(): number {
    switch (this.config.resolution) {
      case '720p':
        return 1280;
      case '1080p':
        return 1920;
      case '4k':
        return 3840;
      default:
        return 1920;
    }
  }

  private getHeight(): number {
    switch (this.config.resolution) {
      case '720p':
        return 720;
      case '1080p':
        return 1080;
      case '4k':
        return 2160;
      default:
        return 1080;
    }
  }

  private getVideoBitrate(): string {
    switch (this.config.resolution) {
      case '720p':
        return '2500k';
      case '1080p':
        return '5000k';
      case '4k':
        return '15000k';
      default:
        return '5000k';
    }
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  private async copySlideImages(slides: any[]): Promise<void> {
    const publicDir = path.join(this.outputDir, 'public');
    await fs.mkdir(publicDir, { recursive: true });
    
    for (const slide of slides) {
      if (slide.originalImageUrl) {
        const sourcePath = slide.originalImageUrl;
        const destPath = path.join(publicDir, `slide_${slide.number}.png`);
        
        try {
          await fs.copyFile(sourcePath, destPath);
          console.log(`Copied slide ${slide.number} image to public directory`);
        } catch (error) {
          console.error(`Failed to copy slide ${slide.number} image:`, error);
        }
      }
    }
  }

}
import { AudioFile, GeneratedVideo } from '../../types/pipeline.types';
import { Timeline, TimelineEvent } from '../timeline/planner';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import * as path from 'path';
import * as fs from 'fs/promises';

interface EnhancedAssemblyConfig {
  format: 'mp4' | 'webm';
  resolution: '720p' | '1080p' | '4k';
  fps: 24 | 30 | 60;
}

interface EnhancedAssemblyInput {
  timeline: Timeline;
  slideImages: string[];
  narrationAudio: AudioFile;
  aiVideos: GeneratedVideo[];
  aiImages?: string[];
}

export class EnhancedAssemblyStage {
  private config: EnhancedAssemblyConfig;
  private outputDir: string;

  constructor(config: EnhancedAssemblyConfig) {
    this.config = config;
    this.outputDir = './output/video-output';
  }

  async assemble(input: EnhancedAssemblyInput): Promise<string> {
    console.log('Assembling final video with mixed media...');
    
    await this.ensureOutputDir();
    
    // Copy all media to public directory
    await this.copyMediaFiles(input);
    
    // Create enhanced Remotion composition
    const compositionPath = await this.createEnhancedComposition(input);
    
    // Bundle the composition
    const bundleLocation = await this.bundleComposition(compositionPath);
    
    // Render the final video
    const outputPath = await this.renderVideo(bundleLocation, input);
    
    console.log(`  Video assembled: ${outputPath}`);
    
    return outputPath;
  }

  private async createEnhancedComposition(input: EnhancedAssemblyInput): Promise<string> {
    const { timeline, narrationAudio } = input;
    
    // Convert timeline events to Remotion sequences
    const sequences: string[] = [];
    let frameOffset = 0;
    
    // Add continuous audio track
    const totalDuration = timeline.totalDuration && !isNaN(timeline.totalDuration) 
      ? timeline.totalDuration 
      : 300; // Default 5 minutes
    const totalFrames = Math.ceil(totalDuration * this.config.fps);
    sequences.push(`
      {/* Continuous narration audio */}
      <Sequence from={0} durationInFrames={${totalFrames}}>
        <Audio src={staticFile('narration.mp3')} />
      </Sequence>`);
    
    // Keep track of AI image counter for proper file naming
    let aiImageCounter = 0;
    
    // Process each timeline event
    for (const event of timeline.events) {
      const startFrame = Math.floor((event.startTime || 0) * this.config.fps);
      const durationFrames = Math.ceil((event.duration || 1) * this.config.fps);
      
      switch (event.type) {
        case 'slide':
          sequences.push(`
      {/* Slide ${event.content.slideNumber} */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <SlideDisplay 
          src={staticFile('slide_${event.content.slideNumber}.png')}
          duration={${durationFrames}}
          transition="${event.content.transition}"
        />
      </Sequence>`);
          break;
          
        case 'ai-video':
          sequences.push(`
      {/* AI Video for slide ${event.content.slideNumber} */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <AIVideoClip 
          src={staticFile('video_${event.content.slideNumber}.mp4')}
          duration={${durationFrames}}
          description="${event.content.description}"
          transition="${event.content.transition}"
        />
      </Sequence>`);
          break;
          
        case 'ai-image':
          aiImageCounter++;
          sequences.push(`
      {/* AI Generated Image ${aiImageCounter} */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <AIImageDisplay 
          src={staticFile('ai_image_${aiImageCounter}.png')}
          duration={${durationFrames}}
          description="${event.content.description || ''}"
          transition="${event.content.transition || 'dissolve'}"
        />
      </Sequence>`);
          break;
          
        case 'slide-with-overlay':
          sequences.push(`
      {/* Slide ${event.content.slideNumber} with AI image overlay */}
      <Sequence from={${startFrame}} durationInFrames={${durationFrames}}>
        <SlideWithOverlay 
          slideSrc={staticFile('slide_${event.content.slideNumber}.png')}
          overlaySrc={staticFile('overlay_${event.content.slideNumber}.png')}
          duration={${durationFrames}}
          transition="${event.content.transition}"
        />
      </Sequence>`);
          break;
          
        case 'transition':
          // Transitions are handled within the components
          break;
      }
    }

    // Generate the complete Remotion composition
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

// Enhanced slide component with smooth transitions
const SlideDisplay = ({ src, duration, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Smooth fade in/out
  const fadeFrames = fps * 0.5; // 0.5 second fade
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
    [1, 1.05], // Only 5% zoom over entire duration
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
          transition: 'transform 0.1s ease-out',
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

// AI Image component for full-screen display
const AIImageDisplay = ({ src, duration, description, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Smooth dissolve transition
  const fadeFrames = transition === 'dissolve' ? fps * 0.7 : fps * 0.5;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Very subtle zoom for visual interest
  const scale = interpolate(
    frame,
    [0, duration],
    [1, 1.03], // Only 3% zoom
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

// AI Video component with smooth transitions
const AIVideoClip = ({ src, duration, description, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Dissolve transition
  const fadeFrames = transition === 'dissolve' ? fps * 0.7 : fps * 0.3;
  const opacity = interpolate(
    frame,
    [0, fadeFrames, duration - fadeFrames, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <div style={{ width: '100%', height: '100%', opacity }}>
        <Video 
          src={src} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
        {/* Optional: Add subtle caption for first 2 seconds */}
        {frame < fps * 2 && description && (
          <div
            style={{
              position: 'absolute',
              bottom: 50,
              left: 50,
              right: 50,
              padding: '10px 20px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 8,
              opacity: interpolate(frame, [0, fps * 0.3, fps * 1.7, fps * 2], [0, 1, 1, 0]),
            }}
          >
            <p style={{ color: '#fff', fontSize: 18, margin: 0 }}>{description}</p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Slide with AI image overlay
const SlideWithOverlay = ({ slideSrc, overlaySrc, duration, transition }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Base slide opacity
  const opacity = interpolate(
    frame,
    [0, fps * 0.5, duration - fps * 0.5, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Overlay appears after 1 second
  const overlayOpacity = interpolate(
    frame,
    [fps, fps * 1.5, duration - fps * 0.5, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Overlay subtle animation
  const overlayScale = spring({
    frame: frame - fps,
    fps,
    from: 0.8,
    to: 1,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Base slide */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
      
      {/* AI image overlay */}
      {overlaySrc && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '35%',
            height: '35%',
            opacity: overlayOpacity,
            transform: \`scale(\${overlayScale})\`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            borderRadius: 8,
            overflow: 'hidden',
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
      )}
    </AbsoluteFill>
  );
};

// Main enhanced composition
export const EnhancedCourseVideo = () => {
  return (
    <>
${sequences.join('\n')}
    </>
  );
};

// Export composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="EnhancedCourseVideo"
      component={EnhancedCourseVideo}
      durationInFrames={${totalFrames}}
      fps={${this.config.fps}}
      width={${this.getWidth()}}
      height={${this.getHeight()}}
    />
  );
};

// Register the root
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);
`;

    // Save composition to file
    const compositionPath = path.join(this.outputDir, 'composition_enhanced.tsx');
    await fs.writeFile(compositionPath, compositionCode);
    
    return compositionPath;
  }

  private async copyMediaFiles(input: EnhancedAssemblyInput): Promise<void> {
    const publicDir = path.join(this.outputDir, 'public');
    await fs.mkdir(publicDir, { recursive: true });
    
    // Copy slide images
    for (let i = 0; i < input.slideImages.length; i++) {
      const sourcePath = input.slideImages[i];
      const destPath = path.join(publicDir, `slide_${i + 1}.png`);
      
      try {
        await fs.copyFile(sourcePath, destPath);
      } catch (error) {
        console.error(`Failed to copy slide ${i + 1}:`, error);
      }
    }
    
    // Copy narration audio
    if (input.narrationAudio) {
      const audioPath = path.join(publicDir, 'narration.mp3');
      await fs.copyFile(input.narrationAudio.url, audioPath);
    }
    
    // Copy AI videos
    for (const video of input.aiVideos) {
      const destPath = path.join(publicDir, `video_${video.slideNumber}.mp4`);
      await fs.copyFile(video.url, destPath);
    }
    
    // Copy AI images if any
    if (input.aiImages) {
      for (let i = 0; i < input.aiImages.length; i++) {
        const destPath = path.join(publicDir, `overlay_${i + 1}.png`);
        await fs.copyFile(input.aiImages[i], destPath);
      }
    }
  }

  private async bundleComposition(compositionPath: string): Promise<string> {
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
    
    return bundleLocation;
  }

  private async renderVideo(bundleLocation: string, input: EnhancedAssemblyInput): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(this.outputDir, `enhanced_video_${timestamp}.${this.config.format}`);
    
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'EnhancedCourseVideo',
      inputProps: {},
    });
    
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      codec: this.getCodec(),
      crf: 23,
      audioBitrate: '128k',
      concurrency: 4,
      onProgress: (progress) => {
        const percent = Math.round(progress.progress * 100);
        if (percent % 10 === 0) {
          console.log(`  Rendering: ${percent}%`);
        }
      },
    });
    
    return outputPath;
  }

  private async ensureOutputDir(): Promise<void> {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  private getCodec(): string {
    return this.config.format === 'webm' ? 'vp8' : 'h264';
  }

  private getWidth(): number {
    const widths = { '720p': 1280, '1080p': 1920, '4k': 3840 };
    return widths[this.config.resolution];
  }

  private getHeight(): number {
    const heights = { '720p': 720, '1080p': 1080, '4k': 2160 };
    return heights[this.config.resolution];
  }
}

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
          transform: `scale(${scale})`,
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
          transform: `scale(${scale})`,
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
            transform: `scale(${overlayScale})`,
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

      {/* Continuous narration audio */}
      <Sequence from={0} durationInFrames={9042}>
        <Audio src={staticFile('narration.mp3')} />
      </Sequence>

      {/* Slide 1 */}
      <Sequence from={0} durationInFrames={150}>
        <SlideDisplay 
          src={staticFile('slide_1.png')}
          duration={150}
          transition="fade"
        />
      </Sequence>

      {/* AI Generated Image 1 */}
      <Sequence from={150} durationInFrames={1171}>
        <AIImageDisplay 
          src={staticFile('ai_image_1.png')}
          duration={1171}
          description="DNA helix transitioning to data center - biological analogy"
          transition="dissolve"
        />
      </Sequence>

      {/* Slide 2 */}
      <Sequence from={1335} durationInFrames={1920}>
        <SlideDisplay 
          src={staticFile('slide_2.png')}
          duration={1920}
          transition="fade"
        />
      </Sequence>

      {/* Slide 3 */}
      <Sequence from={3269} durationInFrames={781}>
        <SlideDisplay 
          src={staticFile('slide_3.png')}
          duration={781}
          transition="fade"
        />
      </Sequence>

      {/* AI Generated Image 2 */}
      <Sequence from={4050} durationInFrames={1054}>
        <AIImageDisplay 
          src={staticFile('ai_image_2.png')}
          duration={1054}
          description="Data center components visualization"
          transition="dissolve"
        />
      </Sequence>

      {/* Slide 4 */}
      <Sequence from={5118} durationInFrames={476}>
        <SlideDisplay 
          src={staticFile('slide_4.png')}
          duration={476}
          transition="fade"
        />
      </Sequence>

      {/* AI Video for slide 4 */}
      <Sequence from={5594} durationInFrames={457}>
        <AIVideoClip 
          src={staticFile('video_4.mp4')}
          duration={457}
          description="Data Center Scale Visualization"
          transition="dissolve"
        />
      </Sequence>

      {/* Slide 4 */}
      <Sequence from={6050} durationInFrames={491}>
        <SlideDisplay 
          src={staticFile('slide_4.png')}
          duration={491}
          transition="fade"
        />
      </Sequence>

      {/* Slide 5 */}
      <Sequence from={6556} durationInFrames={494}>
        <SlideDisplay 
          src={staticFile('slide_5.png')}
          duration={494}
          transition="fade"
        />
      </Sequence>

      {/* AI Generated Image 3 */}
      <Sequence from={7050} durationInFrames={1050}>
        <AIImageDisplay 
          src={staticFile('ai_image_3.png')}
          duration={1050}
          description="Data Center Tiers visualization with shields"
          transition="dissolve"
        />
      </Sequence>

      {/* Slide 6 */}
      <Sequence from={8100} durationInFrames={942}>
        <SlideDisplay 
          src={staticFile('slide_6.png')}
          duration={942}
          transition="fade"
        />
      </Sequence>
    </>
  );
};

// Export composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="EnhancedCourseVideo"
      component={EnhancedCourseVideo}
      durationInFrames={9042}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

// Register the root
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);

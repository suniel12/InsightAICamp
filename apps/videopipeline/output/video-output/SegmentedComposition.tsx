
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

// Main composition with segmented audio
const SegmentedVideoComposition = () => {
  return (
    <AbsoluteFill>
      {/* Visual sequences */}
      
      {/* Slide 1 */}
      <Sequence from={0} durationInFrames={198}>
        <SlideDisplay 
          src={staticFile('slide_1.png')}
          duration={198}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={197} durationInFrames={792}>
        <AIImageDisplay 
          src={staticFile('slide1_img1.png')}
          duration={792}
          description="The Central Nervous System of Research"
          transition="dissolve"
        />
      </Sequence>
      {/* Slide 2 */}
      <Sequence from={1003} durationInFrames={1321}>
        <SlideDisplay 
          src={staticFile('slide_2.png')}
          duration={1321}
          transition="fade"
        />
      </Sequence>
      {/* Slide 3 */}
      <Sequence from={2339} durationInFrames={282}>
        <SlideDisplay 
          src={staticFile('slide_3.png')}
          duration={282}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={2620} durationInFrames={1126}>
        <AIImageDisplay 
          src={staticFile('slide3_img2.png')}
          duration={1126}
          description="Anatomy of a Data Center"
          transition="dissolve"
        />
      </Sequence>
      {/* AI Video for slide 4 */}
      <Sequence from={3761} durationInFrames={1511}>
        <AIVideoClip 
          src={staticFile('video_4.mp4')}
          duration={1511}
          description="Data Center Economies of Scale"
          transition="fade"
        />
      </Sequence>
      {/* Slide 5 */}
      <Sequence from={5286} durationInFrames={683}>
        <SlideDisplay 
          src={staticFile('slide_5.png')}
          duration={683}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={5968} durationInFrames={2729}>
        <AIImageDisplay 
          src={staticFile('slide5_img3.png')}
          duration={2729}
          description="The Four Tiers of Reliability"
          transition="dissolve"
        />
      </Sequence>
      
      {/* Segmented audio sequences */}
      
      {/* Audio for slide-1 */}
      <Sequence from={0} durationInFrames={198}>
        <Audio src={staticFile('segment-1-0.0.mp3')} />
      </Sequence>
      {/* Audio for ai-image-1 */}
      <Sequence from={197} durationInFrames={792}>
        <Audio src={staticFile('segment-1-0.0.mp3')} />
      </Sequence>
      {/* Audio for slide-2 */}
      <Sequence from={1003} durationInFrames={1321}>
        <Audio src={staticFile('segment-2-35.7.mp3')} />
      </Sequence>
      {/* Audio for slide-3 */}
      <Sequence from={2339} durationInFrames={282}>
        <Audio src={staticFile('segment-3-76.6.mp3')} />
      </Sequence>
      {/* Audio for ai-image-3 */}
      <Sequence from={2620} durationInFrames={1126}>
        <Audio src={staticFile('segment-3-76.6.mp3')} />
      </Sequence>
      {/* Audio for ai-video-4-125.4 */}
      <Sequence from={3761} durationInFrames={1511}>
        <Audio src={staticFile('segment-4-125.5.mp3')} />
      </Sequence>
      {/* Audio for slide-5 */}
      <Sequence from={5286} durationInFrames={683}>
        <Audio src={staticFile('segment-5-134.0.mp3')} />
      </Sequence>
      {/* Audio for ai-image-5 */}
      <Sequence from={5968} durationInFrames={2729}>
        <Audio src={staticFile('segment-5-134.0.mp3')} />
      </Sequence>
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
        durationInFrames={8697}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

// Register the root composition
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);

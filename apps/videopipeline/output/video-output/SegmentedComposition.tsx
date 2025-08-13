
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
      
      {/* AI Video: slide4_vid1.mp4 */}
      <Sequence from={0} durationInFrames={440}>
        <AIVideoClip 
          src={staticFile('slide4_vid1.mp4')}
          duration={440}
          description="Data Center Economies of Scale"
          transition="fade"
        />
      </Sequence>
      {/* Slide 1 */}
      <Sequence from={439} durationInFrames={318}>
        <SlideDisplay 
          src={staticFile('slide_1.png')}
          duration={318}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={757} durationInFrames={574}>
        <AIImageDisplay 
          src={staticFile('slide1_img1.png')}
          duration={574}
          description="The Central Nervous System of Research"
          transition="dissolve"
        />
      </Sequence>
      {/* Slide 2 */}
      <Sequence from={1330} durationInFrames={1059}>
        <SlideDisplay 
          src={staticFile('slide_2.png')}
          duration={1059}
          transition="fade"
        />
      </Sequence>
      {/* Slide 3 */}
      <Sequence from={2389} durationInFrames={971}>
        <SlideDisplay 
          src={staticFile('slide_3.png')}
          duration={971}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={3360} durationInFrames={527}>
        <AIImageDisplay 
          src={staticFile('slide3_img2.png')}
          duration={527}
          description="Anatomy of a Data Center"
          transition="dissolve"
        />
      </Sequence>
      {/* Slide 4 */}
      <Sequence from={3887} durationInFrames={1087}>
        <SlideDisplay 
          src={staticFile('slide_4.png')}
          duration={1087}
          transition="fade"
        />
      </Sequence>
      {/* Slide 5 */}
      <Sequence from={4973} durationInFrames={1464}>
        <SlideDisplay 
          src={staticFile('slide_5.png')}
          duration={1464}
          transition="fade"
        />
      </Sequence>
      {/* Slide 6 */}
      <Sequence from={6437} durationInFrames={954}>
        <SlideDisplay 
          src={staticFile('slide_6.png')}
          duration={954}
          transition="fade"
        />
      </Sequence>
      
      {/* Segmented audio sequences */}
      
      {/* Audio for segment-1-0.0 */}
      <Sequence from={0} durationInFrames={440}>
        <Audio src={staticFile('segment-1-0.0.mp3')} />
      </Sequence>
      {/* Audio for segment-2-18.7 */}
      <Sequence from={439} durationInFrames={318}>
        <Audio src={staticFile('segment-2-18.7.mp3')} />
      </Sequence>
      {/* Audio for segment-3-35.1 */}
      <Sequence from={757} durationInFrames={574}>
        <Audio src={staticFile('segment-3-35.1.mp3')} />
      </Sequence>
      {/* Audio for segment-4-50.6 */}
      <Sequence from={1330} durationInFrames={1059}>
        <Audio src={staticFile('segment-4-50.6.mp3')} />
      </Sequence>
      {/* Audio for segment-5-77.7 */}
      <Sequence from={2389} durationInFrames={971}>
        <Audio src={staticFile('segment-5-77.7.mp3')} />
      </Sequence>
      {/* Audio for segment-6-106.2 */}
      <Sequence from={3360} durationInFrames={527}>
        <Audio src={staticFile('segment-6-106.2.mp3')} />
      </Sequence>
      {/* Audio for segment-7-123.5 */}
      <Sequence from={3887} durationInFrames={1087}>
        <Audio src={staticFile('segment-7-123.5.mp3')} />
      </Sequence>
      {/* Audio for segment-8-157.5 */}
      <Sequence from={4973} durationInFrames={1464}>
        <Audio src={staticFile('segment-8-157.5.mp3')} />
      </Sequence>
      {/* Audio for segment-9-255.9 */}
      <Sequence from={6437} durationInFrames={954}>
        <Audio src={staticFile('segment-9-255.9.mp3')} />
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
        durationInFrames={7391}
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

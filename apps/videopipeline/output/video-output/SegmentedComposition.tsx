
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
      <Sequence from={0} durationInFrames={567}>
        <AIVideoClip 
          src={staticFile('slide4_vid1.mp4')}
          duration={567}
          description="Data center walkthrough"
          transition="fade"
        />
      </Sequence>
      {/* Slide 1 */}
      <Sequence from={566} durationInFrames={517}>
        <SlideDisplay 
          src={staticFile('slide_1.png')}
          duration={517}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={1083} durationInFrames={477}>
        <AIImageDisplay 
          src={staticFile('helpdesk_img1.png')}
          duration={477}
          description="Helpdesk technician perspective"
          transition="fade"
        />
      </Sequence>
      {/* Slide 2 */}
      <Sequence from={1559} durationInFrames={633}>
        <SlideDisplay 
          src={staticFile('slide_2.png')}
          duration={633}
          transition="fade"
        />
      </Sequence>
      {/* Slide 3 */}
      <Sequence from={2191} durationInFrames={678}>
        <SlideDisplay 
          src={staticFile('slide_3.png')}
          duration={678}
          transition="fade"
        />
      </Sequence>
      {/* AI Generated Image */}
      <Sequence from={2869} durationInFrames={577}>
        <AIImageDisplay 
          src={staticFile('helpdesk_img2.png')}
          duration={577}
          description="Helpdesk technician perspective"
          transition="fade"
        />
      </Sequence>
      {/* Slide 4 */}
      <Sequence from={3446} durationInFrames={712}>
        <SlideDisplay 
          src={staticFile('slide_4.png')}
          duration={712}
          transition="fade"
        />
      </Sequence>
      {/* Slide 5 */}
      <Sequence from={4158} durationInFrames={1402}>
        <SlideDisplay 
          src={staticFile('slide_5.png')}
          duration={1402}
          transition="fade"
        />
      </Sequence>
      {/* Slide 6 */}
      <Sequence from={5559} durationInFrames={741}>
        <SlideDisplay 
          src={staticFile('slide_6.png')}
          duration={741}
          transition="fade"
        />
      </Sequence>
      
      {/* Segmented audio sequences */}
      
      {/* Audio for segment-1 */}
      <Sequence from={0} durationInFrames={567}>
        <Audio src={staticFile('segment-1.mp3')} />
      </Sequence>
      {/* Audio for segment-2 */}
      <Sequence from={566} durationInFrames={517}>
        <Audio src={staticFile('segment-2.mp3')} />
      </Sequence>
      {/* Audio for segment-3 */}
      <Sequence from={1083} durationInFrames={477}>
        <Audio src={staticFile('segment-3.mp3')} />
      </Sequence>
      {/* Audio for segment-4 */}
      <Sequence from={1559} durationInFrames={633}>
        <Audio src={staticFile('segment-4.mp3')} />
      </Sequence>
      {/* Audio for segment-5 */}
      <Sequence from={2191} durationInFrames={678}>
        <Audio src={staticFile('segment-5.mp3')} />
      </Sequence>
      {/* Audio for segment-6 */}
      <Sequence from={2869} durationInFrames={577}>
        <Audio src={staticFile('segment-6.mp3')} />
      </Sequence>
      {/* Audio for segment-7 */}
      <Sequence from={3446} durationInFrames={712}>
        <Audio src={staticFile('segment-7.mp3')} />
      </Sequence>
      {/* Audio for segment-8 */}
      <Sequence from={4158} durationInFrames={1402}>
        <Audio src={staticFile('segment-8.mp3')} />
      </Sequence>
      {/* Audio for segment-9 */}
      <Sequence from={5559} durationInFrames={741}>
        <Audio src={staticFile('segment-9.mp3')} />
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
        durationInFrames={6300}
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

import { registerRoot } from 'remotion';
import React from 'react';
import {
  Composition,
  Sequence,
  Audio,
  Img,
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';

// Slide component with transitions
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
        }}
      >
        <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    </AbsoluteFill>
  );
};

// Title card for sections
const TitleCard = ({ title, subtitle, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
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

// Main composition with proper audio timing
export const CourseVideoWithAudio = () => {
  // Audio durations in seconds (from our actual audio files)
  const audioDurations = {
    slide1: 65.515,
    slide2: 69.407,
    slide3: 74.005,
    slide4: 80.509,
    slide5: 60.970
  };
  
  // Convert to frames (30 fps)
  const fps = 30;
  const frameDurations = {
    opening: 90, // 3 seconds
    slide1: Math.ceil(audioDurations.slide1 * fps),
    slide2: Math.ceil(audioDurations.slide2 * fps),
    slide3: Math.ceil(audioDurations.slide3 * fps),
    slide4: Math.ceil(audioDurations.slide4 * fps),
    slide5: Math.ceil(audioDurations.slide5 * fps),
    closing: 90 // 3 seconds
  };
  
  // Calculate start frames
  let currentFrame = 0;
  const startFrames = {
    opening: currentFrame,
    slide1: currentFrame += frameDurations.opening,
    slide2: currentFrame += frameDurations.slide1,
    slide3: currentFrame += frameDurations.slide2,
    slide4: currentFrame += frameDurations.slide3,
    slide5: currentFrame += frameDurations.slide4,
    closing: currentFrame += frameDurations.slide5
  };
  
  return (
    <>
      {/* Opening title */}
      <Sequence from={startFrames.opening} durationInFrames={frameDurations.opening}>
        <TitleCard
          title="Introduction to Data Centers"
          subtitle="The Hidden Backbone of the Digital Age"
          duration={frameDurations.opening}
        />
      </Sequence>
      
      {/* Slide 1 with audio */}
      <Sequence from={startFrames.slide1} durationInFrames={frameDurations.slide1}>
        <Audio src={staticFile('audio/slide_1_audio.mp3')} />
        <Slide src={staticFile('slide_1.png')} duration={frameDurations.slide1} />
      </Sequence>
      
      {/* Slide 2 with audio */}
      <Sequence from={startFrames.slide2} durationInFrames={frameDurations.slide2}>
        <Audio src={staticFile('audio/slide_2_audio.mp3')} />
        <Slide src={staticFile('slide_2.png')} duration={frameDurations.slide2} />
      </Sequence>
      
      {/* Slide 3 with audio */}
      <Sequence from={startFrames.slide3} durationInFrames={frameDurations.slide3}>
        <Audio src={staticFile('audio/slide_3_audio.mp3')} />
        <Slide src={staticFile('slide_3.png')} duration={frameDurations.slide3} />
      </Sequence>
      
      {/* Slide 4 with audio */}
      <Sequence from={startFrames.slide4} durationInFrames={frameDurations.slide4}>
        <Audio src={staticFile('audio/slide_4_audio.mp3')} />
        <Slide src={staticFile('slide_4.png')} duration={frameDurations.slide4} />
      </Sequence>
      
      {/* Slide 5 with audio */}
      <Sequence from={startFrames.slide5} durationInFrames={frameDurations.slide5}>
        <Audio src={staticFile('audio/slide_5_audio.mp3')} />
        <Slide src={staticFile('slide_5.png')} duration={frameDurations.slide5} />
      </Sequence>
      
      {/* Closing */}
      <Sequence from={startFrames.closing} durationInFrames={frameDurations.closing}>
        <TitleCard
          title="Thank You"
          subtitle="Continue Learning"
          duration={frameDurations.closing}
        />
      </Sequence>
    </>
  );
};

// Root component
export const RemotionRoot = () => {
  // Calculate total duration
  const totalFrames = 90 + // opening
    Math.ceil(65.515 * 30) + // slide 1
    Math.ceil(69.407 * 30) + // slide 2
    Math.ceil(74.005 * 30) + // slide 3
    Math.ceil(80.509 * 30) + // slide 4
    Math.ceil(60.970 * 30) + // slide 5
    90; // closing
    
  return (
    <Composition
      id="CourseVideoWithAudio"
      component={CourseVideoWithAudio}
      durationInFrames={totalFrames}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};

// Register the root
registerRoot(RemotionRoot);
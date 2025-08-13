
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
          transform: `scale(${scale})`,
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
          transform: `scale(${titleScale})`,
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
          title="Course Title"
          subtitle="Professional Training"
          duration={90}
        />
      </Sequence>
      
      {/* Main content */}
      
      <Sequence from={90} durationInFrames={150}>
        <Slide src={staticFile('slide_1.png')} duration={150} />
      </Sequence>
      <Sequence from={240} durationInFrames={150}>
        <Slide src={staticFile('slide_2.png')} duration={150} />
      </Sequence>
      <Sequence from={390} durationInFrames={150}>
        <Slide src={staticFile('slide_3.png')} duration={150} />
      </Sequence>
      <Sequence from={540} durationInFrames={150}>
        <Slide src={staticFile('slide_4.png')} duration={150} />
      </Sequence>
      <Sequence from={690} durationInFrames={150}>
        <Slide src={staticFile('slide_5.png')} duration={150} />
      </Sequence>
      
      {/* Closing */}
      <Sequence from={840} durationInFrames={90}>
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
      durationInFrames={930}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        slides: [{"number":1,"title":"","bullets":["Data Centers: The Hidden Backbone of the Digital Age","Discover how IT, power, and cooling equipment work together to keep our digital world running 24/7."],"speakerNotes":"","images":[{"type":"embedded","position":{"left":0,"top":1800,"width":2570400,"height":5140800}}],"originalImageUrl":"/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/output/slides/Slide1.png","enhancedImageUrl":"output/enhanced-slides/slide_1_enhanced.png"},{"number":2,"title":"","bullets":["IT Equipment","AGENDA","1","Power Equipment","2","Cooling Equipment","3","Equipment Integration","4","Review & Challenge","5"],"speakerNotes":"","images":[{"type":"embedded","position":{"left":7412400,"top":2109,"width":1731599,"height":5140182}}],"originalImageUrl":"/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/output/slides/Slide2.png","enhancedImageUrl":"output/enhanced-slides/slide_2_enhanced.png"},{"number":3,"title":"","bullets":["You’ll master the essentials of how data centers operate and keep digital services available.","Identify Key Equipment","You will spot IT, power, and cooling equipment in a real data center.","Explain Equipment Roles","You will describe how different equipment types keep data centers running.","Understand Redundancy","You will explain why backup and redundancy are crucial for reliability.","Map Equipment Locations","You will match equipment to where it’s found in the data center layout."],"speakerNotes":"","images":[{"type":"embedded","position":{"left":254212,"top":226800,"width":693975,"height":144000}}],"originalImageUrl":"/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/output/slides/Slide3.png","enhancedImageUrl":"output/enhanced-slides/slide_3_enhanced.png"},{"number":4,"title":"","bullets":["PDU","Power Distribution Unit—advanced power strip for equipment, monitors usage.","CRAC/CRAH","Air conditioning/handling units—keep server rooms cool and stable.","UPS","Uninterruptible Power Supply—battery backup for instant power during outages.","RAID","Array of disks—protects data even if one hard drive fails.","TERMS TO UNDERSTAND","Knowing these terms helps you follow how power, IT, and cooling systems work together."],"speakerNotes":"","images":[{"type":"embedded","position":{"left":8195812,"top":226800,"width":693975,"height":144000}}],"originalImageUrl":"/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/output/slides/Slide4.png","enhancedImageUrl":"output/enhanced-slides/slide_4_enhanced.png"},{"number":5,"title":"","bullets":["DATA CENTER OVERVIEW","A data center combines IT, power, and cooling systems into a reliable digital hub."],"speakerNotes":"","images":[{"type":"embedded","position":{"left":8195812,"top":226800,"width":693975,"height":144000}},{"type":"embedded","position":{"left":19781,"top":3301200,"width":9104437,"height":1843200}}],"originalImageUrl":"/Users/sunilpandey/startup/github/InsightAICamp/apps/videopipeline/output/slides/Slide5.png","enhancedImageUrl":"output/enhanced-slides/slide_5_enhanced.png"}],
        audio: [],
        videos: [],
      }}
    />
  );
};

// Register the root
import { registerRoot } from 'remotion';
registerRoot(RemotionRoot);

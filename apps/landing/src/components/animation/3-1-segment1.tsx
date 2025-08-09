import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Audio,
  staticFile,
} from 'remotion';

// Enhanced metadata system aligned with master script
const SegmentMetadata = {
  M3_1_INTRO_001: {
    id: 'M3.1_INTRO_001',
    audience: ['ALL'],
    duration: 30, // 900 frames at 30fps
    dependency: 'M2_COMPLETE',
    canSkipIf: ['RETURNING_VIEWER'],
    animation: 'module_transition_fade',
    narrator: 'professional_female_v1',
    backgroundMusic: 'tech_ambient_01.mp3',
    volume: -18,
  },
  M3_1_BASICS_001: {
    id: 'M3.1_BASICS_001',
    audience: ['BEGINNER', 'IT_SUPPORT'],
    duration: 60, // 1800 frames at 30fps
    dependency: 'M3.1_INTRO_001',
    canSkipIf: ['SOFTWARE_ENGINEER', 'NETWORK_ENGINEER', 'DEVOPS'],
    prerequisiteKnowledge: ['computer_basics'],
    learningObjective: 'Define what a server is and its purpose',
    quizCheckpoint: true,
  },
};

// Performance-optimized timing constants
const TIMING = {
  INTRO_DURATION: 900, // 30s at 30fps
  BASICS_DURATION: 1800, // 60s at 30fps
  TITLE_FADE_IN: 30,
  TITLE_DISPLAY: 180,
  RACK_APPEAR: 180,
  SERVERS_SLIDE: 450,
  NARRATION_1: 60,
  NARRATION_1_DURATION: 300,
  NARRATION_2: 450,
  NARRATION_2_DURATION: 400,
  TRANSITION_START: 750,
  TRANSITION_DURATION: 150,
} as const;

// Optimized color scheme - Module 3 theme from master script
const COLORS = {
  primary: '#0066CC', // Module 3 blues from script
  secondary: '#4A90E2',
  accent: '#F5A623',
  dark: '#2C3E50',
  light: '#ECF0F1',
  server: '#5DADE2',
  rack: '#34495E',
  text: '#FFFFFF',
  textDark: '#2C3E50',
  background: {
    primary: '#1a1a2e',
    secondary: '#16213e',
  },
} as const;

// Performance-optimized animated rack component
const AnimatedRack: React.FC<{ delay?: number; showServers?: boolean }> = ({ 
  delay = 0, 
  showServers = false 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Memoized spring configuration for performance
  const springConfig = useMemo(() => ({
    stiffness: 120,
    damping: 25,
  }), []);
  
  const progress = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
  });

  // Optimized interpolations with easing
  const scale = interpolate(progress, [0, 1], [0.9, 1], {
    easing: Easing.out(Easing.quad),
  });
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        width: 350,
        height: 500,
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      {/* Rack Frame */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: `3px solid ${COLORS.rack}`,
          borderRadius: 6,
          backgroundColor: `${COLORS.rack}15`,
        }}
      >
        {/* Rack Units */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '90%',
              height: '8%',
              left: '5%',
              top: `${5 + i * 9.5}%`,
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
            }}
          />
        ))}
      </div>
      
      {/* Animated servers sliding in */}
      {showServers && (
        <>
          <AnimatedServer position={1} delay={delay + 15} type="compute" />
          <AnimatedServer position={3} delay={delay + 25} type="storage" />
          <AnimatedServer position={5} delay={delay + 35} type="network" />
        </>
      )}
    </div>
  );
};

// Optimized individual server component with slide animation
const AnimatedServer: React.FC<{
  position: number;
  delay: number;
  type: 'compute' | 'storage' | 'network';
}> = ({ position, delay, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Memoized spring config for consistent animation
  const springConfig = useMemo(() => ({
    stiffness: 90,
    damping: 18,
  }), []);
  
  const slideProgress = spring({
    frame: frame - delay,
    fps,
    config: springConfig,
  });

  const translateX = interpolate(slideProgress, [0, 1], [350, 0], {
    easing: Easing.out(Easing.back(1.2)),
  });
  const opacity = interpolate(slideProgress, [0, 0.3, 1], [0, 0.7, 1]);
  
  const colors = {
    compute: '#5DADE2',
    storage: '#58D68D',
    network: '#F4D03F',
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: '85%',
        height: '16%',
        left: '7.5%',
        top: `${position * 9.5}%`,
        transform: `translateX(${translateX}px)`,
        opacity,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: colors[type],
          borderRadius: 4,
          border: '1px solid rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
        }}
      >
        {/* Server front panel details */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Power LED */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#00FF00',
              filter: 'drop-shadow(0 0 6px #00FF00)',
            }}
          />
          {/* Activity LED */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#FFA500',
              opacity: (frame + position * 13) % 60 > 30 ? 1 : 0.3,
            }}
          />
        </div>
        
        <span
          style={{
            marginLeft: 20,
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {type}
        </span>
      </div>
    </div>
  );
};

// Optimized title animation component matching script timing
const AnimatedTitle: React.FC<{
  text: string;
  delay?: number;
  subtitle?: string;
}> = ({ text, delay = 0, subtitle }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame - delay,
    [0, TIMING.TITLE_FADE_IN],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  const translateY = interpolate(
    frame - delay,
    [0, TIMING.TITLE_FADE_IN],
    [40, 0],
    { 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <h1
        style={{
          fontSize: 48,
          fontWeight: 'bold',
          color: COLORS.text,
          marginBottom: 10,
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {text}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 24,
            color: COLORS.light,
            opacity: 0.9,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

// Script-synchronized narration overlay
const NarrationOverlay: React.FC<{
  text: string;
  delay?: number;
  duration?: number;
}> = ({ text, delay = 0, duration = 100 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame - delay,
    [0, 15, duration - 15, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 50,
        right: 50,
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: '18px 28px',
        borderRadius: 6,
        opacity,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <p
        style={{
          color: COLORS.text,
          fontSize: 18,
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        {text}
      </p>
    </div>
  );
};

// Client-Server animation
const ClientServerAnimation: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      stiffness: 100,
      damping: 20,
    },
  });

  // Connection line animation
  const lineProgress = interpolate(
    frame - delay - 20,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: '80%',
        height: 300,
        left: '10%',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      {/* Client (Laptop) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: `translateY(-50%) scale(${progress})`,
          opacity: progress,
        }}
      >
        <div
          style={{
            width: 120,
            height: 80,
            backgroundColor: COLORS.secondary,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ color: 'white', fontWeight: 'bold' }}>CLIENT</span>
        </div>
      </div>

      {/* Connection Line */}
      <svg
        style={{
          position: 'absolute',
          left: 120,
          top: '50%',
          width: 'calc(100% - 240px)',
          height: 4,
          transform: 'translateY(-50%)',
        }}
      >
        <line
          x1="0"
          y1="2"
          x2={`${lineProgress * 100}%`}
          y2="2"
          stroke={COLORS.accent}
          strokeWidth="3"
          strokeDasharray="5,5"
        />
      </svg>

      {/* Server */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: `translateY(-50%) scale(${progress})`,
          opacity: progress,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            backgroundColor: COLORS.primary,
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ color: 'white', fontWeight: 'bold' }}>SERVER</span>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              gap: 5,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#00FF00',
                boxShadow: '0 0 8px #00FF00',
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#FFA500',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Annotation popup component
const AnnotationPopup: React.FC<{
  text: string;
  delay: number;
  duration: number;
  position?: 'bottom_right' | 'top_right' | 'bottom_left' | 'top_left';
}> = ({ text, delay, duration, position = 'bottom_right' }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame - delay,
    [0, 10, duration - 10, duration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  const scale = interpolate(
    frame - delay,
    [0, 10],
    [0.8, 1],
    { 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back()),
    }
  );

  const positions = {
    bottom_right: { bottom: 50, right: 50 },
    top_right: { top: 50, right: 50 },
    bottom_left: { bottom: 50, left: 50 },
    top_left: { top: 50, left: 50 },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positions[position],
        backgroundColor: COLORS.accent,
        padding: '15px 20px',
        borderRadius: 8,
        opacity,
        transform: `scale(${scale})`,
        maxWidth: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <p
        style={{
          color: COLORS.textDark,
          fontSize: 14,
          fontWeight: 'bold',
          margin: 0,
        }}
      >
        💡 {text}
      </p>
    </div>
  );
};

// Main composition component
export const ServerModuleAnimation: React.FC<{
  userProfile?: {
    audience: string[];
    skipSegments?: string[];
  };
}> = ({ userProfile = { audience: ['ALL'] } }) => {
  const frame = useCurrentFrame();

  // Check if segments should be shown based on user profile
  const shouldShowSegment = (segmentMeta: any) => {
    if (userProfile.skipSegments?.includes(segmentMeta.id)) {
      return false;
    }
    if (segmentMeta.canSkipIf?.some((role: string) => userProfile.audience.includes(role))) {
      return false;
    }
    return true;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background.primary,
        background: `linear-gradient(135deg, ${COLORS.background.primary} 0%, ${COLORS.background.secondary} 100%)`,
        willChange: 'background',
      }}
    >
      {/* Background ambient animation */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.1,
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 120) * 15}% ${50 + Math.cos(frame / 120) * 15}%, ${COLORS.primary}20 0%, transparent 60%)`,
        }}
      />

      {/* SEGMENT 1: Module Introduction - Aligned with Master Script */}
      {shouldShowSegment(SegmentMetadata.M3_1_INTRO_001) && (
        <Sequence from={0} durationInFrames={TIMING.INTRO_DURATION}>
          <AbsoluteFill>
            {/* Title sequence - exact script timing */}
            <Sequence from={0} durationInFrames={TIMING.TITLE_DISPLAY}>
              <AnimatedTitle 
                text="Welcome Back to Module 3"
                subtitle="Data Center Fundamentals: Server Technologies"
              />
            </Sequence>

            {/* Narration part 1 - matches script exactly */}
            <Sequence from={TIMING.NARRATION_1} durationInFrames={TIMING.NARRATION_1_DURATION}>
              <NarrationOverlay
                text="You've successfully learned about the physical infrastructure that keeps data centers running - the power systems that ensure continuous operation and the cooling systems that prevent equipment from overheating."
                duration={TIMING.NARRATION_1_DURATION}
              />
            </Sequence>

            {/* Empty rack animation - visual cue from script */}
            <Sequence from={TIMING.RACK_APPEAR} durationInFrames={TIMING.INTRO_DURATION - TIMING.RACK_APPEAR}>
              <AnimatedRack delay={0} showServers={false} />
            </Sequence>

            {/* Servers sliding in - [VISUAL_CUE: Animated transition from empty rack to servers sliding in] */}
            <Sequence from={TIMING.SERVERS_SLIDE} durationInFrames={TIMING.INTRO_DURATION - TIMING.SERVERS_SLIDE}>
              <AnimatedRack delay={0} showServers={true} />
            </Sequence>

            {/* Narration part 2 - matches script timing */}
            <Sequence from={TIMING.NARRATION_2} durationInFrames={TIMING.NARRATION_2_DURATION}>
              <NarrationOverlay
                text="Now, it's time to explore what goes INSIDE those carefully cooled racks: the servers themselves. Think of servers as the actual workers in your data center."
                duration={TIMING.NARRATION_2_DURATION}
              />
            </Sequence>

            {/* Transition text - smooth bridge to next segment */}
            <Sequence from={TIMING.TRANSITION_START} durationInFrames={TIMING.TRANSITION_DURATION}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: interpolate(frame - TIMING.TRANSITION_START, [0, 30, 120, TIMING.TRANSITION_DURATION], [0, 1, 1, 0]),
                  textAlign: 'center',
                }}
              >
                <h2
                  style={{
                    fontSize: 32,
                    color: COLORS.text,
                    fontWeight: '600',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  They're the computers doing all the processing,<br />storing, and serving of data...
                </h2>
              </div>
            </Sequence>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* SEGMENT 2: What Is a Server? (60s = 1800 frames at 30fps) */}
      {shouldShowSegment(SegmentMetadata.M3_1_BASICS_001) && (
        <Sequence from={900} durationInFrames={1800}>
          <AbsoluteFill>
            {/* Section title */}
            <Sequence from={0} durationInFrames={150}>
              <AnimatedTitle text="What Is a Server?" />
            </Sequence>

            {/* Definition narration */}
            <Sequence from={60} durationInFrames={300}>
              <NarrationOverlay
                text="Simply put, a server is a powerful computer designed to provide services to other computers, called clients."
                duration={300}
              />
            </Sequence>

            {/* Client-Server animation */}
            <Sequence from={180} durationInFrames={420}>
              <ClientServerAnimation delay={0} />
            </Sequence>

            {/* Usage examples narration */}
            <Sequence from={420} durationInFrames={450}>
              <NarrationOverlay
                text="When you check your email, stream a video, or visit a website, you're actually connecting to servers in data centers around the world."
                duration={450}
              />
            </Sequence>

            {/* Fun fact annotation */}
            <Sequence from={600} durationInFrames={150}>
              <AnnotationPopup
                text="Fun Fact: A single server can handle over 1,000 concurrent users!"
                delay={0}
                duration={150}
                position="bottom_right"
              />
            </Sequence>

            {/* Key differences section */}
            <Sequence from={900} durationInFrames={600}>
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80%',
                }}
              >
                <h3
                  style={{
                    fontSize: 32,
                    color: COLORS.text,
                    textAlign: 'center',
                    marginBottom: 40,
                    opacity: interpolate(frame - 900, [0, 30], [0, 1]),
                  }}
                >
                  What Makes Servers Different?
                </h3>
                
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 30,
                  }}
                >
                  {['Reliability', 'Performance', 'Manageability'].map((item, index) => (
                    <div
                      key={item}
                      style={{
                        flex: 1,
                        backgroundColor: 'rgba(74, 144, 226, 0.2)',
                        borderRadius: 12,
                        padding: 30,
                        textAlign: 'center',
                        opacity: interpolate(
                          frame - 950 - index * 50,
                          [0, 30],
                          [0, 1],
                          { extrapolateRight: 'clamp' }
                        ),
                        transform: `translateY(${interpolate(
                          frame - 950 - index * 50,
                          [0, 30],
                          [50, 0],
                          { extrapolateRight: 'clamp' }
                        )}px)`,
                        border: `2px solid ${COLORS.primary}`,
                      }}
                    >
                      <h4
                        style={{
                          fontSize: 24,
                          color: COLORS.accent,
                          marginBottom: 10,
                        }}
                      >
                        {item}
                      </h4>
                      <p
                        style={{
                          fontSize: 14,
                          color: COLORS.light,
                          lineHeight: 1.4,
                        }}
                      >
                        {item === 'Reliability' && '24/7 operation with redundant components'}
                        {item === 'Performance' && 'Handle thousands of concurrent requests'}
                        {item === 'Manageability' && 'Remote monitoring and management'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Sequence>

            {/* Final narration */}
            <Sequence from={1400} durationInFrames={400}>
              <NarrationOverlay
                text="Servers use specialized components designed to run 24/7 for years without failure. They have redundant parts, error-correcting memory, and remote management capabilities."
                duration={400}
              />
            </Sequence>

          </AbsoluteFill>
        </Sequence>
      )}


      {/* Background music - matches script specification */}
      <Audio
        src={staticFile(SegmentMetadata.M3_1_INTRO_001.backgroundMusic)}
        volume={Math.pow(10, SegmentMetadata.M3_1_INTRO_001.volume / 20)} // Convert dB to linear
      />

      {/* Optimized CSS animations - removed unused pulse */}
      <style>
        {`
          * {
            will-change: auto;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </AbsoluteFill>
  );
};
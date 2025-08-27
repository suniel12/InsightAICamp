import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

// Industry-standard color scheme
const COLORS = {
  rack: '#2C2C2C',
  server: '#4A90E2',
  storage: '#7ED321',
  network: '#F5A623',
  power: '#D0021B',
  client: '#9B59B6',
  connection: '#E74C3C',
  text: '#FFFFFF',
  textDark: '#2C3E50',
  accent: '#F39C12',
};

// Point interface for cable connections
interface Point {
  x: number;
  y: number;
}

// Rack frame component (42U standard)
const RackFrame: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      stiffness: 200,
      damping: 20,
    },
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        width: 300,
        height: 600,
        border: `3px solid ${COLORS.rack}`,
        borderRadius: 4,
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
        gap: 2,
        background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Rack unit markers */}
      {Array.from({ length: 42 }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderBottom: `1px solid rgba(255,255,255,0.1)`,
            position: 'relative',
          }}
        >
          {i % 5 === 0 && (
            <span
              style={{
                position: 'absolute',
                left: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 16,
                color: '#666',
                fontFamily: 'monospace',
              }}
            >
              {42 - i}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Server component with slide-in animation
interface ServerUnitProps {
  type: 'server' | 'storage' | 'network' | 'power';
  uHeight: number;
  label: string;
  position: number;
  delay?: number;
}

const ServerUnit: React.FC<ServerUnitProps> = ({
  type,
  uHeight,
  label,
  position,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const slideProgress = spring({
    frame: frame - delay,
    fps,
    config: {
      stiffness: 100,
      damping: 15,
    },
  });

  const translateX = interpolate(slideProgress, [0, 1], [400, 0]);
  const opacity = interpolate(slideProgress, [0, 0.5, 1], [0, 0.8, 1]);

  const unitHeight = 14 * uHeight;

  return (
    <div
      style={{
        position: 'absolute',
        width: 280,
        height: unitHeight,
        background: `linear-gradient(145deg, ${COLORS[type]}, ${COLORS[type]}DD)`,
        border: '2px solid rgba(0,0,0,0.3)',
        borderRadius: 4,
        transform: `translateX(${translateX}px)`,
        opacity,
        top: position * 14 + 15,
        left: 10,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Component icon */}
      <div
        style={{
          width: 40,
          height: 40,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 4,
          marginRight: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          color: 'white',
        }}
      >
        {type === 'server' ? '🖥️' : type === 'storage' ? '💾' : type === 'network' ? '🌐' : '⚡'}
      </div>
      
      <span
        style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          flex: 1,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
      
      {/* LED indicators */}
      <div
        style={{
          display: 'flex',
          gap: 5,
          marginRight: 15,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#00ff00',
            boxShadow: '0 0 8px #00ff00',
            animation: 'pulse 2s infinite',
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#ff8800',
            boxShadow: '0 0 8px #ff8800',
          }}
        />
      </div>
    </div>
  );
};

// Client device component for Segment 2
const ClientDevice: React.FC<{
  type: 'laptop' | 'phone' | 'desktop';
  position: { x: number; y: number };
  delay?: number;
  isActive?: boolean;
}> = ({ type, position, delay = 0, isActive = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      stiffness: 200,
      damping: 20,
    },
  });

  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const getIcon = () => {
    switch (type) {
      case 'laptop': return '💻';
      case 'phone': return '📱';
      case 'desktop': return '🖥️';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <div
        style={{
          width: 120,
          height: 80,
          backgroundColor: isActive ? COLORS.client : '#555',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          boxShadow: isActive ? `0 0 20px ${COLORS.client}` : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        {getIcon()}
      </div>
      <span
        style={{
          color: isActive ? COLORS.client : '#ccc',
          fontSize: 24,
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        Client
      </span>
      
      {/* Activity indicator */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 12,
            height: 12,
            backgroundColor: '#00ff00',
            borderRadius: '50%',
            boxShadow: '0 0 10px #00ff00',
            animation: 'pulse 1s infinite',
          }}
        />
      )}
    </div>
  );
};

// Server component for client-server demo
const ServerComponent: React.FC<{
  position: { x: number; y: number };
  delay?: number;
  isActive?: boolean;
  label?: string;
}> = ({ position, delay = 0, isActive = false, label = 'Server' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      stiffness: 150,
      damping: 25,
    },
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 240,
          height: 160,
          background: isActive 
            ? `linear-gradient(145deg, ${COLORS.server}, ${COLORS.server}DD)`
            : 'linear-gradient(145deg, #444, #333)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(0,0,0,0.3)',
          boxShadow: isActive 
            ? `0 0 30px ${COLORS.server}40, 0 4px 16px rgba(0,0,0,0.3)`
            : '0 4px 16px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {/* Server icon */}
        <div style={{ fontSize: 48, marginBottom: 10 }}>🖥️</div>
        
        {/* LED indicators */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: isActive ? '#00ff00' : '#555',
              boxShadow: isActive ? '0 0 6px #00ff00' : 'none',
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: isActive ? '#ff8800' : '#555',
              boxShadow: isActive ? '0 0 6px #ff8800' : 'none',
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: isActive ? '#00ff00' : '#555',
              boxShadow: isActive ? '0 0 6px #00ff00' : 'none',
            }}
          />
        </div>

        {/* Processing indicator */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: COLORS.server,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              animation: 'spin 2s linear infinite',
            }}
          >
            ⚙️
          </div>
        )}
      </div>
      
      <span
        style={{
          color: isActive ? COLORS.server : '#ccc',
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
};

// Connection line animation
const ConnectionLine: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay?: number;
  isActive?: boolean;
}> = ({ from, to, delay = 0, isActive = false }) => {
  const frame = useCurrentFrame();
  
  const progress = interpolate(frame - delay, [0, 30], [0, 1], { extrapolateLeft: 'clamp' });
  
  const pathLength = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
  const dashArray = pathLength;
  const dashOffset = dashArray - (progress * dashArray);

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
      viewBox="0 0 1920 1080"
    >
      <path
        d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
        stroke={isActive ? COLORS.connection : '#666'}
        strokeWidth={isActive ? 3 : 2}
        fill="none"
        strokeDasharray={isActive ? 10 : dashArray}
        strokeDashoffset={isActive ? 0 : dashOffset}
        opacity={progress > 0 ? 1 : 0}
      />
      
      {/* Data flow animation */}
      {isActive && progress > 0.8 && (
        <circle
          cx={interpolate((frame - delay - 60) % 60, [0, 60], [from.x, to.x])}
          cy={interpolate((frame - delay - 60) % 60, [0, 60], [from.y, to.y])}
          r="4"
          fill={COLORS.connection}
        />
      )}
    </svg>
  );
};

// Fun fact popup
const FunFactPopup: React.FC<{
  text: string;
  position: { x: number; y: number };
  delay?: number;
  duration?: number;
}> = ({ text, position, delay = 0, duration = 150 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame - delay,
    [0, 30, duration - 30, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const scale = spring({
    frame: frame - delay,
    fps: 30,
    config: {
      stiffness: 400,
      damping: 30,
    },
  });

  if (frame < delay || frame > delay + duration) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${Math.min(scale, 1)})`,
        opacity,
        transformOrigin: 'bottom left',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.9)',
          border: `2px solid ${COLORS.server}`,
          borderRadius: 12,
          padding: '12px 16px',
          maxWidth: 300,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            color: COLORS.server,
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          💡 Fun Fact
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 28,
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

// Preview-only narration helper (Web Speech API; not included in rendered exports)
const useSpeakOnFrame = (opts: {
  text: string;
  startSec: number;
  voiceName?: string;
  rate?: number;
  pitch?: number;
}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') return;

    const startFrame = Math.round((opts.startSec ?? 0) * fps);
    if (frame < startFrame || startedRef.current) return;

    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(opts.text);
    utter.rate = opts.rate ?? 1.02;
    utter.pitch = opts.pitch ?? 1.0;
    utter.lang = 'en-US';

    const pickAndSpeak = () => {
      const voices = synth.getVoices();
      const wanted = (opts.voiceName ?? '').toLowerCase();
      let voice = voices.find((v) => v.name.toLowerCase().includes(wanted));
      if (!voice) {
        voice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
      }
      if (voice) utter.voice = voice;
      synth.cancel(); // ensure clean start
      synth.speak(utter);
      startedRef.current = true;
    };

    if (synth.getVoices().length === 0) {
      const onvoices = () => {
        pickAndSpeak();
        synth.removeEventListener('voiceschanged', onvoices);
      };
      synth.addEventListener('voiceschanged', onvoices);
    } else {
      pickAndSpeak();
    }

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    };
  }, [frame, fps, opts.text, opts.startSec, opts.voiceName, opts.rate, opts.pitch]);
};

const NarrationPreview: React.FC = () => {
  useSpeakOnFrame({
    text:
      "Welcome back to Module 3 of our Data Center Fundamentals course. You've successfully learned about the physical infrastructure that keeps data centers running - the power systems that ensure continuous operation and the cooling systems that prevent equipment from overheating. " +
      "Now, it's time to explore what goes INSIDE those carefully cooled racks: the servers themselves. Think of servers as the actual workers in your data center - they're the computers doing all the processing, storing, and serving of data that makes modern digital services possible.",
    startSec: 0,
    voiceName: 'Samantha',
  });
  
  // Segment 2 narration starts at 30s (frame 900 @ 30fps)
  useSpeakOnFrame({
    text:
      "Before we dive into server types, let's clarify what exactly a server is. Simply put, a server is a powerful computer designed to provide services to other computers, called clients. " +
      "Unlike your personal computer that's designed for one user at a time, servers are built to handle requests from hundreds, thousands, or even millions of users simultaneously. When you check your email, stream a video, or visit a website, you're actually connecting to servers in data centers around the world. " +
      "What makes servers different from regular computers? Three key things: reliability, performance, and manageability. Servers use specialized components designed to run 24/7 for years without failure. They have redundant parts, error-correcting memory, and remote management capabilities that your laptop simply doesn't need.",
    startSec: 30,
    voiceName: 'Samantha',
  });
  return null;
};

// COMBINED SEGMENTS: Module 3.1 Introduction + What Is a Server
// Total duration: ~90 seconds (30s + 60s)
export const ServerModuleCombined: React.FC = () => {
  const frame = useCurrentFrame();

  const clients = [
    { type: 'laptop' as const, position: { x: 300, y: 300 }, delay: 60 },
    { type: 'phone' as const, position: { x: 300, y: 450 }, delay: 90 },
    { type: 'desktop' as const, position: { x: 300, y: 600 }, delay: 120 },
  ];

  const server = { position: { x: 1200, y: 450 }, delay: 30 };

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f0f 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background grid effect */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }}
      />

      <NarrationPreview />

      {/* SEGMENT 1: Module Introduction (0-900 frames = 30s) */}
      <Sequence from={0} durationInFrames={900}>
        <AbsoluteFill>
          {/* Welcome back text */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [0, 30, 270, 300], [0, 1, 1, 0]),
            }}
          >
            <h1
              style={{
                fontSize: 96,
                color: 'white',
                fontWeight: 'bold',
                marginBottom: 20,
                textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
                background: 'linear-gradient(45deg, #4A90E2, #7ED321)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Module 3: Server Technologies
            </h1>
            <p
              style={{
                fontSize: 48,
                color: '#ccc',
                maxWidth: 1600,
                lineHeight: 1.5,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Welcome back! You've mastered power and cooling systems.
              <br />
              Now let's explore what goes INSIDE those carefully cooled racks.
            </p>
          </div>

          {/* Visual transition: Empty rack to servers sliding in */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Empty rack appears after intro text completely fades */}
            <Sequence from={330} durationInFrames={270}>
              <RackFrame delay={0} />
            </Sequence>

            {/* Servers start sliding in after rack is well established */}
            <Sequence from={480}>
              <ServerUnit
                type="server"
                uHeight={1}
                label="Web Server"
                position={2}
                delay={0}
              />
            </Sequence>

            <Sequence from={510}>
              <ServerUnit
                type="server"
                uHeight={1}
                label="Database Server"
                position={4}
                delay={30}
              />
            </Sequence>

            <Sequence from={540}>
              <ServerUnit
                type="storage"
                uHeight={2}
                label="Storage Array"
                position={6}
                delay={60}
              />
            </Sequence>
          </div>

          {/* Key message overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [630, 660, 810, 840], [0, 1, 1, 0]),
            }}
          >
            <p
              style={{
                fontSize: 56,
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                marginBottom: 20,
              }}
            >
              Servers: The Digital Workers
            </p>
            <p
              style={{
                fontSize: 36,
                color: '#ccc',
                maxWidth: 1400,
                lineHeight: 1.4,
              }}
            >
              These are the computers doing all the processing, storing, and serving
              <br />
              that makes modern digital services possible.
            </p>
          </div>

          {/* Smooth transition to segment 2 */}
          <div
            style={{
              position: 'absolute',
              bottom: 50,
              right: 50,
              opacity: interpolate(frame, [840, 870], [0, 1], { extrapolateLeft: 'clamp' }),
            }}
          >
            <div
              style={{
                color: COLORS.server,
                fontSize: 32,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span>What exactly is a server?</span>
              <span style={{ animation: 'pulse 2s infinite' }}>→</span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SEGMENT 2: What Is a Server? (900-2700 frames = 60s) */}
      <Sequence from={900} durationInFrames={1800}>
        <AbsoluteFill>
          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              opacity: interpolate(frame - 900, [0, 30, 450, 480], [0, 1, 1, 0]),
            }}
          >
            <h1
              style={{
                fontSize: 84,
                color: 'white',
                fontWeight: 'bold',
                marginBottom: 30,
                textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
              }}
            >
              What Is a Server?
            </h1>
            <p
              style={{
                fontSize: 36,
                color: '#ccc',
                maxWidth: 1200,
                lineHeight: 1.4,
              }}
            >
              A powerful computer designed to provide services to other computers
            </p>
          </div>

          {/* Main server - appears after title fades */}
          <ServerComponent
            position={server.position}
            delay={server.delay + 450}
            isActive={frame - 900 > 540}
            label="Powerful Server"
          />

          {/* Client devices - staggered appearance */}
          {clients.map((client, index) => (
            <ClientDevice
              key={index}
              type={client.type}
              position={client.position}
              delay={client.delay + 450}
              isActive={frame - 900 > 540}
            />
          ))}

          {/* Connection lines - after all components are visible */}
          {frame - 900 > 570 && clients.map((client, index) => (
            <ConnectionLine
              key={index}
              from={{ x: client.position.x + 120, y: client.position.y + 40 }}
              to={{ x: server.position.x, y: server.position.y + 80 }}
              delay={570 + index * 20}
              isActive={frame - 900 > 600}
            />
          ))}

          {/* Key difference explanation */}
          <div
            style={{
              position: 'absolute',
              left: 100,
              bottom: 50,
              opacity: interpolate(frame - 900, [630, 660, 900, 930], [0, 1, 1, 0]),
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                padding: 30,
                maxWidth: 800,
              }}
            >
              <h3
                style={{
                  color: 'white',
                  fontSize: 36,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                🔍 Key Differences
              </h3>
              <div style={{ color: '#ccc', fontSize: 28, lineHeight: 1.6 }}>
                <p><strong style={{ color: 'white' }}>Personal Computer:</strong> Designed for one user at a time</p>
                <p><strong style={{ color: 'white' }}>Server:</strong> Built to handle requests from hundreds, thousands, or millions of users simultaneously</p>
              </div>
            </div>
          </div>

          {/* Fun fact popup */}
          <FunFactPopup
            text="A single server can handle over 1,000 concurrent users!"
            position={{ x: 1500, y: 300 }}
            delay={750}
            duration={150}
          />

          {/* What makes servers different section */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 60,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              opacity: interpolate(frame - 900, [960, 990, 1500, 1530], [0, 1, 1, 0]),
            }}
          >
            <h3
              style={{
                color: 'white',
                fontSize: 48,
                marginBottom: 30,
                fontWeight: 'bold',
              }}
            >
              Three Key Server Advantages
            </h3>
            <div
              style={{
                display: 'flex',
                gap: 40,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: '🔒', title: 'Reliability', desc: '24/7 operation for years' },
                { icon: '⚡', title: 'Performance', desc: 'Handle massive workloads' },
                { icon: '🛠️', title: 'Manageability', desc: 'Remote monitoring & control' },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: 320,
                    opacity: interpolate(frame - 900, [1020 + index * 30, 1050 + index * 30], [0, 1], { extrapolateLeft: 'clamp' }),
                  }}
                >
                  <div style={{ fontSize: 64, marginBottom: 16 }}>{item.icon}</div>
                  <div style={{ color: COLORS.server, fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <div style={{ color: '#ccc', fontSize: 24, textAlign: 'center', lineHeight: 1.3 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* End transition */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 50,
              opacity: interpolate(frame - 900, [1720, 1750], [0, 1], { extrapolateLeft: 'clamp' }),
            }}
          >
            <div
              style={{
                color: COLORS.server,
                fontSize: 28,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span>Next: Server Types & Form Factors</span>
              <span style={{ animation: 'pulse 2s infinite' }}>→</span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* CSS animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </AbsoluteFill>
  );
};
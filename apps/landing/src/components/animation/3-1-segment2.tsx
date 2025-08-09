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
};

// Client device component (laptop/phone/desktop)
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
          width: 60,
          height: 40,
          backgroundColor: isActive ? COLORS.client : '#555',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          boxShadow: isActive ? `0 0 20px ${COLORS.client}` : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        {getIcon()}
      </div>
      <span
        style={{
          color: isActive ? COLORS.client : '#ccc',
          fontSize: 12,
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

// Server component
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
          width: 120,
          height: 80,
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
        <div style={{ fontSize: 24, marginBottom: 5 }}>🖥️</div>
        
        {/* LED indicators */}
        <div style={{ display: 'flex', gap: 4 }}>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: isActive ? '#00ff00' : '#555',
              filter: isActive ? 'drop-shadow(0 0 4px #00ff00)' : 'none',
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: isActive ? '#ff8800' : '#555',
              filter: isActive ? 'drop-shadow(0 0 4px #ff8800)' : 'none',
            }}
          />
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: isActive ? '#00ff00' : '#555',
              filter: isActive ? 'drop-shadow(0 0 4px #00ff00)' : 'none',
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
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: COLORS.server,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
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
          fontSize: 14,
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
  const { fps } = useVideoConfig();
  
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
            fontSize: 12,
            fontWeight: 'bold',
            marginBottom: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          💡 Fun Fact
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

// Comparison table
const ComparisonTable: React.FC<{
  delay?: number;
}> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame - delay,
    [0, 30, 180, 210],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const rows = [
    { category: 'CPU Cores', desktop: '4-16', server: '8-64' },
    { category: 'Price Range', desktop: '$200-500', server: '$1,000-10,000' },
    { category: 'Memory Type', desktop: 'Standard RAM', server: 'ECC Memory' },
    { category: 'Uptime', desktop: '8-12 hours/day', server: '24/7/365' },
    { category: 'Users', desktop: '1', server: '1,000+' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        right: 100,
        top: '50%',
        transform: 'translateY(-50%)',
        opacity,
        backgroundColor: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.server,
          color: 'white',
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Desktop vs Server CPU
      </div>
      <div style={{ padding: 12 }}>
        {rows.map((row, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              paddingBottom: 8,
              borderBottom: index < rows.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              marginBottom: index < rows.length - 1 ? 8 : 0,
            }}
          >
            <span style={{ color: '#ccc', fontSize: 12, fontWeight: 'bold' }}>
              {row.category}
            </span>
            <span style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
              {row.desktop}
            </span>
            <span style={{ color: COLORS.server, fontSize: 12, textAlign: 'center' }}>
              {row.server}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// SEGMENT 2: What Is a Server? (60s)
// [SEGMENT_ID: M3.1_BASICS_001]
// Simple explanation of servers vs clients with visual demonstration
export const DataCenterRackSegment2: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const clients = [
    { type: 'laptop' as const, position: { x: 200, y: 200 }, delay: 60 },
    { type: 'phone' as const, position: { x: 200, y: 350 }, delay: 90 },
    { type: 'desktop' as const, position: { x: 200, y: 500 }, delay: 120 },
  ];

  const server = { position: { x: 800, y: 350 }, delay: 30 };

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
          opacity: 0.3,
        }}
      />

      <Sequence from={0} durationInFrames={durationInFrames}>
        <AbsoluteFill>
          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [0, 30, 450, 480], [0, 1, 1, 0]),
            }}
          >
            <h1
              style={{
                fontSize: 42,
                color: 'white',
                fontWeight: 'bold',
                marginBottom: 15,
                textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
              }}
            >
              What Is a Server?
            </h1>
            <p
              style={{
                fontSize: 18,
                color: '#ccc',
                maxWidth: 600,
                lineHeight: 1.4,
              }}
            >
              A powerful computer designed to provide services to other computers
            </p>
          </div>

          {/* Main server */}
          <ServerComponent
            position={server.position}
            delay={server.delay}
            isActive={frame > 240}
            label="Powerful Server"
          />

          {/* Client devices */}
          {clients.map((client, index) => (
            <ClientDevice
              key={index}
              type={client.type}
              position={client.position}
              delay={client.delay}
              isActive={frame > 240}
            />
          ))}

          {/* Connection lines */}
          {frame > 150 && clients.map((client, index) => (
            <ConnectionLine
              key={index}
              from={{ x: client.position.x + 60, y: client.position.y + 20 }}
              to={{ x: server.position.x, y: server.position.y + 40 }}
              delay={150 + index * 20}
              isActive={frame > 240}
            />
          ))}

          {/* Key difference explanation */}
          <div
            style={{
              position: 'absolute',
              left: 100,
              bottom: 150,
              opacity: interpolate(frame, [180, 210, 420, 450], [0, 1, 1, 0]),
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                padding: 20,
                maxWidth: 400,
              }}
            >
              <h3
                style={{
                  color: 'white',
                  fontSize: 18,
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                🔍 Key Differences
              </h3>
              <div style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
                <p><strong style={{ color: 'white' }}>Personal Computer:</strong> Designed for one user at a time</p>
                <p><strong style={{ color: 'white' }}>Server:</strong> Built to handle requests from hundreds, thousands, or millions of users simultaneously</p>
              </div>
            </div>
          </div>

          {/* Fun fact popup */}
          <FunFactPopup
            text="A single server can handle over 1,000 concurrent users!"
            position={{ x: 950, y: 200 }}
            delay={300}
            duration={150}
          />

          {/* Desktop vs Server comparison */}
          <Sequence from={360} durationInFrames={240}>
            <ComparisonTable delay={0} />
          </Sequence>

          {/* What makes servers different section */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 60,
              transform: 'translateX(-50%)',
              textAlign: 'center',
              opacity: interpolate(frame, [480, 510, 750, 780], [0, 1, 1, 0]),
            }}
          >
            <h3
              style={{
                color: 'white',
                fontSize: 24,
                marginBottom: 15,
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
                    maxWidth: 160,
                    opacity: interpolate(frame, [540 + index * 20, 570 + index * 20], [0, 1], { extrapolateLeft: 'clamp' }),
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ color: COLORS.server, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ color: '#ccc', fontSize: 12, textAlign: 'center', lineHeight: 1.3 }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transition indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 50,
              opacity: interpolate(frame, [720, 750], [0, 1], { extrapolateLeft: 'clamp' }),
            }}
          >
            <div
              style={{
                color: COLORS.server,
                fontSize: 14,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Next: Rack Servers - The Pizza Box</span>
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
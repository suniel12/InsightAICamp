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
  cable: {
    data: '#4A90E2',
    network: '#7ED321',
    power: '#D0021B',
  },
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
                fontSize: 8,
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

// Cable connection animation
const CableConnection: React.FC<{
  from: Point;
  to: Point;
  delay: number;
  type: 'data' | 'network' | 'power';
}> = ({ from, to, delay, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = interpolate(
    frame - delay,
    [0, 60],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    }
  );
  
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
      <defs>
        <filter id={`glow-${type}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y + 50} ${to.x} ${to.y}`}
        stroke={COLORS.cable[type]}
        strokeWidth="4"
        fill="none"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        filter={`url(#glow-${type})`}
        opacity={progress > 0 ? 1 : 0}
      />
      {/* Connection points */}
      {progress > 0.8 && (
        <>
          <circle
            cx={from.x}
            cy={from.y}
            r="6"
            fill={COLORS.cable[type]}
            opacity={interpolate(progress, [0.8, 1], [0, 1])}
          />
          <circle
            cx={to.x}
            cy={to.y}
            r="6"
            fill={COLORS.cable[type]}
            opacity={interpolate(progress, [0.8, 1], [0, 1])}
          />
        </>
      )}
    </svg>
  );
};

// Reusable server component with slide-in animation
interface ServerUnitProps {
  type: 'server' | 'storage' | 'network' | 'power';
  uHeight: number;
  label: string;
  position: number;
  delay?: number;
  connectionPoint?: Point;
}

const ServerUnit: React.FC<ServerUnitProps> = ({
  type,
  uHeight,
  label,
  position,
  delay = 0,
  connectionPoint,
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
        paddingLeft: 15,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {/* Component icon */}
      <div
        style={{
          width: 20,
          height: 20,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          marginRight: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: 'white',
        }}
      >
        {type === 'server' ? '🖥️' : type === 'storage' ? '💾' : type === 'network' ? '🌐' : '⚡'}
      </div>
      
      <span
        style={{
          color: 'white',
          fontSize: 14,
          fontWeight: 'bold',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          flex: 1,
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

      {/* Connection port indicator */}
      {connectionPoint && slideProgress > 0.8 && (
        <div
          style={{
            position: 'absolute',
            right: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: COLORS.cable.network,
            boxShadow: `0 0 10px ${COLORS.cable.network}`,
          }}
        />
      )}
    </div>
  );
};

// Animated label component
interface AnimatedLabelProps {
  text: string;
  description: string;
  position: { x: number; y: number };
  delay?: number;
}

const AnimatedLabel: React.FC<AnimatedLabelProps> = ({
  text,
  description,
  position,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const springValue = spring({
    frame: frame - delay,
    fps,
    config: {
      stiffness: 300,
      damping: 30,
    },
  });

  const scale = interpolate(springValue, [0, 1], [0, 1]);
  const opacity = interpolate(springValue, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: 'left center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 6,
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {text}
      </div>
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#ccc',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: 13,
          maxWidth: 250,
          lineHeight: 1.4,
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(5px)',
        }}
      >
        {description}
      </div>
    </div>
  );
};

// Performance monitoring display
const PerformanceMonitor: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = interpolate(frame - delay, [0, 30], [0, 1], { extrapolateLeft: 'clamp' });
  const cpuUsage = interpolate((frame - delay) % 120, [0, 120], [15, 85]);
  const memUsage = interpolate((frame - delay + 30) % 100, [0, 100], [45, 75]);
  const networkUsage = interpolate((frame - delay + 60) % 90, [0, 90], [20, 95]);

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 50,
        right: 50,
        backgroundColor: 'rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 8,
        padding: 15,
        opacity,
        backdropFilter: 'blur(10px)',
      }}
    >
      <h3 style={{ color: 'white', fontSize: 14, marginBottom: 10 }}>System Metrics</h3>
      
      {[
        { label: 'CPU Usage', value: cpuUsage, color: '#4A90E2' },
        { label: 'Memory', value: memUsage, color: '#7ED321' },
        { label: 'Network', value: networkUsage, color: '#F5A623' },
      ].map((metric, index) => (
        <div key={metric.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ color: '#ccc', fontSize: 12 }}>{metric.label}</span>
            <span style={{ color: 'white', fontSize: 12 }}>{Math.round(metric.value)}%</span>
          </div>
          <div
            style={{
              width: 120,
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${metric.value}%`,
                height: '100%',
                backgroundColor: metric.color,
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Main composition
export const DataCenterRackEducation: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Connection points for cables
  const connectionPoints = {
    switch: { x: 960, y: 95 },
    server1: { x: 960, y: 125 },
    server2: { x: 960, y: 140 },
    storage: { x: 960, y: 175 },
    pdu: { x: 960, y: 400 },
  };

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

      {/* Title sequence */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 64,
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              opacity: interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0]),
              textShadow: '0 0 20px rgba(74, 144, 226, 0.5)',
              background: 'linear-gradient(45deg, #4A90E2, #7ED321)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Data Center Rack Components
          </h1>
          <p
            style={{
              fontSize: 28,
              color: '#ccc',
              textAlign: 'center',
              marginTop: 20,
              opacity: interpolate(frame, [15, 45, 60, 90], [0, 1, 1, 0]),
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Professional Infrastructure Guide
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Main animation */}
      <Sequence from={90}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Performance monitor */}
          <PerformanceMonitor delay={300} />

          {/* Rack frame appears first */}
          <RackFrame delay={0} />

          {/* Network switch */}
          <Sequence from={30}>
            <ServerUnit
              type="network"
              uHeight={1}
              label="Core Network Switch - 48 Port Gigabit"
              position={2}
              delay={30}
              connectionPoint={connectionPoints.switch}
            />
          </Sequence>

          {/* Servers */}
          <Sequence from={60}>
            <ServerUnit
              type="server"
              uHeight={1}
              label="Production Web Server #1"
              position={4}
              delay={60}
              connectionPoint={connectionPoints.server1}
            />
          </Sequence>

          <Sequence from={90}>
            <ServerUnit
              type="server"
              uHeight={1}
              label="Production Web Server #2"
              position={5}
              delay={90}
              connectionPoint={connectionPoints.server2}
            />
          </Sequence>

          {/* Storage array */}
          <Sequence from={120}>
            <ServerUnit
              type="storage"
              uHeight={4}
              label="Enterprise Storage Array - 96TB RAID 10"
              position={7}
              delay={120}
              connectionPoint={connectionPoints.storage}
            />
          </Sequence>

          {/* PDU slides in */}
          <Sequence from={150}>
            <ServerUnit
              type="power"
              uHeight={20}
              label="Intelligent PDU - Power Distribution & Monitoring"
              position={22}
              delay={150}
              connectionPoint={connectionPoints.pdu}
            />
          </Sequence>

          {/* Cable connections animate in */}
          <Sequence from={180}>
            <CableConnection
              from={connectionPoints.switch}
              to={connectionPoints.server1}
              delay={180}
              type="network"
            />
          </Sequence>

          <Sequence from={210}>
            <CableConnection
              from={connectionPoints.switch}
              to={connectionPoints.server2}
              delay={210}
              type="network"
            />
          </Sequence>

          <Sequence from={240}>
            <CableConnection
              from={connectionPoints.switch}
              to={connectionPoints.storage}
              delay={240}
              type="data"
            />
          </Sequence>

          <Sequence from={270}>
            <CableConnection
              from={connectionPoints.pdu}
              to={{ x: connectionPoints.server1.x, y: connectionPoints.server1.y + 10 }}
              delay={270}
              type="power"
            />
          </Sequence>

          {/* Labels appear after components are in place */}
          <Sequence from={330}>
            <AnimatedLabel
              text="Network Infrastructure Layer"
              description="48-port gigabit switch providing high-speed connectivity. Manages traffic between all rack components with VLAN support and QoS."
              position={{ x: 350, y: 60 }}
              delay={330}
            />
          </Sequence>

          <Sequence from={360}>
            <AnimatedLabel
              text="Compute Layer"
              description="Redundant web servers ensuring 99.9% uptime. Load balanced configuration with automatic failover capabilities."
              position={{ x: 350, y: 120 }}
              delay={360}
            />
          </Sequence>

          <Sequence from={390}>
            <AnimatedLabel
              text="Storage Solution"
              description="Enterprise-grade storage with RAID 10 protection. Provides centralized data access with 10Gb/s throughput."
              position={{ x: 350, y: 180 }}
              delay={390}
            />
          </Sequence>

          <Sequence from={420}>
            <AnimatedLabel
              text="Power Management"
              description="Intelligent PDU with remote monitoring. Provides clean power distribution with surge protection and usage analytics."
              position={{ x: 350, y: 380 }}
              delay={420}
            />
          </Sequence>

          {/* Final summary */}
          <Sequence from={480}>
            <div
              style={{
                position: 'absolute',
                bottom: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                opacity: interpolate(frame - 480, [0, 30], [0, 1], { extrapolateLeft: 'clamp' }),
              }}
            >
              <h2
                style={{
                  color: 'white',
                  fontSize: 24,
                  marginBottom: 10,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                Complete Enterprise Rack Solution
              </h2>
              <p
                style={{
                  color: '#ccc',
                  fontSize: 16,
                  maxWidth: 600,
                  lineHeight: 1.5,
                }}
              >
                This 42U configuration provides redundancy, scalability, and enterprise-grade reliability 
                for mission-critical applications with proper cable management and monitoring.
              </p>
            </div>
          </Sequence>
        </AbsoluteFill>
      </Sequence>

      {/* CSS keyframes for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </AbsoluteFill>
  );
};
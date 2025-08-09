import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text, OrbitControls, PerspectiveCamera, Environment, Line } from '@react-three/drei';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import * as THREE from 'three';
import { Group, Vector3 } from 'three';

interface DataPacketProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  delay: number;
  color: string;
  speed?: number;
}

const DataPacket: React.FC<DataPacketProps> = ({ 
  startPos, 
  endPos, 
  delay, 
  color,
  speed = 1
}) => {
  const frame = useCurrentFrame();
  const meshRef = useRef<THREE.Mesh>(null);
  
  const cycleDuration = 60 / speed;
  const progress = ((frame - delay) % cycleDuration) / cycleDuration;
  const visible = frame > delay;
  
  if (!visible) return null;
  
  const x = startPos[0] + (endPos[0] - startPos[0]) * progress;
  const y = startPos[1] + (endPos[1] - startPos[1]) * progress;
  const z = startPos[2] + (endPos[2] - startPos[2]) * progress;
  
  const opacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Pulse effect
  const scale = 0.1 + Math.sin(progress * Math.PI) * 0.05;

  return (
    <Sphere
      ref={meshRef}
      position={[x, y, z]}
      args={[scale, 8, 8]}
    >
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(color)}
        emissiveIntensity={2}
        transparent
        opacity={opacity}
      />
    </Sphere>
  );
};

interface NetworkSwitchProps {
  position: [number, number, number];
  type: 'core' | 'aggregation' | 'access';
  label: string;
}

const NetworkSwitch: React.FC<NetworkSwitchProps> = ({ position, type, label }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  const appearDelay = type === 'core' ? 10 : type === 'aggregation' ? 30 : 50;
  const opacity = interpolate(
    frame,
    [appearDelay, appearDelay + 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  const scale = spring({
    frame: frame - appearDelay,
    fps: 30,
    from: 0,
    to: 1,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });
  
  // Port activity animation
  const activityPhase = (frame % 30) / 30;
  
  const size = type === 'core' ? 1.2 : type === 'aggregation' ? 1 : 0.8;
  const color = type === 'core' ? '#ff6b6b' : type === 'aggregation' ? '#4ecdc4' : '#95e77e';

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Switch body */}
      <Box args={[size * 2, size * 0.8, size * 0.6]} castShadow>
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Front panel */}
      <Box position={[0, 0, size * 0.31]} args={[size * 1.9, size * 0.7, 0.02]}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Port indicators */}
      {[...Array(type === 'core' ? 8 : type === 'aggregation' ? 6 : 4)].map((_, i) => {
        const portCount = type === 'core' ? 8 : type === 'aggregation' ? 6 : 4;
        const isActive = Math.random() > 0.3;
        const ledPhase = (frame + i * 5) % 40;
        
        return (
          <Box
            key={i}
            position={[
              -size * 0.8 + (i * size * 1.6) / (portCount - 1),
              0,
              size * 0.32
            ]}
            args={[size * 0.15, size * 0.05, 0.01]}
          >
            <meshStandardMaterial
              color={isActive ? '#00ff00' : '#333333'}
              emissive={isActive ? new THREE.Color(0, 1, 0) : new THREE.Color(0, 0, 0)}
              emissiveIntensity={isActive ? Math.sin(ledPhase * 0.15) * 0.5 + 0.5 : 0}
              transparent
              opacity={opacity}
            />
          </Box>
        );
      })}
      
      {/* Status display */}
      <Box position={[0, size * 0.2, size * 0.32]} args={[size * 0.4, size * 0.15, 0.01]}>
        <meshStandardMaterial
          color="#001122"
          emissive={new THREE.Color(0, 0.5, 1)}
          emissiveIntensity={activityPhase}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Label */}
      <Text
        position={[0, -size * 0.6, size * 0.4]}
        fontSize={size * 0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

interface RouterProps {
  position: [number, number, number];
  label: string;
}

const Router: React.FC<RouterProps> = ({ position, label }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [70, 100],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Antenna rotation
  const antennaRotation = frame * 0.02;

  return (
    <group position={position}>
      {/* Router body */}
      <Cylinder args={[0.8, 0.8, 0.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <meshStandardMaterial
          color="#8b4513"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Cylinder>
      
      {/* Top plate */}
      <Cylinder args={[0.8, 0.8, 0.05]} position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color="#654321"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Cylinder>
      
      {/* Antennas */}
      {[60, -60].map((angle, i) => (
        <group key={i} rotation={[0, (angle * Math.PI) / 180 + antennaRotation, 0]}>
          <Cylinder
            position={[0.5, 0, 0.3]}
            args={[0.03, 0.03, 0.6]}
            rotation={[0, 0, Math.PI / 12]}
          >
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={opacity}
            />
          </Cylinder>
        </group>
      ))}
      
      {/* Port LEDs */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const radius = 0.6;
        const isActive = Math.random() > 0.4;
        
        return (
          <Sphere
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0.21
            ]}
            args={[0.03, 8, 8]}
          >
            <meshStandardMaterial
              color={isActive ? '#00ff00' : '#ff0000'}
              emissive={isActive ? new THREE.Color(0, 1, 0) : new THREE.Color(1, 0, 0)}
              emissiveIntensity={isActive ? 1 : 0.3}
              transparent
              opacity={opacity}
            />
          </Sphere>
        );
      })}
      
      <Text
        position={[0, 0, -0.5]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

interface FirewallProps {
  position: [number, number, number];
}

const Firewall: React.FC<FirewallProps> = ({ position }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [90, 120],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Security scan animation
  const scanPosition = (frame % 60) / 60;
  
  return (
    <group position={position}>
      {/* Firewall chassis */}
      <Box args={[2, 0.5, 1]} castShadow>
        <meshStandardMaterial
          color="#b22222"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Security shield symbol */}
      <group position={[0, 0, 0.51]}>
        {/* Shield shape using multiple boxes */}
        <Box position={[0, 0.1, 0]} args={[0.3, 0.2, 0.02]}>
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={opacity}
          />
        </Box>
        <Box position={[0, -0.05, 0]} args={[0.25, 0.1, 0.02]}>
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={opacity}
          />
        </Box>
      </group>
      
      {/* Scanning laser effect */}
      {frame > 100 && (
        <Box
          position={[-0.9 + scanPosition * 1.8, 0, 0.52]}
          args={[0.02, 0.3, 0.02]}
        >
          <meshStandardMaterial
            color="#ff0000"
            emissive={new THREE.Color(1, 0, 0)}
            emissiveIntensity={2}
            transparent
            opacity={0.6}
          />
        </Box>
      )}
      
      {/* Status LEDs */}
      {['#00ff00', '#00ff00', '#ffaa00', '#00ff00'].map((color, i) => (
        <Box
          key={i}
          position={[0.6 - i * 0.15, 0.15, 0.51]}
          args={[0.05, 0.05, 0.01]}
        >
          <meshStandardMaterial
            color={color}
            emissive={new THREE.Color(color)}
            emissiveIntensity={1}
            transparent
            opacity={opacity}
          />
        </Box>
      ))}
      
      <Text
        position={[0, -0.4, 0.6]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Firewall
      </Text>
      
      {/* Threat detection indicator */}
      {frame > 130 && (
        <Text
          position={[0, 0.35, 0.52]}
          fontSize={0.1}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          Protected
        </Text>
      )}
    </group>
  );
};

const NetworkTopology3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Camera animation
  const cameraPosition = {
    x: interpolate(frame, [0, 100, 200, 300], [0, 5, 8, 5]),
    y: interpolate(frame, [0, 100, 200, 300], [15, 12, 10, 12]),
    z: interpolate(frame, [0, 100, 200, 300], [15, 12, 10, 12]),
  };
  
  // Network connections
  const connections = useMemo(() => [
    // Core to Aggregation
    [[0, 4, 0], [-3, 2, 0]],
    [[0, 4, 0], [3, 2, 0]],
    // Aggregation to Access
    [[-3, 2, 0], [-5, 0, 0]],
    [[-3, 2, 0], [-3, 0, 0]],
    [[-3, 2, 0], [-1, 0, 0]],
    [[3, 2, 0], [1, 0, 0]],
    [[3, 2, 0], [3, 0, 0]],
    [[3, 2, 0], [5, 0, 0]],
    // Router connections
    [[0, 4, 0], [0, 6, 0]],
    // Firewall connection
    [[0, 6, 0], [0, 8, 0]],
  ], []);

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[cameraPosition.x, cameraPosition.y, cameraPosition.z]} 
        fov={50}
      />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate={frame > 250}
        autoRotateSpeed={0.3}
        target={[0, 3, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 10, 5]} intensity={0.5} color="#4ecdc4" />
      <pointLight position={[5, 10, -5]} intensity={0.5} color="#ff6b6b" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      <group>
        {/* Network connections lines */}
        {connections.map((connection, i) => {
          const lineOpacity = interpolate(
            frame,
            [20 + i * 5, 30 + i * 5],
            [0, 0.5],
            { extrapolateRight: 'clamp' }
          );
          
          if (frame < 20 + i * 5) return null;
          
          return (
            <Line
              key={i}
              points={connection as [number, number, number][]}
              color="#00ffff"
              lineWidth={2}
              transparent
              opacity={lineOpacity}
            />
          );
        })}
        
        {/* Core Switch */}
        <NetworkSwitch 
          position={[0, 4, 0]} 
          type="core" 
          label="Core Switch"
        />
        
        {/* Aggregation Switches */}
        <NetworkSwitch 
          position={[-3, 2, 0]} 
          type="aggregation" 
          label="Agg-1"
        />
        <NetworkSwitch 
          position={[3, 2, 0]} 
          type="aggregation" 
          label="Agg-2"
        />
        
        {/* Access Switches */}
        <NetworkSwitch position={[-5, 0, 0]} type="access" label="Access-1" />
        <NetworkSwitch position={[-3, 0, 0]} type="access" label="Access-2" />
        <NetworkSwitch position={[-1, 0, 0]} type="access" label="Access-3" />
        <NetworkSwitch position={[1, 0, 0]} type="access" label="Access-4" />
        <NetworkSwitch position={[3, 0, 0]} type="access" label="Access-5" />
        <NetworkSwitch position={[5, 0, 0]} type="access" label="Access-6" />
        
        {/* Router */}
        <Router position={[0, 6, 0]} label="Edge Router" />
        
        {/* Firewall */}
        <Firewall position={[0, 8, 0]} />
        
        {/* Internet cloud representation */}
        {frame > 110 && (
          <group position={[0, 10, 0]}>
            <Sphere args={[1, 16, 16]}>
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.3}
              />
            </Sphere>
            <Text
              position={[0, 0, 1.5]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              Internet
            </Text>
          </group>
        )}
        
        {/* Data packets animation */}
        {frame > 80 && (
          <>
            {/* Downlink traffic */}
            {[...Array(5)].map((_, i) => (
              <DataPacket
                key={`down-${i}`}
                startPos={[0, 8, 0]}
                endPos={[0, 4, 0]}
                delay={80 + i * 12}
                color="#00ff00"
                speed={1.5}
              />
            ))}
            
            {/* Core to Aggregation */}
            {[...Array(8)].map((_, i) => (
              <DataPacket
                key={`core-agg-${i}`}
                startPos={[0, 4, 0]}
                endPos={i % 2 === 0 ? [-3, 2, 0] : [3, 2, 0]}
                delay={100 + i * 8}
                color="#ffaa00"
                speed={1.2}
              />
            ))}
            
            {/* Aggregation to Access */}
            {[...Array(12)].map((_, i) => (
              <DataPacket
                key={`agg-access-${i}`}
                startPos={i < 6 ? [-3, 2, 0] : [3, 2, 0]}
                endPos={[
                  i < 6 ? -5 + (i % 3) * 2 : 1 + (i % 3) * 2,
                  0,
                  0
                ]}
                delay={120 + i * 6}
                color="#00aaff"
              />
            ))}
          </>
        )}
        
        {/* Main title */}
        {frame > 20 && (
          <Text
            position={[0, 12, 0]}
            fontSize={0.6}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Network Topology Architecture
          </Text>
        )}
        
        {/* Layer labels */}
        {frame > 60 && (
          <>
            <Text
              position={[-8, 4, 0]}
              fontSize={0.3}
              color="#ff6b6b"
              anchorX="center"
              anchorY="middle"
              rotation={[0, Math.PI / 4, 0]}
            >
              Core Layer
            </Text>
            
            <Text
              position={[-8, 2, 0]}
              fontSize={0.3}
              color="#4ecdc4"
              anchorX="center"
              anchorY="middle"
              rotation={[0, Math.PI / 4, 0]}
            >
              Aggregation Layer
            </Text>
            
            <Text
              position={[-8, 0, 0]}
              fontSize={0.3}
              color="#95e77e"
              anchorX="center"
              anchorY="middle"
              rotation={[0, Math.PI / 4, 0]}
            >
              Access Layer
            </Text>
          </>
        )}
        
        {/* Bandwidth indicator */}
        {frame > 140 && (
          <>
            <Text
              position={[0, 5, 1]}
              fontSize={0.15}
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              100 Gbps
            </Text>
            
            <Text
              position={[0, 3, 1]}
              fontSize={0.15}
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              40 Gbps
            </Text>
            
            <Text
              position={[0, 1, 1]}
              fontSize={0.15}
              color="#00ffff"
              anchorX="center"
              anchorY="middle"
            >
              10 Gbps
            </Text>
          </>
        )}
      </group>
      
      {/* Grid helper */}
      <gridHelper args={[20, 20, '#303030', '#202020']} position={[0, -1, 0]} />
    </>
  );
};

export const NetworkTopology3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0a0a2a 0%, #1a1a3a 100%)' }}>
      <Canvas shadows>
        <NetworkTopology3DScene />
      </Canvas>
    </div>
  );
};
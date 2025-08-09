import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import * as THREE from 'three';
import { Mesh, Group } from 'three';

interface ServerUnitProps {
  position: [number, number, number];
  index: number;
  totalFrames: number;
  isActive: boolean;
}

const ServerUnit: React.FC<ServerUnitProps> = ({ position, index, totalFrames, isActive }) => {
  const meshRef = useRef<Mesh>(null);
  const frame = useCurrentFrame();
  
  // Staggered appearance animation
  const appearDelay = index * 3;
  const opacity = interpolate(
    frame,
    [appearDelay, appearDelay + 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Pulsing effect for active servers
  const pulseIntensity = isActive ? Math.sin(frame * 0.1) * 0.5 + 0.5 : 0;
  
  // LED indicators animation
  const ledBrightness = interpolate(
    frame % 30,
    [0, 15, 30],
    [0.2, 1, 0.2],
    { extrapolateRight: 'clamp' }
  );

  return (
    <group position={position}>
      {/* Server chassis */}
      <Box
        ref={meshRef}
        args={[4.8, 0.4, 0.8]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Front panel */}
      <Box
        position={[0, 0, 0.41]}
        args={[4.7, 0.35, 0.02]}
      >
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Drive bays */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          position={[-1.8 + i * 0.5, 0, 0.42]}
          args={[0.4, 0.25, 0.01]}
        >
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={opacity}
          />
        </Box>
      ))}
      
      {/* Power LED */}
      <Box
        position={[2.2, 0.1, 0.43]}
        args={[0.05, 0.05, 0.01]}
      >
        <meshStandardMaterial
          color={new THREE.Color(0, 1, 0)}
          emissive={new THREE.Color(0, 1, 0)}
          emissiveIntensity={ledBrightness * 2}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Activity LEDs */}
      {[...Array(4)].map((_, i) => (
        <Box
          key={i}
          position={[1.8 + i * 0.15, 0.1, 0.43]}
          args={[0.05, 0.05, 0.01]}
        >
          <meshStandardMaterial
            color={new THREE.Color(1, 0.5, 0)}
            emissive={new THREE.Color(1, 0.5, 0)}
            emissiveIntensity={isActive ? ledBrightness * pulseIntensity : 0}
            transparent
            opacity={opacity}
          />
        </Box>
      ))}
      
      {/* Ventilation grilles */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          position={[-1.5 + i * 0.25, -0.15, 0.42]}
          args={[0.15, 0.02, 0.01]}
        >
          <meshStandardMaterial
            color="#050505"
            transparent
            opacity={opacity * 0.8}
          />
        </Box>
      ))}
    </group>
  );
};

interface RackFrameProps {
  height: number;
}

const RackFrame: React.FC<RackFrameProps> = ({ height }) => {
  const frame = useCurrentFrame();
  
  // Rack appears first
  const rackOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <group>
      {/* Vertical posts */}
      {[
        [-2.5, 0, -0.5],
        [2.5, 0, -0.5],
        [-2.5, 0, 0.5],
        [2.5, 0, 0.5],
      ].map((pos, i) => (
        <Box
          key={i}
          position={pos as [number, number, number]}
          args={[0.1, height, 0.1]}
          castShadow
        >
          <meshStandardMaterial
            color="#333333"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={rackOpacity}
          />
        </Box>
      ))}
      
      {/* Top and bottom frames */}
      {[height / 2, -height / 2].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <Box position={[0, 0, -0.5]} args={[5, 0.1, 0.1]}>
            <meshStandardMaterial
              color="#333333"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={rackOpacity}
            />
          </Box>
          <Box position={[0, 0, 0.5]} args={[5, 0.1, 0.1]}>
            <meshStandardMaterial
              color="#333333"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={rackOpacity}
            />
          </Box>
        </group>
      ))}
      
      {/* Side panels with ventilation */}
      <Box position={[-2.55, 0, 0]} args={[0.02, height, 1]}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.7}
          transparent
          opacity={rackOpacity * 0.3}
        />
      </Box>
      <Box position={[2.55, 0, 0]} args={[0.02, height, 1]}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.7}
          transparent
          opacity={rackOpacity * 0.3}
        />
      </Box>
    </group>
  );
};

interface NetworkSwitchProps {
  position: [number, number, number];
}

const NetworkSwitch: React.FC<NetworkSwitchProps> = ({ position }) => {
  const frame = useCurrentFrame();
  const meshRef = useRef<Group>(null);
  
  // Delayed appearance for network equipment
  const opacity = interpolate(
    frame,
    [60, 80],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Port activity animation
  const portActivity = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => 
      Math.random() > 0.3 ? Math.random() * 30 : 0
    );
  }, []);

  return (
    <group ref={meshRef} position={position}>
      {/* Switch chassis */}
      <Box args={[4.8, 0.2, 0.6]} castShadow>
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Front panel */}
      <Box position={[0, 0, 0.31]} args={[4.7, 0.18, 0.02]}>
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Ethernet ports (24 ports) */}
      {[...Array(24)].map((_, i) => {
        const row = Math.floor(i / 12);
        const col = i % 12;
        const isActive = portActivity[i] > 0;
        const activityPhase = (frame + portActivity[i]) % 60;
        
        return (
          <group key={i}>
            <Box
              position={[-2 + col * 0.35, -0.04 + row * 0.08, 0.32]}
              args={[0.25, 0.06, 0.01]}
            >
              <meshStandardMaterial
                color="#000000"
                transparent
                opacity={opacity}
              />
            </Box>
            {/* Port LED */}
            <Box
              position={[-1.8 + col * 0.35, -0.04 + row * 0.08, 0.33]}
              args={[0.02, 0.02, 0.01]}
            >
              <meshStandardMaterial
                color={isActive ? new THREE.Color(0, 1, 0) : new THREE.Color(0.1, 0.1, 0.1)}
                emissive={isActive ? new THREE.Color(0, 1, 0) : new THREE.Color(0, 0, 0)}
                emissiveIntensity={isActive ? Math.sin(activityPhase * 0.2) * 0.5 + 0.5 : 0}
                transparent
                opacity={opacity}
              />
            </Box>
          </group>
        );
      })}
      
      {/* Status display */}
      <Box position={[2, 0, 0.32]} args={[0.5, 0.1, 0.01]}>
        <meshStandardMaterial
          color="#001100"
          emissive={new THREE.Color(0, 0.5, 0)}
          emissiveIntensity={0.2}
          transparent
          opacity={opacity}
        />
      </Box>
    </group>
  );
};

interface PDUProps {
  position: [number, number, number];
}

const PDU: React.FC<PDUProps> = ({ position }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [90, 110],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  return (
    <group position={position}>
      {/* PDU body */}
      <Box args={[0.3, 8, 0.2]} castShadow>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Power outlets */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          position={[0.16, 3.5 - i * 0.35, 0]}
          args={[0.02, 0.15, 0.1]}
        >
          <meshStandardMaterial
            color="#000000"
            transparent
            opacity={opacity}
          />
        </Box>
      ))}
      
      {/* Status LEDs */}
      {[...Array(20)].map((_, i) => {
        const isOn = Math.random() > 0.2;
        return (
          <Box
            key={i}
            position={[0.16, 3.6 - i * 0.35, 0.05]}
            args={[0.01, 0.01, 0.01]}
          >
            <meshStandardMaterial
              color={isOn ? new THREE.Color(0, 1, 0) : new THREE.Color(1, 0, 0)}
              emissive={isOn ? new THREE.Color(0, 1, 0) : new THREE.Color(0, 0, 0)}
              emissiveIntensity={isOn ? 1 : 0}
              transparent
              opacity={opacity}
            />
          </Box>
        );
      })}
    </group>
  );
};

interface ServerRack3DSceneProps {
  showLabels?: boolean;
}

const ServerRack3DScene: React.FC<ServerRack3DSceneProps> = ({ showLabels = true }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  // Rotation animation
  const rotation = interpolate(
    frame,
    [120, 300],
    [0, Math.PI * 0.5],
    { extrapolateRight: 'clamp' }
  );
  
  // Camera zoom
  const cameraZ = interpolate(
    frame,
    [0, 60, 120, 180],
    [15, 12, 10, 12],
    { extrapolateRight: 'clamp' }
  );
  
  const activeServers = useMemo(() => {
    return Array.from({ length: 20 }, () => Math.random() > 0.3);
  }, []);

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[8, 5, cameraZ]} 
        fov={45}
      />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={frame > 300}
        autoRotateSpeed={0.5}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -5]} intensity={0.5} />
      
      {/* Environment for reflections */}
      <Environment preset="warehouse" />
      
      <group ref={groupRef} rotation={[0, rotation, 0]}>
        {/* Rack frame */}
        <RackFrame height={10} />
        
        {/* Network switches at top */}
        <NetworkSwitch position={[0, 4.5, 0]} />
        <NetworkSwitch position={[0, 4.2, 0]} />
        
        {/* Server units */}
        {[...Array(20)].map((_, i) => (
          <ServerUnit
            key={i}
            position={[0, 3.5 - i * 0.45, 0]}
            index={i}
            totalFrames={300}
            isActive={activeServers[i]}
          />
        ))}
        
        {/* PDUs on sides */}
        <PDU position={[-2.8, 0, 0]} />
        <PDU position={[2.8, 0, 0]} />
        
        {/* Labels */}
        {showLabels && frame > 140 && (
          <>
            <Text
              position={[0, 5.5, 0]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              42U Server Rack
            </Text>
            
            <Text
              position={[0, 4.5, 1.5]}
              fontSize={0.2}
              color="#00ff00"
              anchorX="center"
              anchorY="middle"
            >
              Network Switches
            </Text>
            
            <Text
              position={[3.5, 0, 0]}
              fontSize={0.2}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
              rotation={[0, Math.PI / 2, 0]}
            >
              Power Distribution
            </Text>
          </>
        )}
      </group>
      
      {/* Floor grid */}
      <gridHelper args={[20, 20, '#404040', '#202020']} position={[0, -5, 0]} />
    </>
  );
};

export const ServerRack3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
      <Canvas shadows>
        <ServerRack3DScene showLabels={true} />
      </Canvas>
    </div>
  );
};
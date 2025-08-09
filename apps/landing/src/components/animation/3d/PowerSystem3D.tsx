import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere, Text, OrbitControls, PerspectiveCamera, Environment, Torus } from '@react-three/drei';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import * as THREE from 'three';
import { Group, Mesh } from 'three';

interface ElectricityFlowProps {
  path: Array<[number, number, number]>;
  delay: number;
  color: string;
}

const ElectricityFlow: React.FC<ElectricityFlowProps> = ({ path, delay, color }) => {
  const frame = useCurrentFrame();
  const particleRef = useRef<Mesh>(null);
  
  const progress = ((frame - delay) % 60) / 60;
  const visible = frame > delay;
  
  if (!visible || path.length < 2) return null;
  
  // Calculate position along path
  const segmentLength = 1 / (path.length - 1);
  const currentSegment = Math.floor(progress / segmentLength);
  const segmentProgress = (progress % segmentLength) / segmentLength;
  
  if (currentSegment >= path.length - 1) return null;
  
  const start = path[currentSegment];
  const end = path[currentSegment + 1];
  
  const x = start[0] + (end[0] - start[0]) * segmentProgress;
  const y = start[1] + (end[1] - start[1]) * segmentProgress;
  const z = start[2] + (end[2] - start[2]) * segmentProgress;
  
  const opacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <Sphere
      ref={particleRef}
      position={[x, y, z]}
      args={[0.1, 8, 8]}
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

interface UPSUnitProps {
  position: [number, number, number];
  unitId: string;
}

const UPSUnit: React.FC<UPSUnitProps> = ({ position, unitId }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  const opacity = interpolate(
    frame,
    [30, 60],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Battery charge animation
  const chargeLevel = interpolate(
    (frame % 120),
    [0, 60, 120],
    [0.7, 1, 0.7],
    { extrapolateRight: 'clamp' }
  );
  
  // Status LED blinking
  const ledBlink = Math.sin(frame * 0.1) * 0.5 + 0.5;

  return (
    <group ref={groupRef} position={position}>
      {/* Main UPS cabinet */}
      <Box args={[2, 3, 1.5]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#3a4a5a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Front panel */}
      <Box position={[0, 0, 0.76]} args={[1.8, 2.8, 0.02]}>
        <meshStandardMaterial
          color="#2a3a4a"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Display screen */}
      <Box position={[0, 0.8, 0.77]} args={[1, 0.6, 0.02]}>
        <meshStandardMaterial
          color="#001122"
          emissive={new THREE.Color(0, 0.5, 1)}
          emissiveIntensity={0.5}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Battery level indicators */}
      {[...Array(10)].map((_, i) => {
        const isActive = i < Math.floor(chargeLevel * 10);
        const barColor = i < 3 ? '#ff0000' : i < 6 ? '#ffaa00' : '#00ff00';
        
        return (
          <Box
            key={i}
            position={[-0.3 + i * 0.07, 0.8, 0.78]}
            args={[0.05, 0.3, 0.01]}
          >
            <meshStandardMaterial
              color={isActive ? barColor : '#111111'}
              emissive={isActive ? new THREE.Color(barColor) : new THREE.Color(0, 0, 0)}
              emissiveIntensity={isActive ? 1 : 0}
              transparent
              opacity={opacity}
            />
          </Box>
        );
      })}
      
      {/* Status LEDs */}
      <group position={[0, 0, 0.78]}>
        {/* Power LED */}
        <Box position={[-0.5, 0.2, 0]} args={[0.1, 0.1, 0.01]}>
          <meshStandardMaterial
            color="#00ff00"
            emissive={new THREE.Color(0, 1, 0)}
            emissiveIntensity={ledBlink}
            transparent
            opacity={opacity}
          />
        </Box>
        
        {/* Battery LED */}
        <Box position={[0, 0.2, 0]} args={[0.1, 0.1, 0.01]}>
          <meshStandardMaterial
            color="#ffaa00"
            emissive={new THREE.Color(1, 0.7, 0)}
            emissiveIntensity={0.8}
            transparent
            opacity={opacity}
          />
        </Box>
        
        {/* Fault LED */}
        <Box position={[0.5, 0.2, 0]} args={[0.1, 0.1, 0.01]}>
          <meshStandardMaterial
            color="#111111"
            transparent
            opacity={opacity}
          />
        </Box>
      </group>
      
      {/* Ventilation grilles */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          position={[0, -0.8 + i * 0.15, 0.77]}
          args={[1.5, 0.02, 0.01]}
        >
          <meshStandardMaterial
            color="#0a0a0a"
            transparent
            opacity={opacity * 0.8}
          />
        </Box>
      ))}
      
      {/* Power input/output ports */}
      <group position={[0, -1.3, 0]}>
        <Cylinder position={[-0.5, 0, 0.76]} args={[0.08, 0.08, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#ff0000" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder position={[0.5, 0, 0.76]} args={[0.08, 0.08, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0000ff" metalness={0.8} roughness={0.2} />
        </Cylinder>
      </group>
      
      {/* Unit label */}
      <Text
        position={[0, 1.7, 0.8]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {unitId}
      </Text>
      
      {/* Runtime display */}
      {frame > 80 && (
        <Text
          position={[0, 0.4, 0.78]}
          fontSize={0.12}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
        >
          Runtime: 45 min
        </Text>
      )}
    </group>
  );
};

interface GeneratorProps {
  position: [number, number, number];
}

const Generator: React.FC<GeneratorProps> = ({ position }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  const opacity = interpolate(
    frame,
    [60, 90],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Engine vibration effect
  const vibration = Math.sin(frame * 0.5) * 0.003;
  
  // Exhaust smoke particles
  const smokePhase = (frame % 60) / 60;

  return (
    <group ref={groupRef} position={[position[0] + vibration, position[1], position[2]]}>
      {/* Main generator body */}
      <Box args={[4, 2.5, 2]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#5a4a3a"
          metalness={0.5}
          roughness={0.5}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Engine block */}
      <Box position={[-0.5, 0, 0]} args={[2, 2, 1.5]}>
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Alternator */}
      <Cylinder
        position={[1.5, 0, 0]}
        args={[0.6, 0.6, 1.5]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color="#4a5a6a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </Cylinder>
      
      {/* Cooling radiator */}
      <Box position={[-1.5, 0.5, 0]} args={[0.1, 1.5, 1.5]}>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Radiator fins */}
      {[...Array(10)].map((_, i) => (
        <Box
          key={i}
          position={[-1.48, 0.5, -0.6 + i * 0.13]}
          args={[0.02, 1.4, 0.02]}
        >
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={opacity * 0.8}
          />
        </Box>
      ))}
      
      {/* Exhaust stack */}
      <Cylinder
        position={[0.5, 1.5, 0]}
        args={[0.15, 0.15, 1]}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Cylinder>
      
      {/* Exhaust smoke effect */}
      {frame > 100 && [...Array(3)].map((_, i) => {
        const smokeY = 2 + smokePhase * 2 + i * 0.3;
        const smokeOpacity = (1 - smokePhase) * 0.3;
        
        return (
          <Sphere
            key={i}
            position={[0.5, smokeY, 0]}
            args={[0.2 + smokePhase * 0.3, 8, 8]}
          >
            <meshStandardMaterial
              color="#888888"
              transparent
              opacity={smokeOpacity * opacity}
            />
          </Sphere>
        );
      })}
      
      {/* Control panel */}
      <Box position={[1, 0, 1.01]} args={[0.8, 0.6, 0.05]}>
        <meshStandardMaterial
          color="#1a2a3a"
          emissive={new THREE.Color(0, 0.5, 0)}
          emissiveIntensity={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Status indicators */}
      {['#00ff00', '#00ff00', '#ffaa00'].map((color, i) => (
        <Box
          key={i}
          position={[0.7 + i * 0.2, 0, 1.02]}
          args={[0.08, 0.08, 0.02]}
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
      
      {/* Fuel tank */}
      <Cylinder
        position={[0, -1.5, 0]}
        args={[0.8, 0.8, 3]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Cylinder>
      
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Diesel Generator
      </Text>
      
      {/* Capacity label */}
      {frame > 100 && (
        <Text
          position={[0, 0, 1.2]}
          fontSize={0.15}
          color="#ffaa00"
          anchorX="center"
          anchorY="middle"
        >
          2000 kVA
        </Text>
      )}
    </group>
  );
};

interface TransformerProps {
  position: [number, number, number];
  label: string;
}

const Transformer: React.FC<TransformerProps> = ({ position, label }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [10, 40],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Electromagnetic field effect
  const fieldIntensity = Math.sin(frame * 0.05) * 0.5 + 0.5;

  return (
    <group position={position}>
      {/* Transformer core */}
      <Box args={[1.5, 2, 1.5]} castShadow>
        <meshStandardMaterial
          color="#4a3a2a"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Coil windings */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <Torus
          key={i}
          position={[0, y, 0]}
          args={[0.6, 0.1, 8, 24]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#aa6633"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={opacity}
          />
        </Torus>
      ))}
      
      {/* High voltage bushings */}
      {[-0.5, 0.5].map((x, i) => (
        <Cylinder
          key={i}
          position={[x, 1.2, 0]}
          args={[0.08, 0.12, 0.4]}
        >
          <meshStandardMaterial
            color="#8a6a4a"
            metalness={0.6}
            roughness={0.4}
            transparent
            opacity={opacity}
          />
        </Cylinder>
      ))}
      
      {/* Cooling fins */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          position={[0.76, -0.5 + i * 0.15, 0]}
          args={[0.02, 0.1, 1.3]}
        >
          <meshStandardMaterial
            color="#3a3a3a"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={opacity * 0.9}
          />
        </Box>
      ))}
      
      {/* Electromagnetic field visualization */}
      {frame > 50 && (
        <Torus
          position={[0, 0, 0]}
          args={[1, 0.02, 16, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial
            color="#ffff00"
            emissive={new THREE.Color(1, 1, 0)}
            emissiveIntensity={fieldIntensity * 0.5}
            transparent
            opacity={fieldIntensity * 0.3}
          />
        </Torus>
      )}
      
      <Text
        position={[0, -1.3, 0.8]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

interface PDUPanelProps {
  position: [number, number, number];
}

const PDUPanel: React.FC<PDUPanelProps> = ({ position }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [90, 120],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Circuit breaker status
  const breakerStatus = useMemo(() => {
    return Array.from({ length: 20 }, () => Math.random() > 0.1);
  }, []);

  return (
    <group position={position}>
      {/* Main panel */}
      <Box args={[2, 3, 0.3]} castShadow>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Panel door */}
      <Box position={[0, 0, 0.16]} args={[1.8, 2.8, 0.02]}>
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Circuit breakers */}
      {[...Array(20)].map((_, i) => {
        const row = i % 10;
        const col = Math.floor(i / 10);
        const isOn = breakerStatus[i];
        
        return (
          <group key={i}>
            <Box
              position={[-0.4 + col * 0.8, 1.2 - row * 0.25, 0.17]}
              args={[0.3, 0.15, 0.02]}
            >
              <meshStandardMaterial
                color="#1a1a1a"
                transparent
                opacity={opacity}
              />
            </Box>
            
            {/* Breaker switch */}
            <Box
              position={[-0.4 + col * 0.8, 1.2 - row * 0.25, 0.18]}
              args={[0.08, 0.04, 0.02]}
            >
              <meshStandardMaterial
                color={isOn ? '#00ff00' : '#ff0000'}
                emissive={isOn ? new THREE.Color(0, 0.5, 0) : new THREE.Color(0.5, 0, 0)}
                emissiveIntensity={0.5}
                transparent
                opacity={opacity}
              />
            </Box>
          </group>
        );
      })}
      
      {/* Main breaker */}
      <Box position={[0, -1, 0.17]} args={[0.6, 0.3, 0.03]}>
        <meshStandardMaterial
          color="#ff0000"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Digital display */}
      <Box position={[0, 1.8, 0.17]} args={[0.8, 0.3, 0.02]}>
        <meshStandardMaterial
          color="#001122"
          emissive={new THREE.Color(0, 1, 0.5)}
          emissiveIntensity={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      <Text
        position={[0, -1.7, 0.2]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        PDU Panel
      </Text>
      
      {/* Load percentage */}
      {frame > 110 && (
        <Text
          position={[0, 1.8, 0.19]}
          fontSize={0.1}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          Load: 72%
        </Text>
      )}
    </group>
  );
};

const PowerSystem3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Camera animation
  const cameraPosition = {
    x: interpolate(frame, [0, 100, 200, 300], [15, 12, 10, 12]),
    y: interpolate(frame, [0, 100, 200, 300], [10, 8, 6, 8]),
    z: interpolate(frame, [0, 100, 200, 300], [15, 13, 11, 13]),
  };
  
  // Power flow paths
  const powerPaths = useMemo(() => [
    // Utility to transformer
    [[-8, 0, 0], [-5, 0, 0], [-2, 0, 0]],
    // Transformer to UPS
    [[-2, 0, 0], [0, 0, 0], [2, 0, 0]],
    // UPS to PDU
    [[2, 0, 0], [4, 0, 0], [6, 0, 0]],
    // Generator backup path
    [[8, 0, -4], [5, 0, -2], [2, 0, 0]],
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
        autoRotate={frame > 280}
        autoRotateSpeed={0.25}
        target={[0, 0, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -5]} intensity={0.6} color="#ffaa88" />
      <pointLight position={[5, 5, 5]} intensity={0.4} color="#8888ff" />
      
      {/* Environment */}
      <Environment preset="warehouse" />
      
      <group>
        {/* Utility transformer */}
        <Transformer position={[-5, 0, 0]} label="Utility Transformer" />
        
        {/* UPS units */}
        <UPSUnit position={[0, 0, 0]} unitId="UPS-A" />
        <UPSUnit position={[0, 0, -3]} unitId="UPS-B" />
        
        {/* Generator */}
        <Generator position={[8, 0, -4]} />
        
        {/* PDU Panel */}
        <PDUPanel position={[6, 0, 0]} />
        
        {/* Automatic Transfer Switch */}
        <group position={[2, 0, -4]}>
          <Box args={[1.5, 1.5, 0.8]} castShadow>
            <meshStandardMaterial
              color="#4a4a4a"
              metalness={0.6}
              roughness={0.4}
            />
          </Box>
          <Text
            position={[0, -1, 0.5]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            ATS
          </Text>
        </group>
        
        {/* Power flow visualization */}
        {frame > 50 && powerPaths.map((path, pathIndex) => (
          [...Array(10)].map((_, i) => (
            <ElectricityFlow
              key={`${pathIndex}-${i}`}
              path={path as Array<[number, number, number]>}
              delay={50 + pathIndex * 20 + i * 6}
              color="#ffff00"
            />
          ))
        ))}
        
        {/* Main title */}
        {frame > 20 && (
          <Text
            position={[0, 5, -6]}
            fontSize={0.6}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Data Center Power Infrastructure
          </Text>
        )}
        
        {/* Power path labels */}
        {frame > 80 && (
          <>
            <Text
              position={[-5, 2, 0]}
              fontSize={0.2}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
            >
              Utility Input
            </Text>
            
            <Text
              position={[0, 2, 1]}
              fontSize={0.2}
              color="#00ff00"
              anchorX="center"
              anchorY="middle"
            >
              UPS Systems
            </Text>
            
            <Text
              position={[6, 2, 0]}
              fontSize={0.2}
              color="#0088ff"
              anchorX="center"
              anchorY="middle"
            >
              Distribution
            </Text>
            
            <Text
              position={[8, 2, -4]}
              fontSize={0.2}
              color="#ff8800"
              anchorX="center"
              anchorY="middle"
            >
              Backup Power
            </Text>
          </>
        )}
        
        {/* Redundancy indicator */}
        {frame > 120 && (
          <Text
            position={[0, 4, 2]}
            fontSize={0.25}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
          >
            N+1 Redundancy Active
          </Text>
        )}
      </group>
      
      {/* Floor */}
      <Box args={[25, 0.1, 15]} position={[0, -2, -2]} receiveShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Grid */}
      <gridHelper args={[25, 25, '#303030', '#202020']} position={[0, -1.95, -2]} />
    </>
  );
};

export const PowerSystem3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1a0a0a 0%, #2a1a1a 100%)' }}>
      <Canvas shadows>
        <PowerSystem3DScene />
      </Canvas>
    </div>
  );
};
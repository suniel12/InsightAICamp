import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text, OrbitControls, PerspectiveCamera, Environment, Sphere } from '@react-three/drei';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import * as THREE from 'three';
import { Group, Mesh } from 'three';

interface ServerRowProps {
  position: [number, number, number];
  rowIndex: number;
  label?: string;
}

const ServerRow: React.FC<ServerRowProps> = ({ position, rowIndex, label }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  // Staggered appearance
  const appearDelay = rowIndex * 10;
  const opacity = interpolate(
    frame,
    [appearDelay, appearDelay + 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  const scaleY = spring({
    frame: frame - appearDelay,
    fps: 30,
    from: 0,
    to: 1,
    config: {
      damping: 15,
      stiffness: 100,
      mass: 1,
    },
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Row of server racks */}
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[i * 1.2, 0, 0]}>
          {/* Rack frame */}
          <Box 
            args={[1, 2 * scaleY, 0.8]} 
            position={[0, scaleY, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.7}
              roughness={0.3}
              transparent
              opacity={opacity}
            />
          </Box>
          
          {/* Server indicators */}
          {[...Array(10)].map((_, j) => {
            const isActive = Math.random() > 0.2;
            const ledPhase = (frame + i * 5 + j * 2) % 60;
            
            return (
              <Box
                key={j}
                position={[0, 0.2 + j * 0.18 * scaleY, 0.41]}
                args={[0.8, 0.15, 0.02]}
              >
                <meshStandardMaterial
                  color="#0a0a0a"
                  emissive={isActive ? new THREE.Color(0, 0.3, 0) : new THREE.Color(0, 0, 0)}
                  emissiveIntensity={isActive ? Math.sin(ledPhase * 0.1) * 0.5 + 0.5 : 0}
                  transparent
                  opacity={opacity}
                />
              </Box>
            );
          })}
        </group>
      ))}
      
      {/* Row label */}
      {label && frame > 60 && (
        <Text
          position={[3.5, 2.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

interface CoolingUnitProps {
  position: [number, number, number];
  type: 'CRAC' | 'CRAH';
  index: number;
}

const CoolingUnit: React.FC<CoolingUnitProps> = ({ position, type, index }) => {
  const frame = useCurrentFrame();
  const meshRef = useRef<Mesh>(null);
  
  // Cooling units appear after servers
  const appearDelay = 80 + index * 8;
  const opacity = interpolate(
    frame,
    [appearDelay, appearDelay + 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Fan rotation animation
  const fanRotation = frame * 0.05;
  
  // Airflow particle effect timing
  const flowIntensity = interpolate(
    frame % 120,
    [0, 60, 120],
    [0.3, 1, 0.3],
    { extrapolateRight: 'clamp' }
  );

  return (
    <group position={position}>
      {/* Main unit body */}
      <Box 
        ref={meshRef}
        args={[1.5, 2.5, 1.5]} 
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={type === 'CRAC' ? '#2a4a6a' : '#3a5a4a'}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Front grille */}
      <Box position={[0, 0, 0.76]} args={[1.3, 2.3, 0.02]}>
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={opacity * 0.8}
        />
      </Box>
      
      {/* Fan representation */}
      <group position={[0, 0.5, 0.77]} rotation={[0, 0, fanRotation]}>
        {[...Array(6)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          return (
            <Box
              key={i}
              position={[Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0]}
              args={[0.3, 0.05, 0.02]}
              rotation={[0, 0, angle]}
            >
              <meshStandardMaterial
                color="#1a1a1a"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={opacity}
              />
            </Box>
          );
        })}
      </group>
      
      {/* Status panel */}
      <Box position={[0, 1.8, 0.76]} args={[0.6, 0.3, 0.02]}>
        <meshStandardMaterial
          color="#001100"
          emissive={new THREE.Color(0, 1, 0)}
          emissiveIntensity={flowIntensity * 0.5}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Type label */}
      <Text
        position={[0, -1.5, 0.8]}
        fontSize={0.15}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
      
      {/* Airflow visualization particles */}
      {frame > appearDelay + 30 && [...Array(5)].map((_, i) => {
        const particlePhase = (frame + i * 20) % 100;
        const particleY = interpolate(
          particlePhase,
          [0, 100],
          [-1.2, 3],
          { extrapolateRight: 'clamp' }
        );
        
        return (
          <Sphere
            key={i}
            position={[
              Math.sin(i * 1.2) * 0.3,
              particleY,
              0.9 + Math.cos(i * 1.2) * 0.1
            ]}
            args={[0.05, 8, 8]}
          >
            <meshStandardMaterial
              color={type === 'CRAC' ? '#0080ff' : '#00ff80'}
              emissive={type === 'CRAC' ? new THREE.Color(0, 0.5, 1) : new THREE.Color(0, 1, 0.5)}
              emissiveIntensity={flowIntensity}
              transparent
              opacity={opacity * flowIntensity * 0.6}
            />
          </Sphere>
        );
      })}
    </group>
  );
};

interface PowerInfrastructureProps {
  position: [number, number, number];
}

const PowerInfrastructure: React.FC<PowerInfrastructureProps> = ({ position }) => {
  const frame = useCurrentFrame();
  
  const appearDelay = 120;
  const opacity = interpolate(
    frame,
    [appearDelay, appearDelay + 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Power flow animation
  const flowPosition = (frame % 60) / 60;

  return (
    <group position={position}>
      {/* UPS units */}
      {[0, 2].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <Box args={[1.5, 2, 1.2]} castShadow>
            <meshStandardMaterial
              color="#4a4a0a"
              metalness={0.6}
              roughness={0.4}
              transparent
              opacity={opacity}
            />
          </Box>
          
          {/* Battery indicator */}
          <Box position={[0, 0.5, 0.61]} args={[0.8, 0.3, 0.02]}>
            <meshStandardMaterial
              color="#001100"
              emissive={new THREE.Color(0, 1, 0)}
              emissiveIntensity={0.5}
              transparent
              opacity={opacity}
            />
          </Box>
          
          {/* Status LEDs */}
          {[...Array(5)].map((_, j) => (
            <Box
              key={j}
              position={[-0.3 + j * 0.15, -0.2, 0.61]}
              args={[0.08, 0.08, 0.02]}
            >
              <meshStandardMaterial
                color={j < 4 ? new THREE.Color(0, 1, 0) : new THREE.Color(1, 1, 0)}
                emissive={j < 4 ? new THREE.Color(0, 1, 0) : new THREE.Color(1, 1, 0)}
                emissiveIntensity={1}
                transparent
                opacity={opacity}
              />
            </Box>
          ))}
          
          <Text
            position={[0, -1.2, 0.7]}
            fontSize={0.12}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
          >
            UPS {i + 1}
          </Text>
        </group>
      ))}
      
      {/* Generator */}
      <group position={[4, 0, 0]}>
        <Box args={[2, 1.5, 1.5]} castShadow>
          <meshStandardMaterial
            color="#5a3a3a"
            metalness={0.5}
            roughness={0.5}
            transparent
            opacity={opacity}
          />
        </Box>
        
        {/* Exhaust pipe */}
        <Box position={[0.8, 0.9, 0]} args={[0.3, 0.3, 1.5]}>
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={opacity}
          />
        </Box>
        
        <Text
          position={[0, -1, 0.8]}
          fontSize={0.12}
          color="#aaaaaa"
          anchorX="center"
          anchorY="middle"
        >
          Backup Generator
        </Text>
      </group>
      
      {/* Power flow visualization */}
      {frame > appearDelay + 40 && (
        <group>
          {/* Main power line */}
          <Box 
            position={[1 + flowPosition * 3, -0.5, 0]} 
            args={[0.2, 0.05, 0.05]}
          >
            <meshStandardMaterial
              color="#ffff00"
              emissive={new THREE.Color(1, 1, 0)}
              emissiveIntensity={2}
              transparent
              opacity={opacity * 0.8}
            />
          </Box>
        </group>
      )}
    </group>
  );
};

const DataCenterOverview3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  // Camera animation
  const cameraX = interpolate(
    frame,
    [0, 100, 200, 300],
    [20, 15, 10, 15],
    { extrapolateRight: 'clamp' }
  );
  
  const cameraY = interpolate(
    frame,
    [0, 100, 200, 300],
    [15, 12, 10, 12],
    { extrapolateRight: 'clamp' }
  );
  
  const cameraZ = interpolate(
    frame,
    [0, 100, 200, 300],
    [20, 18, 15, 18],
    { extrapolateRight: 'clamp' }
  );

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[cameraX, cameraY, cameraZ]} 
        fov={50}
      />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate={frame > 250}
        autoRotateSpeed={0.3}
        target={[5, 0, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[15, 20, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 15, -10]} intensity={0.6} color="#8888ff" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      <group ref={groupRef}>
        {/* Floor */}
        <Box 
          args={[30, 0.1, 20]} 
          position={[5, -0.05, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* Raised floor grid pattern */}
        {[...Array(15)].map((_, i) => (
          [...Array(10)].map((_, j) => (
            <Box
              key={`tile-${i}-${j}`}
              args={[1.9, 0.02, 1.9]}
              position={[-2 + i * 2, 0.01, -9 + j * 2]}
              receiveShadow
            >
              <meshStandardMaterial 
                color="#2a2a2a" 
                metalness={0.6} 
                roughness={0.4}
                transparent
                opacity={0.9}
              />
            </Box>
          ))
        ))}
        
        {/* Server rows */}
        <ServerRow position={[-2, 0, -6]} rowIndex={0} label="Row A" />
        <ServerRow position={[-2, 0, -3]} rowIndex={1} label="Row B" />
        <ServerRow position={[-2, 0, 0]} rowIndex={2} label="Row C" />
        <ServerRow position={[-2, 0, 3]} rowIndex={3} label="Row D" />
        <ServerRow position={[-2, 0, 6]} rowIndex={4} label="Row E" />
        
        {/* Cooling units along the walls */}
        <CoolingUnit position={[12, 0, -6]} type="CRAC" index={0} />
        <CoolingUnit position={[12, 0, -2]} type="CRAH" index={1} />
        <CoolingUnit position={[12, 0, 2]} type="CRAC" index={2} />
        <CoolingUnit position={[12, 0, 6]} type="CRAH" index={3} />
        
        {/* Power infrastructure */}
        <PowerInfrastructure position={[14, 0, -8]} />
        
        {/* Main title */}
        {frame > 30 && (
          <Text
            position={[5, 5, -10]}
            fontSize={0.8}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Data Center Infrastructure Overview
          </Text>
        )}
        
        {/* Section labels */}
        {frame > 100 && (
          <>
            <Text
              position={[2, 3, -8]}
              fontSize={0.4}
              color="#00ff00"
              anchorX="center"
              anchorY="middle"
            >
              IT Equipment
            </Text>
            
            <Text
              position={[12, 3, -8]}
              fontSize={0.4}
              color="#0080ff"
              anchorX="center"
              anchorY="middle"
            >
              Cooling Systems
            </Text>
            
            <Text
              position={[16, 3, -8]}
              fontSize={0.4}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
            >
              Power Systems
            </Text>
          </>
        )}
      </group>
      
      {/* Grid helper */}
      <gridHelper args={[40, 40, '#303030', '#202020']} position={[5, -0.1, 0]} />
    </>
  );
};

export const DataCenterOverview3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0a0a1a 0%, #1a2a3a 100%)' }}>
      <Canvas shadows>
        <DataCenterOverview3DScene />
      </Canvas>
    </div>
  );
};
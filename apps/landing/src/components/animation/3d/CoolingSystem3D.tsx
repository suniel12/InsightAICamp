import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sphere, Text, OrbitControls, PerspectiveCamera, Environment, Cylinder, Torus } from '@react-three/drei';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import * as THREE from 'three';
import { Group, Vector3 } from 'three';

interface AirflowParticleProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  delay: number;
  color: string;
  temperature: 'cold' | 'hot';
}

const AirflowParticle: React.FC<AirflowParticleProps> = ({ 
  startPos, 
  endPos, 
  delay, 
  color,
  temperature 
}) => {
  const frame = useCurrentFrame();
  const particleRef = useRef<THREE.Mesh>(null);
  
  const progress = ((frame - delay) % 120) / 120;
  const visible = frame > delay;
  
  const x = startPos[0] + (endPos[0] - startPos[0]) * progress;
  const y = startPos[1] + (endPos[1] - startPos[1]) * progress;
  const z = startPos[2] + (endPos[2] - startPos[2]) * progress;
  
  // Add some wave motion for more realistic flow
  const waveOffset = Math.sin(progress * Math.PI * 2) * 0.2;
  
  const opacity = interpolate(
    progress,
    [0, 0.1, 0.9, 1],
    [0, 0.8, 0.8, 0],
    { extrapolateRight: 'clamp' }
  );

  if (!visible) return null;

  return (
    <Sphere
      ref={particleRef}
      position={[x, y + waveOffset, z]}
      args={[0.08, 8, 8]}
    >
      <meshStandardMaterial
        color={color}
        emissive={new THREE.Color(color)}
        emissiveIntensity={temperature === 'hot' ? 0.8 : 0.5}
        transparent
        opacity={opacity}
      />
    </Sphere>
  );
};

interface CRACUnitProps {
  position: [number, number, number];
}

const CRACUnit: React.FC<CRACUnitProps> = ({ position }) => {
  const frame = useCurrentFrame();
  const groupRef = useRef<Group>(null);
  
  const opacity = interpolate(
    frame,
    [10, 40],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Fan blade rotation
  const fanRotation = frame * 0.1;
  
  // Compressor vibration effect
  const vibration = Math.sin(frame * 0.3) * 0.002;

  return (
    <group ref={groupRef} position={position}>
      {/* Main unit housing */}
      <Box args={[3, 4, 2]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#2a4a7a"
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Front intake grille */}
      <group position={[0, 0, 1.01]}>
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            position={[0, -1.5 + i * 0.4, 0]}
            args={[2.8, 0.05, 0.02]}
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
      </group>
      
      {/* Internal components visible through cutaway */}
      <group position={[0, 0, -0.3]}>
        {/* Evaporator coils */}
        {[...Array(10)].map((_, i) => (
          <Cylinder
            key={i}
            position={[-1 + i * 0.2, 0.5, 0]}
            args={[0.03, 0.03, 2.5]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color="#4488ff"
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={opacity * 0.8}
            />
          </Cylinder>
        ))}
        
        {/* Compressor */}
        <Cylinder
          position={[0, -1.2, 0]}
          args={[0.4, 0.4, 0.8]}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#3a3a3a"
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={opacity}
          />
        </Cylinder>
      </group>
      
      {/* Fan assembly */}
      <group position={[0, 1.2, 0.8]} rotation={[0, 0, fanRotation]}>
        <Cylinder args={[0.05, 0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </Cylinder>
        {[...Array(8)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          return (
            <Box
              key={i}
              position={[Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0]}
              args={[0.4, 0.08, 0.05]}
              rotation={[0, 0, angle]}
            >
              <meshStandardMaterial
                color="#2a2a2a"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={opacity}
              />
            </Box>
          );
        })}
      </group>
      
      {/* Control panel */}
      <Box position={[1.2, 0.5, 1.01]} args={[0.5, 0.8, 0.05]}>
        <meshStandardMaterial
          color="#001122"
          emissive={new THREE.Color(0, 0.5, 1)}
          emissiveIntensity={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      {/* Status indicators */}
      {['#00ff00', '#00ff00', '#ffaa00'].map((color, i) => (
        <Box
          key={i}
          position={[1.2, 0.8 - i * 0.2, 1.02]}
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
      
      {/* Unit label */}
      <Text
        position={[0, 2.3, 1]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        CRAC Unit
      </Text>
      
      {/* Temperature display */}
      {frame > 60 && (
        <Text
          position={[-1.2, 0.5, 1.02]}
          fontSize={0.15}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${18 + Math.sin(frame * 0.02) * 2}°C`}
        </Text>
      )}
    </group>
  );
};

interface HotAisleColdAisleProps {}

const HotAisleColdAisle: React.FC<HotAisleColdAisleProps> = () => {
  const frame = useCurrentFrame();
  
  const serverOpacity = interpolate(
    frame,
    [20, 50],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Generate airflow particles
  const coldParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      startPos: [0, -2, -3] as [number, number, number],
      endPos: [0, 2, -1] as [number, number, number],
      delay: i * 6,
    }));
  }, []);
  
  const hotParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      startPos: [0, 2, 1] as [number, number, number],
      endPos: [0, 4, 3] as [number, number, number],
      delay: i * 6,
    }));
  }, []);

  return (
    <group>
      {/* Server racks forming aisles */}
      {[-2, 2].map((x, rowIndex) => (
        <group key={rowIndex}>
          {[...Array(4)].map((_, i) => (
            <group key={i} position={[x, 0, -6 + i * 3]}>
              {/* Simplified server rack */}
              <Box args={[1.5, 3, 1]} castShadow>
                <meshStandardMaterial
                  color="#1a1a1a"
                  metalness={0.7}
                  roughness={0.3}
                  transparent
                  opacity={serverOpacity}
                />
              </Box>
              
              {/* Server front/back indicators */}
              <Box 
                position={[rowIndex === 0 ? 0.76 : -0.76, 0, 0]} 
                args={[0.02, 2.8, 0.9]}
              >
                <meshStandardMaterial
                  color="#0a0a0a"
                  emissive={new THREE.Color(0.2, 0.2, 0.2)}
                  emissiveIntensity={0.5}
                  transparent
                  opacity={serverOpacity}
                />
              </Box>
              
              {/* Heat generation visualization */}
              {frame > 80 && rowIndex === 0 && (
                <Box
                  position={[0.8, 0, 0]}
                  args={[0.1, 2.8, 0.9]}
                >
                  <meshStandardMaterial
                    color="#ff4400"
                    emissive={new THREE.Color(1, 0.2, 0)}
                    emissiveIntensity={Math.sin(frame * 0.05) * 0.5 + 0.5}
                    transparent
                    opacity={0.3}
                  />
                </Box>
              )}
            </group>
          ))}
        </group>
      ))}
      
      {/* Cold aisle floor marking */}
      <Box position={[0, -1.99, -3]} args={[3, 0.02, 10]}>
        <meshStandardMaterial
          color="#0044ff"
          emissive={new THREE.Color(0, 0.2, 1)}
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
        />
      </Box>
      
      {/* Hot aisle floor marking */}
      {[-4, 4].map((x, i) => (
        <Box key={i} position={[x, -1.99, -3]} args={[2, 0.02, 10]}>
          <meshStandardMaterial
            color="#ff4400"
            emissive={new THREE.Color(1, 0.2, 0)}
            emissiveIntensity={0.2}
            transparent
            opacity={0.5}
          />
        </Box>
      ))}
      
      {/* Aisle labels */}
      {frame > 70 && (
        <>
          <Text
            position={[0, 0.5, 2]}
            fontSize={0.4}
            color="#0088ff"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, 0]}
          >
            COLD AISLE
          </Text>
          
          <Text
            position={[-4, 0.5, 2]}
            fontSize={0.4}
            color="#ff4400"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, 0]}
          >
            HOT AISLE
          </Text>
          
          <Text
            position={[4, 0.5, 2]}
            fontSize={0.4}
            color="#ff4400"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, 0]}
          >
            HOT AISLE
          </Text>
        </>
      )}
      
      {/* Airflow particles - Cold air rising from floor */}
      {frame > 60 && coldParticles.map((particle, i) => (
        <AirflowParticle
          key={`cold-${i}`}
          startPos={particle.startPos}
          endPos={particle.endPos}
          delay={particle.delay + 60}
          color="#0088ff"
          temperature="cold"
        />
      ))}
      
      {/* Airflow particles - Hot air rising to ceiling */}
      {frame > 80 && hotParticles.map((particle, i) => (
        <AirflowParticle
          key={`hot-${i}`}
          startPos={particle.startPos}
          endPos={particle.endPos}
          delay={particle.delay + 80}
          color="#ff4400"
          temperature="hot"
        />
      ))}
      
      {/* Perforated floor tiles */}
      {frame > 50 && [...Array(6)].map((_, i) => (
        <group key={i} position={[0, -1.98, -7 + i * 2.5]}>
          {[...Array(16)].map((_, j) => (
            <Box
              key={j}
              position={[
                -0.6 + (j % 4) * 0.4,
                0,
                -0.6 + Math.floor(j / 4) * 0.4
              ]}
              args={[0.05, 0.02, 0.05]}
            >
              <meshStandardMaterial
                color="#001155"
                metalness={0.8}
                roughness={0.2}
                transparent
                opacity={0.8}
              />
            </Box>
          ))}
        </group>
      ))}
    </group>
  );
};

interface ChillerProps {
  position: [number, number, number];
}

const Chiller: React.FC<ChillerProps> = ({ position }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [100, 130],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Rotating components
  const rotation = frame * 0.02;

  return (
    <group position={position}>
      {/* Main chiller body */}
      <Cylinder args={[1.2, 1.2, 3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <meshStandardMaterial
          color="#3a5a8a"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={opacity}
        />
      </Cylinder>
      
      {/* End caps */}
      {[-1.5, 1.5].map((x, i) => (
        <Cylinder
          key={i}
          position={[x, 0, 0]}
          args={[1.2, 1.2, 0.1]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#2a4a6a"
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={opacity}
          />
        </Cylinder>
      ))}
      
      {/* Piping connections */}
      <Torus
        position={[0, 1, 0]}
        args={[0.15, 0.05, 8, 16]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#0044ff"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={opacity}
        />
      </Torus>
      
      <Torus
        position={[0, -1, 0]}
        args={[0.15, 0.05, 8, 16]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#ff4400"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={opacity}
        />
      </Torus>
      
      {/* Internal impeller (visible through cutaway) */}
      <group position={[0, 0, 0]} rotation={[0, rotation, 0]}>
        {[...Array(6)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          return (
            <Box
              key={i}
              position={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}
              args={[0.3, 0.8, 0.05]}
              rotation={[0, angle, 0]}
            >
              <meshStandardMaterial
                color="#4a4a4a"
                metalness={0.9}
                roughness={0.1}
                transparent
                opacity={opacity * 0.7}
              />
            </Box>
          );
        })}
      </group>
      
      {/* Control panel */}
      <Box position={[0, 0.8, 1.21]} args={[0.8, 0.4, 0.05]}>
        <meshStandardMaterial
          color="#001122"
          emissive={new THREE.Color(0, 1, 0.5)}
          emissiveIntensity={0.3}
          transparent
          opacity={opacity}
        />
      </Box>
      
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Chiller Unit
      </Text>
    </group>
  );
};

const CoolingSystem3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Dynamic camera movement
  const cameraPosition = {
    x: interpolate(frame, [0, 150, 300], [15, 10, 12]),
    y: interpolate(frame, [0, 150, 300], [8, 6, 7]),
    z: interpolate(frame, [0, 150, 300], [15, 12, 14]),
  };

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
        autoRotateSpeed={0.2}
        target={[0, 0, 0]}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 10, -5]} intensity={0.5} color="#8888ff" />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#ffaa88" />
      
      {/* Environment */}
      <Environment preset="warehouse" />
      
      {/* Main cooling system components */}
      <group>
        {/* CRAC Units */}
        <CRACUnit position={[-6, 0, -5]} />
        <CRACUnit position={[6, 0, -5]} />
        
        {/* Hot/Cold aisle configuration */}
        <HotAisleColdAisle />
        
        {/* Chiller */}
        <Chiller position={[0, 0, 6]} />
        
        {/* Main title */}
        {frame > 20 && (
          <Text
            position={[0, 5, -8]}
            fontSize={0.6}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Data Center Cooling System
          </Text>
        )}
        
        {/* Temperature indicators */}
        {frame > 100 && (
          <>
            <Text
              position={[-6, 3, -5]}
              fontSize={0.25}
              color="#0088ff"
              anchorX="center"
              anchorY="middle"
            >
              Supply: 18°C
            </Text>
            
            <Text
              position={[6, 3, -5]}
              fontSize={0.25}
              color="#ff4400"
              anchorX="center"
              anchorY="middle"
            >
              Return: 28°C
            </Text>
          </>
        )}
        
        {/* Efficiency metric */}
        {frame > 140 && (
          <Text
            position={[0, 4, 6]}
            fontSize={0.3}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
          >
            PUE: 1.4
          </Text>
        )}
      </group>
      
      {/* Floor */}
      <Box args={[20, 0.1, 20]} position={[0, -2, 0]} receiveShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Grid */}
      <gridHelper args={[20, 20, '#303030', '#202020']} position={[0, -1.95, 0]} />
    </>
  );
};

export const CoolingSystem3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0a1a2a 0%, #1a2a3a 100%)' }}>
      <Canvas shadows>
        <CoolingSystem3DScene />
      </Canvas>
    </div>
  );
};
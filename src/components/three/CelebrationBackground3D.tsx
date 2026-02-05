import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Float, MeshTransmissionMaterial } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

interface LetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  basePosition: number;
  time: number;
}

function GlassLetter({ letter, index, totalLetters, basePosition, time }: LetterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phaseOffset = (index / totalLetters) * Math.PI * 2;
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      
      // Slow orbital motion - different from landing page
      meshRef.current.position.y = Math.sin(t * 0.4 + phaseOffset) * 0.4;
      meshRef.current.position.z = Math.cos(t * 0.3 + phaseOffset * 0.7) * 0.3;
      
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(t * 0.2 + phaseOffset) * 0.1;
      meshRef.current.rotation.x = Math.cos(t * 0.15 + phaseOffset) * 0.05;
      
      // Subtle scale pulse
      const scale = 1 + Math.sin(t * 0.5 + phaseOffset * 2) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[basePosition, 0, 0]}>
      <Text3D
        ref={meshRef}
        font="/fonts/helvetiker_bold.typeface.json"
        size={2.5}
        height={0.6}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.03}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {letter}
        <meshStandardMaterial
          color="#e879f9"
          emissive="#c026d3"
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.15}
        />
      </Text3D>
    </group>
  );
}

function BackgroundText({ word }: { word: string }) {
  const letters = word.toUpperCase().split('');
  const letterSpacing = 2.2;
  const totalWidth = (letters.length - 1) * letterSpacing;
  
  return (
    <Float speed={0.3} rotationIntensity={0.02} floatIntensity={0.2}>
      <group position={[-totalWidth / 2, 0, -8]}>
        {letters.map((letter, index) => (
          <GlassLetter
            key={index}
            letter={letter}
            index={index}
            totalLetters={letters.length}
            basePosition={index * letterSpacing}
            time={0}
          />
        ))}
      </group>
    </Float>
  );
}

function ResponsiveCamera() {
  const { viewport, camera } = useThree();
  
  useFrame(() => {
    const isMobile = viewport.width < 6;
    const targetZ = isMobile ? 18 : 14;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.03);
  });
  
  return null;
}

function FloatingRings() {
  const ringsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.05;
      ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  const rings = useMemo(() => [
    { radius: 8, tube: 0.02, color: '#ff7f50', speed: 0.3 },
    { radius: 10, tube: 0.015, color: '#e879f9', speed: -0.2 },
    { radius: 12, tube: 0.01, color: '#fbbf24', speed: 0.15 },
  ], []);

  return (
    <group ref={ringsRef} position={[0, 0, -15]}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, 0, 0]}>
          <torusGeometry args={[ring.radius, ring.tube, 16, 100]} />
          <meshStandardMaterial
            color={ring.color}
            emissive={ring.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function AmbientParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 300;
  
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    
    const coralColor = new THREE.Color('#ff7f50');
    const lavenderColor = new THREE.Color('#e879f9');
    const peachColor = new THREE.Color('#fbbf24');
    const warmPinkColor = new THREE.Color('#f472b6');
    
    for (let i = 0; i < count; i++) {
      // Spread particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 15 + Math.random() * 20;
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi) - 10;
      
      const colorChoice = Math.random();
      const color = colorChoice < 0.3 ? coralColor 
        : colorChoice < 0.5 ? lavenderColor 
        : colorChoice < 0.7 ? peachColor 
        : warmPinkColor;
        
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      
      siz[i] = 0.5 + Math.random() * 1.5;
    }
    return [pos, col, siz];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingOrbs() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  const orbs = useMemo(() => [
    { pos: [-6, 4, -12] as [number, number, number], color: '#ff7f50', scale: 0.4 },
    { pos: [7, -3, -15] as [number, number, number], color: '#e879f9', scale: 0.3 },
    { pos: [-4, -5, -10] as [number, number, number], color: '#fbbf24', scale: 0.25 },
    { pos: [5, 5, -18] as [number, number, number], color: '#f472b6', scale: 0.35 },
    { pos: [0, -6, -14] as [number, number, number], color: '#fb923c', scale: 0.28 },
  ], []);

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={1 + i * 0.15} floatIntensity={0.5 + i * 0.1}>
          <mesh position={orb.pos} scale={orb.scale}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene({ word }: { word: string }) {
  return (
    <>
      <color attach="background" args={['#0a0612']} />
      <fog attach="fog" args={['#0a0612', 12, 40]} />
      
      <ResponsiveCamera />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff7f50" />
      <pointLight position={[-10, -5, 5]} intensity={1} color="#e879f9" />
      <pointLight position={[0, -10, 5]} intensity={0.8} color="#fbbf24" />
      <spotLight
        position={[0, 8, 8]}
        angle={0.6}
        penumbra={1}
        intensity={1.5}
        color="#f472b6"
      />
      
      <Suspense fallback={null}>
        <BackgroundText word={word} />
        <FloatingRings />
        <GlowingOrbs />
      </Suspense>
      <AmbientParticles />
    </>
  );
}

interface CelebrationBackground3DProps {
  word?: string;
}

export default function CelebrationBackground3D({ word = 'BRO' }: CelebrationBackground3DProps) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        dpr={[1, 1.5]}
      >
        <Scene word={word} />
      </Canvas>
    </div>
  );
}

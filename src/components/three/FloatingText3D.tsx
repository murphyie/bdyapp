import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Float } from '@react-three/drei';
import { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

interface LetterProps {
  letter: string;
  index: number;
  totalLetters: number;
  basePosition: number;
  mousePosition: { x: number; y: number };
}

function Letter({ letter, index, totalLetters, basePosition, mousePosition }: LetterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phaseOffset = (index / totalLetters) * Math.PI * 2;
  
  // Smooth mouse tracking
  const targetRotation = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Calculate mouse influence (letters closer to cursor react more)
      const letterWorldX = basePosition - ((totalLetters - 1) * 1.6) / 2;
      const distanceFromMouse = Math.abs(mousePosition.x - letterWorldX * 0.15);
      const mouseInfluence = Math.max(0, 1 - distanceFromMouse * 1.5);
      
      // Target rotation based on mouse
      targetRotation.current.x = mousePosition.y * 0.3 * mouseInfluence;
      targetRotation.current.y = mousePosition.x * 0.4 * mouseInfluence;
      
      // Target position offset based on mouse
      targetPosition.current.x = mousePosition.x * 0.2 * mouseInfluence;
      targetPosition.current.y = mousePosition.y * 0.15 * mouseInfluence;
      
      // Independent wave motion with coordinated rhythm
      const baseY = Math.sin(time * 0.8 + phaseOffset) * 0.3;
      const baseZ = Math.sin(time * 0.6 + phaseOffset * 0.5) * 0.2;
      
      // Smooth interpolation for mouse response
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        baseY + targetPosition.current.y,
        0.08
      );
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        baseZ,
        0.08
      );
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetPosition.current.x,
        0.06
      );
      
      // Combined rotation: base animation + mouse influence
      const baseRotY = Math.sin(time * 0.4 + phaseOffset) * 0.15;
      const baseRotX = Math.sin(time * 0.3 + phaseOffset * 0.7) * 0.08;
      const baseRotZ = Math.sin(time * 0.5 + phaseOffset * 1.2) * 0.05;
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        baseRotY + targetRotation.current.y,
        0.08
      );
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        baseRotX + targetRotation.current.x,
        0.08
      );
      meshRef.current.rotation.z = baseRotZ;
    }
  });

  return (
    <group position={[basePosition, 0, 0]}>
      <Text3D
        ref={meshRef}
        font="/fonts/helvetiker_bold.typeface.json"
        size={1.8}
        height={0.5}
        curveSegments={16}
        bevelEnabled
        bevelThickness={0.04}
        bevelSize={0.025}
        bevelOffset={0}
        bevelSegments={6}
      >
        {letter}
        <meshStandardMaterial
          color="#ff69b4"
          emissive="#ff1493"
          emissiveIntensity={0.9}
          metalness={0.9}
          roughness={0.1}
        />
      </Text3D>
    </group>
  );
}

function DynamicText({ mousePosition, word }: { mousePosition: { x: number; y: number }; word: string }) {
  const letters = word.toUpperCase().split('');
  const letterSpacing = 1.6;
  const totalWidth = (letters.length - 1) * letterSpacing;
  
  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.3}>
      <group position={[-totalWidth / 2, 0, 0]}>
        {letters.map((letter, index) => (
          <Letter
            key={index}
            letter={letter}
            index={index}
            totalLetters={letters.length}
            basePosition={index * letterSpacing}
            mousePosition={mousePosition}
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
    const targetZ = isMobile ? 14 : 10;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
  });
  
  return null;
}

function GlowingOrbs({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const orbsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.rotation.y = state.clock.elapsedTime * 0.08 + mousePosition.x * 0.1;
      orbsRef.current.rotation.x = mousePosition.y * 0.05;
    }
  });

  const orbPositions = useMemo(() => [
    { pos: [-4, 2, -4] as [number, number, number], color: '#ff69b4', scale: 0.25 },
    { pos: [4, -1.5, -5] as [number, number, number], color: '#9333ea', scale: 0.2 },
    { pos: [-3, -2, -3] as [number, number, number], color: '#ffd700', scale: 0.18 },
    { pos: [3.5, 2.5, -6] as [number, number, number], color: '#00bcd4', scale: 0.28 },
    { pos: [0, 3.5, -7] as [number, number, number], color: '#ff1493', scale: 0.22 },
  ], []);

  return (
    <group ref={orbsRef}>
      {orbPositions.map((orb, i) => (
        <Float key={i} speed={1.5 + i * 0.2} floatIntensity={0.8 + i * 0.15}>
          <mesh position={orb.pos} scale={orb.scale}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function ParticleField({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 250;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const pinkColor = new THREE.Color('#ff69b4');
    const goldColor = new THREE.Color('#ffd700');
    const purpleColor = new THREE.Color('#9333ea');
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 8;
      
      const colorChoice = Math.random();
      const color = colorChoice < 0.4 ? pinkColor : colorChoice < 0.7 ? goldColor : purpleColor;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02 + mousePosition.x * 0.05;
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.08 + mousePosition.y * 0.03;
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
        size={0.06}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

function Scene({ mousePosition, word }: { mousePosition: { x: number; y: number }; word: string }) {
  return (
    <>
      <color attach="background" args={['#0a0612']} />
      <fog attach="fog" args={['#0a0612', 10, 30]} />
      
      <ResponsiveCamera />
      
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2.5} color="#ff69b4" />
      <pointLight position={[-10, -5, 5]} intensity={2} color="#9333ea" />
      <pointLight position={[0, -10, 5]} intensity={1.2} color="#ffd700" />
      <spotLight
        position={[0, 8, 8]}
        angle={0.5}
        penumbra={1}
        intensity={2.5}
        color="#ff1493"
      />
      
      <Suspense fallback={null}>
        <DynamicText mousePosition={mousePosition} word={word} />
        <GlowingOrbs mousePosition={mousePosition} />
      </Suspense>
      <ParticleField mousePosition={mousePosition} />
    </>
  );
}

export default function FloatingText3D({ word = 'ZUHA' }: { word?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const x = (touch.clientX / window.innerWidth) * 2 - 1;
        const y = -(touch.clientY / window.innerHeight) * 2 + 1;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 touch-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
      >
        <Scene mousePosition={mousePosition} word={word} />
      </Canvas>
    </div>
  );
}

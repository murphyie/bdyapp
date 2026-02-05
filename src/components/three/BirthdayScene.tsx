import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { Float, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function Balloon({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={2}>
      <group position={position} scale={scale}>
        {/* Balloon body */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Balloon knot */}
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* String */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 1.2, 8]} />
          <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      </group>
    </Float>
  );
}

function GiftBox({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        {/* Box */}
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Ribbon vertical */}
        <mesh position={[0, 0, 0.31]}>
          <boxGeometry args={[0.1, 0.62, 0.02]} />
          <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Ribbon horizontal */}
        <mesh position={[0, 0.31, 0]}>
          <boxGeometry args={[0.62, 0.02, 0.1]} />
          <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.2} />
        </mesh>
        {/* Bow */}
        <mesh position={[0, 0.45, 0]}>
          <torusGeometry args={[0.12, 0.04, 8, 16]} />
          <meshStandardMaterial color="#FFD700" metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

function Star3D({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial 
        color="#FFD700" 
        emissive="#FFD700" 
        emissiveIntensity={0.5} 
        metalness={0.8} 
        roughness={0.2} 
      />
    </mesh>
  );
}

function Scene() {
  const balloonColors = ['#FF69B4', '#9B59B6', '#00CED1', '#FF1493', '#8A2BE2', '#00FFFF'];
  const giftColors = ['#FF69B4', '#9B59B6', '#E91E63'];
  
  return (
    <>
      {/* Ambient and point lights for magical atmosphere */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FF69B4" />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#9B59B6" />
      <pointLight position={[0, -5, 5]} intensity={0.3} color="#00CED1" />
      
      {/* Stars background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={1} 
      />
      
      {/* Balloons scattered around */}
      {balloonColors.map((color, i) => (
        <Balloon 
          key={`balloon-${i}`}
          position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 10 - 5
          ]} 
          color={color}
          scale={0.8 + Math.random() * 0.5}
        />
      ))}
      
      {/* More balloons in background */}
      {balloonColors.map((color, i) => (
        <Balloon 
          key={`balloon-bg-${i}`}
          position={[
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 15,
            -15 - Math.random() * 10
          ]} 
          color={color}
          scale={0.4 + Math.random() * 0.3}
        />
      ))}
      
      {/* Gift boxes */}
      {giftColors.map((color, i) => (
        <GiftBox 
          key={`gift-${i}`}
          position={[
            (i - 1) * 4,
            -3 + Math.random(),
            -3 - Math.random() * 3
          ]}
          color={color}
        />
      ))}
      
      {/* Floating stars */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Star3D 
          key={`star-${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15
          ]}
        />
      ))}
    </>
  );
}

export default function BirthdayScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

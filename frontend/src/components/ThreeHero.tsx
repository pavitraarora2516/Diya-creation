'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 3D Gift Box Model
function GiftBox({ hovered, setHovered }: { hovered: boolean; setHovered: (h: boolean) => void }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Steady rotation
      meshRef.current.rotation.y += hovered ? 0.03 : 0.01;
      // Slight floating motion
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.15;
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1.0}
    >
      {/* Main Box Structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1.4, 2]} />
        <meshStandardMaterial
          color="#d49533" // Deep gold
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Box Lid */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.08, 0.3, 2.08]} />
        <meshStandardMaterial
          color="#dfb25e" // Bright gold
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Horizontal Ribbon */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.1, 1.45, 0.35]} />
        <meshStandardMaterial color="#814a36" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Vertical Ribbon */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.35, 1.45, 2.1]} />
        <meshStandardMaterial color="#814a36" metalness={0.1} roughness={0.5} />
      </mesh>

      {/* Ribbon Bow on Top */}
      <group position={[0, 0.9, 0]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.25, 0.08, 12, 24]} />
          <meshStandardMaterial color="#965a1e" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, Math.PI / 4]}>
          <torusGeometry args={[0.25, 0.08, 12, 24]} />
          <meshStandardMaterial color="#965a1e" />
        </mesh>
      </group>
    </group>
  );
}

// Orbiting Chocolate Pralines
function OrbitingChocolate({
  position,
  speed,
  type,
  radius,
  offset,
}: {
  position: [number, number, number];
  speed: number;
  type: 'truffle' | 'square' | 'torus';
  radius: number;
  offset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const angle = elapsed * speed + offset;

      // Orbit around the center gift box
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = position[1] + Math.sin(elapsed * 2 + offset) * 0.3;

      // Self rotation
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {type === 'truffle' && <sphereGeometry args={[0.32, 32, 32]} />}
      {type === 'square' && <boxGeometry args={[0.5, 0.35, 0.5]} />}
      {type === 'torus' && <torusGeometry args={[0.22, 0.1, 16, 32]} />}
      
      <meshStandardMaterial
        color={type === 'truffle' ? '#35230d' : type === 'square' ? '#573115' : '#75441a'} // Dark chocolate tones
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function ThreeHero() {
  const [hovered, setHovered] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setWebglSupported(hasWebGL);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    // Beautiful 2D Static Premium Image Showcase Fallback
    return (
      <div className="w-full h-[500px] md:h-[650px] relative select-none flex items-center justify-center overflow-hidden">
        {/* Decorative Blur Backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-bronze-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-lg w-full flex items-center justify-center p-6">
          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80"
            alt="Premium hampers collection"
            className="w-full h-auto max-h-[450px] object-cover rounded-lg shadow-2xl border border-gold-500/20 gold-glow scale-95 hover:scale-100 transition-all duration-700"
          />
          <div className="absolute -bottom-4 bg-obsidian-950/80 border border-gold-500/10 px-4 py-1.5 rounded text-[10px] uppercase font-bold tracking-widest text-gold-400">
            Handcrafted Luxury Chocolates
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] md:h-[650px] relative select-none">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-bronze-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Canvas shadows className="w-full h-full bg-transparent">
        <PerspectiveCamera makeDefault position={[0, 2.5, 6.5]} fov={45} />
        
        {/* Lights */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight
          position={[-10, 15, -10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <directionalLight position={[0, 5, 5]} intensity={1.0} color="#f5e6c4" />

        {/* Center Gift Box */}
        <GiftBox hovered={hovered} setHovered={setHovered} />

        {/* Orbiting Treats */}
        <OrbitingChocolate position={[3.2, 0.6, 0]} speed={0.4} type="truffle" radius={3.2} offset={0} />
        <OrbitingChocolate position={[-3.2, 0.5, 0]} speed={0.5} type="square" radius={3.0} offset={Math.PI} />
        <OrbitingChocolate position={[0, -0.6, 3.2]} speed={0.35} type="torus" radius={3.4} offset={Math.PI / 2} />

        {/* Floating Gold Dust Particles */}
        <Stars radius={100} depth={50} count={300} factor={4} saturation={0.8} fade speed={1.2} />

        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {/* Floating Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-xs uppercase tracking-widest text-gold-400/60 font-medium">
          Drag to rotate scene &bull; Hover to interact
        </p>
      </div>
    </div>
  );
}

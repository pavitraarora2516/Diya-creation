'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 3D Box Component
function TrayBox({ boxType, ribbonColor }: { boxType: string; ribbonColor: string }) {
  const meshRef = useRef<THREE.Group>(null);

  let boxColor = '#1b1b1b'; // Obsidian Default
  let metalness = 0.3;
  let roughness = 0.6;

  if (boxType === 'gold_chest') {
    boxColor = '#dfb25e';
    metalness = 0.9;
    roughness = 0.15;
  } else if (boxType === 'wood_box') {
    boxColor = '#75441a';
    metalness = 0.05;
    roughness = 0.85;
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.2;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.6, 0]}>
      {/* Box base structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 1.2, 3]} />
        <meshStandardMaterial color={boxColor} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Decorative Ribbon Wrap if ribbonColor is set */}
      {ribbonColor && (
        <group>
          {/* Horizontal stripe */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[4.04, 1.22, 0.45]} />
            <meshStandardMaterial
              color={ribbonColor === 'Gold' ? '#dfb25e' : ribbonColor === 'Red' ? '#9e5d44' : '#ebd094'}
              metalness={ribbonColor === 'Gold' ? 0.8 : 0.2}
            />
          </mesh>
          {/* Vertical stripe */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.45, 1.22, 3.04]} />
            <meshStandardMaterial
              color={ribbonColor === 'Gold' ? '#dfb25e' : ribbonColor === 'Red' ? '#9e5d44' : '#ebd094'}
              metalness={ribbonColor === 'Gold' ? 0.8 : 0.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 3D Item Component rendering inside box
function HamperFilledItems({ items }: { items: { type: string; quantity: number }[] }) {
  const elements: React.JSX.Element[] = [];

  let index = 0;
  // Distribute items inside the box layout grid
  items.forEach((item) => {
    for (let q = 0; q < item.quantity; q++) {
      // Calculate row/column positioning inside the tray (args limit is 4x3)
      const x = ((index % 3) - 1) * 1.0;
      const z = (Math.floor(index / 3) - 0.5) * 0.8;
      const y = -0.1; // Rest on bottom of box

      if (item.type === 'CHOCOLATE') {
        // Truffle chocolate sphere
        elements.push(
          <mesh key={`item-${index}`} position={[x, y, z]} castShadow>
            <sphereGeometry args={[0.26, 16, 16]} />
            <meshStandardMaterial color="#35230d" roughness={0.45} />
          </mesh>
        );
      } else if (item.type === 'GIFT') {
        // Candle cylinder
        elements.push(
          <mesh key={`item-${index}`} position={[x, y + 0.15, z]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.5, 16]} />
            <meshStandardMaterial color="#b27559" roughness={0.3} />
          </mesh>
        );
      } else {
        // Addon flat box (card/ribbon tag)
        elements.push(
          <mesh key={`item-${index}`} position={[x, y, z]} castShadow>
            <boxGeometry args={[0.45, 0.08, 0.45]} />
            <meshStandardMaterial color="#dfb25e" metalness={0.7} />
          </mesh>
        );
      }
      index++;
    }
  });

  return <group>{elements}</group>;
}

export default function ThreeHamperBuilder({
  boxType,
  ribbonColor,
  filledItems,
}: {
  boxType: string;
  ribbonColor: string;
  filledItems: { type: string; quantity: number }[];
}) {
  return (
    <div className="w-full h-[350px] md:h-[450px] bg-obsidian-900/25 rounded-lg relative overflow-hidden border border-gold-500/10 shadow-inner">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] uppercase font-bold tracking-widest bg-gold-500/20 text-gold-300 border border-gold-500/30 px-2 py-0.5 rounded">
          Live 3D Hamper Blueprint
        </span>
      </div>

      <Canvas shadows className="w-full h-full bg-transparent">
        <PerspectiveCamera makeDefault position={[0, 3.2, 5]} fov={45} />
        
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[0, 5, 5]} intensity={1.2} color="#f5e6c4" />
        <directionalLight position={[0, -5, -5]} intensity={0.3} />

        {/* Crate Box */}
        <TrayBox boxType={boxType} ribbonColor={ribbonColor} />

        {/* Filled items */}
        <HamperFilledItems items={filledItems} />

        {/* Gold dust backdrop */}
        <Stars radius={60} depth={20} count={150} factor={3} saturation={0.8} fade speed={1.0} />

        <OrbitControls enableZoom={true} minDistance={3} maxDistance={8} />
      </Canvas>
    </div>
  );
}

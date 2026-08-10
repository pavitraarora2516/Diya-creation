'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// 3D Model representing the Wooden Frame
function CustomizableFrame({ photoUrl }: { photoUrl: string | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const textureLoader = new THREE.TextureLoader();
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);

  // Load custom user image as texture
  useEffect(() => {
    if (photoUrl) {
      textureLoader.load(
        photoUrl,
        (loadedTexture) => {
          setTexture(loadedTexture);
        },
        undefined,
        (err) => {
          console.error('Failed to load user image texture', err);
        }
      );
    } else {
      setTexture(null);
    }
  }, [photoUrl]);

  useFrame((state) => {
    if (groupRef.current && !photoUrl) {
      // Gentle self-rotation when user hasn't uploaded a photo yet
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.4;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.1, -0.3, 0]}>
      {/* Outer Wooden Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 4.2, 0.25]} />
        <meshStandardMaterial
          color="#75441a" // Birchwood light brown
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Frame Border Inset (Bevel) */}
      <mesh position={[0, 0, 0.13]} castShadow>
        <boxGeometry args={[2.6, 3.6, 0.05]} />
        <meshStandardMaterial
          color="#573115" // Darker contrast border
          roughness={0.8}
        />
      </mesh>

      {/* Photo Texture Surface */}
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[2.3, 3.3]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial
            color="#ebd094" // Default golden canvas placeholder
            roughness={0.4}
            metalness={0.0}
            // Fallback grid texture
          />
        )}
      </mesh>
    </group>
  );
}

// 3D Model representing Chocolate Box
function ChocolateBox3D() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Bottom sliding tray */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[3.5, 0.4, 2.5]} />
        <meshStandardMaterial color="#35230d" metalness={0.2} roughness={0.6} />
      </mesh>
      
      {/* Top Slider Sleeve */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3.6, 0.5, 2.3]} />
        <meshStandardMaterial color="#dfb25e" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Ribbon stripe */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.5, 0.52, 2.34]} />
        <meshStandardMaterial color="#814a36" roughness={0.4} />
      </mesh>
    </group>
  );
}

// 3D Model representing Generic Hamper
function GenericHamper3D() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Crate Basket */}
      <mesh castShadow position={[0, -0.4, 0]}>
        <boxGeometry args={[3.5, 0.8, 3.5]} />
        <meshStandardMaterial color="#b27559" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Items representing fillings inside */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.2]} />
        <meshStandardMaterial color="#dfb25e" metalness={0.8} />
      </mesh>
      <mesh position={[0.8, 0, 0.8]} castShadow>
        <sphereGeometry args={[0.5]} />
        <meshStandardMaterial color="#35230d" />
      </mesh>
      <mesh position={[-0.8, 0, -0.8]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#814a36" />
      </mesh>
    </group>
  );
}

export default function ThreeProductViewer({
  sku,
  photoUrl,
}: {
  sku: string;
  photoUrl: string | null;
}) {
  const isFrame = sku === 'GIFT-WD-FRAME';
  const isChoc = sku.startsWith('CHOC-');
  const isHamper = sku.startsWith('HAMP-') || sku.startsWith('BOX-');

  const [webglSupported, setWebglSupported] = React.useState(true);

  React.useEffect(() => {
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
    // Premium 2D Mobile / Non-WebGL Fallback Showcase
    const fallbackSrc = isFrame
      ? (photoUrl || 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=600&q=80')
      : isChoc
      ? 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80'
      : 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80';

    return (
      <div className="w-full h-[400px] bg-obsidian-900/30 rounded-lg relative overflow-hidden border border-gold-500/10 flex flex-col justify-between p-4">
        <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded">
            Interactive Preview
          </span>
          <span className="text-[9px] font-light text-obsidian-400">
            WebGL acceleration disabled. Showing 2D preview.
          </span>
        </div>

        <div className="flex-grow flex items-center justify-center overflow-hidden rounded">
          <img
            src={fallbackSrc}
            alt="Product preview"
            className="max-h-[280px] w-auto object-contain rounded shadow-lg border border-gold-500/5 group-hover:scale-102 transition-transform duration-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] bg-obsidian-900/30 rounded-lg relative overflow-hidden border border-gold-500/10 shadow-inner">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] uppercase font-bold tracking-widest bg-gold-500/20 text-gold-300 border border-gold-500/30 px-2 py-0.5 rounded">
          Interactive 3D Preview
        </span>
      </div>

      <Canvas shadows className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        {/* Lights */}
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[0, 5, 5]} intensity={1.2} color="#f5e6c4" />
        <directionalLight position={[0, -5, -5]} intensity={0.4} />

        {/* Dynamic Model Rendering */}
        {isFrame && <CustomizableFrame photoUrl={photoUrl} />}
        {isChoc && <ChocolateBox3D />}
        {isHamper && <GenericHamper3D />}
        {!isFrame && !isChoc && !isHamper && <ChocolateBox3D />}

        <OrbitControls enableZoom={true} minDistance={3} maxDistance={10} />
      </Canvas>
    </div>
  );
}

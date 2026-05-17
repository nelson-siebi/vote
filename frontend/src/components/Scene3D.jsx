import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, MeshDistortMaterial, Center, Box, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

function CanvasLoader() {
  return (
    <Html center>
      <div className="canvas-loader">
        <div className="spinner" style={{ borderColor: '#ff5500', borderTopColor: 'transparent' }}></div>
        <span style={{ color: '#0f172a' }}>Chargement 3D...</span>
      </div>
    </Html>
  );
}

function ChangingText() {
  const [index, setIndex] = useState(0);
  const words = ["VOTEZ", "ÉCOUTEZ", "DÉCOUVREZ", "SOUTENEZ"];
  const textRef = useRef();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 2.4;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      textRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 2.4, 1.5]}
      fontSize={0.8}
      color="#0f172a" /* Slate 900 */
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#ffffff"
      material-toneMapped={false}
      fontWeight="bold"
    >
      {words[index]}
    </Text>
  );
}

function Equalizer() {
  const groupRef = useRef();
  const bars = useMemo(() => new Array(15).fill(0), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.children.forEach((mesh, i) => {
      const scaleY = 1 + Math.sin(time * 3 + i) * Math.cos(time * 2 + i * 0.5) * 1.5;
      mesh.scale.y = Math.max(0.2, scaleY);
    });
  });

  return (
    <group ref={groupRef} position={[0, -2.5, 0]}>
      {bars.map((_, i) => (
        <Box 
          key={i} 
          args={[0.2, 1, 0.2]} 
          position={[(i - 7) * 0.4, 0, 0]} 
        >
          <meshStandardMaterial color="#ff5500" roughness={0.2} metalness={0.5} />
        </Box>
      ))}
    </group>
  );
}

function MainObject() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.4;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2.5}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />
        <MeshDistortMaterial 
          color="#ff5500" 
          attach="material" 
          distort={0.5} 
          speed={3} 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 45 }} style={{ background: 'transparent' }}>
      <Suspense fallback={<CanvasLoader />}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#ff9900" />
        
        {/* Floating particles - adapted for light background */}
        <Sparkles count={100} scale={10} size={4} speed={0.4} opacity={0.6} color="#ff5500" />
        <Sparkles count={50} scale={8} size={6} speed={0.6} opacity={0.4} color="#0f172a" />

        <Center>
          <MainObject />
          <ChangingText />
          <Equalizer />
        </Center>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={1.5} 
          maxPolarAngle={Math.PI / 2 + 0.2} 
          minPolarAngle={Math.PI / 2 - 0.4} 
        />
      </Suspense>
    </Canvas>
  );
}

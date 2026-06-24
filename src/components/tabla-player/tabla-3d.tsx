"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { StrikeDrum } from "@/lib/tabla-sounds";

export type Tabla3DHandle = {
  strike: (drum: StrikeDrum) => void;
};

function Drum({
  position,
  bodyTopRadius,
  bodyBottomRadius,
  bodyHeight,
  headRadius,
  syahiRadius,
  bodyColor,
  headColor,
  hitRef,
}: {
  position: [number, number, number];
  bodyTopRadius: number;
  bodyBottomRadius: number;
  bodyHeight: number;
  headRadius: number;
  syahiRadius: number;
  bodyColor: string;
  headColor: string;
  hitRef: { current: number };
}) {
  const headGroupRef = useRef<THREE.Group>(null);
  const syahiMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  const baseHeadY = bodyHeight / 2 + 0.02;

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime - hitRef.current;
    const active = elapsed >= 0 && elapsed < 0.35;
    const decay = active ? Math.exp(-elapsed * 16) : 0;

    if (headGroupRef.current) {
      headGroupRef.current.scale.y = 1 - 0.3 * decay;
      headGroupRef.current.position.y = baseHeadY - 0.025 * decay;
    }
    if (bodyRef.current) {
      bodyRef.current.scale.x = 1 + 0.015 * decay;
      bodyRef.current.scale.z = 1 + 0.015 * decay;
    }
    if (syahiMatRef.current) {
      syahiMatRef.current.emissiveIntensity = decay * 1.4;
    }
  });

  return (
    <group position={position}>
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[bodyTopRadius, bodyBottomRadius, bodyHeight, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.55} metalness={0.25} />
      </mesh>

      <group ref={headGroupRef} position={[0, baseHeadY, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[headRadius, headRadius, 0.05, 32]} />
          <meshStandardMaterial color={headColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[syahiRadius, syahiRadius, 0.02, 32]} />
          <meshStandardMaterial
            ref={syahiMatRef}
            color="#0a0a0a"
            roughness={0.4}
            emissive="#ff8a3d"
            emissiveIntensity={0}
          />
        </mesh>
      </group>
    </group>
  );
}

function Scene({
  dayanHitRef,
  bayanHitRef,
}: {
  dayanHitRef: { current: number };
  bayanHitRef: { current: number };
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} />

      <mesh position={[0, -0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#d9d3c4" roughness={1} />
      </mesh>

      {/* Bayan — bass drum, left */}
      <Drum
        position={[-1.15, 0, 0]}
        bodyTopRadius={0.82}
        bodyBottomRadius={0.6}
        bodyHeight={0.85}
        headRadius={0.82}
        syahiRadius={0.3}
        bodyColor="#3a3a3a"
        headColor="#e9ddc3"
        hitRef={bayanHitRef}
      />

      {/* Dayan — treble drum, right */}
      <Drum
        position={[1.0, 0.18, 0]}
        bodyTopRadius={0.5}
        bodyBottomRadius={0.46}
        bodyHeight={1.25}
        headRadius={0.5}
        syahiRadius={0.2}
        bodyColor="#8a5a32"
        headColor="#ecdfc4"
        hitRef={dayanHitRef}
      />

      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={7}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export const Tabla3D = forwardRef<Tabla3DHandle>(function Tabla3D(_, ref) {
  const dayanHitRef = useRef(-Infinity);
  const bayanHitRef = useRef(-Infinity);
  const clockRef = useRef<THREE.Clock | null>(null);

  useImperativeHandle(ref, () => ({
    strike: (drum: StrikeDrum) => {
      const t = clockRef.current?.elapsedTime ?? 0;
      if (drum === "dayan" || drum === "both") dayanHitRef.current = t;
      if (drum === "bayan" || drum === "both") bayanHitRef.current = t;
    },
  }));

  return (
    <div className="aspect-video w-full rounded-lg border border-neutral-200 bg-gradient-to-b from-neutral-100 to-neutral-200 overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 1.6, 3.4], fov: 45 }}
        onCreated={({ clock }) => {
          clockRef.current = clock;
        }}
      >
        <Scene dayanHitRef={dayanHitRef} bayanHitRef={bayanHitRef} />
      </Canvas>
    </div>
  );
});

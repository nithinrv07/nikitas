"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { FloorEnvironment } from "./Building";
import { Character } from "./Character";

/** Slow cinematic dolly through the atrium with pointer parallax. */
function CameraRig() {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 7, -8));
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const intro = Math.min(1, t / 6);
    const e = 1 - Math.pow(1 - intro, 3);
    const x = Math.sin(t * 0.05) * 6 + pointer.x * 1.2;
    const y = THREE.MathUtils.lerp(16, 3.2, e) + pointer.y * 0.6;
    const z = THREE.MathUtils.lerp(20, 13, e) + Math.cos(t * 0.05) * 1.5;
    camera.position.lerp(new THREE.Vector3(x, y, z), 1 - Math.exp(-dt * 2));
    look.current.lerp(new THREE.Vector3(pointer.x * 1.5, 6.5 + pointer.y, -10), 1 - Math.exp(-dt * 2));
    camera.lookAt(look.current);
  });
  return null;
}

export default function AtriumScene() {
  const [quality, setQuality] = useState<"high" | "low">("high");
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768) setQuality("low");
  }, []);
  return (
    <Canvas
      shadows={quality === "high"}
      dpr={quality === "high" ? [1, 1.5] : [0.75, 1.1]}
      camera={{ fov: 50, near: 0.1, far: 200, position: [0, 16, 20] }}
      gl={{ antialias: quality === "high" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setQuality("low")} />
      <AdaptiveDpr pixelated={false} />
      <Suspense fallback={null}>
        <FloorEnvironment id="atrium" quality={quality} interactive={false} />
        <group position={[1.6, 0, 7]} rotation-y={0.25}>
          <Character getSpeed={() => 0} />
        </group>
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}

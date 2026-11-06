"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * The visitor: a sculpted mannequin in brushed platinum with a crimson
 * signal band. Procedural walk cycle driven by speed (0..1).
 */
export function Character({ getSpeed }: { getSpeed: () => number }) {
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const phase = useRef(0);

  useFrame((state, dt) => {
    const s = getSpeed();
    phase.current += dt * (4 + s * 7) * (s > 0.02 ? 1 : 0);
    const swing = Math.sin(phase.current) * 0.7 * s;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;
    if (torso.current) {
      const idle = Math.sin(state.clock.elapsedTime * 1.6) * 0.012;
      torso.current.position.y = 1.0 + Math.abs(Math.sin(phase.current)) * 0.05 * s + idle;
    }
  });

  return (
    <group>
      {/* contact shadow disc */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <circleGeometry args={[0.45, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <group ref={torso} position-y={1}>
        {/* torso */}
        <mesh castShadow position-y={0.32}>
          <capsuleGeometry args={[0.22, 0.42, 6, 14]} />
          <meshStandardMaterial color="#d9dbe0" metalness={0.75} roughness={0.28} />
        </mesh>
        {/* crimson band */}
        <mesh position-y={0.42}>
          <cylinderGeometry args={[0.235, 0.235, 0.05, 20]} />
          <meshStandardMaterial color="#D7263D" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* head */}
        <mesh castShadow position-y={0.86}>
          <sphereGeometry args={[0.17, 20, 16]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.22} />
        </mesh>
        {/* visor — shows facing direction */}
        <mesh position={[0, 0.88, -0.13]}>
          <boxGeometry args={[0.2, 0.05, 0.08]} />
          <meshStandardMaterial color="#090B10" metalness={1} roughness={0.1} />
        </mesh>
        {/* arms */}
        <group ref={armL} position={[-0.3, 0.6, 0]}>
          <mesh castShadow position-y={-0.27}>
            <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
            <meshStandardMaterial color="#c8cbd1" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        <group ref={armR} position={[0.3, 0.6, 0]}>
          <mesh castShadow position-y={-0.27}>
            <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
            <meshStandardMaterial color="#c8cbd1" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
        {/* legs */}
        <group ref={legL} position={[-0.11, 0.02, 0]}>
          <mesh castShadow position-y={-0.48}>
            <capsuleGeometry args={[0.085, 0.72, 4, 8]} />
            <meshStandardMaterial color="#2a2d35" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
        <group ref={legR} position={[0.11, 0.02, 0]}>
          <mesh castShadow position-y={-0.48}>
            <capsuleGeometry args={[0.085, 0.72, 4, 8]} />
            <meshStandardMaterial color="#2a2d35" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

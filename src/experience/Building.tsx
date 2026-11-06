"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Billboard,
  Environment,
  Instance,
  Instances,
  Lightformer,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { floorById, type Division } from "@/content/site";
import { world, type Exhibit, type FloorWorld } from "./world";
import { live, useArchive } from "./store";
import { Display, Mono } from "./Type";

const COL = {
  midnight: "#090B10",
  graphite: "#171A21",
  concrete: "#777D87",
  platinum: "#E5E7EB",
  crimson: "#D7263D",
};

/* ------------------------------------------------------------------ */
/* Shared materials                                                     */
/* ------------------------------------------------------------------ */

function useMaterials(wall: string) {
  return useMemo(
    () => ({
      concrete: new THREE.MeshStandardMaterial({ color: wall, roughness: 0.92, metalness: 0.02 }),
      darkConcrete: new THREE.MeshStandardMaterial({ color: "#1d2027", roughness: 0.85 }),
      stone: new THREE.MeshStandardMaterial({ color: "#0f1116", roughness: 0.14, metalness: 0.2 }),
      metal: new THREE.MeshStandardMaterial({ color: "#c9ccd2", roughness: 0.22, metalness: 0.95 }),
      darkMetal: new THREE.MeshStandardMaterial({ color: "#2b2f37", roughness: 0.35, metalness: 0.9 }),
      crimson: new THREE.MeshStandardMaterial({ color: COL.crimson, roughness: 0.45, metalness: 0.2 }),
      crimsonGlow: new THREE.MeshStandardMaterial({
        color: COL.crimson,
        emissive: COL.crimson,
        emissiveIntensity: 1.2,
        toneMapped: false,
      }),
      screen: new THREE.MeshStandardMaterial({ color: "#07080b", roughness: 0.2, metalness: 0.6 }),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#9aa3ad",
        roughness: 0.05,
        metalness: 0,
        transmission: 0,
        transparent: true,
        opacity: 0.18,
      }),
      lightPanel: new THREE.MeshBasicMaterial({ color: "#f2efe8", toneMapped: false }),
    }),
    [wall],
  );
}
type Mats = ReturnType<typeof useMaterials>;

/* ------------------------------------------------------------------ */
/* Floor environment                                                    */
/* ------------------------------------------------------------------ */

export function FloorEnvironment({
  id,
  quality,
  interactive = true,
}: {
  id: Division;
  quality: "high" | "low";
  interactive?: boolean;
}) {
  const fw = world[id];
  const mats = useMaterials(fw.palette.wall);

  return (
    <group>
      <color attach="background" args={[fw.palette.fog]} />
      <fog attach="fog" args={[fw.palette.fog, 18, Math.max(fw.w, fw.d) * 1.7]} />
      <Lighting fw={fw} quality={quality} />
      <Shell fw={fw} mats={mats} quality={quality} />
      <ElevatorCore fw={fw} mats={mats} interactive={interactive} />
      {fw.exhibits.map((ex) => (
        <ExhibitObject key={ex.id} ex={ex} mats={mats} interactive={interactive} />
      ))}
      <FloorDecor id={id} fw={fw} mats={mats} quality={quality} />
    </group>
  );
}

function Lighting({ fw, quality }: { fw: FloorWorld; quality: "high" | "low" }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#c9d1e0", "#14161c", 1.1]} />
      <directionalLight
        position={[fw.w * 0.25, fw.h * 1.4, fw.d * 0.15]}
        intensity={3.2}
        color={fw.palette.light}
        castShadow={quality === "high"}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-fw.w / 2}
        shadow-camera-right={fw.w / 2}
        shadow-camera-top={fw.d / 2}
        shadow-camera-bottom={-fw.d / 2}
        shadow-camera-far={fw.h * 4}
        shadow-bias={-0.0004}
      />
      <spotLight
        position={[0, fw.h - 0.5, -fw.d / 4]}
        angle={0.7}
        penumbra={0.9}
        intensity={60}
        distance={fw.h * 3}
        color={fw.palette.light}
      />
      <Environment resolution={quality === "high" ? 256 : 64} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 5, -9]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="ring" color={COL.crimson} intensity={2} position={[0, 3, 8]} scale={2} />
      </Environment>
    </>
  );
}

function Shell({ fw, mats, quality }: { fw: FloorWorld; mats: Mats; quality: "high" | "low" }) {
  const { w, d, h, palette } = fw;
  const t = 0.8; // wall thickness
  const gap = 4.4; // elevator opening
  const side = (w - gap) / 2;

  const pilasters = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let z = -d / 2 + 3; z <= d / 2 - 3; z += 5) {
      arr.push([-w / 2 + 0.6, h / 2, z]);
      arr.push([w / 2 - 0.6, h / 2, z]);
    }
    for (let x = -w / 2 + 4; x <= w / 2 - 4; x += 6) if (Math.abs(x) > 9) arr.push([x, h / 2, -d / 2 + 0.6]);
    return arr;
  }, [w, d, h]);

  const beams = useMemo(() => {
    const arr: number[] = [];
    for (let x = -w / 2 + 3; x <= w / 2 - 3; x += 3.5) arr.push(x);
    return arr;
  }, [w]);

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[w, d]} />
        {quality === "high" ? (
          <MeshReflectorMaterial
            resolution={512}
            blur={[400, 120]}
            mixBlur={1}
            mixStrength={1.6}
            roughness={0.85}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color={palette.floor}
            metalness={0.55}
            mirror={0.6}
          />
        ) : (
          <meshStandardMaterial color={palette.floor} roughness={0.55} metalness={0.3} />
        )}
      </mesh>
      {/* stone inlay grid */}
      <gridHelper args={[Math.max(w, d), Math.max(w, d) / 2, "#2a2e36", "#1a1d23"]} position-y={0.005} />

      {/* walls */}
      <mesh position={[0, h / 2, -d / 2 - t / 2]} material={mats.concrete} receiveShadow>
        <boxGeometry args={[w + t * 2, h, t]} />
      </mesh>
      <mesh position={[-w / 2 - t / 2, h / 2, 0]} material={mats.concrete} receiveShadow>
        <boxGeometry args={[t, h, d]} />
      </mesh>
      <mesh position={[w / 2 + t / 2, h / 2, 0]} material={mats.concrete} receiveShadow>
        <boxGeometry args={[t, h, d]} />
      </mesh>
      <mesh position={[-gap / 2 - side / 2, h / 2, d / 2 + t / 2]} material={mats.concrete}>
        <boxGeometry args={[side, h, t]} />
      </mesh>
      <mesh position={[gap / 2 + side / 2, h / 2, d / 2 + t / 2]} material={mats.concrete}>
        <boxGeometry args={[side, h, t]} />
      </mesh>
      <mesh position={[0, (h + 3.6) / 2, d / 2 + t / 2]} material={mats.concrete}>
        <boxGeometry args={[gap, h - 3.6, t]} />
      </mesh>

      {/* ceiling + beams */}
      <mesh position={[0, h + 0.2, 0]} rotation-x={Math.PI / 2} material={mats.darkConcrete}>
        <planeGeometry args={[w, d]} />
      </mesh>
      <Instances material={mats.darkConcrete} limit={40}>
        <boxGeometry args={[0.5, 0.9, d]} />
        {beams.map((x) => (
          <Instance key={x} position={[x, h - 0.25, 0]} />
        ))}
      </Instances>
      {/* light slots between beams */}
      <Instances material={mats.lightPanel} limit={40}>
        <boxGeometry args={[0.12, 0.05, d * 0.8]} />
        {beams.slice(0, -1).map((x) => (
          <Instance key={x} position={[x + 1.75, h - 0.05, 0]} />
        ))}
      </Instances>

      {/* pilasters */}
      <Instances material={mats.concrete} castShadow receiveShadow limit={64}>
        <boxGeometry args={[1.2, h, 1.2]} />
        {pilasters.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* skirting crimson line */}
      <mesh position={[0, 0.06, -d / 2 + 0.01]} material={mats.crimsonGlow}>
        <boxGeometry args={[w, 0.03, 0.02]} />
      </mesh>

      {/* floor name on north wall */}
      <FloorTitle fw={fw} />
    </group>
  );
}

function FloorTitle({ fw }: { fw: FloorWorld }) {
  const f = floorById(fw.id);
  if (fw.id === "atrium") return null;
  const y = Math.min(fw.h - 2.2, 6.2);
  return (
    <group position={[0, y, -fw.d / 2 + 0.05]}>
      <Mono fontSize={0.28} position={[0, 1.15, 0]} color={COL.crimson}>
        {`FLOOR ${f.level} — ${f.division.toUpperCase()}`}
      </Mono>
      <Display fontSize={1.9}>{f.name}</Display>
      <Mono fontSize={0.2} position={[0, -1.05, 0]} maxWidth={14} textAlign="center">
        {f.statement.toUpperCase()}
      </Mono>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Elevator core with sliding doors                                    */
/* ------------------------------------------------------------------ */

function ElevatorCore({ fw, mats, interactive }: { fw: FloorWorld; mats: Mats; interactive: boolean }) {
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const open = useRef(0);
  const z = fw.d / 2;
  const level = floorById(fw.id).level;
  const isNear = useArchive((s) => s.nearby === "elevator");
  const openPanel = useArchive((s) => s.openPanel);
  const phase = useArchive((s) => s.phase);

  useFrame((_, dt) => {
    const dx = live.player.x;
    const dz = live.player.z - z;
    const near = interactive ? Math.hypot(dx, dz) < 5 || phase === "elevator" || phase === "transition" : false;
    open.current = THREE.MathUtils.damp(open.current, near ? 1 : 0, 5, dt);
    const o = open.current * 1.05;
    if (left.current) left.current.position.x = -0.55 - o;
    if (right.current) right.current.position.x = 0.55 + o;
  });

  return (
    <group
      position={[0, 0, z]}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (useArchive.getState().phase === "playing") openPanel("elevator");
      }}
      onPointerOver={() => interactive && (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {/* cabin */}
      <mesh position={[0, 1.8, 1.2]} material={mats.darkMetal}>
        <boxGeometry args={[2.6, 3.6, 0.1]} />
      </mesh>
      <mesh position={[0, 3.45, 0.6]}>
        <boxGeometry args={[2.2, 0.04, 1]} />
        <meshBasicMaterial color="#fff6ea" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 3, 0.6]} intensity={6} distance={6} color="#fff1e0" />
      {/* frame */}
      <mesh position={[-1.4, 1.85, 0]} material={mats.metal}>
        <boxGeometry args={[0.25, 3.7, 0.5]} />
      </mesh>
      <mesh position={[1.4, 1.85, 0]} material={mats.metal}>
        <boxGeometry args={[0.25, 3.7, 0.5]} />
      </mesh>
      <mesh position={[0, 3.75, 0]} material={mats.metal}>
        <boxGeometry args={[3.05, 0.25, 0.5]} />
      </mesh>
      {/* doors */}
      <mesh ref={left} position={[-0.55, 1.75, 0.05]} material={mats.metal} castShadow>
        <boxGeometry args={[1.1, 3.5, 0.08]} />
      </mesh>
      <mesh ref={right} position={[0.55, 1.75, 0.05]} material={mats.metal} castShadow>
        <boxGeometry args={[1.1, 3.5, 0.08]} />
      </mesh>
      {/* indicator */}
      <mesh position={[0, 4.25, -0.05]} material={mats.screen}>
        <boxGeometry args={[1.4, 0.55, 0.05]} />
      </mesh>
      <Mono fontSize={0.26} position={[0, 4.25, -0.09]} rotation-y={Math.PI} color={COL.crimson}>
        {level}
      </Mono>
      <Mono fontSize={0.14} position={[0, 4.7, -0.09]} rotation-y={Math.PI} color={isNear ? COL.platinum : COL.concrete}>
        {isNear ? "ELEVATOR — PRESS E / TAP" : "ELEVATOR"}
      </Mono>
      {/* threshold */}
      <mesh position={[0, 0.011, -0.9]} rotation-x={-Math.PI / 2} material={isNear ? mats.crimsonGlow : mats.darkMetal}>
        <planeGeometry args={[2.8, 0.06]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Exhibits                                                             */
/* ------------------------------------------------------------------ */

function ExhibitObject({ ex, mats, interactive }: { ex: Exhibit; mats: Mats; interactive: boolean }) {
  const near = useArchive((s) => s.nearby === ex.id);
  const openPanel = useArchive((s) => s.openPanel);
  const [hover, setHover] = useState(false);
  const active = near || hover;
  const labelY = { monolith: 5, plinth: 3.6, screen: 4.2, table: 3.9, freestyle: 3.6, desk: 2.8, pedestal: 3.2, podium: 2.6, contact: 2.8, sign: 3.2 }[ex.shape];

  return (
    <group
      position={[ex.pos[0], 0, ex.pos[1]]}
      rotation-y={ex.rot ?? 0}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (useArchive.getState().phase === "playing") openPanel(ex.id);
      }}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "";
      }}
    >
      <ExhibitShape ex={ex} mats={mats} active={active} />
      {/* proximity ring */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
        <ringGeometry args={[ex.r + 0.25, ex.r + 0.32, 64]} />
        <meshBasicMaterial color={active ? COL.crimson : "#3a3f48"} toneMapped={false} />
      </mesh>
      {interactive && (
        <Billboard position-y={labelY}>
          <Mono fontSize={0.16} position-y={0.42} color={active ? COL.crimson : COL.concrete}>
            {ex.eyebrow.toUpperCase()}
          </Mono>
          <Display fontSize={0.5} maxWidth={5} textAlign="center">
            {ex.title}
          </Display>
          {near && (
            <Mono fontSize={0.14} position-y={-0.45} color={COL.platinum}>
              PRESS E · TAP TO OPEN
            </Mono>
          )}
        </Billboard>
      )}
    </group>
  );
}

function ExhibitShape({ ex, mats, active }: { ex: Exhibit; mats: Mats; active: boolean }) {
  const spin = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (spin.current) {
      spin.current.rotation.y = t * 0.4;
      spin.current.position.y = spin.current.userData.base + Math.sin(t * 1.2) * 0.08;
    }
    if (ball.current) {
      // juggling rhythm: quick bounces off a "foot" height
      const p = (t * 1.6) % 1;
      ball.current.position.y = 0.7 + 4 * p * (1 - p) * 1.6;
      ball.current.rotation.x = t * 6;
    }
  });

  switch (ex.shape) {
    case "monolith":
      return (
        <group>
          <mesh position-y={2.2} material={mats.stone} castShadow>
            <boxGeometry args={[1.6, 4.4, 0.45]} />
          </mesh>
          <mesh position={[0, 2.2, 0.235]} material={active ? mats.crimsonGlow : mats.crimson}>
            <boxGeometry args={[0.04, 4.4, 0.01]} />
          </mesh>
          <Display fontSize={0.36} position={[0, 2.6, 0.24]} maxWidth={1.3} textAlign="center">
            {ex.title}
          </Display>
        </group>
      );
    case "plinth":
      return (
        <group>
          <mesh position-y={0.55} material={mats.concrete} castShadow receiveShadow>
            <boxGeometry args={[1.1, 1.1, 1.1]} />
          </mesh>
          <group ref={spin} userData={{ base: 2.2 }} position-y={2.2}>
            <mesh material={mats.darkMetal} castShadow>
              <boxGeometry args={[1.5, 1.1, 0.06]} />
            </mesh>
            <mesh position-z={0.035} material={mats.screen}>
              <planeGeometry args={[1.35, 0.95]} />
            </mesh>
            <Display fontSize={0.5} position-z={0.04}>
              {ex.eyebrow.split(" ")[1] ?? ""}
            </Display>
            <Display fontSize={0.5} position-z={-0.04} rotation-y={Math.PI}>
              {ex.eyebrow.split(" ")[1] ?? ""}
            </Display>
          </group>
          <spotLight position={[0, 4.5, 1]} angle={0.45} penumbra={1} intensity={active ? 30 : 12} distance={7} color="#fff1dd" />
        </group>
      );
    case "screen":
      return (
        <group>
          <mesh position-y={1.2} material={mats.darkMetal}>
            <boxGeometry args={[0.2, 2.4, 0.2]} />
          </mesh>
          <mesh position-y={2.6} material={mats.darkMetal} castShadow>
            <boxGeometry args={[3.4, 2, 0.12]} />
          </mesh>
          <mesh position={[0, 2.6, 0.065]} material={mats.screen}>
            <planeGeometry args={[3.2, 1.8]} />
          </mesh>
          <mesh position={[-1.45, 3.35, 0.07]} material={mats.crimsonGlow}>
            <planeGeometry args={[0.2, 0.04]} />
          </mesh>
          <Display fontSize={0.34} position={[0, 2.6, 0.07]} maxWidth={2.8} textAlign="center">
            {ex.title}
          </Display>
          {ex.awaiting && (
            <Mono fontSize={0.09} position={[0, 1.9, 0.07]}>
              AWAITING RECORD
            </Mono>
          )}
        </group>
      );
    case "table":
      return (
        <group>
          <mesh position-y={0.95} material={mats.stone} castShadow receiveShadow>
            <boxGeometry args={[3.8, 0.12, 1.6]} />
          </mesh>
          {[-1.6, 1.6].map((x) => (
            <mesh key={x} position={[x, 0.45, 0]} material={mats.darkMetal}>
              <boxGeometry args={[0.12, 0.9, 1.4]} />
            </mesh>
          ))}
          {/* scale-model blocks on the table */}
          {[[-1, 0.2, 0.4], [-0.4, -0.3, 0.7], [0.5, 0.1, 0.5], [1.2, -0.2, 0.3]].map(([x, z, hgt], i) => (
            <mesh key={i} position={[x, 1.01 + hgt / 2, z]} material={i % 2 ? mats.metal : mats.concrete} castShadow>
              <boxGeometry args={[0.35, hgt, 0.35]} />
            </mesh>
          ))}
          <group ref={spin} userData={{ base: 2.6 }} position-y={2.6}>
            <mesh material={mats.glass}>
              <boxGeometry args={[2.2, 1.2, 0.03]} />
            </mesh>
            <mesh position-y={-0.55} material={mats.crimsonGlow}>
              <boxGeometry args={[2.2, 0.02, 0.035]} />
            </mesh>
          </group>
        </group>
      );
    case "freestyle":
      return (
        <group>
          <mesh position-y={0.15} material={mats.stone} receiveShadow castShadow>
            <cylinderGeometry args={[2.2, 2.3, 0.3, 48]} />
          </mesh>
          <mesh position-y={0.31} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[1.6, 1.65, 64]} />
            <meshBasicMaterial color={COL.platinum} />
          </mesh>
          <mesh ref={ball} position-y={1.2} castShadow>
            <icosahedronGeometry args={[0.22, 1]} />
            <meshStandardMaterial color="#f2f2f2" roughness={0.5} flatShading />
          </mesh>
          <spotLight position={[0, 7, 0]} angle={0.35} penumbra={0.8} intensity={80} distance={12} color="#ffffff" castShadow />
        </group>
      );
    case "desk":
      return (
        <group>
          <mesh position-y={0.75} material={mats.darkMetal} castShadow receiveShadow>
            <boxGeometry args={[3, 0.08, 1.1]} />
          </mesh>
          <mesh position={[0, 0.37, -0.4]} material={mats.darkMetal}>
            <boxGeometry args={[2.8, 0.74, 0.08]} />
          </mesh>
          {[-0.75, 0.75].map((x) => (
            <group key={x} position={[x, 1.2, -0.3]} rotation-y={x < 0 ? 0.15 : -0.15}>
              <mesh material={mats.darkMetal}>
                <boxGeometry args={[1.25, 0.72, 0.05]} />
              </mesh>
              <mesh position-z={0.03}>
                <planeGeometry args={[1.18, 0.66]} />
                <meshStandardMaterial color="#0d1018" emissive={active ? "#2a1015" : "#0b0d14"} emissiveIntensity={1.5} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.5, 0.75]} material={mats.crimson} castShadow>
            <boxGeometry args={[0.6, 0.12, 0.6]} />
          </mesh>
          <mesh position={[0, 0.95, 1.02]} material={mats.crimson}>
            <boxGeometry args={[0.6, 0.85, 0.1]} />
          </mesh>
        </group>
      );
    case "pedestal":
      return (
        <group>
          <mesh position-y={0.6} material={mats.concrete} castShadow>
            <cylinderGeometry args={[0.7, 0.8, 1.2, 32]} />
          </mesh>
          <group ref={spin} userData={{ base: 1.9 }} position-y={1.9}>
            <mesh material={mats.metal} castShadow>
              {ex.id === "game-prototypes" ? <torusKnotGeometry args={[0.35, 0.11, 120, 16]} /> : <icosahedronGeometry args={[0.45, 0]} />}
            </mesh>
          </group>
        </group>
      );
    case "podium":
      return (
        <group>
          <mesh position-y={0.1} material={mats.stone} receiveShadow>
            <boxGeometry args={[4, 0.2, 2.4]} />
          </mesh>
          <mesh position={[0, 0.75, 0]} material={mats.metal} castShadow>
            <boxGeometry args={[0.8, 1.1, 0.5]} />
          </mesh>
          <mesh position={[0, 1.33, 0.05]} rotation-x={-0.35} material={mats.darkMetal}>
            <boxGeometry args={[0.9, 0.05, 0.6]} />
          </mesh>
        </group>
      );
    case "contact":
      return (
        <group>
          <mesh position-y={0.5} material={mats.stone} castShadow receiveShadow>
            <boxGeometry args={[5, 1, 1.4]} />
          </mesh>
          <mesh position={[0, 1.01, 0]} rotation-x={-Math.PI / 2} material={active ? mats.crimsonGlow : mats.crimson}>
            <planeGeometry args={[0.9, 0.55]} />
          </mesh>
          <Mono fontSize={0.06} position={[0, 1.02, 0]} rotation-x={-Math.PI / 2} color={COL.platinum}>
            ENQUIRIES
          </Mono>
        </group>
      );
    case "sign":
      return (
        <group>
          <mesh position-y={1.3} material={mats.metal} castShadow>
            <boxGeometry args={[1.1, 2.6, 0.14]} />
          </mesh>
          <mesh position={[0, 1.3, 0.075]} material={mats.screen}>
            <planeGeometry args={[0.95, 2.4]} />
          </mesh>
          <Mono fontSize={0.075} position={[0, 2.25, 0.08]} color={COL.crimson} maxWidth={0.8}>
            {ex.eyebrow.toUpperCase()}
          </Mono>
          <Display fontSize={0.17} position={[0, 1.9, 0.08]} maxWidth={0.8} textAlign="center">
            {ex.title}
          </Display>
        </group>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Per-floor architecture                                               */
/* ------------------------------------------------------------------ */

function FloorDecor({ id, fw, mats, quality }: { id: Division; fw: FloorWorld; mats: Mats; quality: "high" | "low" }) {
  switch (id) {
    case "atrium":
      return <AtriumDecor fw={fw} mats={mats} quality={quality} />;
    case "memory":
      return <MemoryDecor fw={fw} mats={mats} />;
    case "foundry":
      return <FoundryDecor fw={fw} mats={mats} />;
    case "arena":
      return <ArenaDecor fw={fw} mats={mats} quality={quality} />;
    case "control":
      return <ControlDecor fw={fw} mats={mats} quality={quality} />;
    case "sandbox":
      return <SandboxDecor fw={fw} mats={mats} quality={quality} />;
    case "assembly":
      return <AssemblyDecor fw={fw} mats={mats} />;
    case "exchange":
      return <ExchangeDecor fw={fw} mats={mats} />;
  }
}

export function AtriumDecor({ fw, mats, quality }: { fw: FloorWorld; mats: Mats; quality: "high" | "low" }) {
  const rings = useRef<THREE.Group>(null);
  const slabs = useRef<THREE.Group>(null);
  const counter = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (rings.current) {
      rings.current.children.forEach((c, i) => {
        c.rotation.x = Math.sin(t * 0.1 + i) * 0.6 + i * 0.4;
        c.rotation.y = t * (0.05 + i * 0.03) * (i % 2 ? -1 : 1);
      });
    }
    if (slabs.current) {
      slabs.current.children.forEach((c, i) => {
        c.rotation.y = Math.sin(t * 0.07 + i * 1.7) * 0.5;
        c.position.y = 13 + Math.sin(t * 0.25 + i) * 0.35 + (i % 3) * 1.4;
      });
    }
    if (counter.current) counter.current.position.y = 9 + Math.sin(t * 0.18) * 5;
  });

  const columns = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (const x of [-15, -7.5, 7.5, 15]) for (const z of [-15, 3]) pts.push([x, fw.h / 2, z]);
    return pts;
  }, [fw.h]);

  return (
    <group>
      {/* monumental columns */}
      <Instances material={mats.concrete} castShadow receiveShadow limit={16}>
        <boxGeometry args={[1.8, fw.h, 1.8]} />
        {columns.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* floating walkways */}
      {[
        { y: 5.5, z: -15, w: 36 },
        { y: 17, z: 3, w: 36 },
      ].map((b, i) => (
        <group key={i} position={[0, b.y, b.z]}>
          <mesh material={mats.concrete} castShadow receiveShadow>
            <boxGeometry args={[b.w, 0.5, 3]} />
          </mesh>
          <mesh position={[0, 0.6, 1.45]} material={mats.glass}>
            <boxGeometry args={[b.w, 1.1, 0.05]} />
          </mesh>
          <mesh position={[0, 1.15, 1.45]} material={mats.metal}>
            <boxGeometry args={[b.w, 0.05, 0.08]} />
          </mesh>
          <mesh position={[0, -0.26, 1.5]} material={mats.crimsonGlow}>
            <boxGeometry args={[b.w, 0.02, 0.02]} />
          </mesh>
        </group>
      ))}
      {/* cross bridge */}
      <mesh position={[0, 11, -6]} rotation-y={Math.PI / 2} material={mats.concrete} castShadow>
        <boxGeometry args={[18, 0.4, 2.2]} />
      </mesh>

      {/* the kinetic sculpture: nested rings */}
      <group ref={rings} position={[0, 15.5, -8]}>
        {[5.5, 4.4, 3.3].map((r, i) => (
          <mesh key={r} material={i === 1 ? mats.crimson : mats.metal} castShadow>
            <torusGeometry args={[r, 0.12 + i * 0.03, 12, 96]} />
          </mesh>
        ))}
        <mesh material={mats.stone}>
          <octahedronGeometry args={[1.1, 0]} />
        </mesh>
      </group>
      {/* suspension cables */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 4, 21, -8]} material={mats.darkMetal}>
          <cylinderGeometry args={[0.02, 0.02, 10, 6]} />
        </mesh>
      ))}

      {/* suspended slabs */}
      <group ref={slabs}>
        {[
          [-12, -4],
          [12, -6],
          [-16, -14],
          [16, -12],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 13, z]} material={i % 2 ? mats.stone : mats.concrete} castShadow>
            <boxGeometry args={[0.5, 4.5, 3]} />
          </mesh>
        ))}
      </group>

      {/* moving counterweight on the east wall */}
      <group ref={counter} position={[fw.w / 2 - 1.6, 9, -6]}>
        <mesh material={mats.darkMetal} castShadow>
          <boxGeometry args={[1.2, 2.4, 1.2]} />
        </mesh>
        <mesh position-x={-0.61} material={mats.crimsonGlow}>
          <boxGeometry args={[0.01, 2.4, 0.06]} />
        </mesh>
      </group>
      <mesh position={[fw.w / 2 - 1.6, fw.h / 2, -6]} material={mats.darkMetal}>
        <boxGeometry args={[0.08, fw.h, 0.08]} />
      </mesh>

      {/* skylight */}
      <mesh position={[0, fw.h - 0.05, -8]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[2, 30]} />
        <meshBasicMaterial color="#f6f2ea" toneMapped={false} />
      </mesh>
      {quality === "high" && (
        <spotLight position={[0, fw.h - 1, -8]} angle={0.4} penumbra={1} intensity={300} distance={40} color="#fff3e2" castShadow />
      )}

      {/* crimson processional line toward elevator */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.013, 6]} material={mats.crimsonGlow}>
        <planeGeometry args={[0.06, 26]} />
      </mesh>

      {/* name on north wall */}
      <group position={[0, 12, -fw.d / 2 + 0.06]}>
        <Display fontSize={5.2}>NIKITA S.</Display>
        <Mono fontSize={0.42} position-y={-3.4} color={COL.crimson}>
          EVERY CHAPTER BUILDS THE NEXT.
        </Mono>
      </group>
    </group>
  );
}

function MemoryDecor({ fw, mats }: { fw: FloorWorld; mats: Mats }) {
  const frames = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -fw.w / 2 + 3; x <= fw.w / 2 - 3; x += 2.6) arr.push([x, 2.4 + ((x * 7) % 3) * 0.35]);
    return arr;
  }, [fw.w]);
  return (
    <group>
      {/* timeline rail connecting the chapters */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.014, -3.75]} material={mats.crimsonGlow}>
        <planeGeometry args={[29, 0.05]} />
      </mesh>
      {/* "photograph" frames on north wall, awaiting images */}
      <Instances material={mats.darkMetal} limit={30}>
        <boxGeometry args={[1.6, 1.1, 0.06]} />
        {frames.map(([x, y]) => (
          <Instance key={x} position={[x, y, -fw.d / 2 + 0.05]} />
        ))}
      </Instances>
      <Instances material={mats.screen} limit={30}>
        <planeGeometry args={[1.4, 0.9]} />
        {frames.map(([x, y]) => (
          <Instance key={x} position={[x, y, -fw.d / 2 + 0.09]} />
        ))}
      </Instances>
      {/* archive shelving on east/west */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (fw.w / 2 - 1.6), 0, 3]}>
          {[0.6, 1.5, 2.4, 3.3].map((y) => (
            <mesh key={y} position-y={y} material={mats.darkMetal}>
              <boxGeometry args={[1, 0.06, 10]} />
            </mesh>
          ))}
          <mesh position-y={1.9} material={mats.concrete}>
            <boxGeometry args={[0.9, 3.6, 0.1]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FoundryDecor({ fw, mats }: { fw: FloorWorld; mats: Mats }) {
  const displays = useRef<THREE.Group>(null);
  useFrame((s) => {
    displays.current?.children.forEach((c, i) => {
      c.position.y = 5 + Math.sin(s.clock.elapsedTime * 0.5 + i * 1.3) * 0.4;
      c.rotation.y = Math.sin(s.clock.elapsedTime * 0.2 + i) * 0.4;
    });
  });
  return (
    <group>
      {/* gantry beams */}
      {[-6, 0, 6].map((z) => (
        <mesh key={z} position={[0, fw.h - 1.4, z]} material={mats.darkMetal} castShadow>
          <boxGeometry args={[fw.w, 0.5, 0.35]} />
        </mesh>
      ))}
      {/* floating project displays */}
      <group ref={displays}>
        {[-11, -5, 5, 11].map((x, i) => (
          <group key={x} position={[x, 5, -9 + (i % 2) * 2]}>
            <mesh material={mats.glass}>
              <boxGeometry args={[2.6, 1.5, 0.03]} />
            </mesh>
            <mesh position-y={-0.76} material={mats.crimsonGlow}>
              <boxGeometry args={[2.6, 0.02, 0.04]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* the crucible — a central cast form */}
      <mesh position={[0, 0.9, 2]} material={mats.darkMetal} castShadow>
        <cylinderGeometry args={[1.1, 0.8, 1.8, 6]} />
      </mesh>
      <mesh position={[0, 1.82, 2]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.95, 6]} />
        <meshBasicMaterial color="#ff7a3c" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.6, 2]} intensity={10} distance={8} color="#ff8a4c" />
      {/* work benches along walls */}
      <Instances material={mats.stone} castShadow limit={12}>
        <boxGeometry args={[3, 0.9, 1]} />
        {[-11, -6, 6, 11].map((x) => (
          <Instance key={x} position={[x, 0.45, 8]} />
        ))}
      </Instances>
    </group>
  );
}

function ArenaDecor({ fw, mats, quality }: { fw: FloorWorld; mats: Mats; quality: "high" | "low" }) {
  const steps = useMemo(() => {
    const arr: { p: [number, number, number]; s: [number, number, number] }[] = [];
    for (let i = 0; i < 6; i++) {
      arr.push({ p: [0, 0.4 + i * 0.8, -fw.d / 2 + 1 + i * 0.01 + (5 - i) * 0.9], s: [fw.w - 4, 0.8, 0.9] });
    }
    return arr;
  }, [fw.w, fw.d]);
  const seats = useMemo(() => {
    if (quality === "low") return [];
    const arr: [number, number, number][] = [];
    for (let row = 0; row < 6; row++) {
      for (let x = -fw.w / 2 + 3; x <= fw.w / 2 - 3; x += 0.9) {
        arr.push([x, 0.95 + row * 0.8, -fw.d / 2 + 1 + (5 - row) * 0.9]);
      }
    }
    return arr;
  }, [fw.w, fw.d, quality]);

  return (
    <group>
      {/* pitch markings */}
      <group position-y={0.012}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 2]}>
          <ringGeometry args={[4.4, 4.5, 72]} />
          <meshBasicMaterial color="#cfd3da" />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 2]}>
          <planeGeometry args={[fw.w - 6, 0.1]} />
          <meshBasicMaterial color="#cfd3da" />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 2]}>
          <planeGeometry args={[0.1, fw.d - 12]} />
          <meshBasicMaterial color="#cfd3da" opacity={0.0} transparent />
        </mesh>
      </group>
      {/* stands (north) */}
      {steps.map((s, i) => (
        <mesh key={i} position={s.p} material={mats.concrete} receiveShadow castShadow>
          <boxGeometry args={s.s} />
        </mesh>
      ))}
      {seats.length > 0 && (
        <Instances material={mats.crimson} limit={400}>
          <boxGeometry args={[0.55, 0.35, 0.45]} />
          {seats.map((p, i) => (
            <Instance key={i} position={p} color={i % 7 === 0 ? COL.concrete : COL.crimson} />
          ))}
        </Instances>
      )}
      {/* floodlight towers */}
      {[
        [-fw.w / 2 + 2, fw.d / 2 - 3],
        [fw.w / 2 - 2, fw.d / 2 - 3],
        [-fw.w / 2 + 2, -fw.d / 2 + 7],
        [fw.w / 2 - 2, -fw.d / 2 + 7],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={fw.h / 2 - 1} material={mats.darkMetal} castShadow>
            <boxGeometry args={[0.35, fw.h - 2, 0.35]} />
          </mesh>
          <mesh position-y={fw.h - 2} rotation-x={0.4}>
            <boxGeometry args={[1.8, 1, 0.2]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ControlDecor({ fw, mats, quality }: { fw: FloorWorld; mats: Mats; quality: "high" | "low" }) {
  const bar = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (bar.current) bar.current.scale.x = 0.15 + ((s.clock.elapsedTime * 0.12) % 1) * 0.85;
  });
  const rows = useMemo(() => {
    const arr: [number, number, number][] = [];
    const n = quality === "high" ? 6 : 3;
    for (let i = 0; i < n; i++) arr.push([-10 + (i % 3) * 10 / 1, 0, 4 + Math.floor(i / 3) * 3.4]);
    return arr;
  }, [quality]);
  return (
    <group>
      {/* broadcast wall */}
      <group position={[0, 5.2, -fw.d / 2 + 0.2]}>
        <mesh material={mats.screen}>
          <boxGeometry args={[18, 4.2, 0.1]} />
        </mesh>
        <mesh ref={bar} position={[0, -1.85, 0.06]} material={mats.crimsonGlow}>
          <planeGeometry args={[17, 0.06]} />
        </mesh>
        <Mono fontSize={0.22} position={[-8.2, 1.75, 0.07]} anchorX="left" color={COL.crimson}>
          ● LIVE — CONTROL ROOM
        </Mono>
      </group>
      {/* production stage riser */}
      <mesh position={[0, 0.2, -9]} material={mats.stone} receiveShadow>
        <boxGeometry args={[16, 0.4, 4]} />
      </mesh>
      {/* production desks (instanced) */}
      <Instances material={mats.darkMetal} castShadow limit={12}>
        <boxGeometry args={[4.2, 0.9, 1]} />
        {rows.map((p, i) => (
          <Instance key={i} position={[p[0], 0.45, p[2]]} />
        ))}
      </Instances>
      <Instances material={mats.screen} limit={36}>
        <boxGeometry args={[0.9, 0.55, 0.04]} />
        {rows.flatMap((p, i) =>
          [-1.3, 0, 1.3].map((dx) => <Instance key={`${i}${dx}`} position={[p[0] + dx, 1.25, p[2] - 0.3]} />),
        )}
      </Instances>
      <pointLight position={[0, fw.h - 1, 0]} intensity={25} distance={20} color="#cdd6ff" />
    </group>
  );
}

function SandboxDecor({ fw, mats, quality }: { fw: FloorWorld; mats: Mats; quality: "high" | "low" }) {
  const voxels = useMemo(() => {
    const arr: { p: [number, number, number]; s: number }[] = [];
    const n = quality === "high" ? 140 : 50;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const x = (rnd() - 0.5) * (fw.w - 4);
      const z = -fw.d / 2 + 1.5 + rnd() * 3.5;
      const stack = Math.floor(rnd() * 5);
      arr.push({ p: [x, 0.25 + stack * 0.5, z], s: 0.5 });
    }
    return arr;
  }, [fw.w, fw.d, quality]);
  const floaters = useRef<THREE.Group>(null);
  useFrame((s) => {
    floaters.current?.children.forEach((c, i) => {
      c.rotation.x = s.clock.elapsedTime * (0.2 + i * 0.05);
      c.rotation.y = s.clock.elapsedTime * 0.3;
    });
  });
  return (
    <group>
      {/* voxel asset wall */}
      <Instances material={mats.concrete} castShadow receiveShadow limit={200}>
        <boxGeometry args={[0.48, 0.48, 0.48]} />
        {voxels.map((v, i) => (
          <Instance key={i} position={v.p} color={i % 11 === 0 ? COL.crimson : i % 3 ? "#5d636c" : "#8a9099"} />
        ))}
      </Instances>
      {/* wireframe prototypes floating */}
      <group ref={floaters}>
        {[
          [-11, 4.5, 2],
          [11, 4, 1],
          [-9, 5.5, 7],
          [9, 5, 6],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            {i % 2 ? <dodecahedronGeometry args={[0.9, 0]} /> : <boxGeometry args={[1.2, 1.2, 1.2]} />}
            <meshBasicMaterial color={i === 0 ? COL.crimson : "#9aa0aa"} wireframe />
          </mesh>
        ))}
      </group>
      {/* workstations row */}
      <Instances material={mats.darkMetal} castShadow limit={8}>
        <boxGeometry args={[2.4, 0.08, 1]} />
        {[-10, -5, 5, 10].map((x) => (
          <Instance key={x} position={[x, 0.75, 8]} />
        ))}
      </Instances>
      <Instances material={mats.screen} limit={8}>
        <boxGeometry args={[1.4, 0.8, 0.05]} />
        {[-10, -5, 5, 10].map((x) => (
          <Instance key={x} position={[x, 1.25, 7.7]} />
        ))}
      </Instances>
    </group>
  );
}

function AssemblyDecor({ fw, mats }: { fw: FloorWorld; mats: Mats }) {
  const seats = useMemo(() => {
    const arr: { p: [number, number, number]; r: number }[] = [];
    for (let row = 0; row < 3; row++) {
      const rad = 7 + row * 1.8;
      for (let a = -0.9; a <= 0.9; a += 0.16) {
        arr.push({ p: [Math.sin(a) * rad, 0.4, -9 + Math.cos(a) * rad], r: a + Math.PI });
      }
    }
    return arr;
  }, []);
  return (
    <group>
      <Instances material={mats.darkMetal} castShadow limit={60}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        {seats.map((s, i) => (
          <Instance key={i} position={s.p} rotation-y={s.r} />
        ))}
      </Instances>
      {/* hanging banners */}
      {[-14, -9, 9, 14].map((x, i) => (
        <group key={x} position={[x, fw.h - 4, -fw.d / 2 + 2]}>
          <mesh material={i % 2 ? mats.concrete : mats.crimson}>
            <boxGeometry args={[2, 6, 0.04]} />
          </mesh>
          <mesh position-y={3.1} material={mats.metal}>
            <boxGeometry args={[2.3, 0.08, 0.08]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ExchangeDecor({ fw, mats }: { fw: FloorWorld; mats: Mats }) {
  return (
    <group>
      {/* full-height window wall */}
      <mesh position={[0, fw.h / 2, -fw.d / 2 + 0.05]}>
        <planeGeometry args={[fw.w - 2, fw.h - 1]} />
        <meshBasicMaterial color="#d9dde4" toneMapped={false} />
      </mesh>
      <Instances material={mats.darkMetal} limit={20}>
        <boxGeometry args={[0.12, fw.h, 0.2]} />
        {Array.from({ length: 9 }, (_, i) => -fw.w / 2 + 1 + (i * (fw.w - 2)) / 8).map((x) => (
          <Instance key={x} position={[x, fw.h / 2, -fw.d / 2 + 0.1]} />
        ))}
      </Instances>
      <pointLight position={[0, fw.h / 2, -fw.d / 2 + 2]} intensity={40} distance={26} color="#eef2f8" />
      {/* seating */}
      {[-2.2, 2.2].map((x) => (
        <mesh key={x} position={[x, 0.45, -2.8]} material={mats.darkMetal} castShadow>
          <boxGeometry args={[0.7, 0.9, 0.7]} />
        </mesh>
      ))}
      <mesh position={[0, 0.25, 4]} material={mats.stone} castShadow receiveShadow>
        <boxGeometry args={[9, 0.5, 1]} />
      </mesh>
    </group>
  );
}

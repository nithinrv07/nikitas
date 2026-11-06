"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { floors, type Division } from "@/content/site";
import { FloorEnvironment } from "./Building";
import { Player } from "./Player";
import { HUD } from "./HUD";
import { live, useArchive } from "./store";

export default function Experience() {
  const floor = useArchive((s) => s.floor);
  const quality = useArchive((s) => s.quality);
  const [ready, setReady] = useState(false);

  // Initial floor from ?floor=..., device-based quality.
  useEffect(() => {
    const st = useArchive.getState();
    const params = new URLSearchParams(window.location.search);
    const req = params.get("floor") as Division | null;
    if (req && floors.some((f) => f.id === req)) st.setFloor(req);
    const coarse = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    if (coarse || params.get("quality") === "low") st.setQuality("low");
    st.setPhase("intro");
    live.respawn = true;
    setReady(true);
  }, []);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        if (e.code === "Escape") target.blur();
        return;
      }
      const st = useArchive.getState();
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
      if (e.code === "Escape" || e.code === "KeyP") {
        if (st.phase === "panel" || st.phase === "elevator") st.closeOverlay();
        else if (st.phase === "playing") st.setPhase("paused");
        else if (st.phase === "paused") st.setPhase("playing");
        return;
      }
      if ((e.code === "KeyE" || e.code === "Enter" || e.code === "Space") && st.phase === "playing") {
        live.interact = true;
        return;
      }
      live.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => live.keys.delete(e.code);
    const blur = () => live.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Clear held keys whenever the game is not in control.
  useEffect(
    () =>
      useArchive.subscribe((s, prev) => {
        if (s.phase !== prev.phase && s.phase !== "playing") {
          live.keys.clear();
          live.joystick.x = live.joystick.y = 0;
        }
      }),
    [],
  );

  const high = quality === "high";

  return (
    <div className="fixed inset-0 touch-none overflow-hidden bg-midnight select-none">
      {ready && (
        <Canvas
          shadows={high}
          dpr={high ? [1, 1.75] : [0.75, 1.25]}
          gl={{ antialias: high, powerPreference: "high-performance" }}
          onCreated={(state) => {
            const { gl } = state;
            if (process.env.NODE_ENV !== "production") (window as unknown as { __r3f: unknown }).__r3f = state;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
          camera={{ fov: 52, near: 0.1, far: 200, position: [0, 4, 20] }}
          aria-label="3D building — use the controls described in the help menu"
        >
          <PerformanceMonitor onDecline={() => useArchive.getState().setQuality("low")} />
          <AdaptiveDpr pixelated={false} />
          <Suspense fallback={null}>
            <FloorEnvironment key={floor} id={floor} quality={quality} />
            <Player />
          </Suspense>
        </Canvas>
      )}
      <HUD />
    </div>
  );
}

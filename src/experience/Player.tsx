"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Character } from "./Character";
import { live, useArchive } from "./store";
import { spawnFor, world } from "./world";

const WALK = 5.2;
const RUN = 9;
const PLAYER_R = 0.45;

/**
 * Third-person controller: keyboard/joystick movement relative to the camera,
 * drag-to-orbit camera (mouse or touch), wheel zoom, simple circle/box
 * collision, proximity detection for exhibits and the elevator.
 */
export function Player() {
  const group = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const floor = useArchive((s) => s.floor);
  const target = useRef(new THREE.Vector3());

  // Drag-to-look (mouse + touch). The HUD joystick stops propagation, so this
  // only receives drags on the scene itself.
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let id = -1;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      if (dragging) return;
      dragging = true;
      id = e.pointerId;
      lx = e.clientX;
      ly = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== id) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      const k = e.pointerType === "touch" ? 0.008 : 0.005;
      live.cam.yaw -= dx * k;
      live.cam.pitch = THREE.MathUtils.clamp(live.cam.pitch + dy * k * 0.6, 0.08, 1.1);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId === id) dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      live.cam.dist = THREE.MathUtils.clamp(live.cam.dist + e.deltaY * 0.006, 3.5, 13);
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl]);

  useEffect(() => {
    live.respawn = true;
  }, [floor]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const g = group.current;
    if (!g) return;
    const st = useArchive.getState();
    const fw = world[st.floor];
    const p = live.player;

    if (live.respawn) {
      const [sx, sz] = spawnFor(st.floor);
      p.x = sx;
      p.z = sz;
      p.heading = 0;
      live.cam.yaw = 0;
      live.respawn = false;
      target.current.set(sx, 1.6, sz);
    }

    // ---- input
    let ix = 0;
    let iy = 0;
    const k = live.keys;
    if (k.has("KeyW") || k.has("ArrowUp")) iy += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) iy -= 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) ix -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) ix += 1;
    ix += live.joystick.x;
    iy += live.joystick.y;
    const mag = Math.min(1, Math.hypot(ix, iy));
    const canMove = st.phase === "playing";

    let speed = 0;
    if (canMove && mag > 0.05) {
      const yaw = live.cam.yaw;
      const fx = -Math.sin(yaw);
      const fz = -Math.cos(yaw);
      const rx = Math.cos(yaw);
      const rz = -Math.sin(yaw);
      let mx = fx * iy + rx * ix;
      let mz = fz * iy + rz * ix;
      const ml = Math.hypot(mx, mz) || 1;
      mx /= ml;
      mz /= ml;
      const run = k.has("ShiftLeft") || k.has("ShiftRight");
      speed = (run ? RUN : WALK) * mag;
      p.x += mx * speed * dt;
      p.z += mz * speed * dt;
      const targetHeading = Math.atan2(-mx, -mz);
      let diff = targetHeading - p.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      p.heading += diff * Math.min(1, dt * 12);
    }
    p.speed = THREE.MathUtils.damp(p.speed, speed / RUN, 10, dt);

    // ---- collision: room bounds
    const bx = fw.w / 2 - PLAYER_R - 0.7;
    const bz = fw.d / 2 - PLAYER_R - 0.7;
    p.x = THREE.MathUtils.clamp(p.x, -bx, bx);
    p.z = THREE.MathUtils.clamp(p.z, -bz, bz);
    // exhibits
    for (const ex of fw.exhibits) {
      const dx = p.x - ex.pos[0];
      const dz = p.z - ex.pos[1];
      const d = Math.hypot(dx, dz);
      const min = ex.r + PLAYER_R;
      if (d < min && d > 0.0001) {
        p.x = ex.pos[0] + (dx / d) * min;
        p.z = ex.pos[1] + (dz / d) * min;
      }
    }

    g.position.set(p.x, 0, p.z);
    g.rotation.y = p.heading;

    // ---- proximity
    let nearest: string | null = null;
    let best = Infinity;
    for (const ex of fw.exhibits) {
      const d = Math.hypot(p.x - ex.pos[0], p.z - ex.pos[1]) - ex.r;
      if (d < 1.8 && d < best) {
        best = d;
        nearest = ex.id;
      }
    }
    const ed = Math.hypot(p.x, p.z - fw.d / 2);
    if (ed < 3.6 && ed - 1 < best) nearest = "elevator";
    if (nearest !== st.nearby) st.setNearby(nearest);

    if (live.interact) {
      live.interact = false;
      if (st.phase === "playing" && nearest) st.openPanel(nearest);
    }

    // ---- camera
    const { yaw, pitch, dist } = live.cam;
    target.current.lerp(new THREE.Vector3(p.x, 1.6, p.z), 1 - Math.exp(-dt * 10));
    const t = target.current;
    let cx = t.x + Math.sin(yaw) * Math.cos(pitch) * dist;
    let cz = t.z + Math.cos(yaw) * Math.cos(pitch) * dist;
    let cy = t.y + Math.sin(pitch) * dist;
    // keep the camera inside the hall
    const m = 0.4;
    cx = THREE.MathUtils.clamp(cx, -fw.w / 2 + m, fw.w / 2 - m);
    cz = THREE.MathUtils.clamp(cz, -fw.d / 2 + m, fw.d / 2 - m);
    cy = THREE.MathUtils.clamp(cy, 0.6, fw.h - 0.8);
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), 1 - Math.exp(-dt * 12));
    camera.lookAt(t.x, t.y, t.z);
  });

  return (
    <group ref={group}>
      <Character getSpeed={() => live.player.speed} />
    </group>
  );
}

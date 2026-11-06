import { create } from "zustand";
import type { Division } from "@/content/site";

export type Phase = "intro" | "tutorial" | "playing" | "paused" | "panel" | "elevator" | "transition";

type State = {
  floor: Division;
  phase: Phase;
  panel: string | null; // exhibit id
  nearby: string | null; // exhibit id or "elevator"
  quality: "high" | "low";
  setFloor: (f: Division) => void;
  setPhase: (p: Phase) => void;
  openPanel: (id: string) => void;
  closeOverlay: () => void;
  setNearby: (id: string | null) => void;
  setQuality: (q: "high" | "low") => void;
};

export const useArchive = create<State>((set) => ({
  floor: "atrium",
  phase: "intro",
  panel: null,
  nearby: null,
  quality: "high",
  setFloor: (floor) => set({ floor, nearby: null }),
  setPhase: (phase) => set({ phase }),
  openPanel: (id) => set(id === "elevator" ? { phase: "elevator", panel: null } : { phase: "panel", panel: id }),
  closeOverlay: () => set({ phase: "playing", panel: null }),
  setNearby: (nearby) => set({ nearby }),
  setQuality: (quality) => set({ quality }),
}));

/**
 * High-frequency, non-React state (read every frame). Kept outside React to
 * avoid re-rendering the HUD 60 times a second.
 */
export const live = {
  player: { x: 0, z: 0, heading: 0, speed: 0 },
  cam: { yaw: 0, pitch: 0.3, dist: 6.5 },
  keys: new Set<string>(),
  joystick: { x: 0, y: 0 },
  /** set true for one frame to request an interaction */
  interact: false,
  /** requested respawn after a floor change */
  respawn: true,
};

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __archive: unknown }).__archive = { live, useArchive };
}

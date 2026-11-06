/**
 * Architectural layout of the building.
 *
 * Each floor is a rectangular hall (x: -w/2..w/2, z: -d/2..d/2). The elevator
 * core always sits in the middle of the south wall (+z). Exhibits are the
 * interactive objects; their copy is pulled from src/content/site.ts so the
 * building and the website never disagree.
 */
import {
  chapters,
  entries,
  floorById,
  floors,
  profile,
  type Division,
} from "@/content/site";

export type ExhibitShape =
  | "monolith"
  | "plinth"
  | "screen"
  | "table"
  | "freestyle"
  | "desk"
  | "pedestal"
  | "podium"
  | "contact"
  | "sign";

export type Exhibit = {
  id: string;
  shape: ExhibitShape;
  /** x, z on the floor plane */
  pos: [number, number];
  /** rotation around Y (radians) */
  rot?: number;
  /** collision radius */
  r: number;
  eyebrow: string;
  title: string;
  body: string;
  route?: string;
  awaiting?: boolean;
  /** opens the contact form instead of a text panel */
  action?: "contact" | "elevator";
};

export type Palette = {
  floor: string;
  wall: string;
  accent: string;
  light: string;
  fog: string;
};

export type FloorWorld = {
  id: Division;
  w: number;
  d: number;
  h: number;
  palette: Palette;
  exhibits: Exhibit[];
};

const C = { midnight: "#090B10", graphite: "#171A21", concrete: "#777D87", platinum: "#E5E7EB", crimson: "#D7263D" };

const fromEntry = (id: string, shape: ExhibitShape, pos: [number, number], rot = 0, r = 1.2): Exhibit => {
  const e = entries.find((x) => x.id === id)!;
  return {
    id: e.id,
    shape,
    pos,
    rot,
    r,
    eyebrow: e.kind,
    title: e.title,
    body: e.summary,
    route: floorById(e.division).route,
    awaiting: e.awaitingRecord,
  };
};

const fromChapter = (i: number, pos: [number, number], rot = 0): Exhibit => {
  const c = chapters[i];
  return {
    id: c.id,
    shape: "plinth",
    pos,
    rot,
    r: 1.1,
    eyebrow: `Chapter ${c.index}${c.period ? ` · ${c.period}` : ""}`,
    title: c.title,
    body: c.body,
    route: floorById(c.division).route,
  };
};

const directory = (pos: [number, number], rot = 0): Exhibit => ({
  id: "directory",
  shape: "sign",
  pos,
  rot,
  r: 0.9,
  eyebrow: "Building directory",
  title: "Seven floors above you",
  body: floors
    .filter((f) => f.id !== "atrium")
    .map((f) => `${f.level} — ${f.name}: ${f.division}`)
    .join("\n"),
  route: "/archive",
});

export const world: Record<Division, FloorWorld> = {
  atrium: {
    id: "atrium",
    w: 44,
    d: 44,
    h: 26,
    palette: { floor: "#15181e", wall: "#4b505a", accent: C.crimson, light: "#f3efe6", fog: C.midnight },
    exhibits: [
      {
        id: "welcome",
        shape: "monolith",
        pos: [0, -8],
        r: 2.2,
        eyebrow: "The Grand Atrium",
        title: profile.name,
        body: `${profile.tagline}\n\n${profile.roles.join(" · ")}\n\n${profile.intro}`,
        route: "/about",
      },
      directory([-6, 14], Math.PI / 6),
      {
        id: "portfolio-kiosk",
        shape: "sign",
        pos: [6, 14],
        rot: -Math.PI / 6,
        r: 0.9,
        eyebrow: "Conventional route",
        title: "Explore portfolio",
        body: "Prefer reading to walking? Every floor of this building is also a regular web page.",
        route: "/about",
      },
    ],
  },
  memory: {
    id: "memory",
    w: 34,
    d: 28,
    h: 9,
    palette: { floor: "#14161b", wall: "#3a3d44", accent: C.crimson, light: "#f1e9dc", fog: "#0c0d11" },
    // Seven chapters arranged as a walkable timeline, west → east.
    exhibits: chapters.map((_, i) => fromChapter(i, [-13.5 + i * 4.5, i % 2 === 0 ? -6 : -1.5], 0)),
  },
  foundry: {
    id: "foundry",
    w: 32,
    d: 28,
    h: 11,
    palette: { floor: "#121419", wall: "#3b342f", accent: C.crimson, light: "#ffd9b0", fog: "#0d0c0b" },
    exhibits: [
      fromEntry("ventures-overview", "table", [-7, -4], 0, 2.2),
      fromEntry("communities", "table", [7, -4], 0, 2.2),
      fromEntry("products", "screen", [0, -10], 0, 1.6),
    ],
  },
  arena: {
    id: "arena",
    w: 40,
    d: 32,
    h: 16,
    palette: { floor: "#0f1412", wall: "#2c3036", accent: C.crimson, light: "#ffffff", fog: "#090b0c" },
    exhibits: [
      fromEntry("freestyle", "freestyle", [0, -3], 0, 2.4),
      fromEntry("sports-management-work", "screen", [-12, -8], Math.PI / 5, 1.6),
      {
        id: "arena-gallery",
        shape: "screen",
        pos: [12, -8],
        rot: -Math.PI / 5,
        r: 1.6,
        eyebrow: "Sports photography",
        title: "Event wall",
        body: "Photographs and event displays from sports management and freestyle will hang here once they are added to the archive.",
        route: "/sports",
        awaiting: true,
      },
    ],
  },
  control: {
    id: "control",
    w: 32,
    d: 28,
    h: 10,
    palette: { floor: "#0e1015", wall: "#22252d", accent: C.crimson, light: "#d7dcff", fog: "#08090c" },
    exhibits: [
      fromEntry("esports-competition", "desk", [-6, -5], 0, 2),
      fromEntry("creator-channel", "desk", [6, -5], 0, 2),
      {
        id: "broadcast-wall",
        shape: "screen",
        pos: [0, -11.5],
        r: 1.6,
        eyebrow: "Tournament wall",
        title: "Competition record",
        body: "Tournament results and achievements appear here once verified records are added.",
        route: "/esports",
        awaiting: true,
      },
    ],
  },
  sandbox: {
    id: "sandbox",
    w: 32,
    d: 28,
    h: 9,
    palette: { floor: "#111317", wall: "#30343c", accent: C.crimson, light: "#e8f0ff", fog: "#0a0b0e" },
    exhibits: [
      fromEntry("game-prototypes", "pedestal", [-6, -4], 0, 1.4),
      fromEntry("tech-exploration", "pedestal", [6, -4], 0, 1.4),
      {
        id: "workstation",
        shape: "desk",
        pos: [0, -10],
        r: 2,
        eyebrow: "Development workstation",
        title: "Playable experiments",
        body: "Builds and playable experiments will be linked from this workstation as they are published. The building you are standing in is one of them.",
        route: "/tech",
      },
    ],
  },
  assembly: {
    id: "assembly",
    w: 34,
    d: 28,
    h: 12,
    palette: { floor: "#15161a", wall: "#3c3f46", accent: C.crimson, light: "#fff3e3", fog: "#0c0c0e" },
    exhibits: [
      fromEntry("leadership", "podium", [0, -9], 0, 1.4),
      fromEntry("partnerships", "monolith", [-10, -3], Math.PI / 8, 1.4),
      fromEntry("speaking", "monolith", [10, -3], -Math.PI / 8, 1.4),
    ],
  },
  exchange: {
    id: "exchange",
    w: 26,
    d: 24,
    h: 8,
    palette: { floor: "#17191e", wall: "#4a4e56", accent: C.crimson, light: "#ffffff", fog: "#0d0e11" },
    exhibits: [
      {
        id: "contact-desk",
        shape: "contact",
        pos: [0, -5],
        r: 2.6,
        eyebrow: "The Exchange",
        title: "Start a conversation",
        body: "Professional enquiries, collaborations and partnerships.",
        route: "/contact",
        action: "contact",
      },
    ],
  },
};

export const ELEVATOR = { z: (d: number) => d / 2 - 1.2, radius: 2.6 };

export const spawnFor = (id: Division): [number, number] => [0, world[id].d / 2 - 7];

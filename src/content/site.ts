/**
 * THE LIVING ARCHIVE — structured, editable content.
 *
 * Everything the website and the 3D building display comes from this file.
 *
 * GENUINE CONTENT RULE
 * --------------------
 * Only the career story supplied in the brief has been written in. Anything
 * that needs a real fact (venture names, dates, results, partners, links,
 * photos, videos) is left EMPTY on purpose. Empty fields are hidden or shown
 * as a quiet "awaiting record" plate — never filled with invented data.
 * Fill them in here and both the website and the building update.
 */

export type Division =
  | "atrium"
  | "memory"
  | "foundry"
  | "arena"
  | "control"
  | "sandbox"
  | "assembly"
  | "exchange";

export type Social = { label: string; url: string };

export type MediaImage = { src: string; alt: string; caption?: string };
/** YouTube video id (e.g. "dQw4w9WgXcQ") or full embeddable URL. */
export type MediaVideo = { title: string; youtubeId?: string; url?: string };

export type Chapter = {
  id: string;
  index: string;
  title: string;
  /** Leave empty until confirmed, e.g. "2019" or "2020 — 2021". */
  period: string;
  division: Division;
  body: string;
};

export type Entry = {
  id: string;
  title: string;
  division: Division;
  kind: string;
  summary: string;
  /** Optional details — leave empty rather than estimating. */
  role?: string;
  period?: string;
  link?: string;
  tags: string[];
  /** true = a category/frame awaiting the real record (names, results, links). */
  awaitingRecord?: boolean;
};

export const profile = {
  name: "Nikita S.",
  monogram: "NS",
  tagline: "Every chapter builds the next.",
  roles: [
    "Entrepreneur",
    "Sports & Esports Professional",
    "Gaming Creator",
    "Technology Explorer",
    "Game Development Enthusiast",
  ],
  positioning:
    "A multidisciplinary entrepreneur working across sports, gaming and technology.",
  intro:
    "Nikita's career did not follow a single track. It started in sports management and on the football freestyle floor, turned towards technology during COVID, moved into esports as an athlete, grew into a gaming creator career, and became a habit of building communities and ventures. The newest chapter is game development. Each one was built on the last.",
  /** Public contact email. Leave empty to hide (the contact form still works). */
  email: "",
  location: "",
  socials: [
    // { label: "Instagram", url: "https://instagram.com/..." },
    // { label: "YouTube", url: "https://youtube.com/@..." },
    // { label: "LinkedIn", url: "https://linkedin.com/in/..." },
    // { label: "X", url: "https://x.com/..." },
    // { label: "Twitch", url: "https://twitch.tv/..." },
  ] as Social[],
  /** Path in /public to a PDF profile. If empty, the printable /profile page is used. */
  profilePdf: "",
};

export type FloorDef = {
  id: Division;
  level: string;
  name: string;
  division: string;
  route: string;
  navLabel: string;
  statement: string;
  description: string;
};

export const floors: FloorDef[] = [
  {
    id: "atrium",
    level: "G",
    name: "The Grand Atrium",
    division: "Home",
    route: "/",
    navLabel: "Home",
    statement: "Every chapter builds the next.",
    description: "The entrance hall of the archive. Every floor starts here.",
  },
  {
    id: "memory",
    level: "01",
    name: "Memory Archive",
    division: "About & Timeline",
    route: "/about",
    navLabel: "About",
    statement: "A career, catalogued as it was built.",
    description:
      "The physical timeline — each chapter of the journey kept as an exhibit, in the order it happened.",
  },
  {
    id: "foundry",
    level: "02",
    name: "The Foundry",
    division: "Ventures",
    route: "/ventures",
    navLabel: "Ventures",
    statement: "Where ideas are cast into ventures.",
    description:
      "Entrepreneurship, startups, products and the communities built around them.",
  },
  {
    id: "arena",
    level: "03",
    name: "The Arena",
    division: "Sports",
    route: "/sports",
    navLabel: "Sports",
    statement: "Where it started: the pitch and the freestyle floor.",
    description: "Sports management and football freestyle.",
  },
  {
    id: "control",
    level: "04",
    name: "Control Room",
    division: "Esports & Creator",
    route: "/esports",
    navLabel: "Esports",
    statement: "Competition, broadcast, creation.",
    description: "Esports as an athlete, gaming and the creator career.",
  },
  {
    id: "sandbox",
    level: "05",
    name: "The Sandbox",
    division: "Tech & Game Dev",
    route: "/tech",
    navLabel: "Tech & Game Dev",
    statement: "Prototypes, experiments, unfinished worlds.",
    description: "Technology exploration and game development.",
  },
  {
    id: "assembly",
    level: "06",
    name: "The Assembly",
    division: "Impact",
    route: "/impact",
    navLabel: "Impact",
    statement: "Leadership, partnerships and the people involved.",
    description:
      "Leadership, partnerships, ambassadorships, speaking and collaborations.",
  },
  {
    id: "exchange",
    level: "07",
    name: "The Exchange",
    division: "Contact",
    route: "/contact",
    navLabel: "Contact",
    statement: "Start a conversation.",
    description: "Professional enquiries, collaboration and networking.",
  },
];

export const floorById = (id: Division) => floors.find((f) => f.id === id)!;

/** The career story, in order. Periods left blank until confirmed. */
export const chapters: Chapter[] = [
  {
    id: "sports-management",
    index: "I",
    title: "Sports management",
    period: "",
    division: "arena",
    body: "The first chapter: working in sports management — learning how teams, events and athletes are organised from the inside.",
  },
  {
    id: "football-freestyle",
    index: "II",
    title: "Football freestyle",
    period: "",
    division: "arena",
    body: "Alongside the management side, hands-on involvement in football freestyle — the skill, the discipline and the culture of performing with a ball.",
  },
  {
    id: "technology-covid",
    index: "III",
    title: "Technology, during COVID",
    period: "",
    division: "sandbox",
    body: "When the world stopped moving, exploration moved online. COVID became the period of discovering technology properly.",
  },
  {
    id: "esports-athlete",
    index: "IV",
    title: "Esports athlete",
    period: "",
    division: "control",
    body: "Technology led to competition: entering esports as an athlete and carrying a sports mindset into a digital arena.",
  },
  {
    id: "gaming-creator",
    index: "V",
    title: "Gaming creator",
    period: "",
    division: "control",
    body: "Competing turned into creating — developing a gaming creator career and an audience around it.",
  },
  {
    id: "communities-ventures",
    index: "VI",
    title: "Communities & ventures",
    period: "",
    division: "foundry",
    body: "An audience became a community, and communities became ventures. Building things for other people became the work itself.",
  },
  {
    id: "game-development",
    index: "VII",
    title: "Game development",
    period: "",
    division: "sandbox",
    body: "The current chapter: moving from playing and presenting games to making them — exploring game development.",
  },
];

/**
 * Archive entries — the searchable project archive, venture cards and floor
 * exhibits. Entries marked awaitingRecord are frames derived from the career
 * story; replace their summary/role/period/link with the real record.
 */
export const entries: Entry[] = [
  {
    id: "ventures-overview",
    title: "Entrepreneurial ventures",
    division: "foundry",
    kind: "Venture",
    summary:
      "The ventures that grew out of community building across sports, gaming and technology.",
    tags: ["entrepreneurship", "startups"],
    awaitingRecord: true,
  },
  {
    id: "communities",
    title: "Community building",
    division: "foundry",
    kind: "Community",
    summary: "Communities built around gaming, esports and sport.",
    tags: ["community", "gaming"],
    awaitingRecord: true,
  },
  {
    id: "products",
    title: "Products & launches",
    division: "foundry",
    kind: "Product",
    summary: "Products and launches from the ventures.",
    tags: ["product"],
    awaitingRecord: true,
  },
  {
    id: "sports-management-work",
    title: "Sports management",
    division: "arena",
    kind: "Sports",
    summary: "Work in sports management — events, teams and athletes.",
    tags: ["sports", "management"],
    awaitingRecord: true,
  },
  {
    id: "freestyle",
    title: "Football freestyle",
    division: "arena",
    kind: "Sports",
    summary: "Involvement in football freestyle — performance, practice and the scene.",
    tags: ["football", "freestyle"],
    awaitingRecord: true,
  },
  {
    id: "esports-competition",
    title: "Esports competition",
    division: "control",
    kind: "Esports",
    summary: "Competing in esports as an athlete.",
    tags: ["esports", "competition"],
    awaitingRecord: true,
  },
  {
    id: "creator-channel",
    title: "Gaming creator career",
    division: "control",
    kind: "Creator",
    summary: "Gaming content and the creator career built around it.",
    tags: ["creator", "gaming", "content"],
    awaitingRecord: true,
  },
  {
    id: "tech-exploration",
    title: "Technology exploration",
    division: "sandbox",
    kind: "Technology",
    summary: "The technology explored since COVID.",
    tags: ["technology"],
    awaitingRecord: true,
  },
  {
    id: "game-prototypes",
    title: "Game development prototypes",
    division: "sandbox",
    kind: "Game Dev",
    summary: "Prototypes and experiments from the game development chapter.",
    tags: ["game development", "prototype"],
    awaitingRecord: true,
  },
  {
    id: "leadership",
    title: "Leadership",
    division: "assembly",
    kind: "Leadership",
    summary: "Leadership roles across communities and ventures.",
    tags: ["leadership"],
    awaitingRecord: true,
  },
  {
    id: "partnerships",
    title: "Partnerships & ambassadorships",
    division: "assembly",
    kind: "Partnership",
    summary: "Brand partnerships, ambassadorships and collaborations.",
    tags: ["partnerships", "collaboration"],
    awaitingRecord: true,
  },
  {
    id: "speaking",
    title: "Speaking engagements",
    division: "assembly",
    kind: "Speaking",
    summary: "Talks, panels and appearances.",
    tags: ["speaking"],
    awaitingRecord: true,
  },
];

/** Achievements — add only verified records. Empty sections show a plate. */
export type Achievement = { title: string; detail: string; period?: string; division: Division };
export const achievements: Achievement[] = [];

/** Galleries per division. Put files in /public/media and reference them here. */
export const galleries: Partial<Record<Division, MediaImage[]>> = {
  arena: [],
  control: [],
  foundry: [],
  sandbox: [],
  assembly: [],
};

export const videos: Partial<Record<Division, MediaVideo[]>> = {
  arena: [],
  control: [],
  sandbox: [],
};

export const entriesFor = (d: Division) => entries.filter((e) => e.division === d);
export const chaptersFor = (d: Division) => chapters.filter((c) => c.division === d);

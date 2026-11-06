"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useProgress } from "@react-three/drei";
import { floorById, floors, profile, type Division } from "@/content/site";
import { ContactForm } from "@/components/site/ContactForm";
import { live, useArchive } from "./store";
import { world } from "./world";

const ease = [0.7, 0, 0.2, 1] as const;
const TUTORIAL_KEY = "living-archive:tutorial-seen";

// Floor travel must always complete in real time, even on slow GPUs.
if (typeof window !== "undefined") gsap.ticker.lagSmoothing(0);

export function HUD() {
  const phase = useArchive((s) => s.phase);
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);

  const inGame = phase !== "intro" && phase !== "tutorial";

  return (
    <>
      {inGame && <TopBar />}
      {inGame && <Minimap touch={touch} />}
      {phase === "playing" && <Prompt touch={touch} />}
      {phase === "playing" && touch && <TouchControls />}
      <AnimatePresence>{phase === "intro" && <Intro key="intro" />}</AnimatePresence>
      <AnimatePresence>{phase === "tutorial" && <Tutorial key="tut" touch={touch} />}</AnimatePresence>
      <AnimatePresence>{phase === "panel" && <ExhibitPanel key="panel" />}</AnimatePresence>
      <AnimatePresence>{phase === "elevator" && <ElevatorPanel key="elev" />}</AnimatePresence>
      <AnimatePresence>{phase === "paused" && <PauseMenu key="pause" touch={touch} />}</AnimatePresence>
      <Shutter />
    </>
  );
}

/* ---------------------------------------------------------------- */

function Intro() {
  const { progress, active } = useProgress();
  const setPhase = useArchive((s) => s.setPhase);
  const floor = useArchive((s) => s.floor);
  // Procedural scene: the only async assets are fonts. Treat "nothing pending" as ready.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 900);
    return () => clearTimeout(t);
  }, []);
  const loaded = settled && !active;
  const start = () => {
    const seen = typeof window !== "undefined" && localStorage.getItem(TUTORIAL_KEY);
    setPhase(seen ? "playing" : "tutorial");
  };
  return (
    <motion.div
      className="absolute inset-0 z-40 grid place-items-center bg-midnight/80 backdrop-blur-sm"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease } }}
    >
      <div className="px-6 text-center">
        <p className="label text-crimson">The Living Archive</p>
        <h1 className="display mt-6 text-7xl md:text-9xl">{profile.name}</h1>
        <p className="display mt-4 text-2xl italic text-platinum/80 md:text-3xl">{profile.tagline}</p>
        <p className="label mt-8 text-concrete">
          {floor === "atrium" ? "Ground floor — The Grand Atrium" : `Arriving at floor ${floorById(floor).level} — ${floorById(floor).name}`}
        </p>
        <div className="mx-auto mt-10 h-px w-64 bg-line">
          <motion.div className="h-px bg-crimson" animate={{ width: `${loaded ? 100 : Math.max(progress, 4)}%` }} />
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={start}
            disabled={!loaded}
            autoFocus
            className="label bg-crimson px-8 py-4 transition-opacity disabled:opacity-40"
          >
            {loaded ? "Enter the building" : `Constructing ${Math.round(progress)}%`}
          </button>
          <Link href="/" className="label border border-platinum/30 px-8 py-4 hover:border-crimson">
            Explore portfolio instead
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Tutorial({ touch }: { touch: boolean }) {
  const setPhase = useArchive((s) => s.setPhase);
  const [step, setStep] = useState(0);
  const steps = touch
    ? [
        ["Move", "Use the joystick in the lower left to walk."],
        ["Look", "Drag anywhere on the scene to turn the camera."],
        ["Interact", "Walk up to an exhibit and tap it — or tap the Interact button."],
        ["Travel", "The elevator in the south wall of every floor takes you anywhere. The ☰ menu also lists every floor."],
      ]
    : [
        ["Move", "W A S D or the arrow keys. Hold Shift to move faster."],
        ["Look", "Click and drag to turn the camera. Scroll to zoom."],
        ["Interact", "Approach an exhibit and press E — or simply click it."],
        ["Travel", "The elevator behind you serves all floors. Esc opens the menu, the map and direct navigation."],
      ];
  const finish = () => {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setPhase("playing");
  };
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-40 flex justify-center p-4 md:bottom-10"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.7, ease } }}
      exit={{ y: 40, opacity: 0, transition: { duration: 0.4 } }}
    >
      <div className="w-full max-w-lg border border-line bg-midnight/90 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p className="label text-crimson">
            Orientation {step + 1} / {steps.length}
          </p>
          <button type="button" onClick={finish} className="label text-concrete hover:text-platinum">
            Skip
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <p className="display mt-4 text-5xl">{steps[step][0]}</p>
            <p className="mt-3 text-platinum/75">{steps[step][1]}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex items-center gap-2">
          {steps.map((_, i) => (
            <span key={i} className={`h-px flex-1 ${i <= step ? "bg-crimson" : "bg-line"}`} />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={() => (step < steps.length - 1 ? setStep(step + 1) : finish())}
            className="label bg-crimson px-6 py-3"
          >
            {step < steps.length - 1 ? "Next" : "Begin"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */

function TopBar() {
  const floor = floorById(useArchive((s) => s.floor));
  const setPhase = useArchive((s) => s.setPhase);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-4 md:p-6">
      <div className="pointer-events-auto">
        <p className="label text-crimson">Floor {floor.level}</p>
        <p className="display text-3xl md:text-4xl">{floor.name}</p>
        <p className="label mt-1 text-concrete">{floor.division}</p>
      </div>
      <div className="pointer-events-auto flex gap-2">
        <Link href={floor.route} className="label hidden border border-platinum/25 bg-midnight/60 px-4 py-2 backdrop-blur hover:border-crimson sm:inline-block">
          Read as page
        </Link>
        <button
          type="button"
          onClick={() => setPhase("paused")}
          className="label border border-platinum/25 bg-midnight/60 px-4 py-2 backdrop-blur hover:border-crimson"
          aria-label="Open menu"
        >
          ☰ <span className="hidden md:inline">Menu · Esc</span>
        </button>
      </div>
    </div>
  );
}

function Prompt({ touch }: { touch: boolean }) {
  const nearby = useArchive((s) => s.nearby);
  const floor = useArchive((s) => s.floor);
  const ex = nearby && nearby !== "elevator" ? world[floor].exhibits.find((e) => e.id === nearby) : null;
  const label = nearby === "elevator" ? "Call the elevator" : ex ? ex.title : null;
  return (
    <AnimatePresence>
      {label && (
        <motion.button
          type="button"
          key={label}
          onClick={() => (live.interact = true)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className={`absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 border border-platinum/25 bg-midnight/80 px-5 py-3 backdrop-blur ${touch ? "bottom-40" : "bottom-10"}`}
        >
          <span className="grid h-7 w-7 place-items-center bg-crimson font-mono text-xs">{touch ? "↵" : "E"}</span>
          <span className="label text-platinum">{label}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------- */

function Minimap({ touch }: { touch: boolean }) {
  const floorId = useArchive((s) => s.floor);
  const nearby = useArchive((s) => s.nearby);
  const [hidden, setHidden] = useState(false);
  const fw = world[floorId];
  const arrow = useRef<SVGGElement>(null);
  const S = 150;
  const scale = S / Math.max(fw.w, fw.d);
  const mw = fw.w * scale;
  const mh = fw.d * scale;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = live.player;
      if (arrow.current) {
        const x = (p.x + fw.w / 2) * scale;
        const y = (p.z + fw.d / 2) * scale;
        arrow.current.setAttribute("transform", `translate(${x} ${y}) rotate(${(-p.heading * 180) / Math.PI})`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fw, scale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.code === "KeyM" && setHidden((h) => !h);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={`pointer-events-none absolute z-30 ${touch ? "top-24 right-4" : "bottom-6 left-6"}`}>
      {!hidden && (
        <div className="border border-line bg-midnight/70 p-3 backdrop-blur">
          <svg width={mw} height={mh} viewBox={`0 0 ${mw} ${mh}`} className={touch ? "w-28 h-auto" : ""} aria-label="Mini-map">
            <rect x={0.5} y={0.5} width={mw - 1} height={mh - 1} fill="none" stroke="#777D87" strokeWidth={1} />
            {/* elevator */}
            <rect x={mw / 2 - 6} y={mh - 4} width={12} height={4} fill={nearby === "elevator" ? "#D7263D" : "#E5E7EB"} />
            {fw.exhibits.map((ex) => (
              <circle
                key={ex.id}
                cx={(ex.pos[0] + fw.w / 2) * scale}
                cy={(ex.pos[1] + fw.d / 2) * scale}
                r={Math.max(2.5, ex.r * scale * 0.7)}
                fill={nearby === ex.id ? "#D7263D" : "none"}
                stroke={nearby === ex.id ? "#D7263D" : "#E5E7EB"}
                strokeWidth={1}
              />
            ))}
            <g ref={arrow}>
              <path d="M0 -6 L4.5 5 L0 2.5 L-4.5 5 Z" fill="#D7263D" />
            </g>
          </svg>
          {!touch && <p className="label mt-2 text-[9px] text-concrete">Map · M to hide</p>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function TouchControls() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pid = useRef<number | null>(null);
  const R = 48;

  const update = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy);
    if (l > R) {
      dx = (dx / l) * R;
      dy = (dy / l) * R;
    }
    setKnob({ x: dx, y: dy });
    live.joystick.x = dx / R;
    live.joystick.y = -dy / R;
  };
  const end = () => {
    pid.current = null;
    setKnob({ x: 0, y: 0 });
    live.joystick.x = live.joystick.y = 0;
  };

  return (
    <>
      <div
        ref={base}
        className="absolute bottom-8 left-8 z-30 h-32 w-32 touch-none rounded-full border border-platinum/25 bg-midnight/50 backdrop-blur"
        onPointerDown={(e) => {
          e.stopPropagation();
          pid.current = e.pointerId;
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => pid.current === e.pointerId && update(e)}
        onPointerUp={end}
        onPointerCancel={end}
        aria-label="Movement joystick"
        role="application"
      >
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-12 w-12 rounded-full bg-platinum/80"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <button
        type="button"
        onClick={() => (live.interact = true)}
        className="label absolute right-8 bottom-12 z-30 grid h-20 w-20 place-items-center rounded-full border border-platinum/25 bg-crimson/90"
      >
        Interact
      </button>
    </>
  );
}

/* ---------------------------------------------------------------- */

function Sheet({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  return (
    <motion.div className="absolute inset-0 z-40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-midnight/40" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-label={label}
        initial={{ x: "100%" }}
        animate={{ x: 0, transition: { duration: 0.6, ease } }}
        exit={{ x: "100%", transition: { duration: 0.4, ease } }}
        className="relative h-full w-full max-w-xl overflow-y-auto border-l border-line bg-midnight/95 p-8 backdrop-blur-xl md:p-12"
      >
        <button type="button" onClick={onClose} className="label absolute top-6 right-6 text-concrete hover:text-platinum" autoFocus>
          Close · Esc
        </button>
        {children}
      </motion.aside>
    </motion.div>
  );
}

function ExhibitPanel() {
  const id = useArchive((s) => s.panel);
  const floor = useArchive((s) => s.floor);
  const close = useArchive((s) => s.closeOverlay);
  const ex = world[floor].exhibits.find((e) => e.id === id);
  if (!ex) return null;
  return (
    <Sheet onClose={close} label={ex.title}>
      <p className="label mt-8 text-crimson">{ex.eyebrow}</p>
      <h2 className="display mt-4 text-6xl">{ex.title}</h2>
      {ex.action === "contact" ? (
        <div className="mt-8">
          <p className="mb-8 text-platinum/75">{ex.body}</p>
          <ContactForm compact />
        </div>
      ) : (
        <>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-platinum/80">{ex.body}</p>
          {ex.awaiting && (
            <p className="mt-6 border border-dashed border-concrete/40 p-4 text-sm text-concrete">
              <span className="label mr-2 text-platinum/70">Awaiting record</span>
              Names, dates, results and media for this exhibit will appear once they are added to the archive.
            </p>
          )}
        </>
      )}
      {ex.route && (
        <Link href={ex.route} className="label mt-10 inline-block border border-platinum/30 px-5 py-3 hover:border-crimson hover:bg-crimson">
          Open full page →
        </Link>
      )}
    </Sheet>
  );
}

/* ---------------------------------------------------------------- */

/** Floor travel with a GSAP-driven architectural shutter. */
function travel(to: Division) {
  const st = useArchive.getState();
  if (to === st.floor) {
    st.closeOverlay();
    return;
  }
  st.setPhase("transition");
  const from = floors.findIndex((f) => f.id === st.floor);
  const target = floors.findIndex((f) => f.id === to);
  const counter = { v: from };
  const num = document.getElementById("shutter-level");
  const name = document.getElementById("shutter-name");
  if (name) name.textContent = floorById(to).name;
  const tl = gsap.timeline();
  tl.to(".shutter-blade", { scaleY: 1, duration: 0.55, ease: "power3.inOut", stagger: 0.05, transformOrigin: "top" })
    .to("#shutter-info", { opacity: 1, duration: 0.25 }, "-=0.2")
    .to(counter, {
      v: target,
      duration: 0.5 + Math.abs(target - from) * 0.12,
      ease: "power2.inOut",
      onUpdate: () => {
        if (num) num.textContent = floors[Math.round(counter.v)].level;
      },
      onComplete: () => {
        useArchive.getState().setFloor(to);
        live.respawn = true;
      },
    })
    .to({}, { duration: 0.35 })
    .to("#shutter-info", { opacity: 0, duration: 0.2 })
    .to(".shutter-blade", {
      scaleY: 0,
      duration: 0.6,
      ease: "power3.inOut",
      stagger: 0.05,
      transformOrigin: "bottom",
      onComplete: () => useArchive.getState().setPhase("playing"),
    });
}

function Shutter() {
  return (
    <div className="pointer-events-none absolute inset-0 z-50" aria-hidden>
      <div className="absolute inset-0 flex">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="shutter-blade h-full flex-1 border-r border-line bg-graphite" style={{ transform: "scaleY(0)" }} />
        ))}
      </div>
      <div id="shutter-info" className="absolute inset-0 grid place-items-center opacity-0">
        <div className="text-center">
          <p className="label text-crimson">Elevator in motion</p>
          <p id="shutter-level" className="display mt-4 text-[28vw] leading-none md:text-[16vw]">G</p>
          <p id="shutter-name" className="label mt-2 text-platinum/80" />
        </div>
      </div>
    </div>
  );
}

function FloorList({ onPick }: { onPick: (d: Division) => void }) {
  const current = useArchive((s) => s.floor);
  return (
    <ul className="mt-8 divide-y divide-line border-y border-line">
      {[...floors].reverse().map((f) => (
        <li key={f.id}>
          <button
            type="button"
            onClick={() => onPick(f.id)}
            className={`group flex w-full items-baseline gap-5 py-4 text-left ${current === f.id ? "text-crimson" : ""}`}
          >
            <span className="label w-8 text-concrete group-hover:text-crimson">{f.level}</span>
            <span className="display text-3xl group-hover:translate-x-1 transition-transform">{f.name}</span>
            <span className="label ml-auto text-concrete">{current === f.id ? "You are here" : f.division}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ElevatorPanel() {
  const close = useArchive((s) => s.closeOverlay);
  return (
    <Sheet onClose={close} label="Elevator">
      <p className="label mt-8 text-crimson">Elevator</p>
      <h2 className="display mt-4 text-6xl">Select a floor</h2>
      <FloorList onPick={travel} />
    </Sheet>
  );
}

function PauseMenu({ touch }: { touch: boolean }) {
  const setPhase = useArchive((s) => s.setPhase);
  const quality = useArchive((s) => s.quality);
  const setQuality = useArchive((s) => s.setQuality);
  const [tab, setTab] = useState<"floors" | "controls">("floors");
  return (
    <motion.div
      className="absolute inset-0 z-40 overflow-y-auto bg-midnight/85 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-label="Paused — navigation menu"
    >
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="label text-crimson">Paused</p>
          <h2 className="display mt-4 text-7xl">The Living Archive</h2>
          <div className="mt-10 flex flex-col items-start gap-3">
            <button type="button" autoFocus onClick={() => setPhase("playing")} className="label bg-crimson px-6 py-3">
              Resume {touch ? "" : "· Esc"}
            </button>
            <button type="button" onClick={() => setTab("floors")} className={`label px-1 py-2 ${tab === "floors" ? "text-platinum" : "text-concrete"}`}>
              Floors & direct navigation
            </button>
            <button type="button" onClick={() => setTab("controls")} className={`label px-1 py-2 ${tab === "controls" ? "text-platinum" : "text-concrete"}`}>
              Controls & settings
            </button>
            <Link href="/" className="label px-1 py-2 text-concrete hover:text-platinum">
              Exit to portfolio
            </Link>
          </div>
        </div>
        <div>
          {tab === "floors" ? (
            <>
              <p className="label text-concrete">Travel directly</p>
              <FloorList onPick={(d) => travel(d)} />
              <p className="label mt-6 text-concrete">Or read a floor as a page:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {floors.map((f) => (
                  <Link key={f.id} href={f.route} className="label border border-line px-3 py-2 text-platinum/80 hover:border-crimson">
                    {f.navLabel}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
                {(touch
                  ? [
                      ["Joystick", "Move"],
                      ["Drag scene", "Look around"],
                      ["Tap object / Interact", "Open exhibit"],
                      ["☰", "This menu"],
                    ]
                  : [
                      ["W A S D / Arrows", "Move"],
                      ["Shift", "Move faster"],
                      ["Drag mouse", "Look around"],
                      ["Scroll", "Zoom"],
                      ["E / Enter / Click", "Interact"],
                      ["M", "Toggle map"],
                      ["Esc / P", "Pause & menu"],
                    ]
                ).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="label text-platinum">{k}</dt>
                    <dd className="text-platinum/70">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10">
                <p className="label text-concrete">Rendering quality</p>
                <div className="mt-3 flex gap-2">
                  {(["high", "low"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      aria-pressed={quality === q}
                      className={`label border px-4 py-2 ${quality === q ? "border-crimson bg-crimson" : "border-line text-concrete"}`}
                    >
                      {q === "high" ? "Cinematic" : "Performance"}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(TUTORIAL_KEY);
                  setPhase("tutorial");
                }}
                className="label mt-8 text-concrete underline hover:text-platinum"
              >
                Replay orientation
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

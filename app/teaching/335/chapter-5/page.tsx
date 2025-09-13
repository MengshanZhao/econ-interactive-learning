"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Bank Boss RPG — Chapter 5 (Amber/Cream theme)
 * - Borrowers ask YOU for a principal today; pick the one with the HIGHEST TOTAL PAY-BACK RATIO.
 * - ~100-word, plain/cute stories; all $ amounts.
 * - Inflation < 10%; effective returns ≤ 15%; no zeros.
 * - Typewriter with gentle key-click (SOUND ON by default).
 * - Dialogue flow: after YOU ask, only "Next →" appears.
 * - Large SQUARE headshot + ornate amber frame (square corners).
 * - Fonts: description/cards use old serif; dialogue uses VT323 (body) + MedievalSharp (name).
 * - “That’s all my questions” closes the dialogue.
 * - Reveal is blocked until you’ve talked to ALL borrowers at least once.
 */

// =========================
// Plain-language stories + soft sounds
// Randomized each time the game opens.
// (No APR/EAR anywhere; no calculations shown.)
// =========================

// ---------- Small helpers ----------
function money(n: number) { return `$${Math.round(n).toLocaleString()}`; }
function rnd(min: number, max: number, dp = 0) {
  const v = Math.random() * (max - min) + min;
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}
const choice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const pct = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;

function toEAR(opts: { kind: "APR" | "EAR" | "LUMP"; rate?: number; m?: number; years?: number; lump?: number }) {
  if (opts.kind === "EAR") return opts.rate || 0;
  if (opts.kind === "APR") { const m = Math.max(1, opts.m || 1); return (1 + (opts.rate || 0) / m) ** m - 1; }
  if (opts.kind === "LUMP") { const y = Math.max(1, opts.years || 1); return (opts.lump || 1) ** (1 / y) - 1; }
  return 0;
}
const real = (i: number, pi: number) => (1 + i) / (1 + pi) - 1;

// Level-payment loan helpers for 2-year terms
function pmtFromPV(apr: number, m: number, years: number, pv: number) {
  const i = apr / m; // per-period rate
  const n = m * years; // total periods
  const denom = 1 - Math.pow(1 + i, -n);
  if (denom === 0 || i === 0) return pv / n; // fallback for zero rate
  return pv * i / denom;
}
function periodLabel(m: number) {
  if (m === 12) return "month";
  if (m === 4) return "quarter";
  if (m === 2) return "half‑year";
  return "year";
}

// ---------- Assets ----------
const ANIMAL_IMAGES = [
  { name: "Dog", image: "/images/dog.png" },
  { name: "Fox", image: "/images/fox.png" },
  { name: "Leopard", image: "/images/leopard.png" },
  { name: "Sheep", image: "/images/sheep.png" }
];

const PLAYER_IMAGES = [
  { name: "Wizard", image: "/images/wizard.png" },
  { name: "Lizard", image: "/images/lizard.png" },
  { name: "Dwarf", image: "/images/dwarf.png" },
  { name: "Pirate", image: "/images/pirate.png" }
];

// ---------- ~100-word, plain/cute borrower stories (no APR/EAR, no math shown) ----------
function storyBakery(name: string, tYears: number, P: number) {
  return `${name}: I'm fixing up a tiny bakery near the old square. The room smells like warm butter even before sunrise. With ${money(P)}, I'll repair the oven, paint the shelves cream, and hang a hand-lettered sign. Mornings, I'll bake simple loaves and cinnamon knots; afternoons, I'll box leftovers for neighbors. I keep a small notebook with dates, sales, and a list of repairs. I'll send you a short note each month so you know how it's going. I can repay a little at a time, steady and polite, for ${tYears} years. If you ever visit, your bread is on the house.`;
}

function storyTea(name: string, tYears: number, P: number) {
  return `${name}: I want to open a cozy tea corner by the river path. The plan is simple: woven mats, low stools, a shelf of jars that click when opened. With ${money(P)}, I'll buy kettles, cups, and a small sign shaped like a teapot. Travelers stop, breathe, and talk; I listen and keep careful notes. I'll repay you gently over ${tYears} years, the same way steam rises—quiet and regular. On market days I'll add sweet buns and lemon slices. If storms come, I'll close early and wipe everything dry. You'll always know how we're doing, because I'll write you every month.`;
}

function storyFerry(name: string, tYears: number, P: number) {
  return `${name}: I'm outfitting a sturdy little ferry for the lake. When the road gets muddy, boats keep life moving. With ${money(P)}, I'll patch the planks, oil the lines, and paint the hull a cheerful blue. My cousin knows the weather; I trust his nose for wind. We'll carry grain in the morning and folks at dusk. I track trips with pencil marks on a board—nothing fancy, always honest. I'll repay you bit by bit over ${tYears} years. If the waves grow bossy, we wait, then try again. You'll get updates that read like the lake: clear, calm, and steady.`;
}

function storyVines(name: string, tYears: number, P: number) {
  return `${name}: The vines outside the walls had a kind spring—lots of shy little grapes. With ${money(P)}, I'll buy a hand press, a few barrels, and a mule with good manners. The work is slow and kind: wash, press, wait, taste, label. I keep my ledger clean and my cellar cooler than a secret. I'll repay you on a simple rhythm for ${tYears} years: small payments, on time, no surprises. If a barrel misbehaves, I'll fix it before I brag. You'll get short letters with smudges of purple and news about harvest days. When the corks pop, you're invited first.`;
}

function storySchool(name: string, tYears: number, P: number) {
  return `${name}: I'm renting a sunny room to run an after-school class. With ${money(P)}, I'll buy chalk, slates, storybooks, and a sturdy clock that actually ticks. We'll practice sums, read short adventures, and celebrate tiny wins with stickers. I keep attendance on a board and tuck the coins into a tin with a polite rattle. I'll repay you slowly and surely across ${tYears} years. Each month you'll get a friendly note—what we learned, which shelf wobbled, and when I fixed it. The goal is simple: keep the lights warm, the pencils sharp, and the promises even sharper.`;
}

function storyWorkshop(name: string, tYears: number, P: number) {
  return `${name}: I'm opening a little fix-it workshop where fussy things become patient again. Hinges that squeak, lamps that blink, scales that lie—bring them in. With ${money(P)}, I'll stock screws, wires, glue that smells like school, and a pegboard that makes me look organized. I write neat tickets and return parts I don't use. I'll repay you in steady, regular pieces for ${tYears} years. On slow days, I sweep; on busy days, I whistle. If a job takes two tries, I own it and finish it right. You'll get monthly updates, short and clear, with a smudge of honest grease.`;
}

function storyMill(name: string, tYears: number, P: number) {
  return `${name}: The mill by the falls can hum again if I shore up the beams and calm the gears. With ${money(P)}, I'll buy belts, wedges, and paint the color of fresh oats. Farmers like early starts; I'll meet them with a thermos and a smile. The work is loud but friendly; the ledger is quiet and square. I'll repay you over ${tYears} years, same amount each time, the way wheels turn—round and reliable. When the river runs high, we pause and sip tea; when it settles, we grind and grin. I'll send you simple notes that smell faintly of flour.`;
}

function storyBookshop(name: string, tYears: number, P: number) {
  return `${name}: I'm starting a tiny bookshop with a bell that rings like a giggle. With ${money(P)}, I'll buy shelves, a plant that forgives me, and stories that fit into pockets. Kids will trade jokes for bookmarks; grownups will trade quiet for a chair. I stamp dates with confident thumps and keep a jar for lost buttons. I'll repay you evenly for ${tYears} years—nothing tricky, just tidy envelopes. If a rainy day slows us, I'll host read-alouds and cocoa. You'll get monthly postcards with doodles in the margins and a line about what made someone smile that week.`;
}

function storyLump(name: string, tYears: number, P: number, k: number) {
  const repay = Math.round(P * k);
  return `${name}: I like simple promises. I borrow ${money(P)} from you today and in ${tYears} years I repay ${money(repay)} in one clean payment. No coupons or fiddly bits between. If you want the compounding math, we can write it down, but the headline is clear: you get back ${money(repay)} at maturity. Simple to remember, simple to check.`;
}

const OPENERS_PLAIN = [
  storyBakery,
  storyTea,
  storyFerry,
  storyVines,
  storySchool,
  storyWorkshop,
  storyMill,
  storyBookshop,
];

// =========================
// Cute Animal Kingdom Inflation Lines
// =========================
const pct1 = (x: number) => `${x.toFixed(1)}%`;

function randomInflationNumber() {
  const v = rnd(-1, 5);
  return Math.round(v * 10) / 10; // one decimal
}

/** Six themed inflation stories (2–4 sentences). */
function makeInflationLine(name: string) {
  const pi = randomInflationNumber();
  const pistr = pct1(pi);

  const variants: ((n: string) => string)[] = [
    // 1. Recession / low inflation
    (n) => `${n}: The new iron factory upstream pours smoke, the river fish drift belly-up, and markets look sad. Shops whisper of a slowdown, so inflation drifts low, around ${pistr}. I budget tight and keep your coins safe in a dry jar.`,

    // 2. Calm / small rise
    (n) => `${n}: Squirrels store extra nuts, owls hoot about steady harvests. Prices nibble upward just a bit, near ${pistr}. It feels calm; I save a handful of grain so your payments stay smooth.`,

    // 3. Middle / playful
    (n) => `${n}: Foxes opened a sweet stand and everyone queues for candy. Treats make coins jingle faster, so inflation prances around ${pistr}. I keep my purse knotted; your envelopes arrive tidy and on time.`,

    // 4. High / stormy
    (n) => `${n}: Storms drowned the carrot fields and rabbits must buy turnips instead. Food feels dearer, roughly ${pistr}. I stretch recipes and cut frills before I ever touch your repayment.`,

    // 5. Supply hiccups / mixed
    (n) => `${n}: The beavers' dam broke, barges stalled, and grain sacks sulked on the shore. Prices wander upward, about ${pistr}. I keep extra flour tucked away so your payback doesn't wander too.`,

    // 6. Negative / cheerful dip
    (n) => `${n}: A bumper berry crop makes baskets overflow. Stalls lower their chalk marks, even dipping to ${pistr}. I refill the pantry while it's cheap and keep your payments cheerful and exact.`,
  ];

  const pick = variants[Math.floor(Math.random() * variants.length)];
  return { text: pick(name), pi };
}

// ---------- Random story factory (call this on each game load) ----------
function makeRandomPlainStory(name: string) {
  const tYears = 2; // all loans last 2 years in this chapter
  // fresh principal each time you open the game
  const principal = Math.round(rnd(50_000, 250_000) / 1000) * 1000; // rounded to $1,000
  const opener = choice(OPENERS_PLAIN);
  const story = opener(name, tYears, principal);
  const inflationData = makeInflationLine(name);
  return { story, principal, termYears: tYears, flavor: inflationData.text, inflationRate: inflationData.pi }; // use flavor after a "What's the price scene like?" question
}

// ---------- Types ----------
interface Lender {
  id: string;
  label: string;
  image: string;
  term: number;             // years 1–30
  kind: "APR" | "EAR" | "LUMP";
  rate?: number;
  m?: number;
  lump?: number;            // payoff multiple at maturity (for LUMP)
  principal: number;        // BORROWED from you today
  infl: number;             // inflation expectation
  open: string;             // ~100 words
  inflStory: string;
}
interface Round { lenders: Lender[]; }

// ---------- Random offer generator with sensible caps ----------
function makeLender(i: number): Lender {
  const animalData = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
  const label = `${animalData.name}`;
  const term = 2; // All offers are 2-year loans

  // Borrow amounts in sensible round dollars
  const principal = Math.round(rnd(50_000, 250_000, 0) / 1000) * 1000;

  // Offer type: only APR or LUMP (no direct EAR quotes)
  let kind: "APR" | "EAR" | "LUMP" = Math.random() < 0.6 ? "APR" : "LUMP";

  let rate: number | undefined;
  let m: number | undefined;
  let lump: number | undefined;

  if (kind === "APR") {
    m = [1, 2, 4, 12][Math.floor(Math.random() * 4)];
    for (let tries = 0; tries < 8; tries++) {
      const apr = rnd(0.03, 0.14, 4);          // 3%–14% APR
      const ear = (1 + apr / m) ** m - 1;
      if (ear <= 0.15) { rate = apr; break; }
    }
    if (rate == null) rate = 0.12;
  } else { // LUMP: choose k so implied EAR ≤ 15% (and ≥ ~3%), k > 1
    const maxK = (1 + 0.15) ** term;
    const minK = (1 + 0.03) ** term;
    const k = rnd(Math.min(minK, maxK * 0.9), maxK, 3);
    lump = Math.max(1.05, Math.min(k, maxK));
  }

  const ear = toEAR({ kind, rate, m, years: term, lump });
  const rStr = pct(Math.min(ear, 0.15), 1);

  // Use plain stories for both APR and LUMP offers
  let open: string;
  let inflStory: string;
  let infl: number;
  
  if (kind === "LUMP") {
    open = storyLump(label, term, principal, lump!);
    const inflData = makeInflationLine(label);
    inflStory = inflData.text;
    infl = inflData.pi / 100; // convert percentage to decimal
  } else {
    const storyData = makeRandomPlainStory(label);
    open = storyData.story;
    // Override the random principal with our calculated one for consistency
    principal = storyData.principal;
    inflStory = storyData.flavor;
    infl = storyData.inflationRate / 100; // convert percentage to decimal
  }

  return { id: `L${i}_${Math.random().toString(36).slice(2,8)}`, label, image: animalData.image, term, kind, rate, m, lump, principal, infl, open, inflStory };
}

function makeRound(): Round { return { lenders: Array.from({ length: 4 }, (_, i) => makeLender(i)) }; }

// =========================
// SOUNDS — gesture-unlocked Web Audio (works on Chrome/Safari/Firefox)
// =========================

type Ctx = AudioContext | (AudioContext & { resume?: () => Promise<void> });

function makeCtx(): Ctx | null {
  if (typeof window === "undefined") return null;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  return AC ? new AC() : null;
}

/** Hook that returns UI sounds + a blip for the typewriter.
 *  IMPORTANT: call `enable()` once from a user action (e.g., Start button)
 *  or let the built-in unlock listeners do it automatically on first interaction.
 */
function useAudio(enabled: boolean = true) {
  const ctxRef = useRef<Ctx | null>(null);
  const [ready, setReady] = useState(false);

  // Create context lazily
  useEffect(() => {
    if (!enabled) return;
    if (!ctxRef.current) ctxRef.current = makeCtx();
  }, [enabled]);

  // One-time unlock on first user gesture
  useEffect(() => {
    if (!enabled) return;
    const tryUnlock = async () => {
      if (!ctxRef.current) ctxRef.current = makeCtx();
      const ctx = ctxRef.current;
      if (!ctx) return;
      // Resume if suspended (autoplay policy)
      // @ts-ignore
      if (ctx.state === "suspended" && ctx.resume) await ctx.resume();
      setReady(ctx.state === "running");
      if (ctx.state === "running") {
        window.removeEventListener("pointerdown", tryUnlock as any);
        window.removeEventListener("keydown", tryUnlock as any);
        window.removeEventListener("touchstart", tryUnlock as any);
      }
    };
    window.addEventListener("pointerdown", tryUnlock as any, { once: true, passive: true });
    window.addEventListener("keydown", tryUnlock as any, { once: true, passive: true });
    window.addEventListener("touchstart", tryUnlock as any, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", tryUnlock as any);
      window.removeEventListener("keydown", tryUnlock as any);
      window.removeEventListener("touchstart", tryUnlock as any);
    };
  }, [enabled]);

  /** Manually enable from a button, e.g. onClick={() => enable()} */
  const enable = async () => {
    if (!enabled) return;
    if (!ctxRef.current) ctxRef.current = makeCtx();
    const ctx = ctxRef.current;
    if (!ctx) return;
    // @ts-ignore
    if (ctx.state === "suspended" && ctx.resume) await ctx.resume();
    setReady(ctx.state === "running");
  };

  // Core tone
  function tone(freq: number, dur = 0.12, type: OscillatorType = "sine", gainPeak = 0.04) {
    if (!enabled) return;
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
    o.onended = () => { o.disconnect(); g.disconnect(); };
  }

  // Soft typewriter blip (noise through bandpass)
  const blip = () => {
    if (!enabled) return;
    const ctx = ctxRef.current;
    if (!ctx || ctx.state !== "running") return;
    const noise = ctx.createBuffer(1, 256, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.22;
    const src = ctx.createBufferSource(); src.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1600; bp.Q.value = 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.003, ctx.currentTime + 0.06);
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + 0.08);
    src.onended = () => { src.disconnect(); bp.disconnect(); g.disconnect(); };
  };

  const click  = () => tone(380, 0.08, "triangle", 0.03);
  const select = () => tone(520, 0.10, "triangle", 0.035);
  const reveal = () => { tone(420, 0.10, "sine", 0.03); setTimeout(()=>tone(640, 0.12, "sine", 0.03), 90); };
  const success = () => { tone(540, 0.10, "triangle", 0.035); setTimeout(()=>tone(760, 0.12, "triangle", 0.035), 100); };
  const thud   = () => tone(120, 0.12, "sawtooth", 0.025);

  return { ready, enable, blip, click, select, reveal, success, thud };
}

/** Example: Typewriter that uses the blip */
function Typewriter({ text, speed = 18, blip }: { text: string; speed?: number; blip?: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [text]);
  useEffect(() => {
    if (i >= text.length) return;
    const id = setTimeout(() => { setI(i + 1); if (blip && (i % 3 === 0)) blip(); }, speed);
    return () => clearTimeout(id);
  }, [i, text, speed, blip]);
  return <span>{text.slice(0, i)}</span>;
}

// ---------- Start Screen ----------
function StartScreen({ onStart, onCharacterSelect, selectedCharacter }: {
  onStart: () => void;
  onCharacterSelect: (character: string) => void;
  selectedCharacter: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF4DF]">
      <div className="mx-auto max-w-4xl p-2">
        <div className="pixel-frame-amber p-6 bg-[#FFF8EA]">
          <div className="text-center">
            <div className="mb-6 pixel-frame-amber bg-[#FFECC8] text-left p-4">
              <p className="mb-3 text-lg leading-relaxed text-amber-900">
                Welcome, banker! Meet <strong className="font-black">4 animal borrowers</strong>. Each asks to borrow a principal now and promises how they’ll pay you back in <strong>2 years</strong>.
              </p>
              <p className="text-base leading-relaxed text-amber-900">
                • Offers are either <strong>APR</strong> (ask about compounding) or a <strong>one-time lump sum</strong><br/>
                • Ask about inflation if you want to think in real terms<br/>
                • Choose the borrower with the <strong>highest effective annual rate (EPR)</strong>
              </p>
            </div>

            <div className="mb-5">
              <h3 className="mb-2 text-xl text-amber-900 font-ms">Choose Your Character</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {PLAYER_IMAGES.map((char) => (
                  <button
                    key={char.name}
                    onClick={() => onCharacterSelect(char.name)}
                    className={`rounded-[2px] p-2 transition-transform ${selectedCharacter === char.name ? "ring-2 ring-amber-600" : ""} hover:scale-105`}
                  >
                    <Image src={char.image} alt={char.name} width={140} height={140} className="mx-auto rounded-[2px] drop-shadow-xl" />
                    <div className="mt-2 text-sm font-ms text-amber-900">{char.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                console.log('Start button clicked');
                onStart();
              }}
              disabled={!selectedCharacter}
              className="rounded-[2px] bg-amber-600 px-6 py-3 text-xl font-ms text-white shadow-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Your Banking Adventure!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export default function BankBossChapter5() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [seed, setSeed] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [log, setLog] = useState<Array<{ who: string; text: string }>>([]);
  const [soundOn, setSoundOn] = useState(true); // SOUND DEFAULT ON
  const [talkedIds, setTalkedIds] = useState<Set<string>>(new Set()); // track conversations
  const [alertMsg, setAlertMsg] = useState<string | null>(null);      // simple modal
  const YOU = `${selectedCharacter || "You"}`;
  
  const audio = useAudio(soundOn);

  const round = useMemo(() => {
    const prev = Math.random; let s = seed + 1;
    // @ts-ignore
    Math.random = () => { const x = Math.sin(s++) * 10000; return x - Math.floor(x); };
    const r = makeRound(); Math.random = prev; return r;
  }, [seed]);

  const selected = round.lenders.find((x) => x.id === selectedId) || null;

  useEffect(() => {
    if (selected) setLog([{ who: selected.label, text: selected.open }]);
  }, [selectedId]);

  const outcomes = round.lenders.map((L) => {
    const ear = toEAR({ kind: L.kind, rate: L.rate, m: L.m, years: L.term, lump: L.lump });
    const rReal = real(ear, L.infl);
    let repay: number;
    if (L.kind === "LUMP") {
      repay = L.principal * (L.lump || 1);
    } else {
      // APR with level payments: total of all payments over the term
      const pmt = pmtFromPV(L.rate || 0, L.m || 1, L.term, L.principal);
      const n = (L.m || 1) * L.term;
      repay = pmt * n;
    }
    const paybackRatio = repay / L.principal;
    return { L, ear, rReal, repay, paybackRatio };
  });
  const best = [...outcomes].sort((a, b) => b.paybackRatio - a.paybackRatio)[0];

  function reset() {
    setSelectedId(null); setAcceptedId(null); setRevealed(false); setLog([]);
    setTalkedIds(new Set()); setSeed((x) => x + 1);
  }

  if (!gameStarted) {
    return (
      <StartScreen
        onStart={async () => { 
          console.log('Enabling audio...');
          await audio.enable(); 
          console.log('Audio ready:', audio.ready);
          audio.click(); 
          setGameStarted(true); 
        }}
        onCharacterSelect={setSelectedCharacter}
        selectedCharacter={selectedCharacter}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen text-slate-800 font-serif"
      style={{
        backgroundImage: "url('/images/bank.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl p-6 pb-72">
        {/* Description uses old serif font */}
        <div className="pixel-frame-amber bg-[#FFF8EA] p-3">
          <p className="mt-1 max-w-4xl text-[19px] text-amber-900">
            Chat with <span className="font-ms font-bold">each borrower</span>. All loans are for <strong>2 years</strong> and are either <strong>APR quotes</strong> (you ask about compounding) or a <strong>one-time lump sum</strong> at maturity.
            Compare and pick the friend with the <span className="font-ms font-bold">highest effective annual rate (EPR)</span>.
          </p>
        </div>

        {/* Cards (old serif font) */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {round.lenders.map((L) => {
            const name = L.label;
            const locked = !!acceptedId && acceptedId !== L.id;
            return (
              <div key={L.id} className={`relative pixel-frame-amber bg-[#FFF8EA] p-3 transition ${selectedId === L.id ? "ring-4 ring-amber-300" : "hover:shadow-xl"} ${locked ? "opacity-40" : ""}`}>
                {/* Deselect X button */}
                {acceptedId === L.id && (
                  <button
                    onClick={() => setAcceptedId(null)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                    title="Deselect this borrower"
                  >
                    ×
                  </button>
                )}
                <div className="flex items-start gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-[2px] bg-[#FFF4DF] shadow-inner">
                    <Image src={L.image} alt={name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-ms text-amber-900">{name}</div>
                    <div className="text-sm text-amber-900">Wants to borrow: <strong>{money(L.principal)}</strong></div>
                    <div className="text-sm text-amber-900 mt-0.5">
                      Term <strong>{L.term}y</strong> • {L.kind === "LUMP"
                        ? <>repay <strong>{money(L.principal*(L.lump||1))}</strong> at maturity</>
                        : <><strong>{pct(L.rate || 0,1)}</strong> {L.kind}{L.kind === "APR" && L.m ? `, comp ${L.m}×/yr` : ""}</>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      audio.click();
                      setSelectedId(L.id);
                      setTalkedIds(prev => { const next = new Set(prev); next.add(L.id); return next; });
                    }}
                    disabled={locked}
                    className="pixel-btn-amber"
                  >
                    Talk
                  </button>
                  <button
                    onClick={() => {
                      audio.select();
                      setAcceptedId(L.id);
                    }}
                    disabled={!!acceptedId && acceptedId!==L.id}
                    className="pixel-btn-amber bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Choose borrower
                  </button>
                  {acceptedId===L.id && <span className="text-sm font-ms text-emerald-700">Selected</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="sticky bottom-4 mt-6">
          <div className="pixel-frame-amber bg-[#FFF8EA] p-3 flex flex-wrap items-center gap-3">
            {!revealed ? (
              <>
                <div className="text-[18px] text-amber-900">
                  Talk to borrowers, then tap <span className="font-ms">Reveal</span> to compare. <span className="font-ms">Repeat</span> gets new offers.
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => {
                      if (talkedIds.size < round.lenders.length) {
                        audio.thud();
                        setAlertMsg("Please talk to each borrower before you reveal the comparison.");
                        return;
                      }
                      audio.reveal();
                      setRevealed(true);
                    }}
                    className="pixel-btn-amber bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40"
                  >
                    Reveal
                  </button>
                  <button onClick={reset} className="pixel-btn-amber bg-amber-700 text-white hover:bg-amber-800">Repeat</button>
                  <button onClick={() => setSoundOn(s=>!s)} className="pixel-btn-amber">{soundOn?"Sound on":"Sound off"}</button>
                </div>
              </>
            ) : (
              <div className="w-full">
                <h2 className="text-xl font-ms text-amber-900">Outcomes</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {outcomes.map((o) => (
                    <div key={o.L.id} className={`pixel-frame-amber bg-[#FFECC8] p-3 ${acceptedId === o.L.id ? "ring-2 ring-emerald-500" : ""}`}>
                      <div className="font-ms text-amber-900">{o.L.label}</div>
                      <ul className="mt-2 text-[18px] leading-7 text-amber-900">
                        <li>Principal: <strong>{money(o.L.principal)}</strong></li>
                        <li>EPR (effective annual): <strong>{pct(o.ear, 2)}</strong></li>
                        <li>Inflation view: <strong>{pct(o.L.infl, 1)}</strong></li>
                        <li>Real annual: <strong className={o.rReal >= 0 ? "text-emerald-700" : "text-rose-700"}>{pct(o.rReal, 2)}</strong></li>
                        <li>Total repay: <strong>{money(o.repay)}</strong></li>
                        <li>Pay-back ratio: <strong>{o.paybackRatio.toFixed(2)}×</strong></li>
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pixel-frame-amber bg-[#FFECC8] p-3 text-[18px] font-ms text-amber-900">
                  <div>Best pick: {best.L.label} with the highest EAR of {pct(best.ear, 2)}.</div>
                  <div className="mt-2 text-sm text-amber-800">
                    Remember: For APR offers, EAR = (1 + APR/m)^m - 1, where m is compounding frequency per year.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert modal */}
      {alertMsg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="pixel-frame-amber bg-[#FFF8EA] p-4 max-w-md mx-4">
            <div className="text-amber-900 text-lg font-ms mb-3">Heads up</div>
            <p className="text-amber-900 mb-4">{alertMsg}</p>
            <div className="flex justify-end">
              <button onClick={() => setAlertMsg(null)} className="pixel-btn-amber bg-amber-600 text-white hover:bg-amber-700">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Dialogue — CRPG style with parchment background */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div 
            key={selected.id} 
            initial={{ y: 60, opacity: 0, scaleY: 0.8 }} 
            animate={{ y: 0, opacity: 1, scaleY: 1 }} 
            exit={{ y: 60, opacity: 0, scaleY: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-6xl p-4"
          >
            <div className="dialogue-box p-0 text-amber-900" style={{
              background: `linear-gradient(135deg, #fdf6e3 0%, #f4e5c1 50%, #ede0c2 100%)`,
              border: '3px solid #8b6914',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.3)',
              backdropFilter: 'blur(2px)',
              position: 'relative'
            }}>
              {(() => {
                const isPlayerSpeaking = !log.length || log[log.length-1].who !== selected.label;
                const currentSpeaker = isPlayerSpeaking ? (selectedCharacter || "You") : selected.label;
                
                return (
              <div className="flex gap-0">
                    {/* Headshot - left for player, right for animal */}
                    {isPlayerSpeaking ? (
                      <>
                        {/* Player headshot on left */}
                        <div className="portrait relative w-[200px] h-[200px] shrink-0 m-3 -mt-8" style={{
                          border: '4px solid #8b6914',
                          borderRadius: '12px',
                          background: '#fdf6e3',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
                          zIndex: 10
                        }}>
                    <Image
                      src={PLAYER_IMAGES.find(p => p.name === selectedCharacter)?.image || "/images/wizard.png"}
                      alt={selectedCharacter || "Player"}
                      fill
                            className="object-contain rounded-lg"
                    />
                </div>
                        {/* Text box */}
                <div className="flex-1 p-3">
                        <div className="inline-block mb-3 px-4 py-2 text-amber-900 font-ms text-[18px]" style={{
                          background: 'linear-gradient(135deg, #f0d49c 0%, #e6c777 100%)',
                          border: '2px solid #8b6914',
                          borderRadius: '6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)'
                        }}>
                          {currentSpeaker}
                  </div>
                        <div className="p-4 min-h-[120px] text-[20px] leading-7 font-vt323" style={{
                          background: 'linear-gradient(135deg, #faf5e6 0%, #f2e9d0 100%)',
                          border: '2px solid #b8956b',
                          borderRadius: '8px',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.5)'
                        }}>
                    {log.length > 0 && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                                  <Typewriter text={log[log.length-1].text} blip={audio.blip} />
                        </div>
                        {/* Only show Next when YOU just asked */}
                        {log[log.length-1].who === (selectedCharacter || "You") && (
                          <button
                            onClick={() => {
                              const last = log[log.length-1];
                              const answer = last.text.toLowerCase().includes("compound")
                                        ? (() => {
                                            const m = selected.m || 1;
                                            const rate = selected.rate || 0;
                                            if (m === 1) {
                                              return `${selected.label}: My APR is ${pct(rate, 1)} compounded annually. I make level payments of ${money(pmtFromPV(rate, m, selected.term, selected.principal))} each year.`;
                                            } else {
                                              const periodRate = rate / m;
                                              const pmt = pmtFromPV(rate, m, selected.term, selected.principal);
                                              return `${selected.label}: My nominal APR is ${pct(rate, 1)}, compounded ${m}× per year. The per‑${periodLabel(m)} rate is ${pct(periodRate, 3)}. I make level payments of ${money(pmt)} each ${periodLabel(m)}.`;
                                            }
                                          })()
                                : selected.inflStory;
                              setLog((L) => [...L, { who: selected.label, text: answer }]);
                            }}
                                    className="rpg-next-btn"
                                    style={{
                                      background: 'linear-gradient(135deg, #d4af7a 0%, #c19a5b 100%)',
                                      border: '2px solid #8b6914',
                                      borderRadius: '6px',
                                      padding: '8px 16px',
                                      color: '#2d1810',
                                      fontWeight: 'bold',
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.boxShadow = '0 0 8px rgba(212, 175, 122, 0.6), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Text box */}
                        <div className="flex-1 p-3">
                        <div className="inline-block mb-3 px-4 py-2 text-amber-900 font-ms text-[18px]" style={{
                          background: 'linear-gradient(135deg, #f0d49c 0%, #e6c777 100%)',
                          border: '2px solid #8b6914',
                          borderRadius: '6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)'
                        }}>
                            {currentSpeaker}
                        </div>
                        <div className="p-4 min-h-[120px] text-[20px] leading-7 font-vt323" style={{
                          background: 'linear-gradient(135deg, #faf5e6 0%, #f2e9d0 100%)',
                          border: '2px solid #b8956b',
                          borderRadius: '8px',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.5)'
                        }}>
                            {log.length > 0 && (
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <Typewriter text={log[log.length-1].text} blip={audio.blip} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Animal headshot on right */}
                        <div className="portrait relative w-[200px] h-[200px] shrink-0 m-3 -mt-8" style={{
                          border: '4px solid #8b6914',
                          borderRadius: '12px',
                          background: '#fdf6e3',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
                          zIndex: 10
                        }}>
                          <Image 
                            src={selected.image} 
                            alt={selected.label} 
                            fill 
                            className="object-contain rounded-lg" 
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* RPG-style choice tabs */}
                  {(log.length === 0 || (log[log.length-1].who === selected.label)) && (
                <div className="p-4 pt-2">
                  <div className="flex flex-col gap-3">
                      {selected.kind === "APR" && (
                        <button
                        onClick={() => {
                          audio.click();
                          setLog((L)=>[...L, { who: (selectedCharacter || "You"), text: `${selectedCharacter || "You"}: Could you tell me your compounding schedule?` }]);
                        }}
                        className="rpg-choice-tab group"
                        style={{
                          background: 'linear-gradient(135deg, #f4e5c1 0%, #ede0c2 50%, #e6d3a3 100%)',
                          border: '2px solid #8b6914',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          textAlign: 'left',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 12px rgba(218, 165, 32, 0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span className="font-ms text-amber-900">📜 Ask about compounding</span>
                        </button>
                      )}
                      <button
                      onClick={() => {
                        audio.click();
                        setLog((L)=>[...L, { who: (selectedCharacter || "You"), text: `${selectedCharacter || "You"}: What's your view on inflation right now?` }]);
                      }}
                      className="rpg-choice-tab"
                      style={{
                        background: 'linear-gradient(135deg, #f4e5c1 0%, #ede0c2 50%, #e6d3a3 100%)',
                        border: '2px solid #8b6914',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        textAlign: 'left',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(218, 165, 32, 0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span className="font-ms text-amber-900">🌾 Ask about inflation</span>
                      </button>
                      <button
                      onClick={() => { 
                        audio.click();
                        setSelectedId(null); 
                        setLog([]); 
                      }}
                      className="rpg-choice-tab"
                      style={{
                        background: 'linear-gradient(135deg, #d4af7a 0%, #c19a5b 50%, #b8956b 100%)',
                        border: '2px solid #8b6914',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        textAlign: 'left',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(184, 134, 11, 0.6), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span className="font-ms text-amber-900">🚪 That's all my questions</span>
                      </button>
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Tiny runtime tests ----------
if (typeof window !== "undefined") {
  const apr = toEAR({ kind: "APR", rate: 0.12, m: 12 });
  const ear = (1 + 0.12 / 12) ** 12 - 1;
  const lumpEar = toEAR({ kind: "LUMP", years: 10, lump: 2 });
  const lumpEarRef = Math.pow(2, 1 / 10) - 1;
  const realRef = real(0.08, 0.03);
  console.assert(Math.abs(apr - ear) < 1e-12, "toEAR(APR) incorrect");
  console.assert(Math.abs(lumpEar - lumpEarRef) < 1e-12, "toEAR(LUMP) incorrect");
  console.assert(Math.abs(realRef - ((1 + 0.08) / (1 + 0.03) - 1)) < 1e-12, "real() incorrect");
}

"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Bank Boss RPG — Artsy JRPG UI (principal amounts + typewriter + richer prose)
 * Chapter 5: Advanced Financial Lending Game
 * - Each lender now clearly states the **principal lent today** so lump-sum quotes are computable.
 * - Longer (~100 words) story paragraphs with vivid RPG flavor.
 * - Typewriter effect + optional blip sound for the dialogue box.
 * - APR/EAR or LUMP (repay k× in Y years) offers; each animal has its own inflation story.
 * - Reveal compares effective and real rates (Fisher). Repeat to reroll.
 */

// ---------- Utility ----------
function rnd(min: number, max: number, dp = 0) {
  const v = Math.random() * (max - min) + min;
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}
const pct = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;
function money(n: number) { return `$${Math.round(n).toLocaleString()}`; }

function toEAR(opts: { kind: "APR" | "EAR" | "LUMP"; rate?: number; m?: number; years?: number; lump?: number }) {
  if (opts.kind === "EAR") return opts.rate || 0;
  if (opts.kind === "APR") { const m = Math.max(1, opts.m || 1); return (1 + (opts.rate || 0) / m) ** m - 1; }
  if (opts.kind === "LUMP") { const y = Math.max(1, opts.years || 1); return (opts.lump || 1) ** (1 / y) - 1; }
  return 0;
}
const real = (i: number, pi: number) => (1 + i) / (1 + pi) - 1;

// ---------- Dialogue templates (~100 words each) ----------
const ANIMAL_IMAGES = [
  { emoji: "🐕", name: "Dog", image: "/images/dog.jpg" },
  { emoji: "🦊", name: "Fox", image: "/images/fox.jpg" },
  { emoji: "🐆", name: "Leopard", image: "/images/leopard.jpg" },
  { emoji: "🐑", name: "Sheep", image: "/images/sheep.jpg" }
];

const PLAYER_IMAGES = [
  { name: "Wizard", image: "/images/wizard.png" },
  { name: "Lizard", image: "/images/lizard.png" },
  { name: "Dwarf", image: "/images/dwarf.png" },
  { name: "Pirate", image: "/images/pirate.png" }
];

function storyBakery(n: string, t: number, r: string, P: number) {
  return `${n}: I'm setting ovens in the old square and lending you ${money(P)} today to finish the hearth and tiles. I learned sweet rolls from my grandmother and I can scale dawn batches without burning a crumb. Market days bring lines that wrap the fountain; evenings we'll sell crusts to inns. If you hold me for ${t} years, my tables price this near ${r} effective annually. Speak plainly about schedules and I'll speak plainly about cash. Bread cools fast; reputations last longer—let's keep both warm.`;
}
function storyTea(n: string, t: number, r: string, P: number) {
  return `${n}: The river path needs a tea house and I'll advance ${money(P)} for timber, braziers, and reed mats. Caravan tongues barter better after steam. My cousins will serve, I'll count, and travelers will write about the quiet. Hold the note for ${t} years and the headline works to about ${r} a year. I keep a copper jar for repairs and a ledger for luck—one I trust more than the other. If you value punctual coins and clean books, pour with me.`;
}
function storyBoat(n: string, t: number, r: string, P: number) {
  return `${n}: I know the lake winds and I'll front ${money(P)} to rig a broad‑keel boat for grain and stone. The west shore starves for ferries when storms sour roads. I price the voyage at ${r} annually over ${t} years if weather behaves and ropes don't lie. I've crew who tie knots like poems and a habit of landing early. Lend steady, and I'll return steady—plus a seat on the prow when the moon is a coin.`;
}
function storyVine(n: string, t: number, r: string, P: number) {
  return `${n}: Vines outside the wall swell with juice; I'll invest ${money(P)} in barrels, presses, and a mule that doesn't gossip. Cellars want patience and roofs that don't drip. Over ${t} years the yield evens to ${r} give or take a late frost. My family bottles truthfully; labels brag, wine shouldn't. If your appetite is for calm curves and honest sums, let's cork the deal and store it where summers can't find it.`;
}
function storySchool(n: string, t: number, r: string, P: number) {
  return `${n}: Chalk, slates, benches—${money(P)} gets us a room where numbers stop bullying children. A little school repays the town and the books equally. Keep me for ${t} years, reckon ${r} effective; I post attendance like a merchant posts prices. If we count curiosity as collateral, we're already rich. Still, I bring ledgers and lockboxes because good intentions can't buy chalk twice.`;
}
function storyWorkshop(n: string, t: number, r: string, P: number) {
  return `${n}: Wheels wobble, lamps fail, doors sulk; my workshop fixes the patience of the city. I'll stake ${money(P)} on tools and stock, then keep the till honest. Over ${t} years, a tidy operator makes about ${r} if nails stay cheap and apprentices stay curious. I'm partial to boring miracles: hinges that never squeak, balances that never lie, payments that arrive before I notice I'm waiting.`;
}
function storyLump(n: string, t: number, _r: string, P: number, k: number) {
  const repay = P * k;
  return `${n}: I keep math simple. I lend you ${money(P)} today so your plan can breathe. At the end of ${t} years you repay ${money(repay)}—one clean sweep, no fiddly coupons. Between, you keep your cash turning. We can still talk compounding if your heart insists, but my promise is a bright line: pay back ${k.toFixed(2)}× the principal at maturity. Simple is not always easy, but it is honest.`;
}
function storyMill(n: string, t: number, r: string, P: number) {
  return `${n}: There's a mill by the falls that grinds hope into flour. Its stones are sharp but its beams sulk; ${money(P)} buys braces, belts, and a fresh coat of paint the color of confidence. Give me ${t} years and I can work to about ${r} if harvests don't play tricks. The baker, the brewer, and I prefer reliable circles: millstones, coin cycles, seasons turning.`;
}

const OPENERS = [storyBakery, storyTea, storyBoat, storyVine, storySchool, storyWorkshop, storyLump, storyMill];

const INFLATION_STORIES = [
  (n: string, pi: number) => `${n}: Fish thin our nets and the cannery eats dawn's catch; smoke follows the river. Prices for oil and salt rise together—call it ${pct(pi,1)} a year until rains learn manners again.`,
  (n: string, pi: number) => `${n}: Caravans are late, grain sulks in the fields, and gossip prices itself in fear. I pencil ${pct(pi,1)} inflation because scarcity likes drama.`,
  (n: string, pi: number) => `${n}: The prefect subsidizes rice and salt to win festivals, so pantries smile. Even so, I budget ${pct(pi,1)}; kindness is not a policy forever.`,
  (n: string, pi: number) => `${n}: Miners flood markets with cheap metal; coins jingle louder but buy less bread. My ledgers whisper ${pct(pi,1)} and I listen.`,
  (n: string, pi: number) => `${n}: Fisherfolk teach me the current by what vanishes. When gulls argue over bare water, I assume ${pct(pi,1)} and plan tight.`,
];

// ---------- Types ----------
interface Lender {
  id: string;
  label: string; // emoji + name
  image: string; // animal image path
  term: number;  // years 1–30
  kind: "APR" | "EAR" | "LUMP";
  rate?: number; // APR/EAR
  m?: number;    // APR comp/yr
  lump?: number; // payoff multiple for LUMP
  principal: number; // amount lent today
  infl: number;  // lender inflation outlook
  open: string;  // long paragraph
  inflStory: string;
  asked: { comp?: boolean; infl?: boolean };
}

interface Round { lenders: Lender[]; }

function makeLender(i: number): Lender {
  const animalData = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
  const label = `${animalData.emoji} ${animalData.name}`;
  const term = Math.max(1, Math.floor(rnd(1, 31)));
  const principal = Math.round(rnd(50000, 250000, 0) / 1000) * 1000;
  const pick = Math.random();
  const kind: "APR" | "EAR" | "LUMP" = pick < 0.45 ? "APR" : pick < 0.85 ? "EAR" : "LUMP";
  const rate = kind !== "LUMP" ? rnd(0.02, 0.14, 4) : undefined;
  const m = kind === "APR" ? [1, 2, 4, 12][Math.floor(Math.random() * 4)] : undefined;
  const lump = kind === "LUMP" ? rnd(1.10, 3.0, 3) : undefined;
  const ear = toEAR({ kind, rate, m, years: term, lump });
  const rStr = pct(ear, 1);
  const open = OPENERS[Math.floor(Math.random() * OPENERS.length)](label, term, rStr, principal, lump || 0);
  const infl = rnd(0.00, 0.08, 3);
  const inflStory = INFLATION_STORIES[Math.floor(Math.random() * INFLATION_STORIES.length)](label, infl);
  return { 
    id: `L${i}_${Math.random().toString(36).slice(2,8)}`, 
    label, 
    image: animalData.image,
    term, 
    kind, 
    rate, 
    m, 
    lump, 
    principal, 
    infl, 
    open, 
    inflStory, 
    asked: {} 
  };
}

function makeRound(): Round { return { lenders: Array.from({ length: 4 }, (_, i) => makeLender(i)) }; }

// ---------- Typewriter with blip ----------
function useBlipSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, [enabled]);
  const blip = () => {
    if (!enabled) return;
    const ctx = ctxRef.current; if (!ctx) return;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "square"; o.frequency.value = 180;
    g.gain.value = 0.03; o.connect(g); g.connect(ctx.destination);
    o.start(); setTimeout(() => { o.stop(); o.disconnect(); g.disconnect(); }, 40);
  };
  return blip;
}

function Typewriter({ text, speed=18, sound=false }: { text: string; speed?: number; sound?: boolean }) {
  const [i, setI] = useState(0);
  const blip = useBlipSound(sound);
  useEffect(() => { setI(0); }, [text]);
  useEffect(() => {
    if (i >= text.length) return;
    const id = setTimeout(() => { const step = 1; setI(i + step); if ((i % 3) === 0) blip(); }, speed);
    return () => clearTimeout(id);
  }, [i, text, speed]);
  return <div>{text.slice(0, i)}</div>;
}

// ---------- Start Screen Component ----------
function StartScreen({ onStart, onCharacterSelect, selectedCharacter }: { 
  onStart: () => void; 
  onCharacterSelect: (character: string) => void;
  selectedCharacter: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <div className="mx-auto max-w-4xl rounded-3xl border-4 border-purple-800 bg-white/90 p-8 shadow-2xl backdrop-blur-lg">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-extrabold text-purple-900 drop-shadow-lg">
            🏦 Bank Boss RPG
          </h1>
          <h2 className="mb-4 text-2xl font-bold text-purple-700">Chapter 5: Advanced Financial Lending</h2>
          
          <div className="mb-6 rounded-2xl bg-purple-50 p-6 text-left">
            <p className="mb-4 text-lg leading-relaxed text-purple-800">
              Welcome to your bank! Today you'll meet with <strong>4 animal lenders</strong> from different kingdoms. 
              Each has their own unique business and inflation outlook. You can only lend to <strong>one lender</strong> 
              - choose wisely to get the <strong>highest real return ratio</strong>!
            </p>
            <p className="text-base leading-relaxed text-purple-700">
              • Talk with each lender to learn their terms (APR, EAR, or lump-sum)<br/>
              • Ask about their inflation expectations<br/>
              • Compare effective and real rates<br/>
              • Choose the lender with the best real annual return
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-bold text-purple-800">Choose Your Character:</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {PLAYER_IMAGES.map((char) => (
                <button
                  key={char.name}
                  onClick={() => onCharacterSelect(char.name)}
                  className={`rounded-xl border-2 p-3 transition-all ${
                    selectedCharacter === char.name 
                      ? "border-purple-600 bg-purple-100 shadow-lg" 
                      : "border-purple-200 hover:border-purple-400"
                  }`}
                >
                  <Image
                    src={char.image}
                    alt={char.name}
                    width={80}
                    height={80}
                    className="mx-auto rounded-lg"
                  />
                  <div className="mt-2 text-sm font-semibold text-purple-800">{char.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            disabled={!selectedCharacter}
            className="rounded-xl bg-purple-600 px-8 py-3 text-xl font-bold text-white shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Your Banking Adventure!
          </button>
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
  const [soundOn, setSoundOn] = useState(true);
  const YOU = `🧙‍♂️ ${selectedCharacter || "You"}`;

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
    const repay = L.kind === "LUMP" ? (L.principal * (L.lump || 1)) : L.principal * Math.pow(1 + ear, L.term);
    return { L, ear, rReal, repay };
  });
  const best = [...outcomes].sort((a, b) => b.rReal - a.rReal)[0];

  function reset() { setSelectedId(null); setAcceptedId(null); setRevealed(false); setLog([]); setSeed((x) => x + 1); }

  if (!gameStarted) {
    return (
      <StartScreen 
        onStart={() => setGameStarted(true)}
        onCharacterSelect={setSelectedCharacter}
        selectedCharacter={selectedCharacter}
      />
    );
  }

  return (
    <div 
      className="relative min-h-screen font-serif text-slate-800"
      style={{
        backgroundImage: "url('/images/bank.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10 mx-auto max-w-6xl p-6 pb-72">
        <h1 className="text-4xl font-extrabold tracking-wide text-purple-900 drop-shadow">Bank Boss — Chapter 5: Animal Lenders</h1>
        <p className="mt-2 max-w-4xl text-base italic text-slate-700 bg-white/60 rounded-lg p-3 backdrop-blur-sm">
          Talk with <span className="font-semibold">each</span> lender. They quote in different ways: APR, EAR, or a lump‑sum like
          <em> "repay 2.4× in 7 years"</em>. Every animal kingdom brings its own inflation story. Compare offers and choose the
          lender with the <span className="font-semibold">highest real annual rate</span>. You receive a principal today—make sure you understand
          <span className="font-semibold"> how much they lend</span> before judging a lump‑sum promise.
        </p>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {round.lenders.map((L) => {
            const [emoji, name] = L.label.split(" ");
            const locked = !!acceptedId && acceptedId !== L.id;
            return (
              <div key={L.id} className={`rounded-3xl border-2 border-purple-200 bg-white/80 p-4 shadow-md backdrop-blur-lg transition ${selectedId === L.id ? "ring-4 ring-purple-400" : "hover:shadow-xl"} ${locked ? "opacity-40" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-purple-50 shadow-inner">
                    <Image
                      src={L.image}
                      alt={name}
                      fill
                      className="object-cover"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-purple-900">{name}</div>
                    <div className="text-xs text-slate-600">Lends today: <strong>{money(L.principal)}</strong></div>
                    <div className="text-xs text-slate-600 mt-0.5">Term <strong>{L.term}y</strong> • {L.kind === "LUMP" ? <>repay <strong>{(L.lump || 1).toFixed(2)}×</strong> at maturity (<strong>{money(L.principal*(L.lump||1))}</strong>)</> : <><strong>{pct(L.rate || 0,1)}</strong> {L.kind}{L.kind === "APR" && L.m ? `, comp ${L.m}×/yr` : ""}</>}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => setSelectedId(L.id)} disabled={locked} className="rounded-xl border border-purple-300 px-3 py-1 text-sm text-purple-700 hover:bg-purple-50">Talk</button>
                  <button onClick={() => setAcceptedId(L.id)} disabled={!!acceptedId && acceptedId!==L.id} className="rounded-xl bg-emerald-600 px-3 py-1 text-sm text-white shadow hover:bg-emerald-700 disabled:opacity-40">Accept</button>
                  {acceptedId===L.id && <span className="text-xs font-semibold text-emerald-700">Selected</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="sticky bottom-4 mt-6 rounded-3xl border border-purple-200 bg-white/85 p-4 shadow-xl backdrop-blur">
          {!revealed ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm text-purple-800">Talk to lenders first. Then click <strong>Reveal</strong> to compare effective and real rates. <strong>Repeat</strong> rerolls numbers.</div>
              <button onClick={() => setRevealed(true)} disabled={!acceptedId} className="ml-auto rounded-xl bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-700 disabled:opacity-40">Reveal</button>
              <button onClick={reset} className="rounded-xl bg-purple-700 px-3 py-2 text-white shadow hover:bg-purple-800">Repeat</button>
              <button onClick={() => setSoundOn(s=>!s)} className="rounded-xl border border-purple-300 px-3 py-2 text-sm text-purple-700">{soundOn?"🔊 Sound on":"🔇 Sound off"}</button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-extrabold text-purple-900">Outcomes</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {outcomes.map((o) => (
                  <div key={o.L.id} className={`rounded-2xl border-2 border-purple-200 bg-white/90 p-3 ${acceptedId === o.L.id ? "border-emerald-500 shadow-xl" : ""}`}>
                    <div className="font-semibold">{o.L.label}</div>
                    <ul className="mt-2 text-sm leading-6">
                      <li>Principal: <strong>{money(o.L.principal)}</strong></li>
                      <li>Effective annual: <strong>{pct(o.ear, 2)}</strong></li>
                      <li>Inflation view: <strong>{pct(o.L.infl, 1)}</strong></li>
                      <li>Real annual: <strong className={o.rReal >= 0 ? "text-emerald-700" : "text-rose-700"}>{pct(o.rReal, 2)}</strong></li>
                      <li>Total repay at end: <strong>{money(o.repay)}</strong></li>
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-purple-50 p-3 text-sm font-semibold text-purple-900">Best pick: {best.L.label} with {pct(best.rReal,2)} real annual.</div>
            </div>
          )}
        </div>
      </div>

      {/* Artsy Bottom Dialogue with Typewriter */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div key={selected.id} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-6xl p-4">
            <div className="relative rounded-3xl border-4 border-purple-800 bg-purple-700/95 p-6 text-white shadow-2xl">
              <div className="absolute -top-4 left-24 rounded-md border-2 border-purple-700 bg-purple-100 px-3 py-1 text-sm font-black tracking-wide text-purple-900">{selected.label}</div>
              <div className="flex items-start gap-5">
                {/* Player Portrait */}
                <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-white/90 shadow-inner">
                  {selectedCharacter && (
                    <Image
                      src={PLAYER_IMAGES.find(p => p.name === selectedCharacter)?.image || "/images/wizard.png"}
                      alt={selectedCharacter}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                
                {/* Dialogue Text */}
                <div className="flex-1 text-lg leading-8">
                  {log.length > 0 && <Typewriter text={log[log.length-1].text} sound={soundOn} />}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {selected.kind === "APR" && (
                      <button onClick={() => setLog((L)=>[...L, { who: YOU, text: `${YOU}: Is that a yearly rate? How often compounding?` }, { who: selected.label, text: `${selected.label}: Nominal APR compounded ${selected.m}×/yr.` }])} className="rounded-md bg-white/90 px-3 py-1 font-semibold text-purple-700 shadow hover:bg-white">Ask compounding</button>
                    )}
                    <button onClick={() => setLog((L)=>[...L, { who: YOU, text: `${YOU}: What's your inflation outlook?` }, { who: selected.label, text: selected.inflStory }])} className="rounded-md bg-white/90 px-3 py-1 font-semibold text-purple-700 shadow hover:bg-white">Ask inflation</button>
                    <button onClick={() => setAcceptedId(selected.id)} disabled={!!acceptedId} className="rounded-md bg-emerald-600 px-3 py-1 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-40">Accept offer</button>
                  </div>
                </div>
                
                {/* Animal Portrait */}
                <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-white/90 shadow-inner">
                  <Image
                    src={selected.image}
                    alt={selected.label.split(" ")[1]}
                    fill
                    className="object-cover"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Tiny runtime tests (dev only) ----------
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
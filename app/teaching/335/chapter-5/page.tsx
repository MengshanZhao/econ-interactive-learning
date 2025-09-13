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
  const label = `${animalData.name}`;
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
    o.type = "sine"; o.frequency.value = 220;
    g.gain.setValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + 0.08);
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.09);
    o.onended = () => { o.disconnect(); g.disconnect(); };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF4DF]">
      <div className="mx-auto max-w-4xl rounded-3xl border-4 border-amber-700 bg-[#FFF8EA] p-8 shadow-2xl">
        <div className="text-center">
          {/* Title removed as requested */}
          
          <div className="mb-6 rounded-2xl bg-[#FFECC8] p-6 text-left">
            <p className="mb-4 text-lg leading-relaxed text-amber-900">
              Welcome, banker! Meet <strong>4 animal friends</strong>. Each offers a simple deal.
              Chat, compare, and pick the one that feels best.
            </p>
            <p className="text-base leading-relaxed text-amber-800">
              • Ask about their rates and views on prices<br/>
              • See real returns in the summary<br/>
              • Choose your favorite and reveal the results
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-bold text-amber-800">Choose Your Character:</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {PLAYER_IMAGES.map((char) => (
                <button
                  key={char.name}
                  onClick={() => onCharacterSelect(char.name)}
                  className={`rounded-xl p-2 transition-transform ${
                    selectedCharacter === char.name ? "ring-2 ring-amber-600" : ""
                  } hover:scale-105`}
                >
                  <Image
                    src={char.image}
                    alt={char.name}
                    width={140}
                    height={140}
                    className="mx-auto rounded-lg drop-shadow-xl"
                  />
                  <div className="mt-2 text-sm font-semibold text-amber-800">{char.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onStart}
            disabled={!selectedCharacter}
            className="rounded-xl bg-amber-600 px-8 py-3 text-xl font-bold text-white shadow-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [soundOn, setSoundOn] = useState(false);
  const YOU = `${selectedCharacter || "You"}`;

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
      
      <div className="relative z-10 mx-auto max-w-6xl p-6 pb-72">
        {/* Title intentionally minimal per request */}
        <p className="mt-2 max-w-4xl text-base italic text-slate-800 bg-[#FFF4DF] rounded-lg p-3">
          Chat with <span className="font-semibold">each</span> lender. They may quote APR, EAR, or a simple one‑time payback.
          Compare and pick the friend with the <span className="font-semibold">best real yearly return</span>.
        </p>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {round.lenders.map((L) => {
            const name = L.label;
            const locked = !!acceptedId && acceptedId !== L.id;
            return (
              <div key={L.id} className={`rounded-3xl border-2 border-amber-200 bg-[#FFF8EA] p-4 shadow-md transition ${selectedId === L.id ? "ring-4 ring-amber-300" : "hover:shadow-xl"} ${locked ? "opacity-40" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#FFF4DF] shadow-inner">
                    <Image
                      src={L.image}
                      alt={name}
                      fill
                      className="object-cover"
                      style={{ mixBlendMode: 'normal' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-amber-900">{name}</div>
                    <div className="text-xs text-slate-700">Lends today: <strong>{money(L.principal)}</strong></div>
                    <div className="text-xs text-slate-700 mt-0.5">Term <strong>{L.term}y</strong> • {L.kind === "LUMP" ? <>repay <strong>{(L.lump || 1).toFixed(2)}×</strong> at maturity (<strong>{money(L.principal*(L.lump||1))}</strong>)</> : <><strong>{pct(L.rate || 0,1)}</strong> {L.kind}{L.kind === "APR" && L.m ? `, comp ${L.m}×/yr` : ""}</>}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => setSelectedId(L.id)} disabled={locked} className="rounded-xl border border-amber-300 px-3 py-1 text-sm text-amber-800 hover:bg-[#FFF4DF]">Talk</button>
                  <button onClick={() => setAcceptedId(L.id)} disabled={!!acceptedId && acceptedId!==L.id} className="rounded-xl bg-amber-600 px-3 py-1 text-sm text-white shadow hover:bg-amber-700 disabled:opacity-40">Accept</button>
                  {acceptedId===L.id && <span className="text-xs font-semibold text-emerald-700">Selected</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="sticky bottom-4 mt-6 rounded-3xl border border-amber-200 bg-[#FFF8EA] p-4 shadow-xl">
          {!revealed ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-sm text-amber-900">Talk to lenders, then tap <strong>Reveal</strong> to compare. <strong>Repeat</strong> gets new offers.</div>
              <button onClick={() => setRevealed(true)} disabled={!acceptedId} className="ml-auto rounded-xl bg-amber-600 px-4 py-2 text-white shadow hover:bg-amber-700 disabled:opacity-40">Reveal</button>
              <button onClick={reset} className="rounded-xl bg-amber-700 px-3 py-2 text-white shadow hover:bg-amber-800">Repeat</button>
              <button onClick={() => setSoundOn(s=>!s)} className="rounded-xl border border-amber-300 px-3 py-2 text-sm text-amber-800">{soundOn?"Sound on":"Sound off"}</button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-extrabold text-amber-900">Outcomes</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {outcomes.map((o) => (
                  <div key={o.L.id} className={`rounded-2xl border-2 border-amber-200 bg-[#FFF4DF] p-3 ${acceptedId === o.L.id ? "border-emerald-500 shadow-xl" : ""}`}>
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
              <div className="mt-4 rounded-2xl bg-[#FFECC8] p-3 text-sm font-semibold text-amber-900">Best pick: {best.L.label} with {pct(best.rReal,2)} real annual.</div>
            </div>
          )}
        </div>
      </div>

      {/* Artsy Bottom Dialogue with Typewriter */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div key={selected.id} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-6xl p-4">
            <div className="relative rounded-3xl border-4 border-amber-700 bg-[#FFF4DF] p-6 text-amber-900 shadow-2xl">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-md border-2 border-amber-700 bg-[#FFECC8] px-4 py-1 text-sm font-black tracking-wide text-amber-900">{selected.label}</div>
              <div className="flex items-center gap-4">
                {/* Left portrait (your character when asking, empty when animal answers) */}
                <div className="w-32 h-32 flex-shrink-0">
                  {log.length > 0 && log[log.length-1].who === YOU && (
                    <Image
                      src={PLAYER_IMAGES.find(p => p.name === selectedCharacter)?.image || "/images/wizard.png"}
                      alt={selectedCharacter || "Player"}
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  )}
                </div>

                {/* Dialogue Text */}
                <div className="flex-1 min-h-[8rem] flex flex-col justify-between">
                  <div className="text-lg">
                    {log.length > 0 && (
                      <>
                        <Typewriter text={log[log.length-1].text} sound={soundOn} />
                        {log[log.length-1].who === "next" && (
                          <div className="mt-4">
                            <button
                              onClick={() => setLog((L) => [
                                ...L.slice(0, -1),
                                { who: selected.label, text: L[L.length-2].text.includes("compounding") 
                                  ? `${selected.label}: Nominal APR, compounded ${selected.m}× per year.`
                                  : selected.inflStory
                                }
                              ])}
                              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              Next →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {(!log.length || log[log.length-1].who !== "next") && (
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      <div className="rounded-xl bg-[#FFECC8] p-4 space-y-3 w-full">
                        {selected.kind === "APR" && (
                          <button 
                            onClick={() => setLog((L)=>[
                              ...L, 
                              { who: YOU, text: `${YOU}: What's your compounding schedule?` },
                              { who: "next", text: "Next" }
                            ])} 
                            className="w-full text-left px-4 py-2 rounded-lg bg-[#FFF8EA] hover:bg-white transition-colors"
                          >
                            Ask about interest rate compounding
                          </button>
                        )}
                        <button 
                          onClick={() => setLog((L)=>[
                            ...L, 
                            { who: YOU, text: `${YOU}: What is the inflation?` },
                            { who: "next", text: "Next" }
                          ])} 
                          className="w-full text-left px-4 py-2 rounded-lg bg-[#FFF8EA] hover:bg-white transition-colors"
                        >
                          Ask about local inflation
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right portrait (animal when answering, empty when you're asking) */}
                <div className="w-32 h-32 flex-shrink-0">
                  {log.length > 0 && log[log.length-1].who !== YOU && log[log.length-1].who !== "next" && (
                    <Image
                      src={selected.image}
                      alt={selected.label}
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  )}
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

// --------- Portrait component (oversized, ~1.5x dialog height) ---------
function Portrait({ selectedCharacter, imageSrc, alt, side }: { selectedCharacter?: string; imageSrc?: string; alt?: string; side: "left" | "right" }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [dialogHeight, setDialogHeight] = useState<number>(160);

  useEffect(() => {
    const el = document.querySelector('[data-dialog-root]') as HTMLDivElement | null;
    function measure() {
      if (!el) return;
      setDialogHeight(el.offsetHeight || 160);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const h = Math.round(dialogHeight * 1.5);
  const w = Math.round(h * 0.9);
  const src = imageSrc || (PLAYER_IMAGES.find(p => p.name === (selectedCharacter || ""))?.image || "/images/wizard.png");
  const altText = alt || (selectedCharacter || "Player");

  return (
    <div
      ref={boxRef}
      className={`relative overflow-visible ${side === 'left' ? 'order-first' : ''}`}
      style={{ width: 0, height: 0 }}
    >
      <div
        className={`absolute ${side === 'left' ? '-bottom-0 -left-2' : '-bottom-0 -right-2'} pointer-events-none`}
        style={{ height: `${h}px`, width: `${w}px`, transform: 'translateY(-100%)' }}
      >
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={altText}
            fill
            className="object-contain drop-shadow-2xl"
            style={{ mixBlendMode: 'normal' }}
            priority
          />
        </div>
      </div>
      {/* Mark dialog container for measurement */}
      <div data-dialog-root={true}></div>
    </div>
  );
}

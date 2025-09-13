"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Bank Boss RPG — Chapter 5
 * - Borrowers ask YOU for a principal today; you pick the one with the HIGHEST TOTAL PAY-BACK RATIO.
 * - ~100 word, plain/cute stories; all $ amounts (no "k× principal").
 * - Inflation < 10%; effective returns ≤ 15%; no zeros.
 * - Typewriter with very soft key-click.
 * - Dialogue flow: after YOU ask, only "Next →" appears.
 * - New UI: large SQUARE headshot + ornate pixel frame + VT323 (body) & MedievalSharp (name).
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

// ---------- ~100-word borrower stories (plain, friendly; all $ amounts) ----------
function storyBakery(n: string, t: number, r: string, P: number) {
  return `${n}: I’m fixing up a little bakery by the old square and I’m asking to borrow ${money(P)} from you to finish the oven and counters. I bake early, keep it warm, and sell out by sunset on market days. I’ll keep simple books and send you tidy updates. If you hold the note for ${t} years, it works out to about ${r} a year on your side. I want this to be friendly and clear: I’ll show schedules, you’ll see cash. Bread cools fast, promises shouldn’t—let’s keep both warm and honest.`;
}
function storyTea(n: string, t: number, r: string, P: number) {
  return `${n}: I’d like to borrow ${money(P)} to open a small tea house by the river path—timber, braziers, reed mats, the cozy bits. Travelers relax after steam, then they buy snacks. My cousins pour, I count. If you keep the loan for ${t} years, your return is about ${r} annually. I keep a repair jar and a careful ledger. No fancy talk, just steady coins and clean tables. If you like punctual pay-backs and easy reading books, pour with me.`;
}
function storyBoat(n: string, t: number, r: string, P: number) {
  return `${n}: I’m asking to borrow ${money(P)} to rig a sturdy ferry boat for grain and stone. When storms muddy the road, the lake is the shortcut. I plan to repay you at about ${r} a year over ${t} years if weather behaves. My crew ties knots like poems and docks early. You lend steady; I pay steady—plus I’ll save you a seat at sunset when the moon looks like a silver coin.`;
}
function storyVine(n: string, t: number, r: string, P: number) {
  return `${n}: The vines outside the wall are heavy this season. I need ${money(P)} to buy barrels, a hand press, and one well-mannered mule. Wine takes patience, so I’ll plan calm cash flows. Over ${t} years it evens to about ${r} for you. My labels won’t brag and my numbers won’t wobble. If you prefer quiet curves and straight sums, lend to me and I’ll repay on time, corked tight and counted twice.`;
}
function storySchool(n: string, t: number, r: string, P: number) {
  return `${n}: With ${money(P)} I can rent a sunny room, buy chalk and slates, and start a small after-school class. I’ll post attendance and keep neat notes so you always know where your coins go. If you hold for ${t} years, expect around ${r} yearly. Curiosity is our collateral, but I still carry a lockbox and a ledger. I’ll repay you first, then buy more chalk.`;
}
function storyWorkshop(n: string, t: number, r: string, P: number) {
  return `${n}: Doors stick, lamps flicker, wheels wobble—my fix-it workshop will keep the town’s patience alive. I’m asking to borrow ${money(P)} for tools and parts. Over ${t} years you’d earn about ${r} if nails stay fairly priced and we stay busy. I like boring miracles: hinges that hush, scales that tell the truth, and payments that arrive before you wonder.`;
}
function storyLump(n: string, t: number, _r: string, P: number, k: number) {
  const repay = Math.round(P * k);
  return `${n}: I like simple promises. I borrow ${money(P)} from you today and in ${t} years I repay ${money(repay)} in one clean payment. No coupons or fiddly bits between. If you want the compounding math, we can write it down, but the headline is clear: you get back ${money(repay)} at maturity. Simple to remember, simple to check.`;
}
function storyMill(n: string, t: number, r: string, P: number) {
  return `${n}: The mill by the falls can hum again if I shore up the beams. I’m asking for ${money(P)} to buy belts, braces, and paint the color of confidence. Over ${t} years your return runs about ${r}, assuming harvests behave. The baker, the brewer, and I all like reliable circles: millstones, seasons, and coins returning on time.`;
}
const OPENERS = [storyBakery, storyTea, storyBoat, storyVine, storySchool, storyWorkshop, storyLump, storyMill];

const INFLATION_STORIES = [
  (n: string, pi: number) => `${n}: Fish thin our nets and the cannery eats dawn’s catch; smoke follows the river. Prices for oil and salt rise together—call it ${pct(pi,1)} a year until rains learn manners again.`,
  (n: string, pi: number) => `${n}: Caravans are late, grain sulks in the fields, and gossip prices itself in fear. I pencil ${pct(pi,1)} inflation because scarcity likes drama.`,
  (n: string, pi: number) => `${n}: The prefect subsidizes rice and salt to win festivals, so pantries smile. Even so, I budget ${pct(pi,1)}; kindness is not a policy forever.`,
  (n: string, pi: number) => `${n}: Miners flood markets with cheap metal; coins jingle louder but buy less bread. My ledgers whisper ${pct(pi,1)} and I listen.`,
  (n: string, pi: number) => `${n}: Fisherfolk teach me the current by what vanishes. When gulls argue over bare water, I assume ${pct(pi,1)} and plan tight.`,
];

// ---------- Types ----------
interface Lender {
  id: string;
  label: string;
  image: string;
  term: number;  // years 1–30
  kind: "APR" | "EAR" | "LUMP";
  rate?: number;
  m?: number;
  lump?: number; // payoff multiple at maturity (for LUMP)
  principal: number; // BORROWED from you today
  infl: number;  // inflation expectation
  open: string;  // ~100 words
  inflStory: string;
}

interface Round { lenders: Lender[]; }

// ---------- Random offer generator with sensible caps ----------
function makeLender(i: number): Lender {
  const animalData = ANIMAL_IMAGES[i % ANIMAL_IMAGES.length];
  const label = `${animalData.name}`;
  const term = Math.max(1, Math.floor(rnd(1, 31)));

  // Borrow amounts in sensible round dollars
  const principal = Math.round(rnd(50_000, 250_000, 0) / 1000) * 1000;

  // Offer type with EAR cap
  const pick = Math.random();
  let kind: "APR" | "EAR" | "LUMP" = pick < 0.45 ? "APR" : pick < 0.85 ? "EAR" : "LUMP";

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
  } else if (kind === "EAR") {
    rate = rnd(0.03, 0.15, 4);                 // 3%–15% EAR
  } else { // LUMP: choose k so implied EAR ≤ 15% (and ≥ about 3%)
    const maxK = (1 + 0.15) ** term;
    const minK = (1 + 0.03) ** term;
    const k = rnd(Math.min(minK, maxK * 0.9), maxK, 3);
    lump = Math.max(1.05, Math.min(k, maxK));
  }

  const ear = toEAR({ kind, rate, m, years: term, lump });
  const rStr = pct(Math.min(ear, 0.15), 1);

  const open = OPENERS[Math.floor(Math.random() * OPENERS.length)](label, term, rStr, principal, lump || 0);
  const infl = rnd(0.00, 0.08, 3);             // under 10%
  const inflStory = INFLATION_STORIES[Math.floor(Math.random() * INFLATION_STORIES.length)](label, infl);

  return { id: `L${i}_${Math.random().toString(36).slice(2,8)}`, label, image: animalData.image, term, kind, rate, m, lump, principal, infl, open, inflStory };
}

function makeRound(): Round { return { lenders: Array.from({ length: 4 }, (_, i) => makeLender(i)) }; }

// ---------- Typewriter with soft key-click ----------
function useBlipSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, [enabled]);

  const blip = () => {
    if (!enabled) return;
    const ctx = ctxRef.current; if (!ctx) return;

    // Short noise burst through bandpass -> gentle key click
    const bufferSize = 256;
    const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

    const src = ctx.createBufferSource();
    src.buffer = noise;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 3;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.003, ctx.currentTime + 0.05);

    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + 0.06);
    src.onended = () => { src.disconnect(); bp.disconnect(); g.disconnect(); };
  };
  return blip;
}

function Typewriter({ text, speed=18, sound=true }: { text: string; speed?: number; sound?: boolean }) {
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

// ---------- Start Screen ----------
function StartScreen({ onStart, onCharacterSelect, selectedCharacter }: {
  onStart: () => void;
  onCharacterSelect: (character: string) => void;
  selectedCharacter: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2331]">
      <div className="mx-auto max-w-4xl p-2">
        <div className="pixel-frame p-6 bg-[#3b313f]">
          <div className="text-center">
            <div className="mb-6 pixel-frame bg-[#4a3f50] text-left p-4">
              <p className="mb-3 text-lg leading-relaxed text-amber-200 font-vt323">
                Welcome, banker! Meet <strong className="font-black">4 animal borrowers</strong>. Each asks for a principal now and promises how they’ll pay you back.
              </p>
              <p className="text-base leading-relaxed text-amber-100 font-vt323">
                • Ask about their rates and inflation views<br/>
                • See real returns and total pay-backs in the summary<br/>
                • Choose the borrower with the <strong>highest total pay-back ratio</strong>
              </p>
            </div>

            <div className="mb-5">
              <h3 className="mb-2 text-xl text-amber-200 font-ms">Choose Your Character</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {PLAYER_IMAGES.map((char) => (
                  <button
                    key={char.name}
                    onClick={() => onCharacterSelect(char.name)}
                    className={`rounded-sm p-2 transition-transform ${selectedCharacter === char.name ? "ring-2 ring-amber-400" : ""} hover:scale-105`}
                  >
                    <Image src={char.image} alt={char.name} width={140} height={140} className="mx-auto rounded-sm drop-shadow-xl" />
                    <div className="mt-2 text-sm font-ms text-amber-100">{char.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onStart}
              disabled={!selectedCharacter}
              className="rounded-sm bg-amber-500 px-6 py-3 text-xl font-ms text-[#2b2331] shadow-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
export default function BankBossChapter6() {
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
    const paybackRatio = repay / L.principal;
    return { L, ear, rReal, repay, paybackRatio };
  });
  const best = [...outcomes].sort((a, b) => b.paybackRatio - a.paybackRatio)[0];

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
      className="relative min-h-screen text-amber-100 bg-[#2b2331] font-vt323"
      style={{
        backgroundImage: "url('/images/bank.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="relative z-10 mx-auto max-w-6xl p-6 pb-72">
        <div className="pixel-frame bg-[#3b313f] p-3">
          <p className="mt-1 max-w-4xl text-[19px] text-amber-100">
            Chat with <span className="font-ms font-bold">each borrower</span>. They’ll ask to borrow a principal amount today and promise a way to pay you back (APR, EAR, or one-time lump sum).
            Compare and pick the friend with the <span className="font-ms font-bold">highest total pay-back ratio</span>.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {round.lenders.map((L) => {
            const name = L.label;
            const locked = !!acceptedId && acceptedId !== L.id;
            return (
              <div key={L.id} className={`pixel-frame bg-[#3b313f] p-3 transition ${selectedId === L.id ? "ring-2 ring-amber-400" : "hover:brightness-110"} ${locked ? "opacity-40" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[2px] bg-[#2b2331] shadow-inner">
                    <Image src={L.image} alt={name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-ms text-amber-200">{name}</div>
                    <div className="text-sm text-amber-100">Wants to borrow: <strong>{money(L.principal)}</strong></div>
                    <div className="text-sm text-amber-100 mt-0.5">
                      Term <strong>{L.term}y</strong> • {L.kind === "LUMP"
                        ? <>repay <strong>{money(L.principal*(L.lump||1))}</strong> at maturity</>
                        : <><strong>{pct(L.rate || 0,1)}</strong> {L.kind}{L.kind === "APR" && L.m ? `, comp ${L.m}×/yr` : ""}</>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => setSelectedId(L.id)} disabled={locked} className="pixel-btn">Talk</button>
                  <button onClick={() => setAcceptedId(L.id)} disabled={!!acceptedId && acceptedId!==L.id} className="pixel-btn bg-amber-500 text-[#2b2331] hover:bg-amber-400">Choose borrower</button>
                  {acceptedId===L.id && <span className="text-sm font-ms text-emerald-300">Selected</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="sticky bottom-4 mt-6">
          <div className="pixel-frame bg-[#3b313f] p-3 flex flex-wrap items-center gap-3">
            {!revealed ? (
              <>
                <div className="text-[18px]">Talk to borrowers, then tap <span className="font-ms">Reveal</span> to compare. <span className="font-ms">Repeat</span> gets new offers.</div>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => setRevealed(true)} disabled={!acceptedId} className="pixel-btn bg-amber-500 text-[#2b2331] hover:bg-amber-400 disabled:opacity-40">Reveal</button>
                  <button onClick={reset} className="pixel-btn bg-amber-600 text-[#2b2331] hover:bg-amber-500">Repeat</button>
                  <button onClick={() => setSoundOn(s=>!s)} className="pixel-btn">{soundOn?"Sound on":"Sound off"}</button>
                </div>
              </>
            ) : (
              <div className="w-full">
                <h2 className="text-xl font-ms text-amber-200">Outcomes</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {outcomes.map((o) => (
                    <div key={o.L.id} className={`pixel-frame bg-[#4a3f50] p-3 ${acceptedId === o.L.id ? "ring-2 ring-emerald-400" : ""}`}>
                      <div className="font-ms text-amber-100">{o.L.label}</div>
                      <ul className="mt-2 text-[18px] leading-7">
                        <li>Principal: <strong>{money(o.L.principal)}</strong></li>
                        <li>Effective annual: <strong>{pct(o.ear, 2)}</strong></li>
                        <li>Inflation view: <strong>{pct(o.L.infl, 1)}</strong></li>
                        <li>Real annual: <strong className={o.rReal >= 0 ? "text-emerald-300" : "text-rose-300"}>{pct(o.rReal, 2)}</strong></li>
                        <li>Total repay: <strong>{money(o.repay)}</strong></li>
                        <li>Pay-back ratio: <strong>{o.paybackRatio.toFixed(2)}×</strong></li>
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pixel-frame bg-[#4a3f50] p-3 text-[18px] font-ms text-amber-100">
                  Best pick: {best.L.label} with a {best.paybackRatio.toFixed(2)}× total pay-back.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Dialogue — large square portrait + ornate frame */}
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div key={selected.id} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-6xl p-4">
            <div className="pixel-frame bg-[#3b313f] p-0 text-amber-100">
              <div className="flex gap-0">
                {/* Large SQUARE headshot (like reference) */}
                <div className="relative w-[180px] h-[180px] shrink-0 m-3 bg-[#2b2331] pixel-inner">
                  {/* When YOU are speaking, show your portrait; else animal */}
                  {(!log.length || log[log.length-1].who !== selected.label) ? (
                    <Image
                      src={PLAYER_IMAGES.find(p => p.name === selectedCharacter)?.image || "/images/wizard.png"}
                      alt={selectedCharacter || "Player"}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <Image src={selected.image} alt={selected.label} fill className="object-contain" />
                  )}
                </div>

                {/* Text box with title tab */}
                <div className="flex-1 p-3">
                  {/* Name tab */}
                  <div className="inline-block mb-2 px-3 py-1 pixel-frame bg-[#4a3f50] text-amber-200 font-ms text-[18px]">
                    {(log.length > 0 && log[log.length-1].who !== selected.label) ? (selectedCharacter || "You") : selected.label}
                  </div>

                  {/* Message + controls */}
                  <div className="pixel-inner bg-[#2b2331] p-4 min-h-[110px] text-[20px] leading-7">
                    {log.length > 0 && (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Typewriter text={log[log.length-1].text} sound={soundOn} />
                        </div>

                        {/* Only show Next when YOU just asked */}
                        {log[log.length-1].who === (selectedCharacter || "You") && (
                          <button
                            onClick={() => {
                              const last = log[log.length-1];
                              const answer = last.text.toLowerCase().includes("compound")
                                ? `${selected.label}: Nominal APR, compounded ${selected.m || 1}× per year.`
                                : selected.inflStory;
                              setLog((L) => [...L, { who: selected.label, text: answer }]);
                            }}
                            className="pixel-btn bg-amber-500 text-[#2b2331] hover:bg-amber-400"
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Choices appear only after animal speaks OR at start */}
                  {(log.length === 0 || (log[log.length-1].who === selected.label)) && (
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {selected.kind === "APR" && (
                        <button
                          onClick={() => setLog((L)=>[...L, { who: (selectedCharacter || "You"), text: `${selectedCharacter || "You"}: Could you tell me your compounding schedule?` }])}
                          className="pixel-btn"
                        >
                          Ask about compounding
                        </button>
                      )}
                      <button
                        onClick={() => setLog((L)=>[...L, { who: (selectedCharacter || "You"), text: `${selectedCharacter || "You"}: What’s your view on inflation right now?` }])}
                        className="pixel-btn"
                      >
                        Ask about inflation
                      </button>
                    </div>
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

"use client";

import React, { useState, useEffect } from "react";

/**
 * TVM Rocket — v5 with juicy FX + themed backgrounds
 * - One shared playfield rectangle; rocket never covered by bottom panel.
 * - Correct FX: green flash, rocket boost+glow, colorful particles, faster flames, sound.
 * - Wrong  FX: screen shake, rocket wobble, red/orange particles, lower tone.
 * - Themes: Lined Sky (default), Stars, Cloudline, Galaxy.
 */

const ROCKET_IMG = "/images/rocket.png"; // local rocket image

// UI constants
const PANEL_PCT = 45; // height % of bottom question panel - much larger for no scrolling
const TOP_MARGIN_PCT = 4; // keep headroom at the top

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function roundTo(value, dp = 2) { const p = Math.pow(10, dp); return Math.round(value * p) / p; }
function toPct(r, dp = 2) { return `${roundTo(r * 100, dp)}%`; }

// ---------- Background theme helper ----------
function themeClass(theme) {
  switch (theme) {
    case 'stars': return 'bg-stars';
    case 'nebula': return 'bg-nebula';
    case 'galaxy': return 'bg-galaxy';
    default: return 'bg-sky';
  }
}

// ------- Question generator with refined wording -------
function generateQuestion() {
  const PV = roundTo(randInt(50, 500) + Math.random(), 2);
  const r = roundTo((randInt(2, 15) / 100) + (Math.random() * 0.002), 4);
  const n = randInt(1, 10);
  const FV = roundTo(PV * Math.pow(1 + r, n), 2);

  const unknowns = ["FV", "PV", "r", "n"];
  const unknown = unknowns[randInt(0, unknowns.length - 1)];

  let prompt = ""; let correct; let formatter = (x) => x; let explain = "";

  if (unknown === "FV") {
    prompt = `You save $${PV} (PV) for ${n} years at an annual rate r = ${toPct(r)}. How much will you have (FV)?`;
    correct = roundTo(PV * Math.pow(1 + r, n), 2);
    formatter = (x) => `$${x.toFixed(2)}`;
    explain = `FV = PV · (1 + r)^n = ${PV} · (1 + ${r})^${n} = $${correct.toFixed(2)}`;
  } else if (unknown === "PV") {
    prompt = `You want $${FV} (FV) in ${n} years at r = ${toPct(r)} per year. How much should you deposit today (PV)?`;
    correct = roundTo(FV / Math.pow(1 + r, n), 2);
    formatter = (x) => `$${x.toFixed(2)}`;
    explain = `PV = FV / (1 + r)^n = ${FV} / (1 + ${r})^${n} = $${correct.toFixed(2)}`;
  } else if (unknown === "r") {
    prompt = `Your savings grow from PV = $${PV} to FV = $${FV} in ${n} years. What annual interest rate r achieves this?`;
    correct = roundTo(Math.pow(FV / PV, 1 / n) - 1, 4);
    formatter = (x) => toPct(x, 2);
    explain = `r = (FV/PV)^(1/n) − 1 = (${FV}/${PV})^(1/${n}) − 1 = ${toPct(correct, 2)}`;
  } else { // n
    prompt = `At r = ${toPct(r)} per year, how many years n to grow PV = $${PV} into FV = $${FV}?`;
    correct = roundTo(Math.log(FV / PV) / Math.log(1 + r), 2);
    formatter = (x) => `${x.toFixed(2)} years`;
    explain = `n = ln(FV/PV) / ln(1+r) = ln(${FV}/${PV}) / ln(1+${r}) = ${correct.toFixed(2)}`;
  }

  const opts = new Set([JSON.stringify(correct)]);
  while (opts.size < 2) {
    let noise;
    if (unknown === "r") noise = roundTo(correct * (1 + (Math.random() * 0.4 - 0.2)) + (Math.random() - 0.5) * 0.01, 4);
    else if (unknown === "n") noise = roundTo(Math.max(0.25, correct + (Math.random() - 0.5) * 2), 2);
    else noise = roundTo(Math.max(0.01, correct + (Math.random() - 0.5) * correct * 0.2), 2);
    opts.add(JSON.stringify(noise));
  }
  const options = Array.from(opts).map((s) => JSON.parse(s));
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }

  return { prompt, correct, options, formatter, unknown, explain };
}

// ------- App -------
export default function TVMRocketGame() {
  useGameStyles(); // Inject CSS styles on client side
  
  const [phase, setPhase] = useState("learn"); // learn | play | end
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(generateQuestion());
  const [score, setScore] = useState(0);
  const [lastExplain, setLastExplain] = useState("");

  // rocket free movement (percent of playfield)
  const [pos, setPos] = useState({ x: 50, y: PANEL_PCT + 6 }); // start just above question panel
  const TOTAL = 5;

  // effect state for visuals + audio
  const [fx, setFx] = useState({ type: "idle", t: 0 });

  // background theme
  const [theme, setTheme] = useState('sky'); // 'sky' | 'stars' | 'nebula' | 'galaxy'

  function nextQuestion() {
    if (qIndex + 1 >= TOTAL) { setPhase("end"); return; }
    setQIndex((i) => i + 1);
    setQuestion(generateQuestion());
    setFx({ type: "idle", t: Date.now() });
  }

  function nudgeRocket(correctHit) {
    if (!correctHit) return; // only move on correct
    const drift = randInt(-18, 18); // horizontal drift
    const verticalSpan = 100 - PANEL_PCT - TOP_MARGIN_PCT; // usable height
    const stepUp = verticalSpan / TOTAL; // per correct
    setPos((p) => ({ x: clamp(p.x + drift, 8, 92), y: clamp(p.y + stepUp, PANEL_PCT + 6, 100 - TOP_MARGIN_PCT) }));
  }

  // simple WebAudio bleeps
  function playTone(success = true) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = success ? "triangle" : "sawtooth";
      o.frequency.value = success ? 660 : 160;
      g.gain.value = 0.08;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      const dur = success ? 0.18 : 0.25;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur + 0.02);
    } catch (e) {}
  }

  function choose(option) {
    const tol = question.unknown === "r" ? 0.0001 : question.unknown === "n" ? 0.05 : 0.005;
    const isCorrect = Math.abs(option - question.correct) < tol;
    setLastExplain(question.explain);
    if (isCorrect) { setScore((s) => s + 1); nudgeRocket(true); setFx({ type: "correct", t: Date.now() }); playTone(true); }
    else { setFx({ type: "wrong", t: Date.now() }); playTone(false); }
    setTimeout(nextQuestion, 750);
  }

  function resetPlay() {
    setScore(0); setQIndex(0); setLastExplain("");
    setQuestion(generateQuestion());
    setPos({ x: 50, y: PANEL_PCT + 6 });
    setFx({ type: "idle", t: Date.now() });
    setPhase("play");
  }

  return (
    <div className="min-h-screen w-full bg-[#0b1020] text-white overflow-hidden font-pixel">
      <div className="relative mx-auto max-w-3xl px-4 py-6" style={{ minHeight: '100vh' }}>
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">TVM Rocket</h1>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 text-xs mr-2">
              <span className={`theme-chip ${theme==='sky'?'theme-active':''}`} onClick={()=>setTheme('sky')}>Sky</span>
              <span className={`theme-chip ${theme==='stars'?'theme-active':''}`} onClick={()=>setTheme('stars')}>Stars</span>
              <span className={`theme-chip ${theme==='nebula'?'theme-active':''}`} onClick={()=>setTheme('nebula')}>Nebula</span>
              <span className={`theme-chip ${theme==='galaxy'?'theme-active':''}`} onClick={()=>setTheme('galaxy')}>Galaxy</span>
            </div>
            <div className="text-sm opacity-80">
              {phase !== "learn" && (<span>Q{Math.min(qIndex + 1, TOTAL)} / {TOTAL} · Score {score}</span>)}
            </div>
          </div>
        </header>

        {phase === "learn" && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl bg-white/5 p-4 md:p-6 shadow-xl border border-white/10">
              <h2 className="text-lg font-bold mb-3">Time Value of Money — Quick Rules</h2>
              <ol className="list-decimal pl-5 space-y-2 text-base leading-7">
                <li>Future value: <b>FV = PV · (1 + r)^n</b></li>
                <li>Present value: <b>PV = FV ÷ (1 + r)^n</b></li>
              </ol>
              <div className="mt-3 text-sm opacity-80">r is the annual rate; n is in years.</div>
              <button onClick={() => setPhase("play")} className="mt-4 inline-flex items-center rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold shadow-lg">Start Quiz</button>
            </div>
            <Playfield pos={pos} idle onChoose={() => {}} question={null} fx={{type:"idle"}} theme={theme} />
          </div>
        )}

        {phase === "play" && (
          <Playfield pos={pos} question={question} onChoose={choose} fx={fx} theme={theme} hud={`Q${Math.min(qIndex + 1, TOTAL)}/${TOTAL} · Score ${score}`} lastExplain={lastExplain} />
        )}

        {phase === "end" && (
          <div className="rounded-2xl bg-white/5 p-6 shadow-xl border border-white/10">
            <h2 className="text-xl font-bold mb-2">Mission complete!</h2>
            <p className="opacity-90">You answered <b>{score}</b> out of <b>{TOTAL}</b> correctly.</p>
            <div className="mt-4">
              <button onClick={resetPlay} className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold shadow-lg">Play Again</button>
              <button onClick={() => setPhase("learn")} className="ml-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold">Back to Lesson</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------- Playfield (shared rectangle) -------
function Playfield({ pos, question, onChoose, hud, lastExplain, fx, theme, idle = false }) {
  return (
    <div className={`relative h-[600px] rounded-2xl border border-white/10 overflow-hidden shadow-xl ${themeClass(theme)} ${fx?.type === 'wrong' ? 'shake' : ''}`}>
      {/* rocket — free movement, always above panel */}
      <div className={`absolute transition-all duration-500 ease-out z-10 ${fx?.type === 'wrong' ? 'wobble' : ''}`} style={{ left: `${pos.x}%`, bottom: `${pos.y}%`, transform: "translate(-50%, 0)" }}>
        <Rocket boost={fx?.type === 'correct'} fail={fx?.type === 'wrong'} />
      </div>

      {/* HUD */}
      <div className="absolute right-2 top-2 text-xs px-2 py-1 rounded bg-black/40 z-20">{idle ? "Correct answers raise the rocket!" : hud}</div>

      {/* Screen flash overlay */}
      {fx?.type === 'correct' && <div className="absolute inset-0 bg-green-300/20 animate-flash z-20 pointer-events-none" />}
      {fx?.type === 'wrong' && <div className="absolute inset-0 bg-red-400/15 animate-flash z-20 pointer-events-none" />}

      {/* Particle bursts */}
      <Particles kind={fx?.type} origin={pos} />

      {/* ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-600/60 to-emerald-400/20" />

      {/* bottom question panel – fixed position */}
      <div className="absolute left-3 right-3 bottom-3" style={{ height: `${PANEL_PCT}%` }}>
        <div className="h-full rounded-xl bg-black/45 backdrop-blur-sm border border-white/10 p-4 overflow-y-auto">
          {!question ? (
            <div className="text-center text-base opacity-90">Lesson demo — quiz starts when you click Start.</div>
          ) : (
            <>
              <div className="text-sm opacity-90 mb-2">Find the missing variable: <span className="font-semibold">{question.unknown}</span></div>
              <div className="text-lg font-semibold leading-snug mb-3">{question.prompt}</div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                {question.options.map((opt, i) => (
                  <button key={i} onClick={() => onChoose(opt)} className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3 text-left font-medium transition-colors text-base">
                    {question.formatter(opt)}
                  </button>
                ))}
              </div>
              {lastExplain && (
                <div className="mt-3 p-3 rounded bg-white/5 text-xs leading-snug"><span className="font-semibold">Prev:</span> {lastExplain}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Rocket({ boost, fail }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={`flex flex-col items-center ${boost ? 'boost' : ''}`}>
      {imgOk ? (
        <img src={ROCKET_IMG} alt="rocket" className={`w-14 h-14 image-pixelated drop-shadow-[0_0_12px_rgba(0,200,255,0.8)] ${boost ? 'scale-110 rotate-3 glow' : ''}`} onError={() => setImgOk(false)} />
      ) : (
        <div className="text-4xl">🚀</div>
      )}
      {/* multi-flame exhaust */}
      <div className="relative mt-1 h-6 w-4">
        <span className={`flame flame1 ${boost ? 'flame-boost' : ''}`} />
        <span className={`flame flame2 ${boost ? 'flame-boost' : ''}`} />
        <span className={`flame flame3 ${boost ? 'flame-boost' : ''}`} />
      </div>
    </div>
  );
}

// Particle component
function Particles({ kind, origin }) {
  const [burst, setBurst] = useState([]);
  useEffect(() => {
    if (kind === 'correct' || kind === 'wrong') {
      const count = kind === 'correct' ? 20 : 12;
      const colors = kind === 'correct' ? ['#ffe066','#8aff80','#7cc4ff','#c792ea'] : ['#ff6b6b','#ffa94d'];
      const arr = Array.from({ length: count }).map((_, i) => ({
        id: i + '-' + Date.now(), x: origin.x, y: origin.y,
        dx: (Math.random() * 2 - 1) * 12,
        dy: (Math.random() * 2 + 4) * 1.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setBurst(arr);
      const to = setTimeout(() => setBurst([]), 600);
      return () => clearTimeout(to);
    }
  }, [kind, origin?.x, origin?.y]);

  return (
    <>
      {burst.map(p => (
        <span key={p.id} className="particle" style={{ left: p.x + '%', bottom: p.y + '%', '--dx': p.dx + 'px', '--dy': p.dy + 'px', background: p.color }} />
      ))}
    </>
  );
}

// CSS styles for the game
const gameStyles = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  .font-pixel { font-family: 'VT323', monospace; letter-spacing: 0.02em; }
  .image-pixelated { image-rendering: pixelated; }
  .glow { filter: drop-shadow(0 0 12px rgba(0,255,200,0.8)); }
  .animate-flash { animation: flash 180ms ease-out; }
  @keyframes flash { from { opacity: 0; } 50% { opacity: 1; } to { opacity: 0; } }
  .shake { animation: shake 280ms ease-in-out; }
  @keyframes shake { 0% { transform: translate(0,0); } 20% { transform: translate(-6px,2px); } 40% { transform: translate(6px,-2px); } 60% { transform: translate(-4px,3px);} 80% { transform: translate(4px,-3px);} 100%{ transform: translate(0,0);} }
  .wobble { animation: wobble 500ms ease-in-out; }
  @keyframes wobble { 0% { transform: translate(-50%,0) rotate(0deg); } 25% { transform: translate(-50%,0) rotate(-6deg);} 50% { transform: translate(-50%,0) rotate(6deg);} 100% { transform: translate(-50%,0) rotate(0deg);} }
  .boost { animation: boost 500ms ease-out; }
  @keyframes boost { 0% { transform: translateY(0) scale(1); } 30% { transform: translateY(2px) scale(1.08); } 100% { transform: translateY(0) scale(1); } }
  /* flames */
  .flame { position: absolute; bottom: 0; left: 50%; width: 6px; height: 14px; border-radius: 3px; transform: translateX(-50%); opacity: .9; filter: blur(0.6px); }
  .flame1 { background: linear-gradient(to bottom, #fffcdc, #ff8a00); animation: puff 700ms infinite; }
  .flame2 { background: linear-gradient(to bottom, #c0f5ff, #00b4ff); animation: puff 620ms infinite 100ms; width: 5px; }
  .flame3 { background: linear-gradient(to bottom, #d3ffcc, #28e07a); animation: puff 680ms infinite 200ms; width: 4px; }
  .flame-boost { animation-duration: 380ms !important; }
  @keyframes puff { 0% { transform: translate(-50%,0) scaleY(1); opacity: .95; } 100% { transform: translate(-50%,8px) scaleY(.5); opacity: .2; } }
  /* particles */
  .particle { position: absolute; width: 6px; height: 6px; border-radius: 1px; transform: translate(-50%, -50%); animation: burst 600ms ease-out forwards; z-index: 15; }
  @keyframes burst { from { opacity: 1; } to { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))); } }

  /* ----- Theme backgrounds ----- */
  .bg-sky { background: url('/images/sky-1.jpg') center/cover, radial-gradient(ellipse at center, rgba(12,20,50,.6), rgba(5,10,28,.9)), repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px); }
  .bg-stars { background-color:#0b1020; background-image: radial-gradient(#9cc1ff 1px, transparent 1px), radial-gradient(#6aa0ff 1px, transparent 1px), linear-gradient(to bottom, #0b1020 0%, #131a33 100%); background-size: 24px 24px, 24px 24px, auto; background-position: 0 0, 12px 12px, 0 0; image-rendering: pixelated; }
  .bg-nebula { background: url('/images/sky-2.png') center/cover, radial-gradient(ellipse at center, rgba(12,20,50,.6), rgba(5,10,28,.9)), repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px); }
  .bg-galaxy { background: radial-gradient(circle at 20% 30%, rgba(255, 153, 255, .25), transparent 40%), radial-gradient(circle at 70% 60%, rgba(80,170,255,.25), transparent 45%), linear-gradient(180deg, #0b1020 0%, #1c2450 60%, #2b1d5a 100%); }

  .theme-chip { user-select:none; cursor:pointer; padding:2px 8px; border-radius:8px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); }
  .theme-active { background: rgba(16,185,129,.25); border-color: rgba(16,185,129,.55); }
`;

// Hook to inject CSS styles on client side
function useGameStyles() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.innerHTML = gameStyles;
      document.head.appendChild(style);
      
      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    }
  }, []);
}

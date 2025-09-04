"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

/**
 * TVM Rocket — Week 4 (Cash Flow PV pack, intuitive Learn)
 * What's new vs Week 3:
 *  - Fully reworked Learn page with visual timelines, step‑by‑step worked examples,
 *    interactive sliders (r, n) for intuition, and "common pitfalls".
 *  - Same 6‑question quiz: 2× stream, 2× perpetuity, 2× annuity.
 *  - Keeps all juicy FX and themes with updated background images.
 */

const ROCKET_IMG = "/images/rocket.png"; // Updated to use local asset

// UI constants
const PANEL_PCT = 32; // height % of bottom question panel
const TOP_MARGIN_PCT = 4;  // keep headroom at the top
const TOTAL = 6;           // 2 per category

// ---------- Utils ----------
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function roundTo(value, dp = 2) { const p = Math.pow(10, dp); return Math.round(value * p) / p; }
function toPct(r, dp = 2) { return `${roundTo(r * 100, dp)}%`; }
const fmtMoney = (x, dp = 2) => `$${Number(x).toFixed(dp)}`;

// ---------- Background theme helper ----------
function themeClass(theme) {
  switch (theme) {
    case 'stars': return 'bg-stars';
    case 'cloud': return 'bg-cloud';
    case 'galaxy': return 'bg-galaxy';
    default: return 'bg-nebula'; // Changed default to nebula
  }
}

// ---------- CASH-FLOW QUESTION GENERATORS ----------
function genStreamPV() {
  // Random finite stream: 3–5 years, positive cash flows; end-of-year timing
  const years = randInt(3, 5);
  const r = roundTo(randInt(3, 12) / 100 + Math.random() * 0.002, 4);
  const Cs = Array.from({ length: years }, () => roundTo(randInt(40, 220) + Math.random(), 2));
  const pv = roundTo(Cs.reduce((acc, C, t) => acc + C / Math.pow(1 + r, t + 1), 0), 2);

  const prompt = `You will receive the following end-of-year cash flows for ${years} years at a discount rate r = ${toPct(r)}. What is the present value (PV) today?

` +
                 Cs.map((C, i) => `Year ${i + 1}: ${fmtMoney(C)}`).join(' · ');

  const explain = `PV = Σ C_t/(1+r)^t = ` +
    Cs.map((C, i) => `${fmtMoney(C)}/(1+${r})^${i + 1}`).join(' + ') +
    ` = ${fmtMoney(pv)}`;

  return makeOptions({ type: 'stream', correct: pv, prompt, explain, formatter: (x) => fmtMoney(x) });
}

function genPerpetuityPV() {
  // Level perpetuity starting one year from now
  const C = roundTo(randInt(20, 200) + Math.random(), 2);
  const r = roundTo(randInt(3, 12) / 100 + Math.random() * 0.002, 4);
  const pv = roundTo(C / r, 2);

  const prompt = `A level perpetuity pays ${fmtMoney(C)} each year forever, with the first payment one year from now. The discount rate is r = ${toPct(r)}. What is the present value (PV) today?`;
  const explain = `PV = C/r = ${fmtMoney(C)} / ${r} = ${fmtMoney(pv)}`;

  return makeOptions({ type: 'perpetuity', correct: pv, prompt, explain, formatter: (x) => fmtMoney(x) });
}

function genAnnuityPV() {
  // Ordinary annuity (end-of-year payments)
  const n = randInt(3, 10);
  const C = roundTo(randInt(30, 250) + Math.random(), 2);
  const r = roundTo(randInt(3, 12) / 100 + Math.random() * 0.002, 4);
  const pv = roundTo(C * (1 - Math.pow(1 + r, -n)) / r, 2);

  const prompt = `A level annuity pays ${fmtMoney(C)} at the end of each year for ${n} years. If the discount rate is r = ${toPct(r)}, what is the present value (PV) today?`;
  const explain = `PV = C * (1 - (1+r)^(-n)) / r = ${fmtMoney(C)} * (1 - (1+${r})^(-${n})) / ${r} = ${fmtMoney(pv)}`;

  return makeOptions({ type: 'annuity', correct: pv, prompt, explain, formatter: (x) => fmtMoney(x) });
}

function makeOptions({ type, correct, prompt, explain, formatter }) {
  // Build 4-option MC set around the correct PV
  const opts = new Set([JSON.stringify(correct)]);
  while (opts.size < 4) {
    // +/- noise of ~5-30% plus small absolute jitter
    const pctJitter = 1 + (Math.random() * 0.30 - 0.15);
    const absJitter = (Math.random() - 0.5) * 5;
    const candidate = roundTo(Math.max(0.01, correct * pctJitter + absJitter), 2);
    opts.add(JSON.stringify(candidate));
  }
  const options = Array.from(opts).map((s) => JSON.parse(s));
  // shuffle
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  return { type, prompt, correct, options, formatter, explain };
}

function generateQuizPack() {
  // Ensure exactly two of each type, then shuffle
  const qs = [genStreamPV(), genStreamPV(), genPerpetuityPV(), genPerpetuityPV(), genAnnuityPV(), genAnnuityPV()];
  for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
  return qs;
}

const TYPE_LABEL = { stream: "Cash-Flow Stream", perpetuity: "Perpetuity", annuity: "Annuity" };

// ------- App -------
export default function Chapter4Page() {
  return (
    <div className="min-h-screen bg-background">
      <section className="metallic-bg text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Chapter 4: Present Value of Cash Flows</h1>
          <p className="text-lg max-w-3xl">
            Master present value calculations for different cash flow patterns through interactive practice
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="card-minimal rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-3 text-foreground">Learning Objectives</h2>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>Calculate present value of finite cash flow streams</li>
                  <li>Understand perpetuity valuation and its applications</li>
                  <li>Master annuity present value calculations</li>
                  <li>Apply discounting principles to real-world scenarios</li>
                </ul>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Interactive Practice</h3>
                <p className="text-foreground mb-4">
                  This enhanced TVM Rocket game focuses on present value calculations for different cash flow patterns:
                </p>
                <ol className="list-decimal list-inside text-foreground space-y-2 mb-4">
                  <li><strong>Learn Mode:</strong> Interactive tutorials with visual timelines and step-by-step examples</li>
                  <li><strong>Practice Mode:</strong> 6 questions covering cash flow streams, perpetuities, and annuities</li>
                  <li><strong>Visual Feedback:</strong> Rocket movement, particle effects, and themed backgrounds</li>
                </ol>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => {
                      const gameContainer = document.getElementById('tvm-game-container');
                      if (gameContainer) {
                        gameContainer.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90"
                  >
                    Start TVM Rocket — Cash Flow PV Game
                  </button>
                </div>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Key Concepts Covered</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Cash Flow Streams</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Finite payment sequences</li>
                      <li>End-of-year timing</li>
                      <li>Sum of discounted cash flows</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Perpetuities</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Infinite payment streams</li>
                      <li>PV = C/r formula</li>
                      <li>First payment in year 1</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Annuities</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Fixed payments for n years</li>
                      <li>PV = C × (1-(1+r)^(-n))/r</li>
                      <li>End-of-year payments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Common Pitfalls</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Decimal vs percentage rates</li>
                      <li>Payment timing assumptions</li>
                      <li>Perpetuity start conditions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Navigation</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/teaching/335" className="text-[color:hsl(var(--primary))] hover:underline">
                      ← Back to Course Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-3" className="text-[color:hsl(var(--primary))] hover:underline">
                      ← Chapter 3: Time Value of Money
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Game Features</h3>
                <ul className="list-disc list-inside text-foreground space-y-1 text-sm">
                  <li>Interactive learning with visual timelines</li>
                  <li>Step-by-step worked examples</li>
                  <li>Multiple themed backgrounds</li>
                  <li>Real-time feedback and scoring</li>
                  <li>Mobile-responsive design</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="tvm-game-container" className="py-6">
        <div className="container mx-auto px-4">
          <div className="rounded-lg overflow-hidden border border-[color:hsl(var(--border))] bg-card">
            <TVMRocketGame />
          </div>
        </div>
      </section>
    </div>
  );
}

// ------- TVM Rocket Game Component -------
function TVMRocketGame() {
  useGameStyles(); // Inject CSS styles on client side

  const [phase, setPhase] = useState("learn"); // learn | play | end
  const [qIndex, setQIndex] = useState(0);
  const [quiz, setQuiz] = useState([]);
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [lastExplain, setLastExplain] = useState("");

  // rocket free movement (percent of playfield)
  const [pos, setPos] = useState({ x: 50, y: PANEL_PCT + 6 }); // start just above question panel

  // effect state for visuals + audio
  const [fx, setFx] = useState({ type: "idle", t: 0 });

  // background theme - changed default to nebula
  const [theme, setTheme] = useState('nebula'); // 'nebula' | 'stars' | 'cloud' | 'galaxy'

  function nextQuestion() {
    if (qIndex + 1 >= TOTAL) { setPhase("end"); return; }
    setQIndex((i) => i + 1);
    setQuestion(quiz[qIndex + 1]);
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
    const tol = 0.01; // cents tolerance for PV
    const isCorrect = Math.abs(option - question.correct) < tol;
    setLastExplain(question.explain);
    if (isCorrect) { setScore((s) => s + 1); nudgeRocket(true); setFx({ type: "correct", t: Date.now() }); playTone(true); }
    else { setFx({ type: "wrong", t: Date.now() }); playTone(false); }
    setTimeout(nextQuestion, 800);
  }

  function resetPlay() {
    const pack = generateQuizPack();
    setQuiz(pack);
    setQuestion(pack[0]);
    setScore(0); setQIndex(0); setLastExplain("");
    setPos({ x: 50, y: PANEL_PCT + 6 });
    setFx({ type: "idle", t: Date.now() });
    setPhase("play");
  }

  return (
    <div className="min-h-screen w-full bg-[#0b1020] text-white overflow-hidden font-pixel">
      <div className="relative mx-auto max-w-3xl px-4 py-6" style={{ minHeight: '100vh' }}>
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">TVM Rocket — Cash-Flow PV</h1>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 text-xs mr-2">
              <span className={`theme-chip ${theme==='nebula'?'theme-active':''}`} onClick={()=>setTheme('nebula')}>Nebula</span>
              <span className={`theme-chip ${theme==='stars'?'theme-active':''}`} onClick={()=>setTheme('stars')}>Stars</span>
              <span className={`theme-chip ${theme==='cloud'?'theme-active':''}`} onClick={()=>setTheme('cloud')}>Cloud</span>
              <span className={`theme-chip ${theme==='galaxy'?'theme-active':''}`} onClick={()=>setTheme('galaxy')}>Galaxy</span>
            </div>
            <div className="text-sm opacity-80">
              {phase !== "learn" && (<span>Q{Math.min(qIndex + 1, TOTAL)} / {TOTAL} · Score {score}</span>)}
            </div>
          </div>
        </header>

        {phase === "learn" && (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <LearnPanel onStart={resetPlay} />
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

// ------- Learn Panel (intuitive) -------
function LearnPanel({ onStart }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 md:p-6 shadow-xl border border-white/10">
      <h2 className="text-lg font-bold mb-3">Present Value — Intuition First</h2>
      <p className="text-base leading-7 mb-3">Money <em>later</em> is worth less than money <em>today</em>. PV tells us the fair price <strong>today</strong> for future cash flows by shrinking each future payment using the rate <span className="whitespace-nowrap">r</span>.</p>

      <ConceptCard
        title="Cash‑Flow Stream (finite)"
        subtitle="Different amounts for a few years"
        summary="Discount each yearly payment back to today and add them up."
        formula={<span>PV = Σ C<sub>t</sub>/(1+r)<sup>t</sup></span>}
        exampleGenerator={makeStreamExample}
        timelineGenerator={(ex) => (
          <Timeline years={ex.years} labels={Array.from({length: ex.years+1},(_,i)=>i.toString())} payments={ex.Cs} />
        )}
      />

      <ConceptCard
        title="Perpetuity (level)"
        subtitle="Same amount every year forever"
        summary="Because payments never stop, the PV is like price = payment ÷ rate. First payment arrives in 1 year."
        formula={<span>PV = C / r</span>}
        exampleGenerator={makePerpetuityExample}
        interactive={(ex, setEx) => (
          <div className="mt-2 text-sm">
            <label className="block mb-2">r: <b>{toPct(ex.r)}</b>
              <input type="range" min={0.02} max={0.15} step={0.005} value={ex.r}
                onChange={(e)=> setEx({...ex, r: Number(e.target.value), pv: roundTo(ex.C / Number(e.target.value),2)})}
                className="w-full" />
            </label>
          </div>
        )}
        timelineGenerator={(ex) => (
          <Timeline years={6} infinite labels={["0","1","2","3","4","5","⋯"]} payments={Array(6).fill(ex.C)} />
        )}
      />

      <ConceptCard
        title="Annuity (level)"
        subtitle="Same amount every year for n years"
        summary="End‑of‑year payments. Like a short perpetuity that stops after n years."
        formula={<span>PV = C · (1 − (1+r)<sup>−n</sup>) / r</span>}
        exampleGenerator={makeAnnuityExample}
        interactive={(ex, setEx) => (
          <div className="grid grid-cols-2 gap-3 text-sm mt-2">
            <label>r: <b>{toPct(ex.r)}</b>
              <input type="range" min={0.02} max={0.15} step={0.005} value={ex.r}
                onChange={(e)=> setEx(recalcAnnuity(ex, { r: Number(e.target.value) }))}
                className="w-full" />
            </label>
            <label>n: <b>{ex.n}</b>
              <input type="range" min={3} max={15} step={1} value={ex.n}
                onChange={(e)=> setEx(recalcAnnuity(ex, { n: Number(e.target.value) }))}
                className="w-full" />
            </label>
          </div>
        )}
        timelineGenerator={(ex) => (
          <Timeline years={ex.n} labels={Array.from({length: ex.n+1},(_,i)=>i.toString())} payments={Array(ex.n).fill(ex.C)} />
        )}
      />

      <div className="mt-4 p-3 rounded-xl bg-white/5 text-sm leading-6">
        <div className="font-semibold mb-1">Common pitfalls</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use <b>decimal</b> r in formulas (e.g., 8% → 0.08).</li>
          <li>Assume <b>end‑of‑year</b> timing unless stated. If payments start today (annuity‑due), multiply annuity PV by (1+r).</li>
          <li>Perpetuity payments must start in 1 year for PV=C/r to apply.</li>
        </ul>
      </div>

      <button onClick={onStart} className="mt-5 inline-flex items-center rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold shadow-lg">Start Cash‑Flow Quiz</button>
    </div>
  );
}

function ConceptCard({ title, subtitle, summary, formula, exampleGenerator, interactive, timelineGenerator }) {
  const [ex, setEx] = useState(exampleGenerator());
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-emerald-300 font-semibold">{title}</div>
          <div className="text-xs opacity-80 mb-1">{subtitle}</div>
        </div>
        <button className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=> setEx(exampleGenerator())}>New example</button>
      </div>
      <div className="text-base leading-7 mt-1">{summary}</div>
      <div className="mt-2 text-sm"><span className="font-semibold">Formula:</span> {formula}</div>

      {/* Timeline visual */}
      <div className="mt-3">
        {timelineGenerator && timelineGenerator(ex)}
      </div>

      {/* Interactive controls (sliders) */}
      {interactive && (
        <div className="mt-2">{interactive(ex, setEx)}</div>
      )}

      {/* Worked steps */}
      <ExampleBlock ex={ex} />
    </div>
  );
}

function ExampleBlock({ ex }) {
  return (
    <div className="mt-3 p-3 rounded bg-white/5 text-sm leading-6">
      {ex.type === 'stream' && (
        <>
          <div><span className="font-semibold">Example:</span> r = {toPct(ex.r)}, payments: {ex.Cs.map(c=>fmtMoney(c)).join(', ')}</div>
          <div className="mt-1">PV = {ex.Cs.map((C,i)=> `${fmtMoney(C)}/(1+${ex.r})^${i+1}`).join(' + ')} = <b>{fmtMoney(ex.pv)}</b></div>
        </>
      )}
      {ex.type === 'perpetuity' && (
        <>
          <div><span className="font-semibold">Example:</span> C = {fmtMoney(ex.C)}, r = {toPct(ex.r)}</div>
          <div className="mt-1">PV = C/r = {fmtMoney(ex.C)} / {ex.r} = <b>{fmtMoney(ex.pv)}</b></div>
        </>
      )}
      {ex.type === 'annuity' && (
        <>
          <div><span className="font-semibold">Example:</span> C = {fmtMoney(ex.C)}, n = {ex.n}, r = {toPct(ex.r)}</div>
          <div className="mt-1">PV = C·(1 − (1+r)<sup>−n</sup>)/r = {fmtMoney(ex.C)}·(1 − (1+{ex.r})<sup>−{ex.n}</sup>)/{ex.r} = <b>{fmtMoney(ex.pv)}</b></div>
        </>
      )}
    </div>
  );
}

function Timeline({ years, labels = [], payments = [], infinite = false }) {
  // labels length can be years+1 (include t=0), payments length = years (t=1..years)
  const maxYears = Math.min(years, 12);
  const ticks = Array.from({ length: maxYears + 1 }, (_, i) => i);
  const showLabels = labels.length ? labels.slice(0, maxYears + 1) : ticks.map(String);
  return (
    <div className="timeline">
      <div className="timeline-bar" />
      <div className="flex justify-between text-xs opacity-80">
        {showLabels.map((lab, i) => (
          <div key={i} className="timeline-tick">
            <div className="tick" />
            <div className="mt-1">{lab}</div>
            {i>0 && payments[i-1] !== undefined && (
              <div className="paychip">{fmtMoney(payments[i-1])}</div>
            )}
          </div>
        ))}
        {infinite && (
          <div className="timeline-tick w-6 text-center">⋯</div>
        )}
      </div>
    </div>
  );
}

// ------- Example data helpers -------
function makeStreamExample() {
  const years = randInt(3,5);
  const r = roundTo(randInt(3,12)/100 + Math.random()*0.002, 4);
  const Cs = Array.from({length: years}, () => roundTo(randInt(40, 200) + Math.random(), 2));
  const pv = roundTo(Cs.reduce((acc,C,i)=> acc + C / Math.pow(1+r, i+1), 0), 2);
  return { type:'stream', years, r, Cs, pv };
}
function makePerpetuityExample() {
  const C = roundTo(randInt(20, 180) + Math.random(), 2);
  const r = roundTo(randInt(3,12)/100 + Math.random()*0.002, 4);
  const pv = roundTo(C / r, 2);
  return { type:'perpetuity', C, r, pv };
}
function makeAnnuityExample() {
  const C = roundTo(randInt(30, 220) + Math.random(), 2);
  const n = randInt(4, 10);
  const r = roundTo(randInt(3,12)/100 + Math.random()*0.002, 4);
  const pv = roundTo(C * (1 - Math.pow(1 + r, -n)) / r, 2);
  return { type:'annuity', C, n, r, pv };
}
function recalcAnnuity(ex, patch) {
  const C = patch.C ?? ex.C;
  const n = patch.n ?? ex.n;
  const r = patch.r ?? ex.r;
  return { ...ex, ...patch, pv: roundTo(C * (1 - Math.pow(1 + r, -n)) / r, 2) };
}

// ------- Playfield (shared rectangle) -------
function Playfield({ pos, question, onChoose, hud, lastExplain, fx, theme, idle = false }) {
  return (
    <div className={`relative w-full max-w-lg mx-auto rounded-2xl border border-white/10 overflow-hidden shadow-xl ${themeClass(theme)} ${fx?.type === 'wrong' ? 'shake' : ''}`} style={{ aspectRatio: '9/14', height: 'auto' }}>
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
              <div className="text-xs mb-1 opacity-80 tracking-wide">Type: <span className="font-semibold">{TYPE_LABEL[question.type]}</span></div>
              <div className="text-lg font-semibold leading-snug mb-3 whitespace-pre-line">{question.prompt}</div>
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

// CSS styles for the game + learn visuals
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
  .bg-nebula { background: url('/images/sky-2.png') center/cover, radial-gradient(ellipse at center, rgba(12,20,50,.6), rgba(5,10,28,.9)), repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px); }
  .bg-stars { background: url('/images/sky-3.jpg') center/cover, radial-gradient(ellipse at center, rgba(12,20,50,.6), rgba(5,10,28,.9)), repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px); }
  .bg-cloud { background: url('/images/cloud.avif') center/cover, radial-gradient(ellipse at center, rgba(12,20,50,.6), rgba(5,10,28,.9)), repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px); }
  .bg-galaxy { background: radial-gradient(circle at 20% 30%, rgba(255, 153, 255, .25), transparent 40%), radial-gradient(circle at 70% 60%, rgba(80,170,255,.25), transparent 45%), linear-gradient(180deg, #0b1020 0%, #1c2450 60%, #2b1d5a 100%); }

  .theme-chip { user-select:none; cursor:pointer; padding:2px 8px; border-radius:8px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); }
  .theme-active { background: rgba(16,185,129,.25); border-color: rgba(16,185,129,.55); }

  /* ----- Learn timeline visuals ----- */
  .timeline { position: relative; }
  .timeline-bar { height: 2px; background: rgba(255,255,255,.25); margin: 8px 2px 6px; }
  .timeline-tick { position: relative; min-width: 24px; }
  .tick { width: 1px; height: 8px; background: rgba(255,255,255,.4); margin: 0 auto; }
  .paychip { margin-top: 4px; padding: 2px 6px; border-radius: 8px; background: rgba(16,185,129,.18); border: 1px solid rgba(16,185,129,.45); display: inline-block; }
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
"use client";

import React, { useEffect, useMemo, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

// ===================== PALETTE =====================

const TIF_PAGE = "#F8E0D9"; // page bg - Light Pink

const TIF = "#90D9D0"; // Light Teal (primary)

const TIF_DARK = "#2AA69A"; // Medium Teal - accents & buttons

const SLATE = "#274248"; // Dark Teal - dark text

// Per-step folder colors

const STEP_THEME: Record<number, { fill: string; stroke: string }> = {

  1: { fill: "#F8E0D9", stroke: "#E89B8D" }, // Light Pink fill, Coral Pink stroke

  2: { fill: "#90D9D0", stroke: "#2AA69A" }, // Light Teal fill, Medium Teal stroke

  3: { fill: "#F7C86F", stroke: "#274248" }, // Golden Yellow fill, Dark Teal stroke

  4: { fill: "#F8E0D9", stroke: "#274248" }, // Light Pink fill, Dark Teal stroke

};

// More vivid actionable color for submits

const SUBMIT_COLOR = "#F7C86F"; // Golden Yellow

const SUBMIT_BORDER = "#274248"; // Dark Teal

// ===================== TYPES & DATA =====================

type Ticker = "AAPL" | "MSFT" | "NVDA" | "TSLA" | "KO"; // FIVE stocks only

type Stock = {

  ticker: Ticker;

  name: string;

  sector: "Tech" | "Auto" | "Staples";

  r: number; // single-period realized return (decimal)

  sd: number; // single-period SD (decimal)

  beta: number; // CAPM beta

};

type Universe = Record<Ticker, Stock>;

type Correl = Record<Ticker, Record<Ticker, number>>; // symmetric corr matrix

const BASE_STOCKS: Universe = {

  AAPL: { ticker: "AAPL", name: "Apple", sector: "Tech", r: 0.034, sd: 0.045, beta: 1.18 },

  MSFT: { ticker: "MSFT", name: "Microsoft", sector: "Tech", r: 0.028, sd: 0.040, beta: 1.05 },

  NVDA: { ticker: "NVDA", name: "NVIDIA", sector: "Tech", r: 0.055, sd: 0.070, beta: 1.60 },

  TSLA: { ticker: "TSLA", name: "Tesla", sector: "Auto", r: 0.041, sd: 0.090, beta: 1.90 },

  KO:   { ticker: "KO",   name: "Coca‑Cola", sector: "Staples", r: 0.012, sd: 0.020, beta: 0.65 },

};

// Correlations — tech↔tech high, cross‑sector lower, staples with low tech corr

const BASE_CORR: Correl = {

  AAPL: { AAPL: 1, MSFT: 0.78, NVDA: 0.70, TSLA: 0.45, KO: 0.18 },

  MSFT: { AAPL: 0.78, MSFT: 1, NVDA: 0.72, TSLA: 0.42, KO: 0.16 },

  NVDA: { AAPL: 0.70, MSFT: 0.72, NVDA: 1, TSLA: 0.50, KO: 0.12 },

  TSLA: { AAPL: 0.45, MSFT: 0.42, NVDA: 0.50, TSLA: 1, KO: 0.08 },

  KO:   { AAPL: 0.18, MSFT: 0.16, NVDA: 0.12, TSLA: 0.08, KO: 1 },

};

// ===================== HELPERS =====================

const toPct = (x: number) => x * 100;

const to2 = (x: number) => Number.parseFloat(x.toFixed(2));

function portfolioReturn(weights: Record<Ticker, number>, u: Universe) {

  return (Object.keys(weights) as Ticker[]).reduce((s, t) => s + (weights[t] || 0) * u[t].r, 0);

}

function portfolioVariance(weights: Record<Ticker, number>, u: Universe, corr: Correl) {

  const tickers = Object.keys(weights) as Ticker[];

  let v = 0;

  for (let i = 0; i < tickers.length; i++) {

    const ti = tickers[i];

    const wi = weights[ti] || 0;

    const sdi = u[ti].sd;

    v += wi * wi * sdi * sdi;

    for (let j = i + 1; j < tickers.length; j++) {

      const tj = tickers[j];

      const wj = weights[tj] || 0;

      const sdj = u[tj].sd;

      const cij = corr[ti][tj];

      v += 2 * wi * wj * cij * sdi * sdj;

    }

  }

  return v; // variance in decimal^2

}

// ===================== FOLDER SHAPE =====================

function FolderShape({ width = 1100, height = 640, color, stroke, pad = 28, children, }:{ width?: number; height?: number; color: string; stroke: string; pad?: number; children?: React.ReactNode; }) {

  const r = 18; const w = width; const h = height;

  const d = [ `M ${r} 0`, `H ${w - r}`, `Q ${w} 0 ${w} ${r}`, `V ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`, `H ${r}`, `Q 0 ${h} 0 ${h - r}`, `V ${r}`, `Q 0 0 ${r} 0`, ].join(" ");

  return (

    <div className="relative w-full" style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.15))" }}>

      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="rounded-[20px] block">

        <path d={d} fill={color} stroke={stroke} strokeWidth={2} />

      </svg>

      <div className="absolute left-0 top-0 w-full h-full"><div className="h-full" style={{ padding: pad }}>{children}</div></div>

    </div>

  );

}

function FolderTabRight({ top, height = 80, color, stroke, label, isActive, isLocked, onClick, }:{ top: number; height?: number; color: string; stroke: string; label: string; isActive: boolean; isLocked: boolean; onClick?: () => void; }) {

  const w = 60; const r = 8; const tabColor = isActive ? color : (isLocked ? "#E0E0E0" : color); const tabStroke = isActive ? stroke : (isLocked ? "#B0B0B0" : stroke); const textColor = isLocked ? "#999" : (isActive ? "#16333A" : "#666");

  return (

    <div className="absolute cursor-pointer transition-all hover:scale-105" style={{ right: -w + 8, top, width: w, height, zIndex: isActive ? 40 : 30, opacity: isLocked ? 0.5 : 1 }} onClick={!isLocked ? onClick : undefined}>

      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} style={{ filter: isActive ? "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" : "drop-shadow(0 1px 3px rgba(0,0,0,0.1))" }}>

        <path d={`M ${r} 0 H ${w} V ${height - r} Q ${w} ${height} ${w - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} V ${r} Q 0 0 ${r} 0 Z`} fill={tabColor} stroke={tabStroke} strokeWidth={isActive ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />

        <line x1="0" y1={r} x2="0" y2={height - r} stroke={tabColor} strokeWidth={4} />

      </svg>

      <div className="absolute inset-0 flex items-center justify-center" style={{ writingMode: "vertical-rl", textOrientation: "mixed", fontSize: "12px", fontWeight: isActive ? "bold" : "semibold", color: textColor }}>{label}</div>

    </div>

  );

}

function StepShell({ color, stroke, currentStep, maxUnlockedStep, onStepClick, children }: { color: string; stroke: string; currentStep: number; maxUnlockedStep: number; onStepClick: (step: number) => void; children: React.ReactNode; }) {

  const tabHeight = 75; const tabSpacing = 8; const startTop = 80;

  return (

    <div className="relative w-full max-w-6xl">

      <div className="absolute -top-6 -left-6 -z-10 opacity-70"><FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} /></div>

      <div className="absolute -top-3 left-6 -z-10 opacity-60"><FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} /></div>

      <div className="relative">

        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={34}>{children}</FolderShape>

        {[1,2,3,4].map((step)=>{

          const stepTheme = STEP_THEME[step]; const isActive = step===currentStep; const isLocked = step>maxUnlockedStep; const top = startTop + (step-1)*(tabHeight+tabSpacing);

          return <FolderTabRight key={step} top={top} height={tabHeight} color={stepTheme.fill} stroke={stepTheme.stroke} label={`Step ${step}`} isActive={isActive} isLocked={isLocked} onClick={()=>onStepClick(step)} />

        })}

      </div>

    </div>

  );

}

const pageVariants = { enter: { x: 80, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -80, opacity: 0 } };

// ===================== MODAL =====================

function Modal({ open, onClose, children }:{ open:boolean; onClose:()=>void; children:React.ReactNode }){

  if(!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-[90%] p-6">

        {children}

        <div className="mt-4 text-right">

          <button className="px-4 py-2 rounded-xl text-white font-semibold hover:brightness-110 hover:shadow-lg" style={{background: SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}} onClick={onClose}>Got it</button>

        </div>

      </div>

    </div>

  );

}

// ===================== APP =====================

export default function PortfolioCovarianceLab(){

  const [universe, setUniverse] = useState<Universe>(BASE_STOCKS);

  const [corr, setCorr] = useState<Correl>(BASE_CORR);

  const [step, setStep] = useState<1|2|3|4>(1);

  // Scenario knobs for CAPM (shown in Step 4 but set here)

  const [rf, setRf] = useState(0.02); // 2%

  const [mrp, setMrp] = useState(0.055); // market risk premium 5.5%

  // MAIN pick (Step 1)

  const [main, setMain] = useState<Ticker | null>(null);

  // Fixed selection: all five stocks

  const allTickers = Object.keys(universe) as Ticker[];

  // Weights (Step 2): default equal 20%

  const [weightsPct, setWeightsPct] = useState<Record<Ticker, number>>({AAPL:20, MSFT:20, NVDA:20, TSLA:20, KO:20});

  const weightSum = useMemo(()=> allTickers.reduce((s,t)=> s + (Math.trunc(weightsPct[t]||0)), 0), [weightsPct]);

  const weightsDec = useMemo(()=>{ const out:Record<Ticker,number>={AAPL:0,MSFT:0,NVDA:0,TSLA:0,KO:0}; allTickers.forEach(t=> out[t]=(Math.trunc(weightsPct[t]||0))/100); return out; },[weightsPct]);

  // Derived: portfolio return & risk (for checking in Step 3 after submit)

  const pRet = useMemo(()=> portfolioReturn(weightsDec, universe), [weightsDec, universe]);

  const pVar = useMemo(()=> portfolioVariance(weightsDec, universe, corr), [weightsDec, universe, corr]);

  const pSd = Math.sqrt(pVar);

  // Step gates

  const [s1, setS1] = useState(false); const [s2, setS2] = useState(false); const [s3, setS3] = useState(false); const [s4, setS4] = useState(false);

  const canNext=(s:1|2|3)=> (s===1&&s1) || (s===2&&s2) || (s===3&&s3);

  const maxUnlockedStep = (s1?2:1) + (s2?1:0) + (s3?1:0);

  const goToStep=(t:1|2|3|4)=>{ if(t<=maxUnlockedStep) setStep(t); };

  // Answers & inputs

  const [ans2, setAns2] = useState<string | null>(null);

  const [rpGuess, setRpGuess] = useState<string>("");

  const [rpChecked, setRpChecked] = useState<boolean>(false);

  const [corrPair, setCorrPair] = useState<[Ticker, Ticker] | null>(null);

  const [varGuess, setVarGuess] = useState<string>("");

  const [ans3, setAns3] = useState<string | null>(null);

  const [capmGuess, setCapmGuess] = useState<string>("");

  const [ans4, setAns4] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  function normalizeWeights(){

    // Keep integer-only normalization

    const sum = allTickers.reduce((s,t)=> s + Math.trunc(weightsPct[t]||0), 0) || 1;

    const next: Record<Ticker, number> = { ...weightsPct };

    allTickers.forEach(t=>{ next[t] = Math.round((Math.trunc(weightsPct[t]||0)/sum)*100); });

    setWeightsPct(next);

  }

  function reshuffleScenario(){

    const jitter = (x:number, p=0.2)=> x*(1 + (Math.random()*2-1)*p*0.2);

    const nextU:Universe = { } as Universe;

    (Object.keys(universe) as Ticker[]).forEach(t=>{

      const s = universe[t];

      nextU[t] = { ...s, r: jitter(s.r,0.3), sd: Math.max(0.012, jitter(s.sd,0.25)), beta: Math.max(0.4, jitter(s.beta,0.25)) };

    });

    setUniverse(nextU); setCorr(BASE_CORR);

    setMain(null); setWeightsPct({AAPL:20,MSFT:20,NVDA:20,TSLA:20,KO:20});

    setS1(false); setS2(false); setS3(false); setS4(false);

    setAns2(null); setAns3(null); setAns4(null); setRpGuess(""); setRpChecked(false);

    setStep(1);

  }

  // ---------- STEP ACTIONS ----------

  function submit1(){

    if(!main){ alert("Pick your main stock."); return; }

    setS1(true);

  }

  function submit2(){

    // Enforce integers, main>0, sum==100, and require student's Rp

    const ints: Record<Ticker, number> = { ...weightsPct } as any;

    allTickers.forEach(t=>{ const v = Math.trunc(Number(ints[t])); ints[t] = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0; });

    setWeightsPct(ints);

    if(!main){ alert("Pick your main stock first."); return; }

    if((ints[main]||0) <= 0){ alert("Your main stock's weight must be an integer greater than 0%."); return; }

    const sum = allTickers.reduce((s,t)=> s + (ints[t]||0), 0);

    if(sum < 100){ alert(`Weights must sum to 100%. They are currently ${sum}% (too low).`); return; }

    if(sum > 100){ alert(`Weights must sum to 100%. They are currently ${sum}% (too high).`); return; }

    const trueRpPct = to2(toPct(portfolioReturn(Object.fromEntries(allTickers.map(t=> [t, (ints[t]||0)/100])) as Record<Ticker,number>, universe)));

    const g = parseFloat(rpGuess||"NaN");

    if(!Number.isFinite(g)) { alert("Please enter your Rₚ (%) before submitting."); return; }

    const ok = Math.abs(g - trueRpPct) <= 0.1; // ±0.1pp

    const lines = allTickers.map(t=>{ const w=ints[t]; const r=universe[t].r; const contrib=(w/100)*r; return `${t}: w=${w}%, R=${to2(toPct(r))}%, w·R=${to2(toPct(contrib))}%`; });

    const verdict = ok ? "✅ Correct" : `❌ Not quite (your ${to2(g)}% vs hidden true ${trueRpPct}%).`;

    setAns2(lines.join("\n") + "\n\nRₚ check → " + verdict);

    setRpChecked(true);

    setS2(true);

  }

  function submit3(){

    if(!corrPair){ alert("Pick a pair to view the given correlation."); return; }

    // Students provide only Var(Rp). We do NOT reveal answers before submit.

    const v = parseFloat(varGuess||"NaN"); // expect %^2

    if(!Number.isFinite(v)){ alert("Please enter your Var(Rₚ) in %² before submitting."); return; }

    const vTrue = toPct(toPct(pVar)); // variance in (%^2)

    const vOK = Math.abs((v||0)-vTrue) <= Math.max(0.01, 0.05*vTrue);

    const [a,b] = corrPair; const givenC = corr[a][b];

    const msg = `${vOK?"✅":"❌"} Var(Rₚ): your ${to2(v||0)} (%^2) → ${to2(vTrue)} (%^2)\n\nGiven Corr(${a},${b}) = ${to2(givenC*100)}%\nVar(Rₚ) = Σ wᵢ² σᵢ² + 2 Σ_{i<j} wᵢ wⱼ ρᵢⱼ σᵢ σⱼ`;

    setAns3(msg);

    setS3(true);

  }

  function submit4(){

    if(!main) return;

    const beta = universe[main].beta; const trueER = rf + beta * mrp; // CAPM

    const g = parseFloat(capmGuess||"NaN")/100; const ok = Math.abs((g||0)-trueER) <= 0.003; // ~0.3pp

    const msg = `${ok?"✅":"❌"} E[R_${main}] = r_f + β (E[R_m]-r_f) = ${to2(rf*100)}% + ${beta.toFixed(2)} × ${to2(mrp*100)}% = ${to2(trueER*100)}%`;

    setAns4(msg);

    setS4(true);

  }

  useEffect(()=>{ // default pair suggestion once main set

    if(main){ const b = allTickers.find(t=> t!==main)!; setCorrPair([main, b]); }

  },[main]);

  // ===================== DEV TESTS =====================

  useEffect(()=>{

    // T1: newline join works

    const demo = ["A","B","C"].join("\n") + "\nEND";

    console.assert(demo === "A\nB\nC\nEND", "[Test] newline join should match");

    // T2: variance non-negative

    const wEq: Record<Ticker,number> = {AAPL:0.2,MSFT:0.2,NVDA:0.2,TSLA:0.2,KO:0.2};

    const v2 = portfolioVariance(wEq, universe, BASE_CORR);

    console.assert(v2 >= 0, "[Test] Var >= 0");

    // T3: CAPM arithmetic stable

    const er = rf + universe.AAPL.beta * mrp;

    console.assert(Math.abs(er - (rf + universe.AAPL.beta*mrp)) < 1e-10, "[Test] CAPM calc stable");

  },[universe, rf, mrp]);

  // ===================== RENDER =====================

  return (

    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: TIF_PAGE }}>

      <AnimatePresence mode="wait">

        {/* ===================== STEP 1 ===================== */}

        {step===1 && (

          <motion.section key="s1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>

            <StepShell color={STEP_THEME[1].fill} stroke={STEP_THEME[1].stroke} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>

              <div className="p-6">

                <div className="flex items-start justify-between mb-3">

                  <h1 className="text-3xl md:text-4xl font-bold" style={{color:SLATE}}>Step 1 — Pick your main stock</h1>

                  <button onClick={reshuffleScenario} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Try different example</button>

                </div>

                {/* Only company names here */}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                  {allTickers.map((t)=> (

                    <button key={t} onClick={()=> setMain(t)} className={`rounded-2xl px-4 py-8 shadow transition text-center font-semibold border ${main===t?"scale-[1.02]" : "hover:scale-[1.02]"}`} style={{ background: main===t?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.4)", color: SLATE, borderColor: STEP_THEME[1].stroke }}>

                      {t}

                    </button>

                  ))}

                </div>

                <div className="mt-6 flex items-center justify-between">

                  <div className="text-sm" style={{ color: SLATE }}>Selected main: {main ?? "—"}</div>

                  <div className="flex gap-2">

                    <button onClick={submit1} className={`px-4 py-2 rounded-xl text-white font-semibold shadow hover:brightness-110 hover:shadow-lg`} style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    <button onClick={()=> canNext(1) && setStep(2)} disabled={!canNext(1)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(1)?"hover:brightness-110 hover:shadow-lg":"opacity-50 cursor-not-allowed"}`} style={{background:SLATE}}>→</button>

                  </div>

                </div>

              </div>

            </StepShell>

          </motion.section>

        )}

        {/* ===================== STEP 2 ===================== */}

        {step===2 && (

          <motion.section key="s2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>

            <StepShell color={STEP_THEME[2].fill} stroke={STEP_THEME[2].stroke} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>

              <div className="p-6">

                <div className="flex items-start justify-between mb-4">

                  <h2 className="text-2xl md:text-3xl font-bold" style={{color:SLATE}}>Step 2 — Set portfolio weights & compute R<sub>p</sub></h2>

                  <div className="flex gap-2">

                    <button onClick={()=> setStep(1)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>

                    <button onClick={normalizeWeights} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Normalize</button>

                    <button onClick={submit2} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background: SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    <button onClick={()=> canNext(2) && setStep(3)} disabled={!canNext(2)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(2)?"hover:brightness-110 hover:shadow-lg":"opacity-50 cursor-not-allowed"}`} style={{background:SLATE}}>→</button>

                  </div>

                </div>

                <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: STEP_THEME[2].fill, borderColor: STEP_THEME[2].stroke}}>

                  <table className="w-full text-sm">

                    <thead style={{ background: "rgba(255,255,255,0.3)" }}>

                      <tr className="text-left">

                        <th className="p-3" style={{color:SLATE}}>Ticker</th>

                        <th className="p-3" style={{color:SLATE}}>Sector</th>

                        <th className="p-3" style={{color:SLATE}}>R<sub>i</sub> (%)</th>

                        <th className="p-3" style={{color:SLATE}}>σ<sub>i</sub> (%)</th>

                        <th className="p-3" style={{color:SLATE}}>β<sub>i</sub></th>

                        <th className="p-3" style={{color:SLATE}}>Weight (%)</th>

                        <th className="p-3" style={{color:SLATE}}>Corr with {main||"—"}</th>

                        <th className="p-3" style={{color:SLATE}}>w<sub>i</sub>·R<sub>i</sub> (%)</th>

                      </tr>

                    </thead>

                    <tbody>

                      {allTickers.map(t=>{

                        const s = universe[t]; const w = Math.trunc(weightsPct[t]||0); const contrib=(w/100)*s.r;

                        const showCorr = main? `${to2(corr[t][main]*100)}%` : "–";

                        return (

                          <tr key={t} className="border-t" style={{borderColor:STEP_THEME[2].stroke}}>

                            <td className="p-3" style={{color:SLATE}}>{t}</td>

                            <td className="p-3" style={{color:SLATE}}>{s.sector}</td>

                            <td className="p-3" style={{color:SLATE}}>{to2(toPct(s.r))}</td>

                            <td className="p-3" style={{color:SLATE}}>{to2(toPct(s.sd))}</td>

                            <td className="p-3" style={{color:SLATE}}>{s.beta.toFixed(2)}</td>

                            <td className="p-3">

                              <input type="number" step={1} min={0} max={100} value={w}

                                onChange={(e)=> {

                                  const v = Math.trunc(Number(e.target.value));

                                  setWeightsPct(prev=> ({...prev, [t]: Number.isFinite(v)? Math.max(0, Math.min(100, v)) : 0}));

                                }}

                                className="w-24 rounded-xl px-2 py-1 border bg-white"/>

                            </td>

                            <td className="p-3" style={{color:SLATE}}>{showCorr}</td>

                            <td className="p-3" style={{color:SLATE}}>{to2(toPct(contrib))}</td>

                          </tr>

                        );

                      })}

                      <tr className="border-t" style={{borderColor:STEP_THEME[2].stroke}}>

                        <td className="p-3 font-semibold" style={{color:SLATE}} colSpan={5}>Totals</td>

                        <td className="p-3 font-semibold" style={{color:SLATE}}>{allTickers.reduce((s,t)=> s + Math.trunc(weightsPct[t]||0), 0)}%</td>

                        <td className="p-3" />

                        <td className="p-3 font-semibold" style={{color:SLATE}}>—</td>

                      </tr>

                    </tbody>

                  </table>

                </div>

                <div className="rounded-2xl p-4 mb-2" style={{ background: STEP_THEME[2].fill, border: `1px solid ${STEP_THEME[2].stroke}`}}>

                  <label className="text-sm block mb-1" style={{color:SLATE}}>Your R<sub>p</sub> (%) — compute Σ w<sub>i</sub>R<sub>i</sub> yourself, then enter:</label>

                  <input type="number" step={1} value={rpGuess} onChange={(e)=> setRpGuess(e.target.value)} className="w-40 rounded-xl px-3 py-2 border bg-white"/>

                  {rpChecked ? <span className="ml-3 text-sm" style={{color:SLATE}}>Submitted ✓</span> : null}

                </div>

                {ans2 && (

                  <div className="mt-2 p-4 rounded-xl shadow-inner" style={{ background: STEP_THEME[2].fill, border: `1px solid ${STEP_THEME[2].stroke}`}}>

                    <div className="font-semibold mb-2" style={{color:SLATE}}>Answer sheet</div>

                    <pre className="text-xs whitespace-pre-wrap" style={{color:SLATE}}>{ans2}</pre>

                  </div>

                )}

              </div>

            </StepShell>

          </motion.section>

        )}

        {/* ===================== STEP 3 ===================== */}

        {step===3 && (

          <motion.section key="s3" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>

            <StepShell color={STEP_THEME[3].fill} stroke={STEP_THEME[3].stroke} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>

              <div className="p-6">

                <div className="flex items-start justify-between mb-2">

                  <h2 className="text-2xl md:text-3xl font-bold text-white">Step 3 — Covariance, Correlation & Var(R<sub>p</sub>)</h2>

                  <div className="flex gap-2">

                    <button onClick={()=> setStep(2)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>

                    <button onClick={()=> setModalOpen(true)} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Explain</button>

                    <button onClick={submit3} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    <button onClick={()=> canNext(3) && setStep(4)} disabled={!canNext(3)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(3)?"hover:brightness-110 hover:shadow-lg":"opacity-50 cursor-not-allowed"}`} style={{background:SLATE}}>→</button>

                  </div>

                </div>

                <div className="rounded-2xl p-4 mb-3" style={{background:"rgba(255,255,255,0.15)", border:`1px solid ${STEP_THEME[3].stroke}`}}>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">

                    <div>

                      <label className="text-sm text-white">Choose a pair (Corr is given)</label>

                      <div className="flex gap-2 mt-1">

                        <select value={corrPair?.[0]||""} onChange={(e)=> setCorrPair([e.target.value as Ticker, corrPair?.[1] || allTickers[0]])} className="rounded-xl px-3 py-2 border bg-white min-w-[120px]">

                          <option value="">—</option>

                          {allTickers.map(t=> <option key={t} value={t}>{t}</option>)}

                        </select>

                        <span className="text-white">×</span>

                        <select value={corrPair?.[1]||""} onChange={(e)=> setCorrPair([corrPair?.[0] || allTickers[0], e.target.value as Ticker])} className="rounded-xl px-3 py-2 border bg-white min-w-[120px]">

                          <option value="">—</option>

                          {allTickers.map(t=> <option key={t} value={t}>{t}</option>)}

                        </select>

                      </div>

                      {corrPair && (

                        <div className="mt-2 text-white text-sm">Given Corr({corrPair[0]},{corrPair[1]}) = {to2(corr[corrPair[0]][corrPair[1]]*100)}%</div>

                      )}

                    </div>

                    <div className="col-span-2">

                      <label className="text-sm text-white">Your Var(R<sub>p</sub>) (%^2)</label>

                      <input type="number" step="0.001" value={varGuess} onChange={(e)=> setVarGuess(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white"/>

                      <div className="text-xs text-white/90 mt-1">Hint: Var adds own variances and all pairwise covariances; ρ is the relationship part.</div>

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {s3 ? (

                    <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.15)", border:`1px solid ${STEP_THEME[3].stroke}`}}>

                      <div className="text-white font-semibold mb-2">Your portfolio (computed after submit)</div>

                      <div className="text-white text-sm">σ<sub>p</sub> = {to2(toPct(pSd))}% | Var(R<sub>p</sub>) = {to2(toPct(toPct(pVar)))} (%^2)</div>

                    </div>

                  ) : null}

                  <div className="rounded-2xl p-4" style={{background:"rgba(255,255,255,0.15)", border:`1px solid ${STEP_THEME[3].stroke}`}}>

                    <div className="text-white font-semibold mb-2">Correlations with main ({main||"—"})</div>

                    <ul className="text-white text-sm list-disc pl-6">

                      {main && allTickers.filter(t=>t!==main).map(t=> (

                        <li key={t}>{main}–{t}: {to2(corr[main][t]*100)}%</li>

                      ))}

                    </ul>

                  </div>

                </div>

                {ans3 && (

                  <div className="mt-3 p-4 rounded-xl shadow-inner" style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${STEP_THEME[3].stroke}`}}>

                    <div className="font-semibold mb-2 text-white">Answer sheet</div>

                    <pre className="text-xs whitespace-pre-wrap text-white">{ans3}</pre>

                  </div>

                )}

                <Modal open={modalOpen} onClose={()=> setModalOpen(false)}>

                  <h3 className="text-xl font-bold mb-3" style={{color:SLATE}}>Understanding Covariance and Correlation</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-semibold mb-2" style={{color:SLATE}}>What is Covariance?</h4>
                      <p className="text-sm mb-2" style={{color:SLATE}}>
                        Covariance measures how two stocks move together. It depends on two things:
                      </p>
                      <ul className="list-disc list-inside text-sm mb-2 ml-2" style={{color:SLATE}}>
                        <li><b>Individual volatility:</b> The variance/standard deviation of returns for each stock (σ<sub>i</sub> and σ<sub>j</sub>)</li>
                        <li><b>Their relationship:</b> How they tend to move together (the correlation ρ<sub>ij</sub>)</li>
                      </ul>
                      <p className="text-sm mb-2" style={{color:SLATE}}>
                        Think of Gala and Honeycrisp apples: they aren't independent—weather and demand affect both varieties. When one goes up, the other tends to go up too, so their covariance is positive. If one usually rises when the other falls, covariance can be negative.
                      </p>
                      <pre className="text-sm p-3 rounded-lg bg-gray-50 border mt-2">Cov(R<sub>i</sub>, R<sub>j</sub>) = ρ<sub>ij</sub> · σ<sub>i</sub> · σ<sub>j</sub></pre>
                    </div>

                    <div>
                      <h4 className="text-base font-semibold mb-2" style={{color:SLATE}}>What is Correlation?</h4>
                      <p className="text-sm mb-2" style={{color:SLATE}}>
                        Correlation is scaled covariance. Once we have the covariance, we calculate correlation by dividing by the product of both stocks' standard deviations. This gives us a number between -1 and +1 that's easier to interpret.
                      </p>
                      <pre className="text-sm p-3 rounded-lg bg-gray-50 border">Corr(R<sub>i</sub>, R<sub>j</sub>) = Cov(R<sub>i</sub>, R<sub>j</sub>) / (SD(R<sub>i</sub>) · SD(R<sub>j</sub>))</pre>
                      <p className="text-sm mt-2" style={{color:SLATE}}>
                        In this exercise, <b>correlation is given</b> for each pair. You can think of it as the "relationship strength" between the two stocks.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-base font-semibold mb-2" style={{color:SLATE}}>Using Correlation to Calculate Portfolio Variance</h4>
                      <p className="text-sm mb-2" style={{color:SLATE}}>
                        Portfolio variance depends on both each stock's own variance and the relationships (correlations) between all pairs:
                      </p>
                      <pre className="text-sm p-3 rounded-lg bg-gray-50 border">Var(R<sub>p</sub>) = Σ w<sub>i</sub>² σ<sub>i</sub>² + 2 Σ<sub>i&lt;j</sub> w<sub>i</sub> w<sub>j</sub> ρ<sub>ij</sub> σ<sub>i</sub> σ<sub>j</sub></pre>
                      <p className="text-sm mt-2" style={{color:SLATE}}>
                        The first term captures each stock's individual risk. The second term captures how pairs of stocks move together—diversification reduces risk when correlations are lower.
                      </p>
                    </div>
                  </div>

                </Modal>

              </div>

            </StepShell>

          </motion.section>

        )}

        {/* ===================== STEP 4 ===================== */}

        {step===4 && (

          <motion.section key="s4" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>

            <StepShell color={STEP_THEME[4].fill} stroke={STEP_THEME[4].stroke} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>

              <div className="p-6">

                <div className="flex items-start justify-between mb-2">

                  <h2 className="text-2xl md:text-3xl font-bold" style={{color:SLATE}}>Step 4 — CAPM Expected Return for your main stock</h2>

                  <div className="flex gap-2">

                    <button onClick={()=> setStep(3)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>

                    {s4 ? (

                      <button onClick={reshuffleScenario} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Try different example</button>

                    ) : (

                      <button onClick={submit4} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    )}

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                  <div className="rounded-2xl p-4 border" style={{background:STEP_THEME[4].fill, borderColor:STEP_THEME[4].stroke}}>

                    <div className="text-sm" style={{color:SLATE}}>

                      CAPM says the expected return equals a safe baseline plus compensation for undiversifiable market risk:

                    </div>

                    <pre className="mt-2 p-3 rounded-lg bg-white/80 border">E[R<sub>i</sub>] = r<sub>f</sub> + β<sub>i</sub> (E[R<sub>m</sub>] − r<sub>f</sub>)</pre>

                    <ul className="list-disc pl-6 mt-2 text-sm" style={{color:SLATE}}>

                      <li><b>r<sub>f</sub></b>: a near‑riskless baseline (set below).</li>

                      <li><b>β<sub>i</sub></b>: sensitivity to market swings (systematic risk).</li>

                      <li><b>E[R<sub>m</sub>] − r<sub>f</sub></b>: market risk premium.</li>

                    </ul>

                  </div>

                  <div className="rounded-2xl p-4 border" style={{background:STEP_THEME[4].fill, borderColor:STEP_THEME[4].stroke}}>

                    <div className="text-sm mb-2" style={{color:SLATE}}>Parameters</div>

                    <div className="flex gap-4 mb-3">

                      <div>

                        <label className="text-sm" style={{color:SLATE}}>r<sub>f</sub> (%)</label>

                        <input type="number" step="0.01" value={to2(rf*100)} onChange={(e)=> setRf(Number(e.target.value)/100)} className="w-28 rounded-xl px-3 py-2 border bg-white"/>

                      </div>

                      <div>

                        <label className="text-sm" style={{color:SLATE}}>MRP (%)</label>

                        <input type="number" step="0.01" value={to2(mrp*100)} onChange={(e)=> setMrp(Number(e.target.value)/100)} className="w-28 rounded-xl px-3 py-2 border bg-white"/>

                      </div>

                    </div>

                    <div className="text-sm" style={{color:SLATE}}>main = {main||"—"} (β={main?universe[main].beta.toFixed(2):"—"})</div>

                    <div className="mt-3">

                      <label className="text-sm" style={{color:SLATE}}>Your E[R] for main (%)</label>

                      <input type="number" step="0.01" value={capmGuess} onChange={(e)=> setCapmGuess(e.target.value)} className="w-48 rounded-xl px-3 py-2 border bg-white"/>

                    </div>

                  </div>

                </div>

                {ans4 && (

                  <div className="mt-3 p-4 rounded-xl shadow-inner" style={{ background: STEP_THEME[4].fill, border: `1px solid ${STEP_THEME[4].stroke}`}}>

                    <div className="font-semibold mb-2" style={{color:SLATE}}>Answer sheet</div>

                    <pre className="text-xs whitespace-pre-wrap" style={{color:SLATE}}>{ans4}</pre>

                  </div>

                )}

              </div>

            </StepShell>

          </motion.section>

        )}

      </AnimatePresence>

    </div>

  );

}


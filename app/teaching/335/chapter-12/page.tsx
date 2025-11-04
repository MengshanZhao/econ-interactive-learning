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

type Covariance = Record<Ticker, Record<Ticker, number>>; // symmetric cov matrix

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

// Calculate covariance from correlation and SDs
function calculateCovariance(corr: Correl, universe: Universe): Covariance {
  const cov: Covariance = {} as Covariance;
  const tickers = Object.keys(universe) as Ticker[];
  
  tickers.forEach(ti => {
    cov[ti] = {} as Record<Ticker, number>;
    tickers.forEach(tj => {
      cov[ti][tj] = corr[ti][tj] * universe[ti].sd * universe[tj].sd;
    });
  });
  
  return cov;
}

// ===================== DOCUMENT HOLDER DESIGN =====================

function FolderShape({ width = 1100, height = 640, color, stroke, pad = 28, children, }:{ width?: number; height?: number; color: string; stroke: string; pad?: number; children?: React.ReactNode; }) {

  const r = 18; const w = width; const h = height;

  const d = [ `M ${r} 0`, `H ${w - r}`, `Q ${w} 0 ${w} ${r}`, `V ${h - r}`, `Q ${w} ${h} ${w - r} ${h}`, `H ${r}`, `Q 0 ${h} 0 ${h - r}`, `V ${r}`, `Q 0 0 ${r} 0`, ].join(" ");

  return (

    <div className="relative w-full max-w-full" style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.15))", backgroundColor: color, borderRadius: "20px", minHeight: h }}>

      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="rounded-[20px] block" style={{ maxWidth: "100%", display: "block", position: "relative", zIndex: 0 }}>

        <path d={d} fill={color} stroke={stroke} strokeWidth={4} />

      </svg>

      <div className="absolute left-0 top-0 w-full" style={{ minHeight: h, zIndex: 1 }}><div style={{ padding: pad }}>{children}</div></div>

    </div>

  );

}

function FolderTabRight({ top, height = 80, color, stroke, label, isActive, isLocked, onClick, }:{ top: number; height?: number; color: string; stroke: string; label: string; isActive: boolean; isLocked: boolean; onClick?: () => void; }) {

  const w = 60; const r = 8; const tabColor = isActive ? color : (isLocked ? "#E0E0E0" : color); const tabStroke = isActive ? stroke : (isLocked ? "#B0B0B0" : stroke); const textColor = isLocked ? "#999" : (isActive ? "#16333A" : "#666");

  return (

    <div className="absolute cursor-pointer transition-all hover:scale-105" style={{ right: -w + 8, top, width: w, height, zIndex: 50, opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? "none" : "auto" }} onClick={!isLocked ? onClick : undefined}>

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

    <div className="relative w-full max-w-6xl mx-auto" style={{ maxWidth: "100%", overflowX: "visible", overflowY: "visible", paddingRight: "60px" }}>

      <div className="absolute -top-6 -left-6 -z-10 opacity-70" style={{ overflow: "hidden" }}><FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} /></div>

      <div className="absolute -top-3 left-6 -z-10 opacity-60" style={{ overflow: "hidden" }}><FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} /></div>

      <div className="relative" style={{ overflow: "visible", zIndex: 1 }}>

        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={34}>{children}</FolderShape>

        {[1,2,3].map((step)=>{

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

  const [step, setStep] = useState<1|2|3>(1); // Start at step 1

  // Scenario knobs for CAPM (shown in Step 3 but set here)

  const [rf, setRf] = useState(0.02); // 2%

  const [mrp, setMrp] = useState(0.055); // market risk premium 5.5%

  // Fixed selection: all five stocks

  const allTickers = Object.keys(universe) as Ticker[];

  // Weights (Step 2): default equal 20%

  const [weightsPct, setWeightsPct] = useState<Record<Ticker, number>>({AAPL:20, MSFT:20, NVDA:20, TSLA:20, KO:20});

  const weightsDec = useMemo(()=>{ const out:Record<Ticker,number>={AAPL:0,MSFT:0,NVDA:0,TSLA:0,KO:0}; allTickers.forEach(t=> out[t]=(Math.trunc(weightsPct[t]||0))/100); return out; },[weightsPct]);

  // Calculate covariance matrix
  const covMatrix = useMemo(() => calculateCovariance(corr, universe), [corr, universe]);

  // Derived: portfolio return & risk (for checking in Step 3 after submit)

  const pRet = useMemo(()=> portfolioReturn(weightsDec, universe), [weightsDec, universe]);

  const pVar = useMemo(()=> portfolioVariance(weightsDec, universe, corr), [weightsDec, universe, corr]);

  const pSd = Math.sqrt(pVar);

  // Step gates

  const [s1, setS1] = useState(false); const [s2, setS2] = useState(false); const [s3, setS3] = useState(false);

  const canNext=(s:1|2)=> (s===1&&s1) || (s===2&&s2);

  const maxUnlockedStep = 1 + (s1?1:0) + (s2?1:0);

  const goToStep=(t:1|2|3)=>{ if(t<=maxUnlockedStep) setStep(t); };

  // Answers & inputs

  const [ans1, setAns1] = useState<string | null>(null);

  const [rpGuess, setRpGuess] = useState<string>("");

  const [rpChecked, setRpChecked] = useState<boolean>(false);

  const [corrPair, setCorrPair] = useState<[Ticker, Ticker] | null>(null);

  const [corrGuess, setCorrGuess] = useState<string>(""); // For correlation calculation

  const [varGuess, setVarGuess] = useState<string>("");

  const [ans2, setAns2] = useState<string | null>(null);

  const [capmGuess, setCapmGuess] = useState<string>("");

  const [selectedStock, setSelectedStock] = useState<Ticker | null>(null);

  const [ans3, setAns3] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [answerModalOpen, setAnswerModalOpen] = useState(false);

  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

  function randomizeWeights(){

    const total = 100;

    const weights: Record<Ticker, number> = {} as Record<Ticker, number>;

    let remaining = total;

    const shuffled = [...allTickers].sort(() => Math.random() - 0.5);

    shuffled.forEach((t, i) => {

      if (i === shuffled.length - 1) {

        weights[t] = remaining;

      } else {

        const w = Math.floor(Math.random() * remaining * 0.6) + 5; // Between 5 and 60% of remaining

        weights[t] = w;

        remaining -= w;

      }

    });

    setWeightsPct(weights);

  }

  function reshuffleScenario(){

    const jitter = (x:number, p=0.2)=> x*(1 + (Math.random()*2-1)*p*0.2);

    const nextU:Universe = { } as Universe;

    (Object.keys(universe) as Ticker[]).forEach(t=>{

      const s = universe[t];

      nextU[t] = { ...s, r: jitter(s.r,0.3), sd: Math.max(0.012, jitter(s.sd,0.25)), beta: Math.max(0.4, jitter(s.beta,0.25)) };

    });

    setUniverse(nextU); setCorr(BASE_CORR);

    setWeightsPct({AAPL:20,MSFT:20,NVDA:20,TSLA:20,KO:20});

    setS1(false); setS2(false); setS3(false);

    setAns1(null); setAns2(null); setAns3(null); setRpGuess(""); setRpChecked(false);

    setCorrGuess(""); setVarGuess("");

    setSelectedStock(null);

    setStep(1);

  }

  // ---------- STEP ACTIONS ----------

  function submit1(){

    // Enforce integers, sum==100, and require student's Rp

    const ints: Record<Ticker, number> = { ...weightsPct } as any;

    allTickers.forEach(t=>{ const v = Math.trunc(Number(ints[t])); ints[t] = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0; });

    setWeightsPct(ints);

    const sum = allTickers.reduce((s,t)=> s + (ints[t]||0), 0);

    if(sum < 100){ alert(`Weights must sum to 100%. They are currently ${sum}% (too low).`); return; }

    if(sum > 100){ alert(`Weights must sum to 100%. They are currently ${sum}% (too high).`); return; }

    const trueRpPct = to2(toPct(portfolioReturn(Object.fromEntries(allTickers.map(t=> [t, (ints[t]||0)/100])) as Record<Ticker,number>, universe)));

    const g = parseFloat(rpGuess||"NaN");

    if(!Number.isFinite(g)) { alert("Please enter your Rₚ (%) before submitting."); return; }

    const ok = Math.abs(g - trueRpPct) <= 0.1; // ±0.1pp

    const lines = allTickers.map(t=>{ const w=ints[t]; const r=universe[t].r; const contrib=(w/100)*r; return `${t}: w=${w}%, R=${to2(toPct(r))}%, w·R=${to2(toPct(contrib))}%`; });

    const verdict = ok ? "✅ Correct" : `❌ Not quite (your ${to2(g)}% vs hidden true ${trueRpPct}%).`;

    const answer = lines.join("\n") + "\n\nRₚ check → " + verdict;

    setAns1(answer);

    setCurrentAnswer(answer);

    setRpChecked(true);

    setS1(true);

    setAnswerModalOpen(true);

  }

  function submit2(){

    if(!corrPair){ alert("Pick a pair to calculate correlation."); return; }

    const [a, b] = corrPair;

    // First check correlation calculation

    const gCorr = parseFloat(corrGuess||"NaN");

    if(!Number.isFinite(gCorr)){ alert("Please enter your calculated Corr(%) first."); return; }

    const trueCorr = corr[a][b];

    const corrOK = Math.abs((gCorr/100||0)-trueCorr) <= 0.02; // ±2pp

    // Then check variance

    const v = parseFloat(varGuess||"NaN"); // expect %^2

    if(!Number.isFinite(v)){ alert("Please enter your Var(Rₚ) in %² before submitting."); return; }

    const vTrue = toPct(toPct(pVar)); // variance in (%^2)

    const vOK = Math.abs((v||0)-vTrue) <= Math.max(0.01, 0.05*vTrue);

    const givenCov = covMatrix[a][b];

    const msg = `${corrOK?"✅":"❌"} Corr(${a},${b}): your ${to2(gCorr||0)}% → ${to2(trueCorr*100)}%\n` +

                `Given Cov(${a},${b}) = ${to2(toPct(givenCov))} (%^2), SD(${a}) = ${to2(toPct(universe[a].sd))}%, SD(${b}) = ${to2(toPct(universe[b].sd))}%\n` +

                `Corr = Cov / (SD(${a}) × SD(${b}))\n\n` +

                `${vOK?"✅":"❌"} Var(Rₚ): your ${to2(v||0)} (%^2) → ${to2(vTrue)} (%^2)\n` +

                `Var(Rₚ) = Σ wᵢ² SD(Rᵢ)² + 2 wᵢ wⱼ Corr(Rᵢ, Rⱼ) SD(Rᵢ) SD(Rⱼ)`;

    setAns2(msg);

    setCurrentAnswer(msg);

    setS2(true);

    setAnswerModalOpen(true);

  }

  function submit3(){

    if(!selectedStock){ alert("Pick a stock first."); return; }

    const beta = universe[selectedStock].beta; const trueER = rf + beta * mrp; // CAPM

    const g = parseFloat(capmGuess||"NaN")/100; const ok = Math.abs((g||0)-trueER) <= 0.003; // ~0.3pp

    const msg = `${ok?"✅":"❌"} E[R_${selectedStock}] = r_f + β (E[R_m]-r_f) = ${to2(rf*100)}% + ${beta.toFixed(2)} × ${to2(mrp*100)}% = ${to2(trueER*100)}%`;

    setAns3(msg);

    setCurrentAnswer(msg);

    setS3(true);

    setAnswerModalOpen(true);

  }

  useEffect(()=>{ // default pair suggestion

    if(allTickers.length >= 2 && !corrPair){ setCorrPair([allTickers[0], allTickers[1]]); }

  },[allTickers.length]);

  // ===================== RENDER =====================

  return (

    <div className="min-h-screen w-full" style={{ backgroundImage: "url('/images/city_background.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", overflowX: "hidden", overflowY: "auto" }}>

      <div className="flex items-start justify-center min-h-screen py-6 px-4 md:px-6" style={{ overflowX: "visible", position: "relative" }}>

      <AnimatePresence mode="wait">

        {/* ===================== STEP 1 ===================== */}

        {step===1 && (

          <motion.section key="s1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>

            <StepShell color={STEP_THEME[1].fill} stroke={STEP_THEME[1].stroke} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>

              <div className="p-6">

                <div className="flex items-start justify-between mb-4">

                  <h1 className="text-2xl md:text-3xl font-bold" style={{color:SLATE}}>Step 1 — Set portfolio weights & compute R<sub>p</sub></h1>

                  <div className="flex gap-2">

                    <button onClick={randomizeWeights} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Random</button>

                    <button onClick={submit1} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background: SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    <button onClick={()=> canNext(1) && setStep(2)} disabled={!canNext(1)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(1)?"hover:brightness-110 hover:shadow-lg":"opacity-50 cursor-not-allowed"}`} style={{background:SLATE}}>→</button>

                  </div>

                </div>

                <div className="rounded-2xl overflow-hidden shadow mb-4" style={{ background: "white", border: `1px solid ${STEP_THEME[1].stroke}`, maxHeight: "500px", overflowY: "auto" }}>

                  <table className="w-full text-sm">

                    <thead style={{ background: STEP_THEME[1].fill }}>

                      <tr className="text-left">

                        <th className="p-3" style={{color:SLATE}}>Ticker</th>

                        <th className="p-3" style={{color:SLATE}}>R<sub>i</sub> (%)</th>

                        <th className="p-3" style={{color:SLATE}}>σ<sub>i</sub> (%)</th>

                        <th className="p-3" style={{color:SLATE}}>Weight (%)</th>

                        <th className="p-3" style={{color:SLATE}}>w<sub>i</sub>·R<sub>i</sub> (%)</th>

                      </tr>

                    </thead>

                    <tbody>

                      {allTickers.map(t=>{

                        const s = universe[t]; const w = Math.trunc(weightsPct[t]||0); const contrib=(w/100)*s.r;

                        return (

                          <tr key={t} className="border-t" style={{borderColor:STEP_THEME[1].stroke}}>

                            <td className="p-3" style={{color:SLATE}}>{t}</td>

                            <td className="p-3" style={{color:SLATE}}>{to2(toPct(s.r))}</td>

                            <td className="p-3" style={{color:SLATE}}>{to2(toPct(s.sd))}</td>

                            <td className="p-3">

                              <input type="number" step={1} min={0} max={100} value={w}

                                onChange={(e)=> {

                                  const v = Math.trunc(Number(e.target.value));

                                  setWeightsPct(prev=> ({...prev, [t]: Number.isFinite(v)? Math.max(0, Math.min(100, v)) : 0}));

                                }}

                                className="w-24 rounded-xl px-2 py-1 border bg-white" style={{ borderColor: STEP_THEME[1].stroke }}/>

                            </td>

                            <td className="p-3" style={{color:SLATE}}>{to2(toPct(contrib))}</td>

                          </tr>

                        );

                      })}

                      <tr className="border-t" style={{borderColor:STEP_THEME[1].stroke}}>

                        <td className="p-3 font-semibold" style={{color:SLATE}} colSpan={3}>Totals</td>

                        <td className="p-3 font-semibold" style={{color:SLATE}}>{allTickers.reduce((s,t)=> s + Math.trunc(weightsPct[t]||0), 0)}%</td>

                        <td className="p-3 font-semibold" style={{color:SLATE}}>—</td>

                      </tr>

                    </tbody>

                  </table>

                </div>

                <div className="rounded-2xl p-4 mb-2" style={{ background: "white", border: `1px solid ${STEP_THEME[1].stroke}`, boxShadow: `0 1px 3px rgba(0,0,0,0.1)` }}>

                  <label className="text-sm block mb-1 font-semibold" style={{color:SLATE}}>Your R<sub>p</sub> (%) — compute Σ w<sub>i</sub>R<sub>i</sub>:</label>

                  <input type="number" step={1} value={rpGuess} onChange={(e)=> setRpGuess(e.target.value)} className="w-40 rounded-xl px-3 py-2 border bg-white" style={{ borderColor: STEP_THEME[1].stroke }}/>

                </div>

                {s1 && (

                  <button onClick={()=> {setCurrentAnswer(ans1); setAnswerModalOpen(true);}} className="mt-3 w-full px-4 py-2 rounded-xl text-white font-semibold shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>View Answer</button>

                )}

              </div>

            </StepShell>

          </motion.section>

        )}

        {/* ===================== STEP 2 ===================== */}

        {step===2 && (

          <motion.section key="s2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>

            <StepShell color={STEP_THEME[2].fill} stroke={STEP_THEME[2].stroke} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>

              <div className="p-6">

                <div className="flex items-start justify-between mb-2">

                  <h2 className="text-2xl md:text-3xl font-bold text-white">Step 2 — Covariance, Correlation & Var(R<sub>p</sub>)</h2>

                  <div className="flex gap-2">

                    <button onClick={()=> setStep(1)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>

                    <button onClick={()=> setModalOpen(true)} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Explain</button>

                    <button onClick={submit2} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    <button onClick={()=> canNext(2) && setStep(3)} disabled={!canNext(2)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(2)?"hover:brightness-110 hover:shadow-lg":"opacity-50 cursor-not-allowed"}`} style={{background:SLATE}}>→</button>

                  </div>

                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg mb-4" style={{ background: "white", border: `3px solid ${STEP_THEME[2].stroke}`, maxHeight: "300px", overflowY: "auto" }}>

                    <table className="w-full text-sm">

                      <thead style={{ background: STEP_THEME[2].fill }}>

                        <tr className="text-left">

                          <th className="p-3" style={{color:SLATE}}>Ticker</th>

                          <th className="p-3" style={{color:SLATE}}>SD (σ<sub>i</sub>) (%)</th>

                          <th className="p-3" style={{color:SLATE}}>Weight (%)</th>

                        </tr>

                      </thead>

                      <tbody>

                        {allTickers.map(t=>{

                          const s = universe[t]; const w = Math.trunc(weightsPct[t]||0);

                          return (

                            <tr key={t} className="border-t" style={{borderColor:STEP_THEME[2].stroke}}>

                              <td className="p-3" style={{color:SLATE}}>{t}</td>

                              <td className="p-3" style={{color:SLATE}}>{to2(toPct(s.sd))}</td>

                              <td className="p-3" style={{color:SLATE}}>{w}%</td>

                            </tr>

                          );

                        })}

                      </tbody>

                    </table>

                </div>

                <div className="rounded-2xl p-4 mb-3" style={{background:"white", border:`1px solid ${STEP_THEME[2].stroke}`, boxShadow: `0 1px 3px rgba(0,0,0,0.1)`, maxHeight: "600px", overflowY: "auto" }}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">

                      <div>

                        <label className="text-sm block mb-1 font-semibold" style={{color:SLATE}}>Choose a pair</label>

                        <div className="flex gap-2">

                          <select value={corrPair?.[0]||""} onChange={(e)=> setCorrPair([e.target.value as Ticker, corrPair?.[1] || allTickers[0]])} className="rounded-xl px-3 py-2 border bg-white min-w-[100px] text-sm">

                            <option value="">—</option>

                            {allTickers.map(t=> <option key={t} value={t}>{t}</option>)}

                          </select>

                          <span className="flex items-center" style={{color:SLATE}}>×</span>

                          <select value={corrPair?.[1]||""} onChange={(e)=> setCorrPair([corrPair?.[0] || allTickers[0], e.target.value as Ticker])} className="rounded-xl px-3 py-2 border bg-white min-w-[100px] text-sm">

                            <option value="">—</option>

                            {allTickers.map(t=> <option key={t} value={t}>{t}</option>)}

                          </select>

                        </div>

                      </div>

                    </div>

                    {corrPair && (

                      <div className="space-y-3">

                        <div className="rounded-lg p-3" style={{ background: STEP_THEME[2].fill, border: `1px solid ${STEP_THEME[2].stroke}` }}>

                          <div className="text-sm font-semibold" style={{color:SLATE}}>Given Cov({corrPair[0]}, {corrPair[1]}) = {to2(toPct(covMatrix[corrPair[0]][corrPair[1]]))} (%²)</div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div>

                            <label className="text-sm block mb-1 font-semibold" style={{color:SLATE}}>Your Corr({corrPair[0]}, {corrPair[1]}) (%) — calculate from Cov and SDs:</label>

                            <input type="number" step="0.01" value={corrGuess} onChange={(e)=> setCorrGuess(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white" style={{ borderColor: STEP_THEME[2].stroke }}/>

                            <div className="text-xs mt-1" style={{color:SLATE, opacity: 0.7}}>Corr = Cov / (SD₁ × SD₂)</div>

                          </div>

                          <div>

                            <label className="text-sm block mb-1 font-semibold" style={{color:SLATE}}>Your Var(R<sub>p</sub>) (%²)</label>

                            <input type="number" step="0.001" value={varGuess} onChange={(e)=> setVarGuess(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white" style={{ borderColor: STEP_THEME[2].stroke }}/>

                            <div className="text-xs mt-1" style={{color:SLATE, opacity: 0.7}}>Use calculated correlations for all pairs</div>

                          </div>

                        </div>

                      </div>

                    )}

                </div>

                {s2 && (

                  <button onClick={()=> {setCurrentAnswer(ans2); setAnswerModalOpen(true);}} className="mt-3 w-full px-4 py-2 rounded-xl text-white font-semibold shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>View Answer</button>

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

                  <h2 className="text-2xl md:text-3xl font-bold" style={{color:SLATE}}>Step 3 — CAPM Expected Return</h2>

                  <div className="flex gap-2">

                    <button onClick={()=> setStep(2)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>

                    {s3 ? (

                      <button onClick={reshuffleScenario} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>New example</button>

                    ) : (

                      <button onClick={submit3} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                    )}

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                  <div className="rounded-2xl p-4 border shadow" style={{background:"white", borderColor:STEP_THEME[3].stroke, borderWidth: "1px" }}>

                    <div className="text-sm mb-3 font-semibold" style={{color:STEP_THEME[3].stroke}}>

                      CAPM: E[R<sub>i</sub>] = r<sub>f</sub> + β<sub>i</sub> (E[R<sub>m</sub>] − r<sub>f</sub>)

                    </div>

                    <div className="flex gap-4 mb-3">

                      <div>

                        <label className="text-sm" style={{color:SLATE}}>r<sub>f</sub> (%)</label>

                        <input type="number" step="0.01" value={to2(rf*100)} onChange={(e)=> setRf(Number(e.target.value)/100)} className="w-24 rounded-xl px-2 py-1 border bg-white text-sm"/>

                      </div>

                      <div>

                        <label className="text-sm" style={{color:SLATE}}>MRP (%)</label>

                        <input type="number" step="0.01" value={to2(mrp*100)} onChange={(e)=> setMrp(Number(e.target.value)/100)} className="w-24 rounded-xl px-2 py-1 border bg-white text-sm"/>

                      </div>

                    </div>

                    <div className="mb-3">

                      <label className="text-sm block mb-1" style={{color:SLATE}}>Select stock:</label>

                      <select value={selectedStock||""} onChange={(e)=> setSelectedStock(e.target.value as Ticker)} className="w-full rounded-xl px-3 py-2 border bg-white text-sm">

                        <option value="">—</option>

                        {allTickers.map(t=> <option key={t} value={t}>{t} (β={universe[t].beta.toFixed(2)})</option>)}

                      </select>

                    </div>

                    <div>

                      <label className="text-sm block mb-1" style={{color:SLATE}}>Your E[R] (%)</label>

                      <input type="number" step="0.01" value={capmGuess} onChange={(e)=> setCapmGuess(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white text-sm"/>

                    </div>

                  </div>

                  <div className="rounded-2xl p-4 border shadow" style={{background:"white", borderColor:STEP_THEME[3].stroke, borderWidth: "1px" }}>

                    <div className="text-sm mb-2 font-semibold" style={{color:STEP_THEME[3].stroke}}>Stock betas:</div>

                    <ul className="text-sm space-y-1" style={{color:SLATE}}>

                      {allTickers.map(t=> (

                        <li key={t}>{t}: β = {universe[t].beta.toFixed(2)}</li>

                      ))}

                    </ul>

                  </div>

                </div>

                {s3 && (

                  <button onClick={()=> {setCurrentAnswer(ans3); setAnswerModalOpen(true);}} className="mt-3 w-full px-4 py-2 rounded-xl text-white font-semibold shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>View Answer</button>

                )}

              </div>

            </StepShell>

          </motion.section>

        )}

      </AnimatePresence>

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

                In this exercise, <b>covariance is given</b>. You calculate correlation from it, then use correlation to find portfolio variance.

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

        <Modal open={answerModalOpen} onClose={()=> setAnswerModalOpen(false)}>

          <h3 className="text-xl font-bold mb-3" style={{color:SLATE}}>Answer Sheet</h3>

          <pre className="text-sm whitespace-pre-wrap p-4 rounded-lg bg-gray-50 border" style={{color:SLATE, maxHeight: "400px", overflowY: "auto" }}>{currentAnswer || "No answer available"}</pre>

        </Modal>

      </div>

    </div>

  );

}

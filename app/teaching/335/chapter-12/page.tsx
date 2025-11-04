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

function DocumentCard({ step, color, stroke, isActive, children }: { step: number; color: string; stroke: string; isActive: boolean; children: React.ReactNode; }) {

  const offset = isActive ? 0 : (step - 1) * 8; // Offset for stacked effect
  const scale = isActive ? 1 : 0.96;
  const opacity = isActive ? 1 : 0.7;
  const zIndex = isActive ? 10 : 10 - step;
  const marginTop = isActive ? 0 : -((step - 1) * 8);

  return (

    <div className="relative" style={{ 

      marginTop: `${marginTop}px`,
      transform: `translateY(${offset}px) scale(${scale})`,
      opacity,
      zIndex,
      filter: isActive ? "drop-shadow(0 8px 20px rgba(0,0,0,0.2))" : "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
      transition: "all 0.3s ease",
      pointerEvents: isActive ? "auto" : "none"

    }}>

      <div className="rounded-2xl border-2" style={{ background: color, borderColor: stroke }}>

        {children}

      </div>

    </div>

  );

}

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

  const [step, setStep] = useState<1|2|3|4>(2); // Start at step 2

  // Scenario knobs for CAPM (shown in Step 4 but set here)

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

  const [s2, setS2] = useState(false); const [s3, setS3] = useState(false); const [s4, setS4] = useState(false);

  const canNext=(s:2|3)=> (s===2&&s2) || (s===3&&s3);

  const maxUnlockedStep = 2 + (s2?1:0) + (s3?1:0);

  const goToStep=(t:2|3|4)=>{ if(t<=maxUnlockedStep) setStep(t); };

  // Answers & inputs

  const [ans2, setAns2] = useState<string | null>(null);

  const [rpGuess, setRpGuess] = useState<string>("");

  const [rpChecked, setRpChecked] = useState<boolean>(false);

  const [corrPair, setCorrPair] = useState<[Ticker, Ticker] | null>(null);

  const [corrGuess, setCorrGuess] = useState<string>(""); // For correlation calculation

  const [varGuess, setVarGuess] = useState<string>("");

  const [ans3, setAns3] = useState<string | null>(null);

  const [capmGuess, setCapmGuess] = useState<string>("");

  const [selectedStock, setSelectedStock] = useState<Ticker | null>(null);

  const [ans4, setAns4] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

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

    setS2(false); setS3(false); setS4(false);

    setAns2(null); setAns3(null); setAns4(null); setRpGuess(""); setRpChecked(false);

    setCorrGuess(""); setVarGuess("");

    setSelectedStock(null);

    setStep(2);

  }

  // ---------- STEP ACTIONS ----------

  function submit2(){

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

    setAns2(lines.join("\n") + "\n\nRₚ check → " + verdict);

    setRpChecked(true);

    setS2(true);

  }

  function submit3(){

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

                `Var(Rₚ) = Σ wᵢ² σᵢ² + 2 Σ_{i<j} wᵢ wⱼ ρᵢⱼ σᵢ σⱼ`;

    setAns3(msg);

    setS3(true);

  }

  function submit4(){

    if(!selectedStock){ alert("Pick a stock first."); return; }

    const beta = universe[selectedStock].beta; const trueER = rf + beta * mrp; // CAPM

    const g = parseFloat(capmGuess||"NaN")/100; const ok = Math.abs((g||0)-trueER) <= 0.003; // ~0.3pp

    const msg = `${ok?"✅":"❌"} E[R_${selectedStock}] = r_f + β (E[R_m]-r_f) = ${to2(rf*100)}% + ${beta.toFixed(2)} × ${to2(mrp*100)}% = ${to2(trueER*100)}%`;

    setAns4(msg);

    setS4(true);

  }

  useEffect(()=>{ // default pair suggestion

    if(allTickers.length >= 2 && !corrPair){ setCorrPair([allTickers[0], allTickers[1]]); }

  },[allTickers.length]);

  // ===================== RENDER =====================

  return (

    <div className="min-h-screen w-full flex items-center justify-center p-6 py-12" style={{ background: TIF_PAGE }}>

      <div className="relative w-full max-w-6xl space-y-0">

        {/* Document holder style - show previous steps underneath, stacked */}

          <DocumentCard step={2} color={STEP_THEME[2].fill} stroke={STEP_THEME[2].stroke} isActive={step === 2}>

            <div className="p-4">

              <div className="flex items-start justify-between mb-4">

                <h2 className="text-2xl md:text-3xl font-bold" style={{color:SLATE}}>Step 2 — Set portfolio weights & compute R<sub>p</sub></h2>

                <div className="flex gap-2">

                  <button onClick={randomizeWeights} className="rounded-full px-3 h-10 flex items-center justify-center text-white text-sm shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Random</button>

                  <button onClick={submit2} className="rounded-full px-3 h-10 flex items-center justify-center text-white text-sm shadow hover:brightness-110 hover:shadow-lg" style={{background: SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                  {step > 2 && <button onClick={()=> setStep(3)} className="rounded-full w-10 h-10 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>→</button>}

                </div>

              </div>

              <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: "rgba(255,255,255,0.3)", borderColor: STEP_THEME[2].stroke}}>

                <table className="w-full text-xs">

                  <thead style={{ background: "rgba(255,255,255,0.5)" }}>

                    <tr className="text-left">

                      <th className="p-2" style={{color:SLATE}}>Ticker</th>

                      <th className="p-2" style={{color:SLATE}}>R<sub>i</sub> (%)</th>

                      <th className="p-2" style={{color:SLATE}}>Weight (%)</th>

                      <th className="p-2" style={{color:SLATE}}>w<sub>i</sub>·R<sub>i</sub> (%)</th>

                    </tr>

                  </thead>

                  <tbody>

                    {allTickers.map(t=>{

                      const s = universe[t]; const w = Math.trunc(weightsPct[t]||0); const contrib=(w/100)*s.r;

                      return (

                        <tr key={t} className="border-t" style={{borderColor:STEP_THEME[2].stroke}}>

                          <td className="p-2" style={{color:SLATE}}>{t}</td>

                          <td className="p-2" style={{color:SLATE}}>{to2(toPct(s.r))}</td>

                          <td className="p-2" style={{color:SLATE}}>{w}%</td>

                          <td className="p-2" style={{color:SLATE}}>{to2(toPct(contrib))}</td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

              {step === 2 && (

                <>

                  <div className="rounded-2xl p-4 mb-2" style={{ background: STEP_THEME[2].fill, border: `1px solid ${STEP_THEME[2].stroke}`}}>

                    <label className="text-sm block mb-1" style={{color:SLATE}}>Your R<sub>p</sub> (%) — compute Σ w<sub>i</sub>R<sub>i</sub>:</label>

                    <input type="number" step={1} value={rpGuess} onChange={(e)=> setRpGuess(e.target.value)} className="w-40 rounded-xl px-3 py-2 border bg-white"/>

                  </div>

                  {ans2 && (

                    <div className="mt-2 p-4 rounded-xl shadow-inner" style={{ background: STEP_THEME[2].fill, border: `1px solid ${STEP_THEME[2].stroke}`}}>

                      <div className="font-semibold mb-2" style={{color:SLATE}}>Answer sheet</div>

                      <pre className="text-xs whitespace-pre-wrap" style={{color:SLATE}}>{ans2}</pre>

                    </div>

                  )}

                </>

              )}


            </div>

          </DocumentCard>

        )}

        {step >= 3 && (

          <DocumentCard step={3} color={STEP_THEME[3].fill} stroke={STEP_THEME[3].stroke} isActive={step === 3}>

            <div className="p-4">

              <div className="flex items-start justify-between mb-2">

                <h2 className="text-2xl md:text-3xl font-bold text-white">Step 3 — Covariance, Correlation & Var(R<sub>p</sub>)</h2>

                <div className="flex gap-2">

                  {step > 3 && <button onClick={()=> setStep(2)} className="rounded-full w-10 h-10 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>}

                  <button onClick={()=> setModalOpen(true)} className="rounded-full px-3 h-10 flex items-center justify-center text-white text-sm shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Explain</button>

                  <button onClick={submit3} className="rounded-full px-3 h-10 flex items-center justify-center text-white text-sm shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                  {step > 3 && <button onClick={()=> setStep(4)} className="rounded-full w-10 h-10 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>→</button>}

                </div>

              </div>

              {step === 3 && (

                <>

                  <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: "rgba(255,255,255,0.15)", borderColor: STEP_THEME[3].stroke}}>

                    <table className="w-full text-xs">

                      <thead style={{ background: "rgba(255,255,255,0.2)" }}>

                        <tr className="text-left">

                          <th className="p-2" style={{color:"white"}}>Ticker</th>

                          <th className="p-2" style={{color:"white"}}>SD (σ<sub>i</sub>) (%)</th>

                          <th className="p-2" style={{color:"white"}}>Weight (%)</th>

                        </tr>

                      </thead>

                      <tbody>

                        {allTickers.map(t=>{

                          const s = universe[t]; const w = Math.trunc(weightsPct[t]||0);

                          return (

                            <tr key={t} className="border-t" style={{borderColor:STEP_THEME[3].stroke}}>

                              <td className="p-2" style={{color:"white"}}>{t}</td>

                              <td className="p-2" style={{color:"white"}}>{to2(toPct(s.sd))}</td>

                              <td className="p-2" style={{color:"white"}}>{w}%</td>

                            </tr>

                          );

                        })}

                      </tbody>

                    </table>

                  </div>

                  <div className="rounded-2xl p-4 mb-3" style={{background:"rgba(255,255,255,0.15)", border:`1px solid ${STEP_THEME[3].stroke}`}}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">

                      <div>

                        <label className="text-sm text-white block mb-1">Choose a pair</label>

                        <div className="flex gap-2">

                          <select value={corrPair?.[0]||""} onChange={(e)=> setCorrPair([e.target.value as Ticker, corrPair?.[1] || allTickers[0]])} className="rounded-xl px-3 py-2 border bg-white min-w-[100px] text-sm">

                            <option value="">—</option>

                            {allTickers.map(t=> <option key={t} value={t}>{t}</option>)}

                          </select>

                          <span className="text-white flex items-center">×</span>

                          <select value={corrPair?.[1]||""} onChange={(e)=> setCorrPair([corrPair?.[0] || allTickers[0], e.target.value as Ticker])} className="rounded-xl px-3 py-2 border bg-white min-w-[100px] text-sm">

                            <option value="">—</option>

                            {allTickers.map(t=> <option key={t} value={t}>{t}</option>)}

                          </select>

                        </div>

                      </div>

                    </div>

                    {corrPair && (

                      <div className="space-y-3">

                        <div className="rounded-lg p-3 bg-white/20">

                          <div className="text-white text-sm mb-2">Given Cov({corrPair[0]}, {corrPair[1]}) = {to2(toPct(covMatrix[corrPair[0]][corrPair[1]]))} (%²)</div>

                          <div className="text-white text-sm">SD({corrPair[0]}) = {to2(toPct(universe[corrPair[0]].sd))}%</div>

                          <div className="text-white text-sm">SD({corrPair[1]}) = {to2(toPct(universe[corrPair[1]].sd))}%</div>

                        </div>

                        <div>

                          <label className="text-sm text-white block mb-1">Your Corr({corrPair[0]}, {corrPair[1]}) (%) — calculate from Cov and SDs:</label>

                          <input type="number" step="0.01" value={corrGuess} onChange={(e)=> setCorrGuess(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white"/>

                          <div className="text-xs text-white/90 mt-1">Corr = Cov / (SD₁ × SD₂)</div>

                        </div>

                        <div>

                          <label className="text-sm text-white block mb-1">Your Var(R<sub>p</sub>) (%²)</label>

                          <input type="number" step="0.001" value={varGuess} onChange={(e)=> setVarGuess(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white"/>

                          <div className="text-xs text-white/90 mt-1">Use calculated correlations for all pairs</div>

                        </div>

                      </div>

                    )}

                  </div>

                  {ans3 && (

                    <div className="mt-3 p-4 rounded-xl shadow-inner" style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${STEP_THEME[3].stroke}`}}>

                      <div className="font-semibold mb-2 text-white">Answer sheet</div>

                      <pre className="text-xs whitespace-pre-wrap text-white">{ans3}</pre>

                    </div>

                  )}

                </>

              )}

            </div>

          </DocumentCard>

        )}

        {step >= 4 && (

          <DocumentCard step={4} color={STEP_THEME[4].fill} stroke={STEP_THEME[4].stroke} isActive={step === 4}>

            <div className="p-4">

              <div className="flex items-start justify-between mb-2">

                <h2 className="text-2xl md:text-3xl font-bold" style={{color:SLATE}}>Step 4 — CAPM Expected Return</h2>

                <div className="flex gap-2">

                  <button onClick={()=> setStep(3)} className="rounded-full w-10 h-10 flex items-center justify-center text-white text-xl shadow hover:brightness-110 hover:shadow-lg" style={{background:SLATE}}>←</button>

                  {s4 ? (

                    <button onClick={reshuffleScenario} className="rounded-full px-3 h-10 flex items-center justify-center text-white text-sm shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>New example</button>

                  ) : (

                    <button onClick={submit4} className="rounded-full px-3 h-10 flex items-center justify-center text-white text-sm shadow hover:brightness-110 hover:shadow-lg" style={{background:SUBMIT_COLOR, border:`2px solid ${SUBMIT_BORDER}`}}>Submit</button>

                  )}

                </div>

              </div>

              {step === 4 && (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                  <div className="rounded-2xl p-4 border" style={{background:STEP_THEME[4].fill, borderColor:STEP_THEME[4].stroke}}>

                    <div className="text-sm mb-3" style={{color:SLATE}}>

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

                  <div className="rounded-2xl p-4 border" style={{background:STEP_THEME[4].fill, borderColor:STEP_THEME[4].stroke}}>

                    <div className="text-sm mb-2" style={{color:SLATE}}>Stock betas:</div>

                    <ul className="text-sm space-y-1" style={{color:SLATE}}>

                      {allTickers.map(t=> (

                        <li key={t}>{t}: β = {universe[t].beta.toFixed(2)}</li>

                      ))}

                    </ul>

                  </div>

                </div>

              )}

              {ans4 && step === 4 && (

                <div className="mt-3 p-4 rounded-xl shadow-inner" style={{ background: STEP_THEME[4].fill, border: `1px solid ${STEP_THEME[4].stroke}`}}>

                  <div className="font-semibold mb-2" style={{color:SLATE}}>Answer sheet</div>

                  <pre className="text-xs whitespace-pre-wrap" style={{color:SLATE}}>{ans4}</pre>

                </div>

              )}

            </div>

          </DocumentCard>

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

      </div>

    </div>

  );

}

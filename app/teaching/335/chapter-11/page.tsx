"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===================== PALETTE =====================
const TIF_PAGE = "#ECF9F8"; // page bg
const TIF = "#81D8D0"; // Tiffany blue (primary)
const TIF_DARK = "#2AA69A"; // accents & buttons
const SLATE = "#274248"; // dark text
const CREAM = "#FFF8F1"; // neutral answer box bg

// Per-step folder colors (distinct, discrete colors - inspired by reference)
const STEP_THEME: Record<number, { fill: string; stroke: string }> = {
  1: { fill: "#E8D5C4", stroke: "#C9A882" }, // muted peach/terracotta
  2: { fill: "#D4E4D1", stroke: "#9BB599" }, // muted sage green
  3: { fill: "#2AA69A", stroke: "#1E7F75" }, // dark teal
  4: { fill: "#F5D7C7", stroke: "#E5B8A0" }, // light pink/peach
};

// Submit button color (changed to different color)
const SUBMIT_COLOR = "#81D8D0"; // Tiffany blue

// ===================== DATA =====================
type PeriodRow = { label: string; Pt: number; DivNext: number; Pnext: number };
type CompanyKey = "Apple (AAPL)" | "Microsoft (MSFT)" | "Tesla (TSLA)" | "Coca-Cola (KO)";
type Dataset = Record<CompanyKey, PeriodRow[]>;

const DATA: Dataset = {
  "Apple (AAPL)": [
    { label: "Feb→May 2024", Pt: 183.86, DivNext: 0.25, Pnext: 189.84 },
    { label: "May→Aug 2024", Pt: 189.84, DivNext: 0.25, Pnext: 177.97 },
    { label: "Aug→Nov 2024", Pt: 177.97, DivNext: 0.25, Pnext: 189.71 },
    { label: "Nov 2024→Feb 2025", Pt: 189.71, DivNext: 0.25, Pnext: 183.86 },
    { label: "Feb→May 2025", Pt: 183.86, DivNext: 0.26, Pnext: 190.9 },
  ],
  "Microsoft (MSFT)": [
    { label: "Dec 2024→Mar 2025", Pt: 369.0, DivNext: 0.83, Pnext: 403.0 },
    { label: "Mar→Jun 2025", Pt: 403.0, DivNext: 0.83, Pnext: 432.0 },
    { label: "Jun→Sep 2025", Pt: 432.0, DivNext: 0.83, Pnext: 420.0 },
    { label: "Sep→Dec 2025", Pt: 420.0, DivNext: 0.91, Pnext: 410.0 },
  ],
  "Tesla (TSLA)": [
    { label: "Q1→Q2 2024", Pt: 175.0, DivNext: 0.0, Pnext: 194.0 },
    { label: "Q2→Q3 2024", Pt: 194.0, DivNext: 0.0, Pnext: 220.0 },
    { label: "Q3→Q4 2024", Pt: 220.0, DivNext: 0.0, Pnext: 248.0 },
    { label: "Q4 2024→Q1 2025", Pt: 248.0, DivNext: 0.0, Pnext: 205.0 },
  ],
  "Coca-Cola (KO)": [
    { label: "Jan→Apr 2024", Pt: 60.5, DivNext: 0.46, Pnext: 61.8 },
    { label: "Apr→Jul 2024", Pt: 61.8, DivNext: 0.46, Pnext: 62.7 },
    { label: "Jul→Oct 2024", Pt: 62.7, DivNext: 0.46, Pnext: 58.9 },
    { label: "Oct 2024→Jan 2025", Pt: 58.9, DivNext: 0.46, Pnext: 60.2 },
  ],
};

// ===================== HELPERS =====================
const toPct = (x: number) => x * 100;
const fromPct = (x: number) => x / 100;
const to2 = (x: number) => Number.parseFloat(x.toFixed(2));
function normalPDF(x: number, mu: number, sigma: number) {
  if (sigma === 0) return 0;
  const a = 1 / (sigma * Math.sqrt(2 * Math.PI));
  return a * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}

// ===================== FOLDER SHAPE =====================
function FolderShape({
  width = 1100,
  height = 640,
  color,
  stroke,
  pad = 28,
  children,
}: {
  width?: number;
  height?: number;
  color: string;
  stroke: string;
  pad?: number;
  children?: React.ReactNode;
}) {
  const r = 18; // corner radius
  const w = width;
  const h = height;
  const d = [
    `M ${r} 0`,
    `H ${w - r}`,
    `Q ${w} 0 ${w} ${r}`,
    `V ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `H ${r}`,
    `Q 0 ${h} 0 ${h - r}`,
    `V ${r}`,
    `Q 0 0 ${r} 0`,
  ].join(" ");

  return (
    <div className="relative w-full" style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.15))" }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="rounded-[20px] block">
        <path d={d} fill={color} stroke={stroke} strokeWidth={2} />
      </svg>
      {/* Content goes directly on the colored folder (no white panel) */}
      <div className="absolute left-0 top-0 w-full h-full">
        <div className="h-full" style={{ padding: pad }}>{children}</div>
      </div>
    </div>
  );
}

// Right-side tab (like a real folder) - shows all tabs at once
function FolderTabRight({ top, height = 80, color, stroke, label, isActive, isLocked, onClick }: { top: number; height?: number; color: string; stroke: string; label: string; isActive: boolean; isLocked: boolean; onClick?: () => void }) {
  const w = 60; // tab width
  const r = 8; // corner radius
  const tabColor = isActive ? color : (isLocked ? "#E0E0E0" : color);
  const tabStroke = isActive ? stroke : (isLocked ? "#B0B0B0" : stroke);
  const textColor = isLocked ? "#999" : (isActive ? "#16333A" : "#666");
  
  return (
    <div 
      className="absolute cursor-pointer transition-all hover:scale-105" 
      style={{ 
        right: -w + 8, 
        top, 
        width: w, 
        height, 
        zIndex: isActive ? 40 : 30,
        opacity: isLocked ? 0.5 : 1
      }}
      onClick={!isLocked ? onClick : undefined}
    >
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} style={{ filter: isActive ? "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" : "drop-shadow(0 1px 3px rgba(0,0,0,0.1))" }}>
        {/* Tab shape - rounded rectangle on left side */}
        <path
          d={`M ${r} 0 H ${w} V ${height - r} Q ${w} ${height} ${w - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} V ${r} Q 0 0 ${r} 0 Z`}
          fill={tabColor}
          stroke={tabStroke}
          strokeWidth={isActive ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left edge that connects seamlessly - no boundary */}
        <line x1="0" y1={r} x2="0" y2={height - r} stroke={tabColor} strokeWidth={4} />
      </svg>
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          fontSize: "12px",
          fontWeight: isActive ? "bold" : "semibold",
          color: textColor
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ===================== PAGE WRAPPER WITH RIGHT-SIDE TABS =====================
function StepShell({ color, stroke, stepNum, currentStep, maxUnlockedStep, onStepClick, children }: { 
  color: string; 
  stroke: string; 
  stepNum: number; 
  currentStep: number;
  maxUnlockedStep: number;
  onStepClick: (step: number) => void;
  children: React.ReactNode 
}) {
  const tabHeight = 75;
  const tabSpacing = 8;
  const startTop = 80;
  
  return (
    <div className="relative w-full max-w-6xl">
      {/* Stacked sheets behind for depth */}
      <div className="absolute -top-6 -left-6 -z-10 opacity-70">
        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} />
      </div>
      <div className="absolute -top-3 left-6 -z-10 opacity-60">
        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} />
      </div>

      {/* Active folder */}
      <div className="relative">
        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={34}>
          {children}
        </FolderShape>
        
        {/* Right-side tabs - show all 4 steps */}
        {[1, 2, 3, 4].map((step) => {
          const stepTheme = STEP_THEME[step];
          const isActive = step === currentStep;
          const isLocked = step > maxUnlockedStep;
          const top = startTop + (step - 1) * (tabHeight + tabSpacing);
          
          return (
            <FolderTabRight
              key={step}
              top={top}
              height={tabHeight}
              color={stepTheme.fill}
              stroke={stepTheme.stroke}
              label={`Step ${step}`}
              isActive={isActive}
              isLocked={isLocked}
              onClick={() => onStepClick(step)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ===================== SLIDE VARIANTS =====================
const pageVariants = {
  enter: { x: 80, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -80, opacity: 0 },
};

// ===================== APP =====================
export default function ReturnsLab() {
  const [company, setCompany] = useState<CompanyKey | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const rows = company ? DATA[company] : [];
  const trueR = useMemo(() => rows.map((r) => (r.DivNext + (r.Pnext - r.Pt)) / r.Pt), [rows]);
  const meanR = useMemo(() => (trueR.length ? trueR.reduce((a, b) => a + b, 0) / trueR.length : 0), [trueR]);
  const sdR = useMemo(() => {
    if (trueR.length < 2) return 0;
    const m = meanR;
    const v = trueR.reduce((s, x) => s + (x - m) ** 2, 0) / (trueR.length - 1);
    return Math.sqrt(v);
  }, [trueR, meanR]);

  // DEV TESTS (console only)
  useEffect(() => {
    const rowsTest = DATA["Apple (AAPL)"];
    const R = rowsTest.map((r) => (r.DivNext + (r.Pnext - r.Pt)) / r.Pt);
    const mean = R.reduce((a, b) => a + b, 0) / R.length;
    const sd = Math.sqrt(R.reduce((s, x) => s + (x - mean) ** 2, 0) / (R.length - 1));
    console.assert(!Number.isNaN(mean) && !Number.isNaN(sd), "[Test] Mean/SD should be numbers");
    console.assert(R.length === rowsTest.length, "[Test] R length matches rows");

    // Additional tests: 95% band lower < upper, and data exists
    const lo = mean - 2 * sd;
    const hi = mean + 2 * sd;
    console.assert(lo < hi, "[Test] Lower bound should be less than upper bound");
    console.assert(Object.keys(DATA).length >= 4, "[Test] DATA should include 4 companies");

    // New tests: Apple row 1 R ≈ 3.39%
    const r1 = (0.25 + (189.84 - 183.86)) / 183.86;
    console.assert(Math.abs(r1 - 0.0339) < 0.001, "[Test] Apple row1 R should be ~3.39%");
  }, []);

  // Inputs
  const [rInput, setRInput] = useState<number[]>([]);
  const [avgInput, setAvgInput] = useState<string>("");
  const [sdInput, setSdInput] = useState<string>("");
  const [loInput, setLoInput] = useState<string>("");
  const [hiInput, setHiInput] = useState<string>("");

  // Submit gates
  const [submitted1, setSubmitted1] = useState(false);
  const [submitted2, setSubmitted2] = useState(false);
  const [submitted3, setSubmitted3] = useState(false);
  const [submitted4, setSubmitted4] = useState(false);

  // Answer notes
  const [answer2, setAnswer2] = useState<string | null>(null);
  const [answer3, setAnswer3] = useState<string | null>(null);
  const [answer4, setAnswer4] = useState<string | null>(null);

  // ---------- NAV RULES ----------
  const canNext = (s: typeof step) => (s === 1 && submitted1) || (s === 2 && submitted2) || (s === 3 && submitted3);
  const maxUnlockedStep = (submitted1 ? 2 : 1) + (submitted2 ? 1 : 0) + (submitted3 ? 1 : 0);
  const goToStep = (s: 1 | 2 | 3 | 4) => {
    // Can only go to unlocked steps (current or previous)
    if (s <= maxUnlockedStep) {
      setStep(s);
    }
  };

  // ---------- STEP ACTIONS ----------
  const pickCompany = (k: CompanyKey) => {
    setCompany(k);
    setRInput(Array.from({ length: DATA[k].length }, () => 0));
    setSubmitted1(false);
    setSubmitted2(false);
    setSubmitted3(false);
    setSubmitted4(false);
    setAnswer2(null);
    setAnswer3(null);
    setAnswer4(null);
  };

  const submit1 = () => {
    if (company) setSubmitted1(true);
  };

  const submit2 = () => {
    const lines = rows.map((r, i) => {
      const correct = to2(toPct(trueR[i]));
      const yours = rInput[i] ?? NaN;
      const ok = Math.abs((yours || 0) - correct) <= 0.1;
      return `${ok ? "✅" : "❌"} ${r.label}: your ${yours || 0}% → ${correct}%  |  R = (${r.DivNext.toFixed(2)} + ${r.Pnext.toFixed(2)} − ${r.Pt.toFixed(2)}) / ${r.Pt.toFixed(2)}`;
    });
    setAnswer2(lines.join("\n"));
    setSubmitted2(true);
  };

  const submit3 = () => {
    const meanPct = to2(toPct(meanR));
    const sdPct = to2(toPct(sdR));
    const yourMean = parseFloat(avgInput || "NaN");
    const yourSd = parseFloat(sdInput || "NaN");
    const okM = Math.abs((yourMean || 0) - meanPct) <= 0.1;
    const okS = Math.abs((yourSd || 0) - sdPct) <= 0.1;
    setAnswer3(
      `${okM ? "✅" : "❌"} Mean: your ${yourMean || 0}% → ${meanPct}%\n` +
        `${okS ? "✅" : "❌"} SD: your ${yourSd || 0}% → ${sdPct}%\n\n` +
        `Mean = average(R)\nSD = sample SD of R`
    );
    setSubmitted3(true);
  };

  const submit4 = () => {
    const loTrue = to2(toPct(meanR - 2 * sdR));
    const hiTrue = to2(toPct(meanR + 2 * sdR));
    const lo = parseFloat(loInput || "NaN");
    const hi = parseFloat(hiInput || "NaN");
    const okL = Math.abs((lo || 0) - loTrue) <= 0.2;
    const okH = Math.abs((hi || 0) - hiTrue) <= 0.2;
    setAnswer4(
      `${okL ? "✅" : "❌"} Lower: your ${lo || 0}% → ${loTrue}%\n` +
        `${okH ? "✅" : "❌"} Upper: your ${hi || 0}% → ${hiTrue}%\n\nInterval ≈ μ ± 2σ`
    );
    setSubmitted4(true);
  };

  // ===================== RENDER =====================
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: TIF_PAGE }}>
      <AnimatePresence mode="wait">
        {/* ===================== STEP 1 ===================== */}
        {step === 1 && (
          <motion.section key="s1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell color={STEP_THEME[1].fill} stroke={STEP_THEME[1].stroke} stepNum={1} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>
              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: SLATE }}>
                  Step 1 — Pick your company
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(["Apple (AAPL)", "Microsoft (MSFT)", "Tesla (TSLA)", "Coca-Cola (KO)"] as CompanyKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => pickCompany(k)}
                      className="rounded-2xl px-4 py-8 shadow hover:scale-[1.02] transition text-center font-semibold border"
                      style={{ background: "rgba(255,255,255,0.4)", color: SLATE, borderColor: STEP_THEME[1].stroke }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm" style={{ color: SLATE }}>Selected: {company ?? "—"}</div>
                  <div className="flex gap-2">
                    <button onClick={submit1} disabled={!company} className={`px-4 py-2 rounded-xl text-white font-semibold shadow ${company ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: SUBMIT_COLOR }}>
                      Submit
                    </button>
                    <button onClick={() => canNext(1) && goToStep(2)} disabled={!canNext(1)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(1) ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: SLATE }}>
                      →
                    </button>
                  </div>
                </div>
              </div>
            </StepShell>
          </motion.section>
        )}

        {/* ===================== STEP 2 ===================== */}
        {step === 2 && (
          <motion.section key="s2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell color={STEP_THEME[2].fill} stroke={STEP_THEME[2].stroke} stepNum={2} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: SLATE }}>
                    Step 2 — Compute period returns (company: {company ?? "—"})
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => goToStep(1)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow" style={{ background: SLATE }}>
                      ←
                    </button>
                    <button onClick={submit2} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow" style={{ background: SUBMIT_COLOR }}>
                      Submit
                    </button>
                    <button onClick={() => canNext(2) && goToStep(3)} disabled={!canNext(2)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(2) ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: SLATE }}>
                      →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow border" style={{ background: STEP_THEME[2].fill, borderColor: STEP_THEME[2].stroke, opacity: 0.9 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead style={{ background: "rgba(255,255,255,0.3)" }}>
                        <tr className="text-left">
                          <th className="p-3" style={{ color: SLATE }}>Period</th>
                          <th className="p-3" style={{ color: SLATE }}>Pₜ</th>
                          <th className="p-3" style={{ color: SLATE }}>Divₜ₊₁</th>
                          <th className="p-3" style={{ color: SLATE }}>Pₜ₊₁</th>
                          <th className="p-3" style={{ color: SLATE }}>Your Rₜ₊₁ (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className="border-t" style={{ borderColor: STEP_THEME[2].stroke }}>
                            <td className="p-3 whitespace-nowrap" style={{ color: SLATE }}>{r.label}</td>
                            <td className="p-3" style={{ color: SLATE }}>{r.Pt.toFixed(2)}</td>
                            <td className="p-3" style={{ color: SLATE }}>{r.DivNext.toFixed(2)}</td>
                            <td className="p-3" style={{ color: SLATE }}>{r.Pnext.toFixed(2)}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                step="0.01"
                                value={rInput[i] || 0}
                                onChange={(e) => setRInput((prev) => prev.map((x, j) => (j === i ? Number(e.target.value) : x)))}
                                className="w-28 rounded-xl px-2 py-1 border bg-white"
                                style={{ borderColor: STEP_THEME[2].stroke }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {submitted2 && (
                  <div className="mt-4 p-4 rounded-xl shadow-inner" style={{ background: STEP_THEME[2].fill, border: `1px solid ${STEP_THEME[2].stroke}` }}>
                    <div className="font-semibold mb-2" style={{ color: SLATE }}>Answer sheet</div>
                    <pre className="text-xs whitespace-pre-wrap" style={{ color: SLATE }}>{answer2}</pre>
                  </div>
                )}
              </div>
            </StepShell>
          </motion.section>
        )}

        {/* ===================== STEP 3 ===================== */}
        {step === 3 && (
          <motion.section key="s3" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell color={STEP_THEME[3].fill} stroke={STEP_THEME[3].stroke} stepNum={3} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "white" }}>
                    Step 3 — Compute Average & SD
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => goToStep(2)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow" style={{ background: SLATE }}>
                      ←
                    </button>
                    <button onClick={submit3} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow" style={{ background: SUBMIT_COLOR }}>
                      Submit
                    </button>
                    <button onClick={() => canNext(3) && goToStep(4)} disabled={!canNext(3)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(3) ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: SLATE }}>
                      →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: "rgba(255,255,255,0.15)", borderColor: STEP_THEME[3].stroke }}>
                  <table className="w-full text-sm">
                    <thead style={{ background: "rgba(255,255,255,0.2)" }}>
                      <tr className="text-left">
                        <th className="p-3" style={{ color: "white" }}>Period</th>
                        <th className="p-3" style={{ color: "white" }}>Correct Rₜ₊₁ (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: STEP_THEME[3].stroke }}>
                          <td className="p-3" style={{ color: "white" }}>{r.label}</td>
                          <td className="p-3" style={{ color: "white" }}>{to2(toPct(trueR[i]))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-2xl shadow p-6" style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${STEP_THEME[3].stroke}` }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="text-sm" style={{ color: "white" }}>Average (%)</label>
                      <input type="number" step="0.01" value={avgInput} onChange={(e) => setAvgInput(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white" />
                    </div>
                    <div>
                      <label className="text-sm" style={{ color: "white" }}>SD (%)</label>
                      <input type="number" step="0.01" value={sdInput} onChange={(e) => setSdInput(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white" />
                    </div>
                    <div className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>Use the R table above (correct values).</div>
                  </div>
                </div>

                {submitted3 && (
                  <div className="mt-4 p-4 rounded-xl shadow-inner" style={{ background: "rgba(255,255,255,0.15)", border: `1px solid ${STEP_THEME[3].stroke}` }}>
                    <div className="font-semibold mb-2" style={{ color: "white" }}>Answer sheet</div>
                    <pre className="text-xs whitespace-pre-wrap" style={{ color: "white" }}>{answer3}</pre>
                  </div>
                )}
              </div>
            </StepShell>
          </motion.section>
        )}

        {/* ===================== STEP 4 ===================== */}
        {step === 4 && (
          <motion.section key="s4" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell color={STEP_THEME[4].fill} stroke={STEP_THEME[4].stroke} stepNum={4} currentStep={step} maxUnlockedStep={maxUnlockedStep} onStepClick={goToStep}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: SLATE }}>
                    Step 4 — ~95% Prediction Band
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => goToStep(3)} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow" style={{ background: SLATE }}>
                      ←
                    </button>
                    {submitted4 ? (
                      <button
                        onClick={() => {
                          setCompany(null);
                          setStep(1);
                          setSubmitted1(false);
                          setSubmitted2(false);
                          setSubmitted3(false);
                          setSubmitted4(false);
                          setRInput([]);
                          setAvgInput("");
                          setSdInput("");
                          setLoInput("");
                          setHiInput("");
                          setAnswer2(null);
                          setAnswer3(null);
                          setAnswer4(null);
                        }}
                        className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow"
                        style={{ background: SUBMIT_COLOR }}
                      >
                        Try another company
                      </button>
                    ) : (
                      <button onClick={submit4} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow" style={{ background: SUBMIT_COLOR }}>
                        Submit
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: STEP_THEME[4].fill, borderColor: STEP_THEME[4].stroke, opacity: 0.9 }}>
                  <table className="w-full text-sm">
                    <thead style={{ background: "rgba(255,255,255,0.3)" }}>
                      <tr className="text-left">
                        <th className="p-3" style={{ color: SLATE }}>Period</th>
                        <th className="p-3" style={{ color: SLATE }}>Correct Rₜ₊₁ (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: STEP_THEME[4].stroke }}>
                          <td className="p-3" style={{ color: SLATE }}>{r.label}</td>
                          <td className="p-3" style={{ color: SLATE }}>{to2(toPct(trueR[i]))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-2xl shadow p-6" style={{ background: STEP_THEME[4].fill, border: `1px solid ${STEP_THEME[4].stroke}`, opacity: 0.9 }}>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <Bell mean={meanR} sd={sdR} />
                    <div className="flex-1">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="p-2 font-medium" style={{ color: SLATE }}>Lower (μ − 2σ) %</td>
                            <td className="p-2">
                              <input type="number" step="0.01" value={loInput} onChange={(e) => setLoInput(e.target.value)} className="w-36 rounded-xl px-2 py-1 border bg-white" />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium" style={{ color: SLATE }}>Upper (μ + 2σ) %</td>
                            <td className="p-2">
                              <input type="number" step="0.01" value={hiInput} onChange={(e) => setHiInput(e.target.value)} className="w-36 rounded-xl px-2 py-1 border bg-white" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {submitted4 && (
                  <div className="mt-4 p-4 rounded-xl shadow-inner" style={{ background: STEP_THEME[4].fill, border: `1px solid ${STEP_THEME[4].stroke}` }}>
                    <div className="font-semibold mb-2" style={{ color: SLATE }}>Answer sheet</div>
                    <pre className="text-xs whitespace-pre-wrap" style={{ color: SLATE }}>{answer4}</pre>
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

// ============== Bell curve component ==============
function Bell({ mean, sd }: { mean: number; sd: number }) {
  const width = 600;
  const height = 220;
  const padding = 36;
  const sigma = sd || 0.00001;
  const xMin = mean - 4 * sigma,
    xMax = mean + 4 * sigma;
  const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const maxY = normalPDF(mean, mean, sigma);
  const scaleY = (y: number) => height - padding - (y / maxY) * (height - 2 * padding);

  const N = 200;
  const path = Array.from({ length: N }, (_, i) => {
    const x = xMin + (i / (N - 1)) * (xMax - xMin);
    const y = normalPDF(x, mean, sigma);
    return `${i === 0 ? "M" : "L"}${scaleX(x)},${scaleY(y)}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="rounded-xl shadow" style={{ background: "white" }}>
      <path d={path} fill="none" stroke={SLATE} strokeWidth={3} />
      <line x1={scaleX(mean)} y1={padding} x2={scaleX(mean)} y2={height - padding} stroke={TIF_DARK} strokeDasharray="6,6" />
    </svg>
  );
}

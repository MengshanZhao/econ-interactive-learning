"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===================== PALETTE =====================
const TIF_PAGE = "#ECF9F8"; // page bg
const TIF = "#81D8D0"; // Tiffany blue (primary)
const TIF_DARK = "#2AA69A"; // accents & buttons
const SLATE = "#274248"; // dark text
const CREAM = "#FFF8F1"; // neutral answer box bg

// Per-step folder colors (elegant Tiffany blue inspired palette)
const STEP_THEME: Record<number, { fill: string; stroke: string }> = {
  1: { fill: "#A8E6E1", stroke: "#5FCBC4" }, // light tiffany
  2: { fill: "#B7DFE3", stroke: "#7BB8C1" }, // soft aqua
  3: { fill: "#C4E8E9", stroke: "#8FCFD0" }, // pale cyan
  4: { fill: "#D1E4ED", stroke: "#9DC5D6" }, // light sky blue
};

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

// Small top tab that "bumps" above the folder edge - fixed styling to match reference
function FolderTab({ left, width = 65, color, stroke, label }: { left: number; width?: number; color: string; stroke: string; label?: string }) {
  const h = 28; // tab height above the top (smaller for more refined look)
  const r = 6; // smaller radius for more refined look
  return (
    <div className="absolute -top-7" style={{ left, width, height: h, zIndex: 30 }}>
      <svg width="100%" height={h} viewBox={`0 0 ${width} ${h}`} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
        {/* Tab shape - rounded rectangle, bottom edge matches folder color (no visible boundary) */}
        <path
          d={`M ${r} 0 H ${width - r} Q ${width} 0 ${width} ${r} V ${h - r} Q ${width} ${h} ${width - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`}
          fill={color}
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Overlay bottom edge with folder color to hide boundary */}
        <line x1="0" y1={h} x2={width} y2={h} stroke={color} strokeWidth={3} />
      </svg>
      {label ? (
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold" style={{ color: "#16333A" }}>{label}</div>
      ) : null}
    </div>
  );
}

// ===================== PAGE WRAPPER + STACKED LOOK =====================
function LeftPeek({ color, stroke, inset = 16, width = 18 }: { color: string; stroke: string; inset?: number; width?: number }) {
  // A slim rounded strip peeking from the left to suggest the older folder beneath
  return (
    <div className="absolute" style={{ left: -width + 6, top: inset, bottom: inset, width }}>
      <svg width="100%" height="100%" viewBox="0 0 20 100" preserveAspectRatio="none">
        <path d="M18 2 Q18 0 16 0 H4 Q2 0 2 2 V98 Q2 100 4 100 H16 Q18 100 18 98 Z" fill={color} stroke={stroke} strokeWidth={2} />
      </svg>
    </div>
  );
}

function StepShell({ bumpX, color, stroke, prevTabs = [], stepNum, children }: { bumpX: number; color: string; stroke: string; prevTabs?: Array<{ left: number; color: string; stroke: string; label?: string }>; stepNum: number; children: React.ReactNode }) {
  // Ensure a single parent node wraps the tab + folder content
  return (
    <div className="relative w-full max-w-6xl">
      {/* Left peeks from earlier steps (only show a slice) */}
      {prevTabs.length > 0 && (
        <LeftPeek color={prevTabs[prevTabs.length - 1].color} stroke={prevTabs[prevTabs.length - 1].stroke} />
      )}

      {/* Stacked sheets behind for depth */}
      <div className="absolute -top-6 -left-6 -z-10 opacity-70">
        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} />
      </div>
      <div className="absolute -top-3 left-6 -z-10 opacity-60">
        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={28} />
      </div>

      {/* Active folder + its tab */}
      <div className="relative">
        <FolderTab left={bumpX} color={color} stroke={stroke} label={`Step ${stepNum}`} />
        <FolderShape width={1100} height={640} color={color} stroke={stroke} pad={34}>
          {children}
        </FolderShape>
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
  const goNext = () => setStep((s) => (s === 4 ? 4 : ((s + 1) as any)));
  const goPrev = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as any)));

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
  // Adjusted bump positions - tabs very close to left edge, narrow spacing (matching reference image)
  const bumpByStep = { 1: 24, 2: 100, 3: 176, 4: 252 } as const; // left → right, smaller increments, closer to left

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: TIF_PAGE }}>
      <AnimatePresence mode="wait">
        {/* ===================== STEP 1 ===================== */}
        {step === 1 && (
          <motion.section key="s1" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell bumpX={bumpByStep[1]} color={STEP_THEME[1].fill} stroke={STEP_THEME[1].stroke} prevTabs={[]} stepNum={1}>
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
                      style={{ background: "#F7E5D1", color: SLATE, borderColor: "#E3C39B" }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="text-sm text-slate-700">Selected: {company ?? "—"}</div>
                  <button onClick={submit1} disabled={!company} className={`px-4 py-2 rounded-xl text-white font-semibold shadow ${company ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: TIF_DARK }}>
                    Submit
                  </button>
                  <button onClick={() => canNext(1) && goNext()} disabled={!canNext(1)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(1) ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: TIF_DARK }}>
                    →
                  </button>
                </div>
              </div>
            </StepShell>
          </motion.section>
        )}

        {/* ===================== STEP 2 ===================== */}
        {step === 2 && (
          <motion.section key="s2" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell bumpX={bumpByStep[2]} color={STEP_THEME[2].fill} stroke={STEP_THEME[2].stroke} prevTabs={[{ left: bumpByStep[1], color: STEP_THEME[1].fill, stroke: STEP_THEME[1].stroke, label: "Step 1" }]} stepNum={2}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: SLATE }}>
                    Step 2 — Compute period returns (company: {company ?? "—"})
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={goPrev} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow" style={{ background: SLATE }}>
                      ←
                    </button>
                    <button onClick={submit2} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow" style={{ background: TIF_DARK }}>
                      Submit
                    </button>
                    <button onClick={() => canNext(2) && goNext()} disabled={!canNext(2)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(2) ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: TIF_DARK }}>
                      →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow border" style={{ background: CREAM, borderColor: "#efd6cc" }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/60">
                        <tr className="text-left">
                          <th className="p-3">Period</th>
                          <th className="p-3">Pₜ</th>
                          <th className="p-3">Divₜ₊₁</th>
                          <th className="p-3">Pₜ₊₁</th>
                          <th className="p-3">Your Rₜ₊₁ (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3 whitespace-nowrap">{r.label}</td>
                            <td className="p-3">{r.Pt.toFixed(2)}</td>
                            <td className="p-3">{r.DivNext.toFixed(2)}</td>
                            <td className="p-3">{r.Pnext.toFixed(2)}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                step="0.01"
                                value={rInput[i] || 0}
                                onChange={(e) => setRInput((prev) => prev.map((x, j) => (j === i ? Number(e.target.value) : x)))}
                                className="w-28 rounded-xl px-2 py-1 border bg-white"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {submitted2 && (
                  <div className="mt-4 p-4 rounded-xl bg-white shadow-inner">
                    <div className="font-semibold mb-2">Answer sheet</div>
                    <pre className="text-xs whitespace-pre-wrap">{answer2}</pre>
                  </div>
                )}
              </div>
            </StepShell>
          </motion.section>
        )}

        {/* ===================== STEP 3 ===================== */}
        {step === 3 && (
          <motion.section key="s3" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell bumpX={bumpByStep[3]} color={STEP_THEME[3].fill} stroke={STEP_THEME[3].stroke} prevTabs={[{ left: bumpByStep[1], color: STEP_THEME[1].fill, stroke: STEP_THEME[1].stroke, label: "Step 1" }, { left: bumpByStep[2], color: STEP_THEME[2].fill, stroke: STEP_THEME[2].stroke, label: "Step 2" }]} stepNum={3}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: SLATE }}>
                    Step 3 — Compute Average & SD
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={goPrev} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow" style={{ background: SLATE }}>
                      ←
                    </button>
                    <button onClick={submit3} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow" style={{ background: TIF_DARK }}>
                      Submit
                    </button>
                    <button onClick={() => canNext(3) && goNext()} disabled={!canNext(3)} className={`rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow ${canNext(3) ? "" : "opacity-50 cursor-not-allowed"}`} style={{ background: TIF_DARK }}>
                      →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: "#F7FAFF", borderColor: "#E2ECFB" }}>
                  <table className="w-full text-sm">
                    <thead className="bg-white/60">
                      <tr className="text-left">
                        <th className="p-3">Period</th>
                        <th className="p-3">Correct Rₜ₊₁ (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3">{r.label}</td>
                          <td className="p-3">{to2(toPct(trueR[i]))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="text-sm">Average (%)</label>
                      <input type="number" step="0.01" value={avgInput} onChange={(e) => setAvgInput(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white" />
                    </div>
                    <div>
                      <label className="text-sm">SD (%)</label>
                      <input type="number" step="0.01" value={sdInput} onChange={(e) => setSdInput(e.target.value)} className="w-full rounded-xl px-3 py-2 border bg-white" />
                    </div>
                    <div className="text-sm text-slate-600">Use the R table above (correct values).</div>
                  </div>
                </div>

                {submitted3 && (
                  <div className="mt-4 p-4 rounded-xl bg-white shadow-inner">
                    <div className="font-semibold mb-2">Answer sheet</div>
                    <pre className="text-xs whitespace-pre-wrap">{answer3}</pre>
                  </div>
                )}
              </div>
            </StepShell>
          </motion.section>
        )}

        {/* ===================== STEP 4 ===================== */}
        {step === 4 && (
          <motion.section key="s4" variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45 }}>
            <StepShell bumpX={bumpByStep[4]} color={STEP_THEME[4].fill} stroke={STEP_THEME[4].stroke} prevTabs={[{ left: bumpByStep[1], color: STEP_THEME[1].fill, stroke: STEP_THEME[1].stroke, label: "Step 1" }, { left: bumpByStep[2], color: STEP_THEME[2].fill, stroke: STEP_THEME[2].stroke, label: "Step 2" }, { left: bumpByStep[3], color: STEP_THEME[3].fill, stroke: STEP_THEME[3].stroke, label: "Step 3" }]} stepNum={4}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: SLATE }}>
                    Step 4 — ~95% Prediction Band
                  </h2>
                </div>

                <div className="rounded-2xl overflow-hidden shadow border mb-4" style={{ background: "#F7FAFF", borderColor: "#E2ECFB" }}>
                  <table className="w-full text-sm">
                    <thead className="bg-white/60">
                      <tr className="text-left">
                        <th className="p-3">Period</th>
                        <th className="p-3">Correct Rₜ₊₁ (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3">{r.label}</td>
                          <td className="p-3">{to2(toPct(trueR[i]))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <Bell mean={meanR} sd={sdR} />
                    <div className="flex-1">
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="p-2 font-medium">Lower (μ − 2σ) %</td>
                            <td className="p-2">
                              <input type="number" step="0.01" value={loInput} onChange={(e) => setLoInput(e.target.value)} className="w-36 rounded-xl px-2 py-1 border bg-white" />
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">Upper (μ + 2σ) %</td>
                            <td className="p-2">
                              <input type="number" step="0.01" value={hiInput} onChange={(e) => setHiInput(e.target.value)} className="w-36 rounded-xl px-2 py-1 border bg-white" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="mt-4 flex gap-2">
                        <button onClick={goPrev} className="rounded-full w-12 h-12 flex items-center justify-center text-white text-xl shadow" style={{ background: SLATE }}>
                          ←
                        </button>
                        <button onClick={submit4} className="rounded-full px-4 h-12 flex items-center justify-center text-white text-base shadow" style={{ background: TIF_DARK }}>
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {submitted4 && (
                  <div className="mt-4 p-4 rounded-xl bg-white shadow-inner">
                    <div className="font-semibold mb-2">Answer sheet</div>
                    <pre className="text-xs whitespace-pre-wrap">{answer4}</pre>
                    <div className="mt-4 flex items-center gap-3">
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
                        className="px-4 py-2 rounded-xl text-white font-semibold"
                        style={{ background: SLATE }}
                      >
                        Try another company
                      </button>
                    </div>
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

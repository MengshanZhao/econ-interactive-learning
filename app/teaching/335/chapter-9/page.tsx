"use client";
import React from "react";

export default function IncrementalEarningsGame() {
  // ---------------------- UTILITIES ----------------------
  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const to2 = (x: number) => Number.parseFloat(x.toFixed(2));

  type Scene = "TEACH" | "PLAY";

  const calcEBIT = (revenues: number, costs: number, dep: number) => to2(revenues - costs - dep);
  const calcEarnings = (ebit: number, taxRate: number) => to2(ebit - taxRate * ebit);

  // ---------------------- EXAMPLE GENERATOR ----------------------
  const makeExample = () => {
    const years = 5;
    const taxRate = rnd(18, 30) / 100;

    const capex = rnd(800, 1200);
    const depreciation = to2(capex / years);

    const rev = rnd(420, 620);
    const cost = rnd(120, 220);
    const y0Cost = rnd(30, 80);

    const rows = Array.from({ length: years + 1 }, (_, t) => {
      const revenues = t === 0 ? 0 : rev;
      const costs = t === 0 ? y0Cost : cost;
      const dep = t === 0 ? 0 : depreciation;
      const ebit = calcEBIT(revenues, costs, dep);
      const tax = to2(-taxRate * ebit);
      const earnings = to2(ebit + tax);
      return { t, revenues, costs, dep, ebit, tax, earnings };
    });

    return { years, taxRate, capex, depreciation, rev, cost, y0Cost, rows };
  };

  // ---------------------- STATE ----------------------
  const [scene, setScene] = React.useState<Scene>("TEACH");
  const [ex, setEx] = React.useState(makeExample());
  const [typed, setTyped] = React.useState("");
  const fullText = `Incremental Earnings = (Incremental Revenues − Incremental Costs − Depreciation) × (1 − Tax Rate).\n\nTax is recorded as −(Tax Rate × EBIT). So when EBIT is positive, tax is negative; when EBIT is negative, tax becomes a positive tax shield.\n\nWatch this one worked example carefully — I only teach you once.`;

  // ---------------------- TYPEWRITER + SOUND ----------------------
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const typeIndex = React.useRef(0);
  const typingRef = React.useRef<number | null>(null);

  const playTick = () => {
    try {
      if (typeof window === "undefined") return;
      if (!audioCtxRef.current) audioCtxRef.current = new (window as any).AudioContext();
      const ctx = audioCtxRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 1200;
      g.gain.value = 0.02;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        try { o.stop(); } catch {}
      }, 30);
    } catch {}
  };

  React.useEffect(() => {
    if (scene !== "TEACH") return;
    if (typingRef.current) cancelAnimationFrame(typingRef.current as any);
    setTyped("");
    typeIndex.current = 0;

    const step = () => {
      if (typeIndex.current < fullText.length) {
        const next = fullText[typeIndex.current];
        setTyped((s) => s + next);
        if (next !== " " && next !== "\n") playTick();
        typeIndex.current += 1;
        typingRef.current = requestAnimationFrame(() => setTimeout(step, 22)) as any;
      }
    };
    step();
    return () => {
      if (typingRef.current) cancelAnimationFrame(typingRef.current as any);
    };
  }, [scene]);

  // ---------------------- STUDENT INPUTS ----------------------
  const [answers, setAnswers] = React.useState(() => ex.rows.map(() => ({ ebit: "", earn: "" })));
  const resetGame = () => {
    const e = makeExample();
    setEx(e);
    setAnswers(e.rows.map(() => ({ ebit: "", earn: "" })));
    setScene("TEACH");
  };

  // ---------------------- VALIDATION ----------------------
  const [errors, setErrors] = React.useState<{ key: string; msg: string }[]>([]);
  const [submitted, setSubmitted] = React.useState(false);

  const check = () => {
    const errs: { key: string; msg: string }[] = [];
    ex.rows.forEach((r, i) => {
      const ebitIn = Number(answers[i].ebit);
      const earnIn = Number(answers[i].earn);
      if (!Number.isFinite(ebitIn) || Math.abs(ebitIn - r.ebit) > 0.1) {
        errs.push({ key: `ebit-${i}`, msg: `Year ${r.t}: EBIT should be ${r.ebit}. Calculation: ${r.revenues} − ${r.costs} − ${r.dep} = ${r.ebit}.` });
      }
      if (!Number.isFinite(earnIn) || Math.abs(earnIn - r.earnings) > 0.1) {
        const sign = r.ebit >= 0 ? "−" : "+";
        errs.push({ key: `earn-${i}`, msg: `Year ${r.t}: Incremental Earnings should be ${r.earnings}. Calculation: EBIT ${r.ebit} ${sign} ${to2(Math.abs(ex.taxRate * r.ebit))} (tax) = ${r.earnings}.` });
      }
    });
    setErrors(errs);
    setSubmitted(true);
  };

  const wrong = (key: string) => errors.some((e) => e.key === key);

  // ---------------------- RENDER ----------------------
  const Table = ({ mode }: { mode: "TEACH" | "PLAY" }) => (
    <div className="w-full overflow-auto">
      <table className="w-full border border-black text-sm">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-2 text-left">Year</th>
            <th className="p-2 text-left">Incremental Revenues</th>
            <th className="p-2 text-left">Incremental Costs</th>
            <th className="p-2 text-left">Depreciation</th>
            <th className="p-2 text-left">EBIT</th>
            <th className="p-2 text-left">Income Tax @ {to2(ex.taxRate * 100)}%</th>
            <th className="p-2 text-left">Incremental Earnings</th>
          </tr>
        </thead>
        <tbody>
          {ex.rows.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-neutral-100">
              <td className="p-2 border-t border-black">{r.t}</td>
              <td className="p-2 border-t border-black">{r.revenues}</td>
              <td className="p-2 border-t border-black">{-r.costs}</td>
              <td className="p-2 border-t border-black">{-r.dep}</td>
              <td className="p-2 border-t border-black">
                {mode === "TEACH" ? (
                  <span>{r.ebit}</span>
                ) : (
                  <input
                    aria-label={`EBIT year ${r.t}`}
                    inputMode="decimal"
                    className={`w-28 border px-2 py-1 bg-white ${wrong(`ebit-${i}`) ? "ring-2 ring-red-600 rounded-full" : ""}`}
                    value={answers[i].ebit}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers(prev => {
                        const next = [...prev];
                        next[i] = { ...next[i], ebit: v };
                        return next;
                      });
                    }}
                    placeholder="EBIT"
                  />
                )}
              </td>
              <td className="p-2 border-t border-black">{r.tax}</td>
              <td className="p-2 border-t border-black">
                {mode === "TEACH" ? (
                  <span>{r.earnings}</span>
                ) : (
                  <input
                    aria-label={`Earnings year ${r.t}`}
                    inputMode="decimal"
                    className={`w-28 border px-2 py-1 bg-white ${wrong(`earn-${i}`) ? "ring-2 ring-red-600 rounded-full" : ""}`}
                    value={answers[i].earn}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAnswers(prev => {
                        const next = [...prev];
                        next[i] = { ...next[i], earn: v };
                        return next;
                      });
                    }}
                    placeholder="Earnings"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const StepCard = ({ step, text }: { step: number; text: string }) => (
    <div className="border border-black p-3 mt-3">
      <div className="text-xs uppercase tracking-wider">Step {step}</div>
      <div className="font-medium">{text}</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white text-black font-mono p-6 flex flex-col gap-6">

      {scene === "TEACH" ? (
        <>
          <div className="whitespace-pre-wrap leading-7 border border-black p-4 bg-neutral-50 shadow-[8px_8px_0_#000]">
            {typed}
          </div>

          <div className="text-sm">Straight‑line depreciation base = {ex.capex} over {ex.years} years → Depreciation each year = {ex.depreciation}.</div>

          <Table mode="TEACH" />

          <StepCard step={1} text={`Compute EBIT each year: Revenues − Costs − Depreciation.`} />
          <StepCard step={2} text={`Compute tax: −(Tax Rate × EBIT). Here Tax Rate = ${to2(ex.taxRate * 100)}%.`} />
          <StepCard step={3} text={`Incremental Earnings = EBIT + Tax.`} />

          <div className="flex gap-3 mt-4">
            <button
              className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition"
              onClick={() => setScene("PLAY")}
            >
              Now it's your turn →
            </button>
            <button
              className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition"
              onClick={resetGame}
              title="Try a different teaching example"
            >
              Try a different example
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm">Fill only the <span className="underline">EBIT</span> and <span className="underline">Incremental Earnings</span> columns. Everything else is given. Keep two decimals.</div>
          <Table mode="PLAY" />
          <div className="flex gap-3 mt-4 items-center">
            <button
              className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition"
              onClick={check}
            >
              Submit
            </button>
            <button
              className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition"
              onClick={resetGame}
            >
              Try a different example
            </button>
            <div className="text-xs opacity-70">All values in currency units; tax shown with sign (negative tax is payment).</div>
          </div>

          {submitted && (
            <div className="mt-4">
              {errors.length === 0 ? (
                <div className="border-2 border-black p-4 bg-neutral-50 font-semibold">Perfect! All entries are correct.</div>
              ) : (
                <div className="border-2 border-red-600 p-4 bg-red-50">
                  <div className="font-semibold mb-2">Check the red‑ringed cells. Here are the fixes:</div>
                  <ul className="list-disc ml-6">
                    {errors.map((e, i) => (
                      <li key={i} className="mb-1">{e.msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

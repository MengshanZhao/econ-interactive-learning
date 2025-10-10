"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function InvestmentDecisionGame() {
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState("");

  // ---------- Helpers ----------
  const npv = (rate, flows) => flows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);

  const irr = (flows) => {
    let lo = -0.99, hi = 5.0;
    const f = (r) => npv(r, flows);
    let flo = f(lo), fhi = f(hi);
    if (Number.isNaN(flo) || Number.isNaN(fhi) || flo * fhi > 0) return NaN;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      const fmid = f(mid);
      if (Math.abs(fmid) < 1e-10) return mid;
      if (flo * fmid < 0) {
        hi = mid; fhi = fmid;
      } else {
        lo = mid; flo = fmid;
      }
    }
    return (lo + hi) / 2;
  };

  const payback = (flows) => {
    let remaining = -flows[0];
    for (let t = 1; t < flows.length; t++) {
      if (remaining <= flows[t]) return t - 1 + remaining / flows[t];
      remaining -= flows[t];
    }
    return Infinity;
  };

  // ---------- Scenario generation ----------
  const buildScenario = () => {
    const periods = [0, 1, 2];
    const r = 0.1;
    const A0 = -500, B0 = -400;

    for (let tries = 0; tries < 200; tries++) {
      const a1 = 260 + Math.floor(Math.random() * 140);
      const a2 = 240 + Math.floor(Math.random() * 160);
      const b1 = 260 + Math.floor(Math.random() * 140);
      const b2 = 140 + Math.floor(Math.random() * 160);

      const projA = [A0, a1, a2];
      const projB = [B0, b1, b2];

      const npvA = npv(r, projA);
      const npvB = npv(r, projB);
      const irrA = irr(projA);
      const irrB = irr(projB);
      const pbA = payback(projA);
      const pbB = payback(projB);
      const piA = npvA / Math.abs(A0);
      const piB = npvB / Math.abs(B0);

      const disagree = (npvA > npvB && irrB > irrA) || (npvB > npvA && irrA > irrB);
      if (Number.isFinite(irrA) && Number.isFinite(irrB) && disagree)
        return { periods, projA, projB, r, npvA, npvB, irrA, irrB, pbA, pbB, piA, piB };
    }
    return { periods: [0, 1, 2], projA: [-500, 325, 325], projB: [-400, 325, 200], r: 0.1 };
  };

  const [scenario, setScenario] = useState(buildScenario());

  const formatMoney = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const pct = (x) => (isFinite(x) ? `${(x * 100).toFixed(2)}%` : "n/a");

  const questions = [
    {
      text: "Based on the NPV rule, which project should you choose?",
      options: ["Project A", "Project B"],
      correct: scenario.npvA > scenario.npvB ? "Project A" : "Project B",
      calc: `NPV = Σ [CF_t / (1 + r)^t]\nNPV(A) = ${formatMoney(scenario.projA[1])}/1.1 + ${formatMoney(scenario.projA[2])}/1.1² − 500 = ${formatMoney(scenario.npvA)}\nNPV(B) = ${formatMoney(scenario.projB[1])}/1.1 + ${formatMoney(scenario.projB[2])}/1.1² − 400 = ${formatMoney(scenario.npvB)}`,
      right: (winner) => `Correct! Choose ${winner} because it has the higher NPV.`,
      wrong: (winner) => `Not quite. ${winner} has the higher NPV.`,
    },
    {
      text: "Based on the IRR rule, which project should you choose?",
      options: ["Project A", "Project B"],
      correct: scenario.irrA > scenario.irrB ? "Project A" : "Project B",
      calc: `IRR is the discount rate where NPV = 0.\nIRR(A) ≈ ${pct(scenario.irrA)}; IRR(B) ≈ ${pct(scenario.irrB)}.`,
      right: (winner) => `Correct! ${winner} has the higher IRR.`,
      wrong: (winner) => `Not quite. ${winner} has the higher IRR.`,
    },
    {
      text: "Based on the Payback Period rule, which project should you choose?",
      options: ["Project A", "Project B"],
      correct: scenario.pbA < scenario.pbB ? "Project A" : "Project B",
      calc: `Payback = time when cumulative inflows = initial cost.\nA: -500 + ${scenario.projA[1]} + ${scenario.projA[2]} → ≈ ${scenario.pbA.toFixed(2)} yrs\nB: -400 + ${scenario.projB[1]} + ${scenario.projB[2]} → ≈ ${scenario.pbB.toFixed(2)} yrs` ,
      right: (winner) => `Correct! ${winner} recovers the investment sooner.`,
      wrong: (winner) => `Not quite. ${winner} pays back faster.`,
    },
    {
      text: "Based on the Profitability Index (PI) rule, which project should you choose?",
      options: ["Project A", "Project B"],
      correct: scenario.piA > scenario.piB ? "Project A" : "Project B",
      calc: `PI = NPV / |Initial investment|\nPI(A) = ${formatMoney(scenario.npvA)}/500 = ${(scenario.piA).toFixed(3)}\nPI(B) = ${formatMoney(scenario.npvB)}/400 = ${(scenario.piB).toFixed(3)}`,
      right: (winner) => `Correct! ${winner} creates more value per dollar invested.`,
      wrong: (winner) => `Not quite. ${winner} has the higher PI.`,
    },
  ];

  const current = questions[step];

  const handleAnswer = (choice) => {
    const winner = current.correct;
    if (choice === winner) {
      setFeedback(`${current.right(winner)}\n\n${current.calc}`);
    } else {
      setFeedback(`${current.wrong(winner)}\n\n${current.calc}`);
    }
  };

  const nextQuestion = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
      setFeedback("");
    } else {
      setScenario(buildScenario());
      setStep(0);
      setFeedback("");
    }
  };

  // Intro page with teaching videos
  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-green-900 p-6">
        <motion.div 
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6 text-center">Chapter 8: Investment Decision Rules</h1>
          
          <Card className="mb-6 border-2 border-green-800 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">Teaching Videos</h2>
              <p className="text-center mb-6 text-lg">
                Watch these videos to learn about NPV and investment decision criteria before playing the game.
              </p>
              
              <div className="space-y-6">
                {/* Video 1: NPV */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">1. Net Present Value (NPV)</h3>
                  <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-md" style={{ paddingBottom: "56.25%" }}>
                    <video 
                      controls 
                      className="absolute top-0 left-0 w-full h-full"
                      preload="metadata"
                    >
                      <source src="/videos/NPV.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Video 2: Comparing Investment Criteria */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">2. Comparing Investment Criteria</h3>
                  <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-md" style={{ paddingBottom: "56.25%" }}>
                    <video 
                      controls 
                      className="absolute top-0 left-0 w-full h-full"
                      preload="metadata"
                    >
                      <source src="/videos/compare_2.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
              <Button 
                  onClick={() => setShowIntro(false)} 
                  className="bg-green-800 text-white hover:bg-green-700 text-xl px-8 py-6 rounded-lg border-0"
                  style={{ backgroundImage: 'none' }}
                >
                  Start the Game →
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-green-700">
            <p>Take your time with the videos. You can start the game whenever you&apos;re ready!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-green-900 p-6">
      <motion.h1 className="text-3xl font-bold mb-4 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Investment Decision Game
      </motion.h1>

      <Card className="w-full max-w-2xl mb-6 border-2 border-green-800 rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Cash Flows</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-700">
                Required return = {(scenario.r * 100).toFixed(0)}%
              </span>
              <Button onClick={() => { setScenario(buildScenario()); setStep(0); setFeedback(""); }} className="bg-green-800 text-white hover:bg-green-700 rounded-lg border-0" style={{ backgroundImage: 'none' }}>
                Try a different example
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-900 text-white">
                  <th className="p-2 text-left">Period</th>
                  <th className="p-2 text-right">Project A</th>
                  <th className="p-2 text-right">Project B</th>
                </tr>
              </thead>
              <tbody>
                {scenario.periods.map((p, i) => (
                  <tr key={p} className={i % 2 === 0 ? "bg-green-50" : "bg-white"}>
                    <td className="p-2">{p}</td>
                    <td className="p-2 text-right">{formatMoney(scenario.projA[i])}</td>
                    <td className="p-2 text-right">{formatMoney(scenario.projB[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-xl border-2 border-green-800 rounded-2xl shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">{current.text}</h3>

          <div className="flex flex-col gap-3">
            {current.options.map((opt, i) => (
              <Button 
                key={i} 
                className="bg-green-700 text-white hover:bg-green-800 rounded-lg border-0 py-6 text-lg font-semibold" 
                style={{ backgroundImage: 'none' }}
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>

          {feedback && (
            <motion.pre className="mt-4 p-3 text-sm rounded-md border border-green-700 bg-green-50 whitespace-pre-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {feedback}
            </motion.pre>
          )}

          {feedback && (
            <div className="flex justify-center mt-4">
              <Button onClick={nextQuestion} className="bg-green-800 text-white hover:bg-green-700 rounded-lg border-0 px-8 py-4" style={{ backgroundImage: 'none' }}>
                {step < questions.length - 1 ? "Next" : "Try a different example"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


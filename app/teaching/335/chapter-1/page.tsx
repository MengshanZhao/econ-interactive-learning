"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"

import { Card } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

type PackageOption = {

  id: "A" | "B"

  label: string

  earnings: number // gross

  personalTax: number // 0-1

  corporateTax: number // 0-1

}

type Round = {

  id: string

  title: string

  prompt: string

  isPractice?: boolean

  A: PackageOption

  B: PackageOption

}

function afterTax(p: PackageOption) {

  // Simple teaching rule: taxes reduce take-home multiplicatively.

  // You can swap this to your preferred model later.

  return Math.round(p.earnings * (1 - p.personalTax) * (1 - p.corporateTax))

}

function money(n: number) {

  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })

}

function pct(x: number) {

  return `${Math.round(x * 100)}%`

}

/** -------- PIXEL ART STYLES -------- */
const pixelStyles = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  
  .pixel-art-container {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    font-family: 'VT323', monospace;
  }
  
  .pixel-field {
    background: #87CEEB;
    position: relative;
    overflow: hidden;
    image-rendering: pixelated;
  }
  
  .pixel-sky {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: #87CEEB;
    image-rendering: pixelated;
  }
  
  .pixel-ground {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: #B8E0D2;
    border-top: 2px solid #98D8E8;
    image-rendering: pixelated;
  }
  
  .pixel-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0,0,0,0.05) 15px, rgba(0,0,0,0.05) 16px),
      repeating-linear-gradient(90deg, transparent, transparent 15px, rgba(0,0,0,0.05) 15px, rgba(0,0,0,0.05) 16px);
    image-rendering: pixelated;
    pointer-events: none;
  }
  
  .pixel-stairs {
    display: flex;
    align-items: flex-end;
    height: 100%;
    padding-bottom: 20px;
    gap: 8px;
  }
  
  .pixel-step {
    width: 40px;
    height: 30px;
    background: #d08a6a;
    border: 2px solid #c77f60;
    border-radius: 0;
    box-shadow: 
      2px 2px 0 #b87256,
      inset -2px -2px 0 rgba(0,0,0,0.1);
    image-rendering: pixelated;
  }
  
  .pixel-step:nth-child(even) {
    background: #c77f60;
    border-color: #b87256;
  }
  
  .pixel-character {
    position: absolute;
    bottom: 20px;
    transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
    image-rendering: pixelated;
  }
  
  .pixel-character.stepping {
    animation: pixelStep 0.5s ease-out;
  }
  
  .pixel-character.wrong {
    animation: pixelWrong 0.5s ease-out;
  }
  
  @keyframes pixelStep {
    0% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
    100% { transform: translateY(0) scale(1); }
  }
  
  @keyframes pixelWrong {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-15px) rotate(-5deg); }
    75% { transform: translateX(5px) rotate(5deg); }
  }
  
  .pixel-avatar {
    width: 32px;
    height: 40px;
    position: relative;
    image-rendering: pixelated;
  }
  
  .pixel-head {
    width: 24px;
    height: 24px;
    background: #ffb48a;
    border: 2px solid #e89f7a;
    border-radius: 0;
    margin: 0 auto;
    position: relative;
    image-rendering: pixelated;
  }
  
  .pixel-body {
    width: 20px;
    height: 20px;
    background: #4b74ff;
    border: 2px solid #3a5fd9;
    border-radius: 0;
    margin: 2px auto 0;
    position: relative;
    image-rendering: pixelated;
  }
  
  .pixel-backpack {
    width: 8px;
    height: 12px;
    background: #2a2a2f;
    border: 1px solid #1a1a1f;
    border-radius: 0;
    position: absolute;
    left: -4px;
    top: 8px;
    image-rendering: pixelated;
  }
  
  .pixel-confetti {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #ffd15a;
    border: 1px solid #e6ba3d;
    border-radius: 0;
    image-rendering: pixelated;
  }
  
  .pixel-ui-text {
    font-family: 'VT323', monospace;
    font-size: 16px;
    image-rendering: pixelated;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .pixel-ui-card {
    background: rgba(255, 255, 255, 0.95);
    border: 3px solid #333;
    border-radius: 0;
    image-rendering: pixelated;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
  }
  
  .pixel-ui-button {
    border-radius: 0;
    border: 2px solid #333;
    image-rendering: pixelated;
    font-family: 'VT323', monospace;
    text-transform: none;
    letter-spacing: 0;
  }
  
  .pixel-confetti-container {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }
  
  .pixel-button {
    border-radius: 0;
    border: 2px solid;
    image-rendering: pixelated;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  
  .pixel-button:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
  }
  
  .pixel-button:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }
`;

function usePixelStyles() {
  useEffect(() => {
    const styleId = 'pixel-art-styles'
    if (document.getElementById(styleId)) return
    
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = pixelStyles
    document.head.appendChild(style)
    
    return () => {
      const existing = document.getElementById(styleId)
      if (existing) existing.remove()
    }
  }, [])
}

/** -------- PIXEL ART SCENE -------- */

function PixelField({
  stepIndex,
  wrongPulse,
  correctPulse,
}: {
  stepIndex: number
  wrongPulse: number
  correctPulse: number
}) {
  usePixelStyles()
  const [animating, setAnimating] = useState(false)
  const [wrongAnimating, setWrongAnimating] = useState(false)
  const confettiRef = useRef<HTMLDivElement>(null)
  const prevStepIndex = useRef(stepIndex)
  
  useEffect(() => {
    if (stepIndex > prevStepIndex.current) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 500)
    }
    prevStepIndex.current = stepIndex
  }, [stepIndex])
  
  useEffect(() => {
    if (wrongPulse > 0) {
      setWrongAnimating(true)
      setTimeout(() => setWrongAnimating(false), 500)
    }
  }, [wrongPulse])
  
  useEffect(() => {
    if (correctPulse > 0 && confettiRef.current) {
      // Create confetti particles
      for (let i = 0; i < 12; i++) {
        const confetti = document.createElement('div')
        confetti.className = 'pixel-confetti'
        const startX = 50 + (Math.random() - 0.5) * 30
        const startY = 30
        confetti.style.left = `${startX}%`
        confetti.style.top = `${startY}%`
        confetti.style.setProperty('--dx', `${(Math.random() - 0.5) * 200}px`)
        confetti.style.setProperty('--dy', `${-100 - Math.random() * 100}px`)
        confetti.style.animation = `pixelConfetti 0.8s ease-out forwards`
        confettiRef.current.appendChild(confetti)
        
        setTimeout(() => confetti.remove(), 800)
      }
    }
  }, [correctPulse])
  
  // Calculate character position (left percentage based on step)
  const characterLeft = 15 + (stepIndex * 8.5)
  
  return (
    <div className="pixel-art-container pixel-field" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        @keyframes pixelConfetti {
          to {
            transform: translate(var(--dx), var(--dy)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      
      {/* Sky layer */}
      <div className="pixel-sky" />
      
      {/* Ground layer */}
      <div className="pixel-ground" />
      
      {/* Pixel grid overlay */}
      <div className="pixel-grid" />
      
      {/* Stairs */}
      <div className="pixel-stairs" style={{ paddingLeft: '10%', position: 'relative', zIndex: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="pixel-step" />
        ))}
      </div>
      
      {/* Character */}
      <div 
        className={`pixel-character ${animating ? 'stepping' : ''} ${wrongAnimating ? 'wrong' : ''}`}
        style={{ left: `${characterLeft}%`, zIndex: 3 }}
      >
        <div className="pixel-avatar">
          <div className="pixel-head">
            {/* Eyes */}
            <div style={{
              position: 'absolute',
              width: '3px',
              height: '3px',
              background: '#000',
              left: '6px',
              top: '8px',
              boxShadow: '6px 0 0 #000',
              imageRendering: 'pixelated'
            }} />
          </div>
          <div className="pixel-body">
            <div className="pixel-backpack" />
          </div>
        </div>
      </div>
      
      {/* Confetti container */}
      <div ref={confettiRef} className="pixel-confetti-container" style={{ zIndex: 4 }} />
    </div>
  )
}

/** -------- UI + GAME LOGIC -------- */

function PackageCard({

  p,

  onPick,

}: {

  p: PackageOption

  onPick: (id: "A" | "B") => void

}) {

  return (

    <Card className="p-5 bg-card shadow-md hover:shadow-xl transition-shadow">

      <div className="flex items-start justify-between gap-3">

        <div>

          <div className="text-sm text-muted-foreground font-vt323">Package {p.id}</div>

          <div className="text-xl font-bold font-vt323">{p.label}</div>

        </div>

        <Badge variant="secondary" className="font-vt323">Choose</Badge>

      </div>

      <div className="mt-4 space-y-2 text-sm font-vt323">

        <div className="flex justify-between">

          <span className="text-muted-foreground">Earnings (gross)</span>

          <span className="font-medium">${money(p.earnings)}</span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">Personal tax</span>

          <span className="font-medium">{pct(p.personalTax)}</span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">Corporate tax</span>

          <span className="font-medium">{pct(p.corporateTax)}</span>

        </div>

      </div>

      <Button className="w-full mt-4 font-vt323 text-base" onClick={() => onPick(p.id)}>

        Pick Package {p.id}

      </Button>

    </Card>

  )

}

export default function TaxStairsGamePage() {

  const rounds: Round[] = useMemo(

    () => [

      {

        id: "practice",

        title: "Practice Round",

        prompt:

          "Pick the package that gives the higher AFTER-TAX income. (We'll reveal the math right after you choose.)",

        isPractice: true,

        A: { id: "A", label: "Stable Salary", earnings: 6000, personalTax: 0.2, corporateTax: 0.1 },

        B: { id: "B", label: "Higher Gross (but taxed more)", earnings: 6800, personalTax: 0.28, corporateTax: 0.18 },

      },

      {

        id: "r1",

        title: "Round 1",

        prompt: "Same task: choose the package with higher AFTER-TAX income.",

        A: { id: "A", label: "Offer A", earnings: 7200, personalTax: 0.22, corporateTax: 0.12 },

        B: { id: "B", label: "Offer B", earnings: 7600, personalTax: 0.30, corporateTax: 0.10 },

      },

      {

        id: "r2",

        title: "Round 2",

        prompt: "Now it's getting close — trust the take-home, not the gross.",

        A: { id: "A", label: "Offer A", earnings: 8200, personalTax: 0.26, corporateTax: 0.18 },

        B: { id: "B", label: "Offer B", earnings: 7800, personalTax: 0.22, corporateTax: 0.08 },

      },

      {

        id: "r3",

        title: "Round 3",

        prompt: "Final step: which package pays you more after taxes?",

        A: { id: "A", label: "Offer A", earnings: 9000, personalTax: 0.33, corporateTax: 0.05 },

        B: { id: "B", label: "Offer B", earnings: 8600, personalTax: 0.24, corporateTax: 0.14 },

      },

    ],

    []

  )

  const [roundIndex, setRoundIndex] = useState(0)

  const round = rounds[roundIndex]

  const [picked, setPicked] = useState<"A" | "B" | null>(null)

  const [result, setResult] = useState<{

    correct: boolean

    bestId: "A" | "B"

    afterA: number

    afterB: number

  } | null>(null)

  // stairs progress

  const [stepIndex, setStepIndex] = useState(0)

  const [wrongPulse, setWrongPulse] = useState(0)

  const [correctPulse, setCorrectPulse] = useState(0)

  const [showInstructions, setShowInstructions] = useState(true)

  function evaluate(choice: "A" | "B") {

    const afterA = afterTax(round.A)

    const afterB = afterTax(round.B)

    const bestId: "A" | "B" = afterA >= afterB ? "A" : "B"

    const correct = choice === bestId

    setPicked(choice)

    setResult({ correct, bestId, afterA, afterB })

    if (correct) {

      setStepIndex((s) => Math.min(s + 1, 9))

      setCorrectPulse((x) => x + 1)

    } else {

      setWrongPulse((x) => x + 1)

    }

  }

  function nextRound() {

    setPicked(null)

    setResult(null)

    setRoundIndex((i) => Math.min(i + 1, rounds.length - 1))

  }

  function restart() {

    setRoundIndex(0)

    setPicked(null)

    setResult(null)

    setStepIndex(0)

    setWrongPulse(0)

    setCorrectPulse(0)

    setShowInstructions(true)

  }

  const isLast = roundIndex === rounds.length - 1

  return (

    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-10">

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">

          {/* LEFT: UI */}

          <div className="flex flex-col gap-4">

                <div className="flex items-center justify-between">

              <div>

                <div className="text-sm text-muted-foreground font-vt323">Game 1 • After-Tax Choice</div>

                <h1 className="text-3xl font-bold font-vt323">Climb the Tax Stairs</h1>

              </div>

              <div className="flex gap-2">

                <Badge variant="secondary" className="font-vt323">Step {stepIndex}</Badge>

                <Button variant="outline" onClick={restart} className="font-vt323 text-base">

                  Restart

                </Button>

              </div>

            </div>

            <AnimatePresence mode="wait">

              {showInstructions ? (

                <motion.div

                  key="instructions"

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  exit={{ opacity: 0, y: -10 }}

                >

                  <Card className="p-6 pixel-ui-card" style={{ borderRadius: 0, border: '3px solid #333' }}>

                    <h2 className="text-xl font-bold mb-2 pixel-ui-text" style={{ fontSize: '20px' }}>How to play</h2>

                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground pixel-ui-text" style={{ fontSize: '16px' }}>

                      <li>You'll see two packages (A vs B).</li>

                      <li>Each has earnings + two tax rates (personal + corporate).</li>

                      <li>Your goal: pick the higher <span className="font-medium text-foreground">after-tax</span> pay.</li>

                      <li>Correct choice = your character steps up one stair.</li>

                    </ol>

                    <div className="mt-4 p-4 bg-muted/40 text-sm pixel-ui-text" style={{ borderRadius: 0, border: '2px solid #666', fontSize: '14px' }}>

                      <div className="font-semibold mb-1">After-tax (teaching version)</div>

                      <div className="text-muted-foreground">

                        after-tax = earnings × (1 − personal tax) × (1 − corporate tax)

                      </div>

                    </div>

                    <div className="mt-5 flex justify-end">

                      <Button onClick={() => setShowInstructions(false)} className="pixel-ui-button font-vt323 text-base" style={{ borderRadius: 0, border: '2px solid #333' }}>Start (Practice First)</Button>

                    </div>

                  </Card>

                </motion.div>

              ) : (

                <motion.div

                  key="round"

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  exit={{ opacity: 0, y: -10 }}

                  className="flex flex-col gap-4"

                >

                  <Card className="p-6">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <div className="text-sm text-muted-foreground font-vt323">

                          {round.isPractice ? "Practice" : `Question ${roundIndex}`}

                        </div>

                        <h2 className="text-xl font-bold font-vt323">{round.title}</h2>

                      </div>

                      {round.isPractice && <Badge variant="secondary">guided</Badge>}

                    </div>

                    <p className="mt-2 text-sm text-muted-foreground font-vt323">{round.prompt}</p>

                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">

                    <PackageCard p={round.A} onPick={(id) => !result && evaluate(id)} />

                    <PackageCard p={round.B} onPick={(id) => !result && evaluate(id)} />

                  </div>

                  <AnimatePresence>

                    {result && (

                      <motion.div

                        initial={{ opacity: 0, y: 10 }}

                        animate={{ opacity: 1, y: 0 }}

                        exit={{ opacity: 0, y: -10 }}

                      >

                        <Card className="p-6">

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <div className="text-sm text-muted-foreground font-vt323">Result</div>

                              <div className="text-2xl font-bold font-vt323">

                                {result.correct ? "✅ Correct — step up!" : "❌ Not quite — taxes got you!"}

                              </div>

                              <div className="mt-1 text-sm text-muted-foreground font-vt323">

                                Best choice was <span className="font-semibold text-foreground">Package {result.bestId}</span>.

                              </div>

                            </div>

                            <Badge variant={result.correct ? "default" : "destructive"} className="font-vt323">

                              You chose {picked}

                            </Badge>

                          </div>

                          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm font-vt323">

                            <div className="p-4 rounded-lg bg-muted/40">

                              <div className="font-semibold mb-1">Package A after-tax</div>

                              <div className="text-2xl font-bold">${money(result.afterA)}</div>

                              <div className="text-muted-foreground mt-1">

                                ${money(round.A.earnings)} × (1 − {pct(round.A.personalTax)}) × (1 − {pct(round.A.corporateTax)})

                              </div>

                            </div>

                            <div className="p-4 rounded-lg bg-muted/40">

                              <div className="font-semibold mb-1">Package B after-tax</div>

                              <div className="text-2xl font-bold">${money(result.afterB)}</div>

                              <div className="text-muted-foreground mt-1">

                                ${money(round.B.earnings)} × (1 − {pct(round.B.personalTax)}) × (1 − {pct(round.B.corporateTax)})

                              </div>

                            </div>

                          </div>

                          <div className="mt-5 flex items-center justify-between gap-3">

                            <div className="text-sm text-muted-foreground font-vt323">

                              Takeaway: judge offers by <span className="font-medium text-foreground">take-home</span>, not gross.

                            </div>

                            <div className="flex gap-2">

                              {isLast ? (

                                <Button onClick={restart} className="font-vt323 text-base">Play Again</Button>

                              ) : (

                                <Button onClick={nextRound} className="font-vt323 text-base">Next Question</Button>

                              )}

                            </div>

                          </div>

                        </Card>

                      </motion.div>

                    )}

                  </AnimatePresence>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

          {/* RIGHT: pixel art game scene */}

          <Card className="overflow-hidden relative min-h-[520px] border-0" style={{ background: '#87CEEB', borderRadius: 0, border: '3px solid #333' }}>

            <div className="h-[520px] w-full relative">

              <PixelField stepIndex={stepIndex} wrongPulse={wrongPulse} correctPulse={correctPulse} />

              {/* Pixel UI Overlay */}
              <div className="absolute top-4 left-4 z-20">
                <div className="pixel-ui-card px-3 py-1 pixel-ui-text" style={{ fontSize: '14px', background: 'rgba(255,255,255,0.9)' }}>
                  STEP {stepIndex}
                </div>
              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>

  )

}
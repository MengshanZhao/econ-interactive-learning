"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

import { Canvas, useFrame } from "@react-three/fiber"

import { OrthographicCamera, Environment } from "@react-three/drei"

import * as THREE from "three"

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

/** -------- 3D SCENE -------- */

function VoxelStairs({

  steps = 8,

  stepW = 1.2,

  stepH = 0.45,

  stepD = 1.0,

}: {

  steps?: number

  stepW?: number

  stepH?: number

  stepD?: number

}) {

  const geo = useMemo(() => new THREE.BoxGeometry(stepW, stepH, stepD), [stepW, stepH, stepD])

  return (

    <group position={[0, 0, 0]}>

      {Array.from({ length: steps }).map((_, i) => {

        const x = i * (stepW * 0.82)

        const y = i * (stepH * 0.95)

        const z = 0

        return (

          <mesh key={i} geometry={geo} position={[x, y, z]} castShadow receiveShadow>

            <meshStandardMaterial color={i % 2 === 0 ? "#d08a6a" : "#c77f60"} roughness={0.9} />

          </mesh>

        )

      })}

      {/* Side wall / platform */}

      <mesh position={[steps * (stepW * 0.82) * 0.3, -0.55, 0]} receiveShadow>

        <boxGeometry args={[steps * (stepW * 0.82) + 2, 0.6, 3]} />

        <meshStandardMaterial color="#2a2a2f" roughness={0.95} />

      </mesh>

    </group>

  )

}

function LittleAvatar({

  stepIndex,

  stepW = 1.2,

  stepH = 0.45,

  onWrongPulse,

}: {

  stepIndex: number

  stepW?: number

  stepH?: number

  onWrongPulse: number // increments to trigger a wrong animation

}) {

  const group = useRef<THREE.Group>(null)

  const tRef = useRef(0)

  // target position based on step

  const target = useMemo(() => {

    const x = stepIndex * (stepW * 0.82)

    const y = stepIndex * (stepH * 0.95) + 0.35

    return new THREE.Vector3(x, y, 0)

  }, [stepIndex, stepW, stepH])

  // wrong animation: hop + tiny knockback

  const wrongAnim = useRef({ active: false, start: 0 })

  useEffect(() => {

    if (!group.current) return

    wrongAnim.current = { active: true, start: performance.now() }

  }, [onWrongPulse])

  useFrame((_, dt) => {

    if (!group.current) return

    // smooth follow to target

    group.current.position.lerp(target, 1 - Math.pow(0.0005, dt * 60))

    // idle bob

    tRef.current += dt

    group.current.rotation.y = Math.sin(tRef.current * 1.1) * 0.08

    // wrong hop (short)

    if (wrongAnim.current.active) {

      const elapsed = (performance.now() - wrongAnim.current.start) / 1000

      const dur = 0.45

      if (elapsed <= dur) {

        const p = elapsed / dur

        const hop = Math.sin(p * Math.PI) * 0.35

        const knock = Math.sin(p * Math.PI) * 0.25

        group.current.position.y += hop

        group.current.position.x -= knock * 0.35

        group.current.rotation.z = Math.sin(p * Math.PI) * 0.22

      } else {

        wrongAnim.current.active = false

        group.current.rotation.z = 0

      }

    }

  })

  return (

    <group ref={group} castShadow>

      {/* body */}

      <mesh castShadow>

        <boxGeometry args={[0.38, 0.5, 0.3]} />

        <meshStandardMaterial color="#4b74ff" roughness={0.7} />

      </mesh>

      {/* head */}

      <mesh position={[0, 0.38, 0]} castShadow>

        <boxGeometry args={[0.28, 0.28, 0.28]} />

        <meshStandardMaterial color="#ffb48a" roughness={0.65} />

      </mesh>

      {/* tiny backpack */}

      <mesh position={[-0.22, 0.1, -0.02]} castShadow>

        <boxGeometry args={[0.14, 0.22, 0.18]} />

        <meshStandardMaterial color="#2a2a2f" roughness={0.85} />

      </mesh>

    </group>

  )

}

function ConfettiCoins({ trigger }: { trigger: number }) {

  const group = useRef<THREE.Group>(null)

  const coins = useMemo(() => {

    const arr = Array.from({ length: 18 }).map(() => ({

      pos: new THREE.Vector3(0, 0, 0),

      vel: new THREE.Vector3(

        (Math.random() - 0.5) * 2.2,

        2.2 + Math.random() * 1.2,

        (Math.random() - 0.5) * 1.2

      ),

      rot: new THREE.Vector3(Math.random(), Math.random(), Math.random()),

    }))

    return arr

  }, [])

  const active = useRef(false)

  const start = useRef(0)

  useEffect(() => {

    if (!group.current) return

    // reset

    coins.forEach((c) => {

      c.pos.set(0, 0, 0)

      c.vel.set((Math.random() - 0.5) * 2.2, 2.2 + Math.random() * 1.2, (Math.random() - 0.5) * 1.2)

      c.rot.set(Math.random(), Math.random(), Math.random())

    })

    active.current = true

    start.current = performance.now()

  }, [trigger, coins])

  useFrame((_, dt) => {

    if (!group.current || !active.current) return

    const elapsed = (performance.now() - start.current) / 1000

    if (elapsed > 0.9) {

      active.current = false

      return

    }

    coins.forEach((c, i) => {

      c.vel.y -= 7.5 * dt

      c.pos.addScaledVector(c.vel, dt)

      c.rot.x += dt * 6

      c.rot.y += dt * 7

      const m = group.current!.children[i] as THREE.Mesh

      m.position.copy(c.pos)

      m.rotation.set(c.rot.x, c.rot.y, c.rot.z)

      m.scale.setScalar(0.9 + Math.sin(elapsed * 10 + i) * 0.05)

    })

  })

  return (

    <group ref={group} position={[0.3, 1.2, 0.2]}>

      {coins.map((_, i) => (

        <mesh key={i} castShadow>

          <boxGeometry args={[0.12, 0.08, 0.02]} />

          <meshStandardMaterial color="#ffd15a" roughness={0.35} metalness={0.4} />

        </mesh>

      ))}

    </group>

  )

}

function VoxelScene({

  stepIndex,

  wrongPulse,

  correctPulse,

}: {

  stepIndex: number

  wrongPulse: number

  correctPulse: number

}) {

  return (

    <Canvas shadows dpr={[1, 2]} style={{ width: "100%", height: "100%" }}>

      {/* Camera */}

      <OrthographicCamera makeDefault position={[6, 5, 8]} zoom={85} near={-50} far={50} />

      <ambientLight intensity={0.6} />

      <directionalLight position={[8, 10, 6]} intensity={1.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />

      {/* floor fog-ish vibe */}

      <fog attach="fog" args={["#e48a7d", 8, 20]} />

      {/* Scene objects */}

      <group position={[-2.5, -0.5, 0]}>

        <VoxelStairs steps={10} />

        <LittleAvatar stepIndex={stepIndex} onWrongPulse={wrongPulse} />

        <ConfettiCoins trigger={correctPulse} />

      </group>

      {/* background env */}

      <Environment preset="sunset" />

    </Canvas>

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

          <div className="text-sm text-muted-foreground">Package {p.id}</div>

          <div className="text-xl font-bold">{p.label}</div>

        </div>

        <Badge variant="secondary">Choose</Badge>

      </div>

      <div className="mt-4 space-y-2 text-sm">

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

      <Button className="w-full mt-4" onClick={() => onPick(p.id)}>

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

                <div className="text-sm text-muted-foreground">Game 1 • After-Tax Choice</div>

                <h1 className="text-3xl font-bold">Climb the Tax Stairs</h1>

              </div>

              <div className="flex gap-2">

                <Badge variant="secondary">Step {stepIndex}</Badge>

                <Button variant="outline" onClick={restart}>

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

                  <Card className="p-6">

                    <h2 className="text-xl font-bold mb-2">How to play</h2>

                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">

                      <li>You'll see two packages (A vs B).</li>

                      <li>Each has earnings + two tax rates (personal + corporate).</li>

                      <li>Your goal: pick the higher <span className="font-medium text-foreground">after-tax</span> pay.</li>

                      <li>Correct choice = your character steps up one stair.</li>

                    </ol>

                    <div className="mt-4 p-4 rounded-lg bg-muted/40 text-sm">

                      <div className="font-semibold mb-1">After-tax (teaching version)</div>

                      <div className="text-muted-foreground">

                        after-tax = earnings × (1 − personal tax) × (1 − corporate tax)

                      </div>

                    </div>

                    <div className="mt-5 flex justify-end">

                      <Button onClick={() => setShowInstructions(false)}>Start (Practice First)</Button>

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

                        <div className="text-sm text-muted-foreground">

                          {round.isPractice ? "Practice" : `Question ${roundIndex}`}

                        </div>

                        <h2 className="text-xl font-bold">{round.title}</h2>

                      </div>

                      {round.isPractice && <Badge variant="secondary">guided</Badge>}

                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">{round.prompt}</p>

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

                              <div className="text-sm text-muted-foreground">Result</div>

                              <div className="text-2xl font-bold">

                                {result.correct ? "✅ Correct — step up!" : "❌ Not quite — taxes got you!"}

                              </div>

                              <div className="mt-1 text-sm text-muted-foreground">

                                Best choice was <span className="font-semibold text-foreground">Package {result.bestId}</span>.

                              </div>

                            </div>

                            <Badge variant={result.correct ? "default" : "destructive"}>

                              You chose {picked}

                            </Badge>

                          </div>

                          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">

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

                            <div className="text-sm text-muted-foreground">

                              Takeaway: judge offers by <span className="font-medium text-foreground">take-home</span>, not gross.

                            </div>

                            <div className="flex gap-2">

                              {isLast ? (

                                <Button onClick={restart}>Play Again</Button>

                              ) : (

                                <Button onClick={nextRound}>Next Question</Button>

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

          {/* RIGHT: voxel diorama */}

          <Card className="overflow-hidden relative min-h-[520px] bg-gradient-to-b from-[#ff8d7d] to-[#2b2b33]">

            <div className="absolute top-4 left-4 z-10">

              <Badge variant="secondary">Voxel Preview</Badge>

            </div>

            <div className="absolute top-4 right-4 z-10">

              <Badge variant="secondary">Correct → step up</Badge>

            </div>

            <div className="h-[520px] w-full">

              <VoxelScene stepIndex={stepIndex} wrongPulse={wrongPulse} correctPulse={correctPulse} />

            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm">

              <div className="text-white text-sm">

                <span className="font-semibold">Goal:</span> reach the top by consistently choosing higher after-tax pay.

              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>

  )

}
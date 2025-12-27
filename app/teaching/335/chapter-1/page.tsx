"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

import { Canvas, useFrame } from "@react-three/fiber"

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

// Sky colors that change with each step - warm orange/peach gradients
const skyColors = [
  '#FFE4CC', // Step 0 - light peach
  '#FFD9B3', // Step 1
  '#FFCF9A', // Step 2
  '#FFC481', // Step 3
  '#FFBA68', // Step 4
  '#FFB04F', // Step 5
  '#FFA636', // Step 6
  '#FF9C1D', // Step 7
  '#FF9204', // Step 8
  '#FF8800', // Step 9 - deep orange
]

function VoxelStairs({ stepIndex }: { stepIndex: number }) {
  const stepGeo = useMemo(() => new THREE.BoxGeometry(2.0, 0.4, 1.2), [])
  
  return (
    <group position={[0, -1, 0]}>
      {Array.from({ length: 10 }).map((_, i) => {
        const z = -i * 1.5 // Move back in Z
        const y = i * 0.4  // Step height
        const colors = ['#d08a6a', '#c77f60', '#b87256']
        const color = colors[i % 3]
        
        return (
          <mesh key={i} geometry={stepGeo} position={[0, y, z]}>
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}
    </group>
  )
}

function VoxelMountain({ position, size = 1 }: { position: [number, number, number]; size?: number }) {
  const layers = 8
  const layersRef = useRef<THREE.Group>(null)
  
  return (
    <group ref={layersRef} position={position}>
      {Array.from({ length: layers }).map((_, i) => {
        const width = (layers - i) * 0.6 * size
        const height = 0.5
        const y = i * 0.5
        const z = -i * 0.3
        const colors = ['#d08a6a', '#c77f60', '#b87256', '#a8654d']
        const color = colors[i % 4]
        
        return (
          <mesh key={i} position={[0, y, z]}>
            <boxGeometry args={[width, height, width * 0.8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}
    </group>
  )
}

function WaterPool({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 12]} />
        <meshBasicMaterial color="#9BB5C0" transparent opacity={0.6} />
      </mesh>
      {/* Water base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[4, 12]} />
        <meshBasicMaterial color="#7A9BA8" />
      </mesh>
    </group>
  )
}

function LittleAvatar({ stepIndex, wrongPulse }: { stepIndex: number; wrongPulse: number }) {
  const group = useRef<THREE.Group>(null)
  const wrongAnim = useRef({ active: false, start: 0 })
  
  // Target position: move forward in Z space, step up
  const targetZ = -stepIndex * 1.5
  const targetY = stepIndex * 0.4 + 0.6
  
  useEffect(() => {
    if (wrongPulse > 0) {
      wrongAnim.current = { active: true, start: performance.now() }
    }
  }, [wrongPulse])
  
  useFrame((_, dt) => {
    if (!group.current) return
    
    // Smooth movement to target
    group.current.position.lerp(new THREE.Vector3(0, targetY, targetZ), 1 - Math.pow(0.05, dt))
    
    // Idle bob
    group.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1
    
    // Wrong animation: shake
    if (wrongAnim.current.active) {
      const elapsed = (performance.now() - wrongAnim.current.start) / 1000
      if (elapsed < 0.5) {
        const shake = Math.sin(elapsed * 20) * 0.15
        group.current.position.x = shake
        group.current.rotation.z = shake * 0.5
      } else {
        wrongAnim.current.active = false
        group.current.rotation.z = 0
        group.current.position.x = 0
      }
    }
  })
  
  return (
    <group ref={group} position={[0, 0.6, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshBasicMaterial color="#4b74ff" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshBasicMaterial color="#ffb48a" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.3, 0.2]} />
        <meshBasicMaterial color="#3a5fd9" />
      </mesh>
      <mesh position={[0.1, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.3, 0.2]} />
        <meshBasicMaterial color="#3a5fd9" />
      </mesh>
      {/* Backpack */}
      <mesh position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.15, 0.25, 0.2]} />
        <meshBasicMaterial color="#2a2a2f" />
      </mesh>
    </group>
  )
}

function Confetti({ trigger, originZ }: { trigger: number; originZ: number }) {
  const group = useRef<THREE.Group>(null)
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      position: new THREE.Vector3(0, 1, 0),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        2.5 + Math.random() * 1.5,
        (Math.random() - 0.5) * 1.5
      ),
      rotation: new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
    }))
  }, [])
  
  const active = useRef(false)
  const start = useRef(0)
  
  useEffect(() => {
    if (trigger > 0) {
      particles.forEach((p) => {
        p.position.set(0, 1.5, originZ)
        p.velocity.set(
          (Math.random() - 0.5) * 3,
          2.5 + Math.random() * 1.5,
          (Math.random() - 0.5) * 1.5
        )
      })
      active.current = true
      start.current = performance.now()
    }
  }, [trigger, particles, originZ])
  
  useFrame((_, dt) => {
    if (!group.current || !active.current) return
    const elapsed = (performance.now() - start.current) / 1000
    if (elapsed > 1.2) {
      active.current = false
      return
    }
    
    particles.forEach((p, i) => {
      p.velocity.y -= 7 * dt
      p.position.addScaledVector(p.velocity, dt)
      p.rotation.x += dt * 6
      p.rotation.y += dt * 7
      p.rotation.z += dt * 5
      
      const mesh = group.current!.children[i] as THREE.Mesh
      if (mesh) {
        mesh.position.copy(p.position)
        mesh.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z)
      }
    })
  })
  
  return (
    <group ref={group}>
      {particles.map((_, i) => (
        <mesh key={i} position={[0, 1.5, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.02]} />
          <meshBasicMaterial color="#ffd15a" />
        </mesh>
      ))}
    </group>
  )
}

function Simple3DScene({
  stepIndex,
  wrongPulse,
  correctPulse,
}: {
  stepIndex: number
  wrongPulse: number
  correctPulse: number
}) {
  const skyColor = skyColors[Math.min(stepIndex, skyColors.length - 1)]
  const characterZ = -stepIndex * 1.5
  
  return (
    <Canvas 
      camera={{ position: [5, 4, 10], fov: 55 }}
      style={{ width: '100%', height: '100%', background: `linear-gradient(to bottom, ${skyColor}, #FFB366)` }}
    >
      <ambientLight intensity={1.1} />
      
      {/* Ground plane - extends far back */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -12]}>
        <planeGeometry args={[40, 50]} />
        <meshBasicMaterial color="#B8E0D2" />
      </mesh>
      
      {/* Left mountain - terraced voxel style */}
      <VoxelMountain position={[-6, -1.5, -8]} size={1.2} />
      
      {/* Right mountain - partially visible */}
      <VoxelMountain position={[6, -1.5, -10]} size={1.0} />
      
      {/* Far mountain */}
      <VoxelMountain position={[-4, -1.5, -18]} size={0.8} />
      
      {/* Water pool to the left */}
      <WaterPool position={[-4, -1.4, -6]} />
      
      {/* Voxel path/stairs */}
      <VoxelStairs stepIndex={stepIndex} />
      
      {/* Character */}
      <LittleAvatar stepIndex={stepIndex} wrongPulse={wrongPulse} />
      
      {/* Confetti - originates from character position */}
      <Confetti trigger={correctPulse} originZ={characterZ} />
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

                  <Card className="p-6">

                    <h2 className="text-xl font-bold mb-2 font-vt323">How to play</h2>

                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground font-vt323">

                      <li>You'll see two packages (A vs B).</li>

                      <li>Each has earnings + two tax rates (personal + corporate).</li>

                      <li>Your goal: pick the higher <span className="font-medium text-foreground">after-tax</span> pay.</li>

                      <li>Correct choice = your character steps up one stair.</li>

                    </ol>

                    <div className="mt-4 p-4 rounded-lg bg-muted/40 text-sm font-vt323">

                      <div className="font-semibold mb-1">After-tax (teaching version)</div>

                      <div className="text-muted-foreground">

                        after-tax = earnings × (1 − personal tax) × (1 − corporate tax)

                      </div>

                    </div>

                    <div className="mt-5 flex justify-end">

                      <Button onClick={() => setShowInstructions(false)} className="font-vt323 text-base">Start (Practice First)</Button>

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

          {/* RIGHT: 3D game scene */}

          <Card className="overflow-hidden relative min-h-[520px]" style={{ borderRadius: 0 }}>

            <div className="h-[520px] w-full relative">

              <Simple3DScene stepIndex={stepIndex} wrongPulse={wrongPulse} correctPulse={correctPulse} />

              {/* UI Overlay */}
              <div className="absolute top-4 left-4 z-20">
                <Badge variant="secondary" className="font-vt323 text-base bg-white/90">
                  Step {stepIndex}
                </Badge>
              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>

  )

}
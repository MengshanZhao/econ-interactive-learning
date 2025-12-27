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

  newOffer: PackageOption

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

// Sky colors matching photo - reddish-pink to orange gradient
const skyColors = [
  '#FFB6C1', // Step 0 - light pink
  '#FFA07A', // Step 1 - light salmon
  '#FF8C69', // Step 2
  '#FF7F50', // Step 3 - coral
  '#FF6B47', // Step 4
  '#FF6347', // Step 5 - tomato
  '#FF5A3D', // Step 6
  '#FF4D33', // Step 7
  '#FF4029', // Step 8
  '#FF331F', // Step 9 - deep red-orange
]

function VoxelStairs({ stepIndex }: { stepIndex: number }) {
  const stepGeo = useMemo(() => new THREE.BoxGeometry(2.0, 0.4, 1.2), [])
  
  return (
    <group position={[0, -1, 0]}>
      {Array.from({ length: 10 }).map((_, i) => {
        const z = -i * 1.5 // Move back in Z
        const y = i * 0.4  // Step height
        // Darker browns matching photo
        const colors = ['#8B5A3C', '#7A4F35', '#6B452E', '#5C3A27']
        const color = colors[i % 4]
        
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
        // Darker browns matching photo - terra-cotta/brown tones
        const colors = ['#8B5A3C', '#7A4F35', '#6B452E', '#5C3A27', '#4D2F20']
        const color = colors[i % 5]
        
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
      {/* Water surface - darker blue-gray matching photo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 12]} />
        <meshBasicMaterial color="#5A7A8A" transparent opacity={0.7} />
      </mesh>
      {/* Water base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[4, 12]} />
        <meshBasicMaterial color="#4A6A7A" />
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
      {/* Body - dark blue matching photo */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshBasicMaterial color="#2E4A6B" />
      </mesh>
      {/* Head - light pink/purple matching photo */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshBasicMaterial color="#E8A5C4" />
      </mesh>
      {/* Legs - darker blue */}
      <mesh position={[-0.1, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.3, 0.2]} />
        <meshBasicMaterial color="#1E3A5B" />
      </mesh>
      <mesh position={[0.1, -0.3, 0]}>
        <boxGeometry args={[0.15, 0.3, 0.2]} />
        <meshBasicMaterial color="#1E3A5B" />
      </mesh>
      {/* Backpack - dark brown */}
      <mesh position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.15, 0.25, 0.2]} />
        <meshBasicMaterial color="#3A2A1F" />
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
  currentOffer,
}: {
  stepIndex: number
  wrongPulse: number
  correctPulse: number
  currentOffer: PackageOption | null
}) {
  const skyColor = skyColors[Math.min(stepIndex, skyColors.length - 1)]
  const characterZ = -stepIndex * 1.5
  
  return (
    <Canvas 
      camera={{ position: [5, 4, 10], fov: 55 }}
      style={{ width: '100%', height: '100%', background: `linear-gradient(to bottom, ${skyColor}, #FF8C69)` }}
    >
      <ambientLight intensity={1.1} />
      
      {/* Ground plane - brown/terra-cotta matching photo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -12]}>
        <planeGeometry args={[40, 50]} />
        <meshBasicMaterial color="#9B7A5A" />
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

function OfferCard({

  offer,

  label,

  onChoose,

  disabled,

}: {

  offer: PackageOption

  label: string

  onChoose: () => void

  disabled?: boolean

}) {

  const afterTaxAmount = afterTax(offer)

  return (

    <Card className="p-6 bg-card shadow-lg hover:shadow-xl transition-all border-2">

      <div className="mb-4">

        <div className="text-sm text-muted-foreground font-vt323 mb-1">{label}</div>

        <div className="text-2xl font-bold font-vt323">{offer.label}</div>

      </div>

      <div className="space-y-3 text-sm font-vt323 mb-6">

        <div className="flex justify-between items-center">

          <span className="text-muted-foreground">Earnings (gross)</span>

          <span className="font-semibold text-lg">${money(offer.earnings)}</span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">Personal tax</span>

          <span className="font-medium">{pct(offer.personalTax)}</span>

        </div>

        <div className="flex justify-between">

          <span className="text-muted-foreground">Corporate tax</span>

          <span className="font-medium">{pct(offer.corporateTax)}</span>

        </div>

        <div className="pt-2 border-t">

          <div className="flex justify-between items-center">

            <span className="text-muted-foreground">After-tax</span>

            <span className="font-bold text-xl text-primary">${money(afterTaxAmount)}</span>

          </div>

        </div>

      </div>

      <Button 

        className="w-full font-vt323 text-base h-12" 

        onClick={onChoose}

        disabled={disabled}

        size="lg"

      >

        {label}

      </Button>

    </Card>

  )

}

export default function TaxStairsGamePage() {

  const rounds: Round[] = useMemo(

    () => [

      {

        id: "r1",

        title: "Round 1",

        newOffer: { id: "A", label: "Tech Startup", earnings: 7200, personalTax: 0.22, corporateTax: 0.12 },

      },

      {

        id: "r2",

        title: "Round 2",

        newOffer: { id: "B", label: "Finance Corp", earnings: 7600, personalTax: 0.30, corporateTax: 0.10 },

      },

      {

        id: "r3",

        title: "Round 3",

        newOffer: { id: "A", label: "Consulting Firm", earnings: 8200, personalTax: 0.26, corporateTax: 0.18 },

      },

      {

        id: "r4",

        title: "Round 4",

        newOffer: { id: "B", label: "Remote Agency", earnings: 7800, personalTax: 0.22, corporateTax: 0.08 },

      },

      {

        id: "r5",

        title: "Round 5",

        newOffer: { id: "A", label: "Enterprise Co", earnings: 9000, personalTax: 0.33, corporateTax: 0.05 },

      },

    ],

    []

  )

  // Initial current offer
  const initialOffer: PackageOption = { id: "A", label: "Current Job", earnings: 6000, personalTax: 0.2, corporateTax: 0.1 }

  const [roundIndex, setRoundIndex] = useState(0)

  const round = rounds[roundIndex]

  const [currentOffer, setCurrentOffer] = useState<PackageOption>(initialOffer)

  const [choice, setChoice] = useState<"stay" | "switch" | null>(null)

  const [result, setResult] = useState<{

    correct: boolean

    shouldSwitch: boolean

    currentAfterTax: number

    newAfterTax: number

  } | null>(null)

  // stairs progress

  const [stepIndex, setStepIndex] = useState(0)

  const [wrongPulse, setWrongPulse] = useState(0)

  const [correctPulse, setCorrectPulse] = useState(0)

  function evaluate(choice: "stay" | "switch") {

    const currentAfterTax = afterTax(currentOffer)

    const newAfterTax = afterTax(round.newOffer)

    const shouldSwitch = newAfterTax > currentAfterTax

    const correct = (choice === "switch" && shouldSwitch) || (choice === "stay" && !shouldSwitch)

    setChoice(choice)

    setResult({ correct, shouldSwitch, currentAfterTax, newAfterTax })

    if (correct) {

      setStepIndex((s) => Math.min(s + 1, 9))

      setCorrectPulse((x) => x + 1)

      // Update current offer if switching was correct, or keep current if staying was correct

      if (shouldSwitch) {

        setCurrentOffer(round.newOffer)

      }

    } else {

      setWrongPulse((x) => x + 1)

    }

  }

  function nextRound() {

    setChoice(null)

    setResult(null)

    setRoundIndex((i) => Math.min(i + 1, rounds.length - 1))

  }

  function restart() {

    setRoundIndex(0)

    setCurrentOffer(initialOffer)

    setChoice(null)

    setResult(null)

    setStepIndex(0)

    setWrongPulse(0)

    setCorrectPulse(0)

  }

  const isLast = roundIndex === rounds.length - 1

  return (

    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">

      <div className="container mx-auto px-4 py-8">

        {/* Top: Simple instruction */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold font-vt323 mb-2">Pick the highest after tax offer to climb on the mountain!</h1>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="font-vt323 text-base">Step {stepIndex}/9</Badge>
            <Button variant="outline" onClick={restart} className="font-vt323 text-base">
              Restart
            </Button>
          </div>
        </div>

        {/* Game area */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">

          {/* LEFT: Game controls */}
          <div className="flex flex-col gap-6">

            <AnimatePresence mode="wait">

              {!result ? (

                <motion.div

                  key="round"

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  exit={{ opacity: 0, y: -10 }}

                  className="flex flex-col gap-6"

                >

                  <Card className="p-6 bg-white/90 shadow-lg">

                    <div className="text-center mb-4">

                      <div className="text-sm text-muted-foreground font-vt323 mb-1">{round.title}</div>

                      <h2 className="text-2xl font-bold font-vt323">A new job offer arrives!</h2>

                      <p className="mt-2 text-sm text-muted-foreground font-vt323">Should you stay with your current job or switch?</p>

                    </div>

                  </Card>

                  <div className="grid gap-6">

                    <OfferCard 

                      offer={currentOffer} 

                      label="Stay with Current Job"

                      onChoose={() => evaluate("stay")}

                    />

                    <OfferCard 

                      offer={round.newOffer} 

                      label="Switch to New Offer"

                      onChoose={() => evaluate("switch")}

                    />

                  </div>

                </motion.div>

              ) : (

                <motion.div

                  key="result"

                  initial={{ opacity: 0, y: 10 }}

                  animate={{ opacity: 1, y: 0 }}

                  exit={{ opacity: 0, y: -10 }}

                >

                  <Card className="p-6 bg-white/90 shadow-lg">

                    <div className="text-center mb-6">

                      <div className="text-4xl mb-3">

                        {result.correct ? "✅" : "❌"}

                      </div>

                      <div className="text-2xl font-bold font-vt323 mb-2">

                        {result.correct ? "Correct! Step up!" : "Not quite!"}

                      </div>

                      <div className="text-sm text-muted-foreground font-vt323">

                        {result.shouldSwitch 

                          ? "The new offer has higher after-tax pay. You should switch!"

                          : "Your current job has higher after-tax pay. You should stay!"

                        }

                      </div>

                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">

                      <div className="p-4 rounded-lg bg-muted/40 border-2 border-dashed">

                        <div className="font-semibold mb-2 font-vt323">Current Job</div>

                        <div className="text-2xl font-bold font-vt323">${money(result.currentAfterTax)}</div>

                        <div className="text-xs text-muted-foreground mt-1 font-vt323">after-tax</div>

                      </div>

                      <div className="p-4 rounded-lg bg-muted/40 border-2 border-dashed">

                        <div className="font-semibold mb-2 font-vt323">New Offer</div>

                        <div className="text-2xl font-bold font-vt323">${money(result.newAfterTax)}</div>

                        <div className="text-xs text-muted-foreground mt-1 font-vt323">after-tax</div>

                      </div>

                    </div>

                    <div className="flex justify-center">

                      {isLast ? (

                        <Button onClick={restart} className="font-vt323 text-base" size="lg">

                          Play Again

                        </Button>

                      ) : (

                        <Button onClick={nextRound} className="font-vt323 text-base" size="lg">

                          Next Round

                        </Button>

                      )}

                    </div>

                  </Card>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

          {/* RIGHT: 3D game scene */}
          <Card className="overflow-hidden relative min-h-[600px] shadow-xl" style={{ borderRadius: 12 }}>

            <div className="h-[600px] w-full relative">

              <Simple3DScene stepIndex={stepIndex} wrongPulse={wrongPulse} correctPulse={correctPulse} currentOffer={currentOffer} />

              {/* Current offer display - bottom right corner, on top of mountain */}
              {currentOffer && (
                <div className="absolute bottom-6 right-6 z-20">
                  <Card className="p-4 bg-white/95 shadow-xl border-2 border-orange-200 min-w-[200px]">
                    <div className="text-xs text-muted-foreground font-vt323 mb-1">Current Job</div>
                    <div className="text-lg font-bold font-vt323 mb-2">{currentOffer.label}</div>
                    <div className="text-2xl font-bold font-vt323 text-orange-600">
                      ${money(afterTax(currentOffer))}
                    </div>
                    <div className="text-xs text-muted-foreground font-vt323 mt-1">after-tax</div>
                  </Card>
                </div>
              )}

              {/* Step indicator - top left */}
              <div className="absolute top-4 left-4 z-20">
                <Badge variant="secondary" className="font-vt323 text-base bg-white/95 shadow-lg px-4 py-2">
                  Step {stepIndex}/9
                </Badge>
              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>

  )

}
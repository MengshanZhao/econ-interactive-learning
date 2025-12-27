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
  '#FF8C69', // Step 1
  '#FF6347', // Step 2 - tomato
  '#FF331F', // Step 3 - deep red-orange
]

function VoxelStairs({ stepIndex }: { stepIndex: number }) {
  const stepGeo = useMemo(() => new THREE.BoxGeometry(2.0, 0.4, 1.2), [])
  
  return (
    <group position={[0, -1.2, 0]}>
      {Array.from({ length: 4 }).map((_, i) => {
        const z = -i * 1.5 // Move back in Z
        const y = i * 0.4  // Step height (step 0 at y=0, step 1 at y=0.4, etc.)
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

function LittleAvatar({ stepIndex, wrongPulse, correctPulse }: { stepIndex: number; wrongPulse: number; correctPulse: number }) {
  const group = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const wrongAnim = useRef({ active: false, start: 0 })
  const correctAnim = useRef({ active: false, start: 0 })
  
  // Target position: move forward in Z space, step up
  // Start at ground level (step 0), climb to step 3
  const targetZ = -stepIndex * 1.5
  const targetY = stepIndex * 0.4 - 0.2  // Start at ground level (-0.2), climb up (step 0: -0.2, step 1: 0.2, step 2: 0.6, step 3: 1.0)
  
  useEffect(() => {
    if (wrongPulse > 0) {
      wrongAnim.current = { active: true, start: performance.now() }
    }
  }, [wrongPulse])
  
  useEffect(() => {
    if (correctPulse > 0) {
      correctAnim.current = { active: true, start: performance.now() }
    }
  }, [correctPulse])
  
  useFrame((_, dt) => {
    if (!group.current || !headRef.current || !bodyRef.current) return
    
    // Smooth movement to target
    group.current.position.lerp(new THREE.Vector3(0, targetY, targetZ), 1 - Math.pow(0.05, dt))
    
    // Idle bob
    if (!wrongAnim.current.active && !correctAnim.current.active) {
    group.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1
      headRef.current.rotation.x = 0
      bodyRef.current.rotation.x = 0
    }
    
    // Wrong animation: annoyed - head shake, body slump
    if (wrongAnim.current.active) {
      const elapsed = (performance.now() - wrongAnim.current.start) / 1000
      if (elapsed < 1.2) {
        const shake = Math.sin(elapsed * 25) * 0.2
        const slump = Math.sin(elapsed * 8) * 0.3
        group.current.position.x = shake * 0.3
        group.current.rotation.z = shake * 0.3
        headRef.current.rotation.x = slump * 0.5 // Head droops
        bodyRef.current.rotation.x = slump * 0.3 // Body slumps
        bodyRef.current.position.y = -Math.abs(slump) * 0.1 // Slight crouch
      } else {
        wrongAnim.current.active = false
        group.current.rotation.z = 0
        group.current.position.x = 0
        headRef.current.rotation.x = 0
        bodyRef.current.rotation.x = 0
        bodyRef.current.position.y = 0
      }
    }
    
    // Correct animation: happy - slight bounce
    if (correctAnim.current.active) {
      const elapsed = (performance.now() - correctAnim.current.start) / 1000
      if (elapsed < 0.8) {
        const bounce = Math.sin(elapsed * 15) * 0.15
        group.current.position.y = targetY + bounce * 0.2
        headRef.current.rotation.x = -bounce * 0.2 // Head tilts up
      } else {
        correctAnim.current.active = false
        group.current.position.y = targetY
        headRef.current.rotation.x = 0
      }
    }
  })
  
  // Check if character reached the top (step 3)
  const isAtTop = stepIndex >= 3
  
  return (
    <group ref={group} position={[0, -0.2, 0]}>
      <group ref={bodyRef}>
        {/* Body - dark blue matching photo */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshBasicMaterial color="#2E4A6B" />
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
      {/* Head - light pink/purple matching photo */}
      <group ref={headRef} position={[0, 0.4, 0]}>
        <mesh>
          <boxGeometry args={[0.32, 0.32, 0.32]} />
          <meshBasicMaterial color="#E8A5C4" />
        </mesh>
        {/* Crown when at the top */}
        {isAtTop && (
          <group position={[0, 0.25, 0]}>
            {/* Crown base */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.4, 0.15, 0.25]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
            {/* Crown spikes */}
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[-0.15 + i * 0.075, 0.1, 0]}>
                <boxGeometry args={[0.05, 0.15, 0.05]} />
                <meshBasicMaterial color="#FFA500" />
              </mesh>
            ))}
            {/* Crown jewel */}
            <mesh position={[0, 0.15, 0.1]}>
              <boxGeometry args={[0.1, 0.1, 0.05]} />
              <meshBasicMaterial color="#FF0000" />
            </mesh>
          </group>
        )}
      </group>
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

function Fireworks({ trigger, originZ }: { trigger: number; originZ: number }) {
  const group = useRef<THREE.Group>(null)
  const particles = useMemo(() => {
    const allParticles: Array<{
      position: THREE.Vector3
      velocity: THREE.Vector3
      color: string
      origin: THREE.Vector3
      startTime: number
    }> = []
    
    // Create 5 firework bursts
    for (let fw = 0; fw < 5; fw++) {
      const origin = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        3 + Math.random() * 2,
        originZ + (Math.random() - 0.5) * 3
      )
      const startTime = fw * 0.3
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500']
      
      for (let i = 0; i < 30; i++) {
        allParticles.push({
          position: origin.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          ),
          color: colors[Math.floor(Math.random() * colors.length)],
          origin: origin.clone(),
          startTime,
        })
      }
    }
    return allParticles
  }, [originZ])
  
  const active = useRef(false)
  const start = useRef(0)
  
  useEffect(() => {
    if (trigger > 0) {
      particles.forEach((p) => {
        p.position.copy(p.origin)
        p.velocity.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        )
      })
      active.current = true
      start.current = performance.now()
    }
  }, [trigger, particles])
  
  useFrame((_, dt) => {
    if (!group.current || !active.current) return
    const elapsed = (performance.now() - start.current) / 1000
    if (elapsed > 3) {
      active.current = false
      return
    }
    
    particles.forEach((p, i) => {
      const localElapsed = elapsed - p.startTime
      if (localElapsed < 0 || localElapsed > 1.5) return
      
      p.velocity.y -= 5 * dt
      p.position.addScaledVector(p.velocity, dt)
      
      const mesh = group.current!.children[i] as THREE.Mesh
      if (mesh) {
        mesh.position.copy(p.position)
        const scale = Math.max(0, 1 - localElapsed * 0.8)
        mesh.scale.set(scale, scale, scale)
      }
    })
  })
  
  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshBasicMaterial color={p.color} />
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
  allComplete,
}: {
  stepIndex: number
  wrongPulse: number
  correctPulse: number
  currentOffer: PackageOption | null
  allComplete: boolean
}) {
  const skyColor = skyColors[Math.min(stepIndex, skyColors.length - 1)]
  const characterZ = -stepIndex * 1.5
  
  // Dynamic camera position that moves forward and up as character progresses
  const cameraPosition = useMemo(() => {
    const baseX = 5
    const baseY = 4
    const baseZ = 10
    return [
      baseX - stepIndex * 0.3, // Move camera left slightly
      baseY + stepIndex * 0.4, // Move camera up
      baseZ - stepIndex * 0.8, // Move camera forward
    ] as [number, number, number]
  }, [stepIndex])
  
  return (
    <Canvas 
      camera={{ position: cameraPosition, fov: 55 }}
      style={{ width: '100%', height: '100%', background: `linear-gradient(to bottom, ${skyColor}, #FF8C69)` }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
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
      <LittleAvatar stepIndex={stepIndex} wrongPulse={wrongPulse} correctPulse={correctPulse} />
      
      {/* Confetti - originates from character position */}
      <Confetti trigger={correctPulse} originZ={characterZ} />
      
      {/* Fireworks when all complete */}
      {allComplete && <Fireworks trigger={1} originZ={characterZ} />}
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

    ],

    []

  )

  // Initial current offer
  const initialOffer: PackageOption = { id: "A", label: "TechCorp Solutions", earnings: 6000, personalTax: 0.2, corporateTax: 0.1 }

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
  const [showIntro, setShowIntro] = useState(true)
  const [showExample, setShowExample] = useState(false)

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

      setStepIndex((s) => Math.min(s + 1, 3))

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

    setShowIntro(true)

  }

  const isLast = roundIndex === rounds.length - 1
  const allComplete = stepIndex >= 3

  return (

    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">

      {/* Intro popup with blur */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur background */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
          {/* Intro card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white/95 rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl border-4 border-orange-300"
          >
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold font-vt323 text-orange-600 mb-4">Welcome to Your Career Journey!</h2>
              <div className="text-lg font-vt323 text-gray-700 space-y-4 leading-relaxed">
                <p>
                  You've just graduated and found your first full-time work at <span className="font-bold text-orange-600">TechCorp Solutions</span>!
                </p>
                <p>
                  But in the meantime, you're still looking for better opportunities...
                </p>
                <p className="text-xl font-bold text-orange-600 mt-6">
                  Please pick the highest after-tax offer to climb on the mountain!
                </p>
              </div>

              {/* Example calculation popup */}
              {showExample && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-left"
                >
                  <div className="text-lg font-bold font-vt323 text-blue-700 mb-3">Example Calculation:</div>
                  <div className="text-base font-vt323 text-gray-800 space-y-2">
                    <p>Let's say you have an offer with:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Earnings (gross): $6,000</li>
                      <li>Corporate tax: 10%</li>
                      <li>Personal tax: 20%</li>
                    </ul>
                    <p className="mt-3 font-semibold">After-tax calculation:</p>
                    <p className="font-mono bg-white p-2 rounded border">
                      $6,000 × (1 - 0.10) × (1 - 0.20) = $6,000 × 0.90 × 0.80 = $4,320
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      So your after-tax income would be <span className="font-bold text-blue-700">$4,320</span>
                    </p>
                      </div>
                </motion.div>
              )}

              {/* Game style buttons */}
              <div className="flex gap-4 justify-center mt-6">
                {/* Blue button - Give me an example */}
                <button
                  onClick={() => setShowExample(!showExample)}
                  className="group relative cursor-pointer"
                  style={{ perspective: '1000px' }}
                >
                  <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-5deg)' }}>
                    <div className="relative transform transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                      <div className="relative w-40 h-12 bg-blue-500 rounded shadow-xl" style={{ 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-300 rounded-t opacity-60"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-vt323 text-base font-bold">
                          Give me an example
                        </div>
                      </div>
                      <div className="absolute left-1 top-1 w-40 h-12 bg-blue-700 rounded opacity-50" style={{ transform: 'translateZ(-4px)' }}></div>
                    </div>
                  </div>
                </button>

                {/* Red button - Start Game */}
                <button
                  onClick={() => setShowIntro(false)}
                  className="group relative cursor-pointer"
                  style={{ perspective: '1000px' }}
                >
                  <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(5deg)' }}>
                    <div className="relative transform transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                      <div className="relative w-40 h-12 bg-red-500 rounded shadow-xl" style={{ 
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      }}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-300 rounded-t opacity-60"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white font-vt323 text-base font-bold">
                          Start Game
                              </div>
                              </div>
                      <div className="absolute left-1 top-1 w-40 h-12 bg-red-700 rounded opacity-50" style={{ transform: 'translateZ(-4px)' }}></div>
                            </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">

        {/* Game area - single 3D scene with all UI inside */}
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden relative min-h-[700px] shadow-xl" style={{ borderRadius: 12 }}>
            <div className="h-[700px] w-full relative">
              <Simple3DScene stepIndex={stepIndex} wrongPulse={wrongPulse} correctPulse={correctPulse} currentOffer={currentOffer} allComplete={allComplete || false} />

              {/* Step indicator - top left */}
              <div className="absolute top-4 left-4 z-20">
                <Badge variant="secondary" className="font-vt323 text-lg bg-white/90 backdrop-blur-sm shadow-lg px-4 py-2">
                  Step {stepIndex}/3
                            </Badge>
                          </div>

              {/* Round title - top center */}
              {!result && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-8 py-4 shadow-lg border-2 border-orange-200">
                    <div className="text-base text-muted-foreground font-vt323 mb-2">{round.title}</div>
                    <div className="text-2xl font-bold font-vt323">A new job offer arrives!</div>
                              </div>
                            </div>
              )}

              {/* Current offer display - bottom right corner */}
              {currentOffer && !result && (
                <div className="absolute bottom-6 right-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-5 shadow-xl border-2 border-orange-300 min-w-[240px]">
                    <div className="text-sm text-muted-foreground font-vt323 mb-2">Current Job</div>
                    <div className="text-xl font-bold font-vt323 mb-4">{currentOffer.label}</div>
                    <div className="space-y-3 text-base font-vt323">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Earnings (gross)</span>
                        <span className="font-semibold text-lg">${money(currentOffer.earnings)}</span>
                              </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personal tax</span>
                        <span className="font-medium text-lg">{pct(currentOffer.personalTax)}</span>
                            </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Corporate tax</span>
                        <span className="font-medium text-lg">{pct(currentOffer.corporateTax)}</span>
                          </div>
                            </div>
                  </div>
                </div>
              )}

              {/* New offer display - bottom left corner */}
              {!result && (
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-5 shadow-xl border-2 border-blue-300 min-w-[240px]">
                    <div className="text-sm text-muted-foreground font-vt323 mb-2">New Offer</div>
                    <div className="text-xl font-bold font-vt323 mb-4">{round.newOffer.label}</div>
                    <div className="space-y-3 text-base font-vt323">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Earnings (gross)</span>
                        <span className="font-semibold text-lg">${money(round.newOffer.earnings)}</span>
                            </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personal tax</span>
                        <span className="font-medium text-lg">{pct(round.newOffer.personalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Corporate tax</span>
                        <span className="font-medium text-lg">{pct(round.newOffer.corporateTax)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3D Arrow buttons - center bottom */}
              {!result && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-8 items-center">
                  {/* Left side - Arrow pointing left + Switch to New Offer button */}
                  <div className="flex items-center gap-2">
                    {/* Arrow pointing left (to new offer box) */}
                    <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-10deg)' }}>
                      <div className="w-0 h-0" style={{ 
                        borderTop: '18px solid transparent',
                        borderBottom: '18px solid transparent',
                        borderLeft: '24px solid #3b82f6',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}></div>
                    </div>
                    {/* Switch button */}
                    <button
                      onClick={() => evaluate("switch")}
                      className="group relative cursor-pointer"
                      style={{ perspective: '1000px' }}
                    >
                      <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-5deg)' }}>
                        <div className="relative transform transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                          <div className="relative w-36 h-10 bg-blue-500 rounded shadow-xl" style={{ 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          }}>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-300 rounded-t opacity-60"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white font-vt323 text-sm font-bold">
                              Switch to New Offer
                            </div>
                          </div>
                          <div className="absolute left-1 top-1 w-36 h-10 bg-blue-700 rounded opacity-50" style={{ transform: 'translateZ(-4px)' }}></div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Right side - Stay with Current Job button + Arrow pointing right */}
                  <div className="flex items-center gap-2">
                    {/* Stay button */}
                    <button
                      onClick={() => evaluate("stay")}
                      className="group relative cursor-pointer"
                      style={{ perspective: '1000px' }}
                    >
                      <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(5deg)' }}>
                        <div className="relative transform transition-all duration-300 group-hover:scale-110 group-active:scale-95">
                          <div className="relative w-36 h-10 bg-orange-500 rounded shadow-xl" style={{ 
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                          }}>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-300 rounded-t opacity-60"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white font-vt323 text-sm font-bold">
                              Stay with Current Job
                            </div>
                          </div>
                          <div className="absolute left-1 top-1 w-36 h-10 bg-orange-700 rounded opacity-50" style={{ transform: 'translateZ(-4px)' }}></div>
                        </div>
                      </div>
                    </button>
                    {/* Arrow pointing right (to current job box) */}
                    <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(10deg)' }}>
                      <div className="w-0 h-0" style={{ 
                        borderTop: '18px solid transparent',
                        borderBottom: '18px solid transparent',
                        borderRight: '24px solid #f97316',
                        filter: 'drop-shadow(-2px 2px 4px rgba(0,0,0,0.3))'
                      }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion message - all 3 rounds correct */}
              {allComplete && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="bg-white/95 backdrop-blur-sm rounded-lg p-8 shadow-2xl border-4 border-yellow-400 min-w-[400px] text-center"
                  >
                    <div className="text-6xl mb-4">👑</div>
                    <div className="text-3xl font-bold font-vt323 mb-3 text-yellow-600">Congratulations!</div>
                    <div className="text-xl font-bold font-vt323 mb-2 text-green-600">You've Reached the Top!</div>
                    <div className="text-base text-muted-foreground font-vt323 mb-6">
                      You successfully completed all 3 rounds and climbed to the top of the mountain!
                    </div>
                    <Button 
                      onClick={restart}
                      className="font-vt323 text-lg bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3"
                      size="lg"
                    >
                      Play Again
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Result display - center (delayed animation) */}
              {result && result.correct && !allComplete && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-2xl border-4 border-green-400 min-w-[300px] text-center"
                  >
                    <div className="text-5xl mb-3">✅</div>
                    <div className="text-2xl font-bold font-vt323 mb-2 text-green-600">Correct! Step up!</div>
                    <div className="text-sm text-muted-foreground font-vt323 mb-4">
                      {result.shouldSwitch 
                        ? "The new offer has higher after-tax pay."
                        : "Your current job has higher after-tax pay."
                      }
                              </div>
                    <Button 
                      onClick={isLast ? restart : nextRound}
                      className="font-vt323 text-base bg-green-500 hover:bg-green-600 text-white"
                      size="lg"
                    >
                      {isLast ? "Play Again" : "Next Round"}
                    </Button>
                </motion.div>
                              </div>
              )}

              {/* Wrong answer popup with calculation - center (delayed animation) */}
              {result && !result.correct && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-2xl border-4 border-red-400 min-w-[400px] max-w-[500px]"
                  >
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-3">❌</div>
                      <div className="text-2xl font-bold font-vt323 mb-2 text-red-600">Not quite!</div>
                      <div className="text-sm text-muted-foreground font-vt323">
                        {result.shouldSwitch 
                          ? "The new offer has higher after-tax pay. You should switch!"
                          : "Your current job has higher after-tax pay. You should stay!"
                        }
                            </div>
                          </div>

                    <div className="space-y-3 mb-4 text-sm font-vt323">
                      <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200">
                        <div className="font-semibold mb-1">Current Job Calculation:</div>
                        <div className="text-xs text-muted-foreground">
                          ${money(currentOffer.earnings)} × (1 − {pct(currentOffer.personalTax)}) × (1 − {pct(currentOffer.corporateTax)})
                              </div>
                        <div className="text-lg font-bold text-orange-600 mt-1">
                          = ${money(result.currentAfterTax)}
                            </div>
          </div>

                      <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                        <div className="font-semibold mb-1">New Offer Calculation:</div>
                        <div className="text-xs text-muted-foreground">
                          ${money(round.newOffer.earnings)} × (1 − {pct(round.newOffer.personalTax)}) × (1 − {pct(round.newOffer.corporateTax)})
                            </div>
                        <div className="text-lg font-bold text-blue-600 mt-1">
                          = ${money(result.newAfterTax)}
                          </div>
                            </div>
                            </div>

                    <div className="text-center">
                      <Button 
                        onClick={isLast ? restart : nextRound}
                        className="font-vt323 text-base bg-red-500 hover:bg-red-600 text-white"
                        size="lg"
                      >
                        {isLast ? "Play Again" : "Next Round"}
                      </Button>
              </div>
                      </motion.div>
                </div>
              )}

            </div>

          </Card>

        </div>

      </div>

    </div>

  )

}
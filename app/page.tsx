'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Mail, MapPin, Phone, Linkedin, BookOpen, School, Award, Code } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import dynamic from 'next/dynamic'

const avatarFaces = [
  { src: "/images/sad.JPG", alt: "Sad face" },
  { src: "/images/facepalm.JPG", alt: "Facepalm" },
  { src: "/images/angry.JPG", alt: "Angry face" },
  { src: "/images/wink.JPG", alt: "Wink face" },
]

const JourneyMap = dynamic(() => import('@/components/journey-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-card rounded-lg animate-pulse"></div>
  ),
})

// Dynamically import the HeroSection component to ensure client-side rendering
const HeroSection = dynamic(
  () => import('@/components/hero-section'),
  {
    ssr: false,
    loading: () => (
      <div className="relative py-16 md:py-24">
        {/* Simple placeholder */}
        <div className="container mx-auto px-4">
          <div className="h-48 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const [faceIdx, setFaceIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setFaceIdx((idx) => (idx + 1) % avatarFaces.length)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  const selectFace = (idx: number) => {
    setFaceIdx(idx)
    setIsPlaying(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Video Background */}
      <HeroSection />

      {/* About Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-6 text-foreground">About Me</h2>
              <p className="text-foreground mb-4">
                I am a PhD candidate in Agricultural Economics at Washington State University, expecting to graduate in
                May 2026. My research focuses on development economics, health outcomes, and environmental policy.
              </p>
              <p className="text-foreground mb-4">
                I have experience in field research, experimental design, and data analysis. My current work examines
                the effects of Problem Management Plus (PM+) intervention on maternal mental health and child
                undernutrition in Gombe, Nigeria, as well as environmental protection policies in China.
              </p>
              <p className="text-foreground mb-6">
                My teaching style emphasizes student engagement through diverse methods, including <Link href="/teaching/335" className="text-[color:hsl(var(--primary))] hover:underline">self-designed interactive games</Link>.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-foreground">
                  <MapPin className="h-5 w-5 mr-2 text-foreground" />
                  <span>Pullman, Washington, US</span>
                </div>
                <div className="flex items-center text-foreground">
                  <Mail className="h-5 w-5 mr-2 text-foreground" />
                  <a href="mailto:mengshan.zhao@wsu.edu" className="hover:text-foreground transition-colors">
                    mengshan.zhao@wsu.edu
                  </a>
                </div>
                <div className="flex items-center text-foreground">
                  <Phone className="h-5 w-5 mr-2 text-foreground" />
                  <a href="tel:+16083347814" className="hover:text-foreground transition-colors">
                    (608) 334-7814
                  </a>
                </div>
                <div className="flex items-center text-foreground">
                  <Linkedin className="h-5 w-5 mr-2 text-foreground" />
                  <a href="https://www.linkedin.com/in/mengshan-zhao-222422194/" className="hover:text-foreground transition-colors">
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Research Interests</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-foreground rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  </div>
                  <span className="text-foreground">Development Economics</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-foreground rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  </div>
                  <span className="text-foreground">Maternal and Child Health</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-foreground rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  </div>
                  <span className="text-foreground">Environmental Policy</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-foreground rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  </div>
                  <span className="text-foreground">Labor Economics</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-foreground rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  </div>
                  <span className="text-foreground">Transportation Economics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Featured Research</h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between bg-card rounded-lg px-8 py-6 shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Maternal Health & Field Research in Nigeria</h3>
                <p className="text-foreground mb-2 max-w-2xl">Investigating how maternal psychological support interventions can improve both maternal well-being and child nutrition outcomes, offering a potentially cost-efficient approach to addressing interconnected health challenges in vulnerable populations.</p>
              </div>
              <Button asChild className="button-metallic mt-4 md:mt-0 md:ml-8">
                <Link href="/research#maternal-health">Learn More</Link>
              </Button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between bg-card rounded-lg px-8 py-6 shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Competing for Clean Air</h3>
                <p className="text-foreground mb-2 max-w-2xl">How cities compete to avoid government scrutiny creates strategic pollution reduction that's 4x more effective than previously measured, revealing the hidden power of ranking-based environmental policies in driving local government behavior.</p>
              </div>
              <Button asChild className="button-metallic mt-4 md:mt-0 md:ml-8">
                <Link href="/research#clean-air">Learn More</Link>
              </Button>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between bg-card rounded-lg px-8 py-6 shadow-md">
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Birth Timing Decisions</h3>
                <p className="text-foreground mb-2 max-w-2xl">Examining how women's education and human capital development reshape fertility decisions under China's evolving population policies, revealing unintended consequences of how investment in women's skills changes the calculus of family planning in modern China.</p>
              </div>
              <Button asChild className="button-metallic mt-4 md:mt-0 md:ml-8">
                <Link href="/research#birth-timing">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button asChild className="button-metallic">
              <Link href="/research">See more research</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Education & Experience */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Education & Experience</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <School className="h-8 w-8 text-foreground mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Education</h3>
              </div>
              <div className="space-y-6">
                <div className="border-l-2 border-foreground pl-4 ml-4">
                  <h4 className="text-lg font-semibold text-foreground">Ph.D. in Agriculture Economics</h4>
                  <p className="text-foreground">Washington State University</p>
                  <p className="text-foreground text-sm">2021 - Expected May 2026</p>
                  <p className="text-foreground mt-1">GPA: 3.9/4.0</p>
                </div>
                <div className="border-l-2 border-foreground pl-4 ml-4">
                  <h4 className="text-lg font-semibold text-foreground">Master's in Agriculture and Applied Economics</h4>
                  <p className="text-foreground">University of Wisconsin, Madison</p>
                  <p className="text-foreground text-sm">2019 - 2021</p>
                  <p className="text-foreground mt-1">GPA: 3.8/4.0</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center mb-6">
                <BookOpen className="h-8 w-8 text-foreground mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Research Experience</h3>
              </div>
              <div className="space-y-6">
                <div className="border-l-2 border-foreground pl-4 ml-4">
                  <h4 className="text-lg font-semibold text-foreground">Research Assistant</h4>
                  <p className="text-foreground">Washington State University</p>
                  <p className="text-foreground text-sm">Jan 2023 - Present</p>
                  <p className="text-foreground mt-1">Supervisor: Prof. Seollee Park</p>
                  <p className="text-foreground mt-1">
                    Studying effects of PM+ intervention on maternal mental health and child undernutrition
                  </p>
                </div>
                <div className="border-l-2 border-foreground pl-4 ml-4">
                  <h4 className="text-lg font-semibold text-foreground">Research Assistant</h4>
                  <p className="text-foreground">Washington State University</p>
                  <p className="text-foreground text-sm">Jan 2022 - Dec 2022</p>
                  <p className="text-foreground mt-1">Supervisor: Prof. Jake Wagner</p>
                  <p className="text-foreground mt-1">
                    Conducted research on transportation economics and optimal pricing policies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* References */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">References</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-foreground">Chair: Seollee Park</h3>
              <p className="text-foreground mb-2">Assistant Professor</p>
              <p className="text-foreground mb-2">School of Economic Sciences & Paul G. Allen School for Global Health</p>
              <p className="text-foreground mb-2">Washington State University</p>
              <p className="text-foreground mb-2">2020 NE Wilson Rd, Pullman, WA 99163</p>
              <p className="text-foreground mb-2">
                Email: <a href="mailto:seollee.park@wsu.edu" className="text-[color:hsl(var(--primary))] hover:underline">seollee.park@wsu.edu</a>
              </p>
              <p className="text-foreground">
                Phone: <a href="tel:5093358521" className="text-[color:hsl(var(--primary))] hover:underline">509-335-8521</a>
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-foreground">Benjamin Cowan</h3>
              <p className="text-foreground mb-2">Professor</p>
              <p className="text-foreground mb-2">School of Economic Sciences</p>
              <p className="text-foreground mb-2">Washington State University</p>
              <p className="text-foreground mb-2">Pullman, WA 99163</p>
              <p className="text-foreground mb-2">
                Email: <a href="mailto:ben.cowan@wsu.edu" className="text-[color:hsl(var(--primary))] hover:underline">ben.cowan@wsu.edu</a>
              </p>
              <p className="text-foreground">
                Phone: <a href="tel:5093352184" className="text-[color:hsl(var(--primary))] hover:underline">509-335-2184</a>
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-foreground">Shanthi Manian</h3>
              <p className="text-foreground mb-2">Associate Professor</p>
              <p className="text-foreground mb-2">School of Economic Sciences & Paul G. Allen School for Global Health</p>
              <p className="text-foreground mb-2">Washington State University</p>
              <p className="text-foreground mb-2">Pullman, WA 99163</p>
              <p className="text-foreground mb-2">
                Email: <a href="mailto:shanthi.manian@wsu.edu" className="text-[color:hsl(var(--primary))] hover:underline">shanthi.manian@wsu.edu</a>
              </p>
              <p className="text-foreground">
                Phone: <a href="tel:5093358739" className="text-[color:hsl(var(--primary))] hover:underline">509-335-8739</a>
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 text-foreground">Gregmar I. Galinato</h3>
              <p className="text-foreground mb-2">Professor</p>
              <p className="text-foreground mb-2">School of Economic Sciences</p>
              <p className="text-foreground mb-2">Washington State University</p>
              <p className="text-foreground mb-2">Pullman, WA 99163</p>
              <p className="text-foreground mb-2">
                Email: <a href="mailto:ggalinato@wsu.edu" className="text-[color:hsl(var(--primary))] hover:underline">ggalinato@wsu.edu</a>
              </p>
              <p className="text-foreground">
                Phone: <a href="tel:5093356382" className="text-[color:hsl(var(--primary))] hover:underline">509-335-6382</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

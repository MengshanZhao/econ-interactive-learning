"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white border-b border-[color:hsl(var(--border))] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-[color:hsl(var(--primary))] transition-colors">
            Mengshan Zhao
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/research" className="text-gray-600 hover:text-gray-900 transition-colors">
              Research
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-600 hover:text-gray-900 transition-colors">
                Teaching
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Teaching</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/teaching" className="block">
                  <DropdownMenuItem>Overview</DropdownMenuItem>
                </Link>
                <Link href="/teaching/335" className="block">
                  <DropdownMenuItem>ECONS 335: Business Finance</DropdownMenuItem>
                </Link>
                <Link href="/teaching/335/chapter-1" className="block">
                  <DropdownMenuItem>335 Games: Chapter 1</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/cv" className="text-gray-600 hover:text-gray-900 transition-colors">
              CV
            </Link>
            <Button asChild className="bg-[#FFC107] hover:bg-[#FFA000] text-black px-6 py-2 rounded-full font-semibold transition-colors">
              <Link href="/contact">Contact</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600 hover:text-gray-900 transition-colors" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-[color:hsl(var(--border))]">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-gray-900 hover:text-[color:hsl(var(--primary))] py-2 transition-colors" onClick={toggleMenu}>
                Home
              </Link>
              <Link href="/research" className="text-gray-900 hover:text-[color:hsl(var(--primary))] py-2 transition-colors" onClick={toggleMenu}>
                Research
              </Link>
              <details>
                <summary className="text-gray-900 py-2">Teaching</summary>
                <nav className="ml-4 flex flex-col space-y-2 py-2">
                  <Link href="/teaching" className="text-gray-900 hover:text-[color:hsl(var(--primary))] transition-colors" onClick={toggleMenu}>
                    Overview
                  </Link>
                  <Link href="/teaching/335" className="text-gray-900 hover:text-[color:hsl(var(--primary))] transition-colors" onClick={toggleMenu}>
                    ECONS 335: Business Finance
                  </Link>
                  <Link href="/teaching/335/chapter-1" className="text-gray-900 hover:text-[color:hsl(var(--primary))] transition-colors" onClick={toggleMenu}>
                    335 Games: Chapter 1
                  </Link>
                </nav>
              </details>
              <Link href="/cv" className="text-gray-900 hover:text-[color:hsl(var(--primary))] py-2 transition-colors" onClick={toggleMenu}>
                CV
              </Link>
              <Link href="/contact" className="text-gray-900 hover:text-[color:hsl(var(--primary))] py-2 transition-colors" onClick={toggleMenu}>
                Contact
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

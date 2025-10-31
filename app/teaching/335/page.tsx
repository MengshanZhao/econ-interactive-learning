import Link from "next/link"

export default function ECONS335Page() {
  return (
    <div className="min-h-screen bg-background">
      <section className="metallic-bg text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">ECONS 335: Business Finance</h1>
          <p className="text-lg max-w-3xl">
            Online course, Fall 2025 (August 2025 – December 2025)
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="card-minimal rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-3 text-foreground">Course Overview</h2>
                <p className="text-foreground mb-3">
                  Core tools of financial economics with practical application to valuation and firm decisions.
                </p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>Analyze and interpret financial statements</li>
                  <li>Apply time value of money and discounting</li>
                  <li>Understand risk–return and portfolio intuition</li>
                  <li>Value stocks and bonds; assess capital budgeting</li>
                  <li>Use and evaluate financial data sources</li>
                </ul>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Interactive Practice</h3>
                <p className="text-foreground mb-4">
                  Weekly interactive mini‑games will reinforce core concepts. Start with Chapter 1 below.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/teaching/335/chapter-1" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 1: Tax of Corporation Earning
                  </Link>
                  <Link href="/teaching/335/chapter-2" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 2: Financial Statement Analysis
                  </Link>
                  <Link href="/teaching/335/chapter-3" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 3: Time Value of Money
                  </Link>
                  <Link href="/teaching/335/chapter-4" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 4: TVM Rocket — Cash Flow PV
                  </Link>
                  <Link href="/teaching/335/chapter-5" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 5: Bank Boss — Animal Borrowers
                  </Link>
                  <Link href="/teaching/335/chapter-6" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 6: Bond Memory — Pricing Game
                  </Link>
                  <Link href="/teaching/335/chapter-7" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 7: Stock Valuation
                  </Link>
                  <Link href="/teaching/335/chapter-8" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 8: Investment Decision
                  </Link>
                  <Link href="/teaching/335/chapter-9" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 9: Incremental Earnings Practice
                  </Link>
                  <Link href="/teaching/335/chapter-11" className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90">
                    Chapter 11: Returns Lab
                  </Link>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Logistics</h3>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>Format: Online</li>
                  <li>Term: Fall 2025</li>
                </ul>
                <div className="pt-3">
                  <a
                    href="/Files/335_Syllabus.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                  >
                    Syllabus →
                  </a>
                </div>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Chapters</h3>
                <ol className="list-decimal list-inside text-foreground space-y-1">
                  <li>
                    <Link href="/teaching/335/chapter-1" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 1: Tax of Corporation Earning
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-2" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 2: Financial Statement Analysis
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-3" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 3: Time Value of Money
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-4" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 4: TVM Rocket: Cash Flow PV
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-5" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 5: Bank Boss: Animal Borrowers
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-6" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 6: Bond Price: A Memory Game
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-7" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 7: Stock Valuation
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-8" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 8: Investment Decision
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-9" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 9: Incremental Earnings Practice
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-11" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 11: Returns Lab
                    </Link>
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}


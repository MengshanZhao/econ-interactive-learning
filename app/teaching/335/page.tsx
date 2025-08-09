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
                <p className="text-foreground mb-2">
                  Students will learn the basic tools of financial economics and how to apply them. The course equips
                  students to analyze financial statements, understand and apply the time value of money, analyze the
                  risk–return tradeoff, value assets such as stocks and bonds, and analyze firms’ major financial
                  decisions.
                </p>
                <p className="text-foreground">
                  The course also introduces major sources of financial data and emphasizes interpretation, quality,
                  and credibility. These analytical and information‑literacy skills are valuable for many careers and
                  for personal financial decision‑making.
                </p>
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
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Chapters</h3>
                <ol className="list-decimal list-inside text-foreground space-y-1">
                  <li>
                    <Link href="/teaching/335/chapter-1" className="text-[color:hsl(var(--primary))] hover:underline">
                      Chapter 1: Tax of Corporation Earning
                    </Link>
                  </li>
                  <li className="text-muted-foreground">Chapter 2: Coming soon</li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}


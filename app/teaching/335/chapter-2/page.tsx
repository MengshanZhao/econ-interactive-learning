import Link from "next/link"

export default function Chapter2Page() {
  return (
    <div className="min-h-screen bg-background">
      <section className="metallic-bg text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Chapter 2: Financial Statement Analysis</h1>
          <p className="text-lg max-w-3xl">
            Learn to analyze balance sheets and income statements through interactive practice
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="card-minimal rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-3 text-foreground">Learning Objectives</h2>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>Distinguish between balance sheets and income statements</li>
                  <li>Understand key financial ratios and their components</li>
                  <li>Build financial ratio formulas by selecting appropriate line items</li>
                  <li>Apply ratio analysis to evaluate company performance</li>
                </ul>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Interactive Practice</h3>
                <p className="text-foreground mb-4">
                  This three-step interactive game will help you master financial statement analysis:
                </p>
                <ol className="list-decimal list-inside text-foreground space-y-2 mb-4">
                  <li><strong>Statement Recognition:</strong> Identify whether a financial statement is a balance sheet or income statement</li>
                  <li><strong>Ratio Learning:</strong> Explore how different ratios use specific line items from financial statements</li>
                  <li><strong>Formula Building:</strong> Construct ratio formulas by selecting the correct financial statement items</li>
                </ol>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="/games/financial-statements-game.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-[color:hsl(var(--primary))] text-white font-semibold hover:opacity-90"
                  >
                    Start Financial Statement Analysis Game
                  </a>
                </div>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Key Concepts Covered</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Liquidity Ratios</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Current Ratio</li>
                      <li>Quick Ratio</li>
                      <li>Cash Ratio</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Leverage Ratios</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Debt-Equity Ratio</li>
                      <li>Debt-to-Capital Ratio</li>
                      <li>Equity Multiplier</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Profitability Ratios</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Gross Margin</li>
                      <li>Operating Margin</li>
                      <li>Net Profit Margin</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Operating Returns</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                      <li>Asset Turnover</li>
                      <li>Return on Equity (ROE)</li>
                      <li>Return on Assets (ROA)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Navigation</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/teaching/335" className="text-[color:hsl(var(--primary))] hover:underline">
                      ← Back to Course Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/teaching/335/chapter-1" className="text-[color:hsl(var(--primary))] hover:underline">
                      ← Chapter 1: Tax of Corporation Earning
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="card-minimal rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3 text-foreground">Game Features</h3>
                <ul className="list-disc list-inside text-foreground space-y-1 text-sm">
                  <li>Progressive difficulty levels</li>
                  <li>Interactive highlighting of ratio components</li>
                  <li>Real-time feedback and scoring</li>
                  <li>Comprehensive ratio reference guide</li>
                  <li>Mobile-responsive design</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}







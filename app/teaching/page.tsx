import { Book, Calendar, Star } from "lucide-react"
import Link from "next/link"

export default function TeachingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="metallic-bg text-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Teaching</h1>
          <p className="text-xl max-w-3xl">
            I have experience teaching undergraduate economics courses at Washington State University, both as an
            instructor and teaching assistant.
          </p>
        </div>
      </section>

      {/* Teaching Experience */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Teaching Experience</h2>

          <div className="space-y-12">
            {/* Fall 2025 Courses */}
            <div className="card-minimal rounded-lg p-8">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-[#fff9e6] to-[#ffd700] p-3 rounded-lg text-[color:hsl(var(--foreground))] mr-6">
                  <Book className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Instructor</h3>
                  <p className="text-foreground mb-4">Washington State University</p>
                  <div className="flex items-center mb-4 text-foreground">
                    <Calendar className="h-5 w-5 mr-2 text-[color:hsl(var(--primary))]" />
                    <span>August 2025 - December 2025</span>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-foreground">ECONS 335: Business Finance</h4>
                      </div>
                      <p className="text-foreground mb-2">Online course</p>
                      <div className="space-y-3">
                        <p className="text-foreground">
                          Core tools of financial economics with practical application to valuation and firm decisions.
                        </p>
                        <ul className="list-disc list-inside text-foreground space-y-1">
                          <li>Analyze and interpret financial statements</li>
                          <li>Apply time value of money and discounting</li>
                          <li>Understand risk–return and portfolio intuition</li>
                          <li>Value stocks and bonds; assess capital budgeting</li>
                          <li>Use and evaluate financial data sources</li>
                        </ul>
                        <div className="pt-2 space-y-2">
                          <Link
                            href="/teaching/335"
                            className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                          >
                            View course details and interactive practice →
                          </Link>
                          <div>
                            <a
                              href="/Files/335_Syllabus.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                            >
                              View course details and interactive practice →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-foreground">ECONS 426: Transportation Economics & Supply Chain Analysis</h4>
                      </div>
                      <p className="text-foreground mb-2">Online course</p>
                      <div className="space-y-3">
                        <p className="text-foreground">
                          Economic principles applied to freight, modes, pricing, and supply‑chain performance.
                        </p>
                        <ul className="list-disc list-inside text-foreground space-y-1">
                          <li>Explain transport and supply‑chain trade‑offs</li>
                          <li>Compare modes and network design implications</li>
                          <li>Conduct basic costing and pricing analyses</li>
                          <li>Evaluate policy impacts using microeconomic tools</li>
                          <li>Perform and interpret empirical analysis</li>
                        </ul>
                        <div className="pt-2">
                          <a
                            href="/Files/426_syllabus.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                          >
                            View course details and interactive practice →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-minimal rounded-lg p-8">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-[#fff9e6] to-[#ffd700] p-3 rounded-lg text-[color:hsl(var(--foreground))] mr-6">
                  <Book className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Instructor</h3>
                  <p className="text-foreground mb-4">Washington State University</p>
                  <div className="flex items-center mb-4 text-foreground">
                    <Calendar className="h-5 w-5 mr-2 text-[color:hsl(var(--primary))]" />
                    <span>January 2025 - May 2025</span>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-foreground">ECONS 320: Money and Banking</h4>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-[color:hsl(var(--primary))] mr-1" />
                          <span className="text-foreground">4.5/5</span>
                        </div>
                      </div>
                      <p className="text-foreground mb-4">Online course</p>
                      <div className="space-y-2">
                        <p className="text-foreground">
                          This course covers the role of money and banking in the economy, monetary policy, financial
                          institutions, and the Federal Reserve System.
                        </p>
                        <p className="text-foreground">Topics include:</p>
                        <ul className="list-disc list-inside text-foreground space-y-1">
                          <li>Money and the financial system</li>
                          <li>Banking and financial institutions</li>
                          <li>Central banking and monetary policy</li>
                          <li>International finance and exchange rates</li>
                        </ul>
                        <div className="pt-2">
                          <a
                            href="/Files/320_Syllabus.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                          >
                            View course details and interactive practice →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-foreground">ECONS 323: Labor Economics</h4>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-[color:hsl(var(--primary))] mr-1" />
                          <span className="text-foreground">4.5/5</span>
                        </div>
                      </div>
                      <p className="text-foreground mb-4">Online course</p>
                      <div className="space-y-2">
                        <p className="text-foreground">
                          This course examines the economics of labor markets, including wage determination, employment,
                          unemployment, labor market discrimination, and labor unions.
                        </p>
                        <p className="text-foreground">Topics include:</p>
                        <ul className="list-disc list-inside text-foreground space-y-1">
                          <li>Labor supply and demand</li>
                          <li>Wage determination and inequality</li>
                          <li>Human capital and education</li>
                          <li>Labor market discrimination</li>
                          <li>Unemployment and job search</li>
                        </ul>
                        <div className="pt-2">
                          <a
                            href="/Files/323_Syllabus.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                          >
                            View course details and interactive practice →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-minimal rounded-lg p-8">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-[#fff9e6] to-[#ffd700] p-3 rounded-lg text-[color:hsl(var(--foreground))] mr-6">
                  <Book className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">Teaching Assistant</h3>
                  <p className="text-foreground mb-4">Washington State University</p>
                  <div className="flex items-center mb-4 text-foreground">
                    <Calendar className="h-5 w-5 mr-2 text-[color:hsl(var(--primary))]" />
                    <span>September 2021 - December 2021</span>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="text-xl font-semibold text-foreground mb-3">
                      ECONS 101: Fundamentals of Microeconomics
                    </h4>
                    <div className="space-y-2">
                      <p className="text-foreground">
                        Assisted with teaching the introductory microeconomics course, which covers basic economic
                        principles, supply and demand, consumer behavior, and market structures.
                      </p>
                      <p className="text-foreground">Responsibilities included:</p>
                      <ul className="list-disc list-inside text-foreground space-y-1">
                        <li>Leading discussion sections</li>
                        <li>Holding office hours</li>
                        <li>Grading assignments and exams</li>
                        <li>Providing additional support to students</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Teaching Philosophy</h2>
          <div className="card-minimal rounded-lg p-8">
            <p className="text-foreground mb-4">
              My philosophy centers on three principles: i) Building trust and providing clear channels for student support; ii) Creating new ways of engagement that enhance motivation; iii) Linking classroom concepts to real-world applications while using new technology tools carefully.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

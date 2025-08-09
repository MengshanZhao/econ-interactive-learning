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
                      <div className="space-y-2">
                        <p className="text-foreground">
                          Students will learn the basic tools of financial economics and how to apply them. The course equips students to analyze financial statements, understand and apply the time value of money, analyze the risk–return tradeoff, value assets such as stocks and bonds, and analyze firms’ major financial decisions. It also introduces major sources of financial data and emphasizes interpretation, quality, and credibility.
                        </p>
                        <p className="text-foreground">
                          These analytical and information‑literacy skills are valuable for many careers and for personal financial decision‑making. The financial literacy students acquire will foster a lifelong appreciation for the role of financial economics in current events and their own lives.
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/teaching/335"
                            className="inline-flex items-center text-[color:hsl(var(--primary))] font-semibold hover:underline"
                          >
                            View course details and interactive practice →
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-semibold text-foreground">ECONS 426: Transportation Economics & Supply Chain Analysis</h4>
                      </div>
                      <p className="text-foreground mb-2">Online course</p>
                      <div className="space-y-2">
                        <p className="text-foreground">By the end of the course, students should be able to:</p>
                        <ul className="list-disc list-inside text-foreground space-y-1">
                          <li>Understand important concepts on transportation and supply chain</li>
                          <li>Apply fundamental microeconomic theory to analyze transportation issues</li>
                          <li>Compare modes of transportation and their advantages/disadvantages in supply chains</li>
                          <li>Conduct basic costing and pricing analysis related to transportation</li>
                          <li>Perform empirical analysis related to transportation issues</li>
                        </ul>
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
              My teaching philosophy centers on creating an engaging and inclusive learning environment that encourages critical thinking and practical application of economic concepts.
            </p>
            <p className="text-foreground mb-4">Key elements of my approach include:</p>
            <ul className="list-disc list-inside text-foreground space-y-2 mb-4">
              <li>Connecting theoretical concepts to real-world applications through targeted coursework and assignments</li>
              <li>Encouraging students to embrace modern tools by incorporating AI and technological methods into learning</li>
              <li>Providing clear, constructive feedback and comprehensive support for student success</li>
            </ul>
            <p className="text-foreground">
              I strive to make economics accessible and relevant to students' lives and careers while fostering a supportive environment for questions and engagement with challenging material.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

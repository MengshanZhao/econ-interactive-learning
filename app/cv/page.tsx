import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

export default function CVPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Curriculum Vitae</h1>
          <div className="mt-8">
            <Button asChild className="bg-[#FFC107] hover:bg-[#FFA000] text-black px-6 py-2 rounded-full font-semibold transition-colors">
              <a href="/CV.pdf" download>
                <Download className="mr-2 h-4 w-4" /> Download CV
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CV Content */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Personal Info */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Mengshan Zhao (She/Her)</h2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p>PhD Candidate in Agricultural Economics</p>
                  <p>Washington State University</p>
                  <p>Pullman, Washington, US</p>
                </div>
                <div>
                  <p>Email: mengshan.zhao@wsu.edu</p>
                  <p>Phone: (608) 334-7814</p>
                  <p>
                    <a
                      href="https://www.linkedin.com/in/mengshan-zhao-222422194/"
                      className="text-gray-600 hover:text-gray-900 inline-flex items-center transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="ml-1 h-3 w-3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Education</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">Ph.D. in Agriculture Economics</h4>
                    <span className="text-gray-600">09.2021 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-1">Washington State University, United States</p>
                  <p className="text-gray-600">GPA: 3.9/4.0</p>
                  <p className="text-gray-600">Research interests: Development and Health</p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Master's Degree in Agriculture and Applied Economics
                    </h4>
                    <span className="text-gray-600">09.2019 – 06.2021</span>
                  </div>
                  <p className="text-gray-600 mb-1">University of Wisconsin, Madison, United States</p>
                  <p className="text-gray-600">GPA: 3.8/4.0</p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">B.B.A. with Honours in Applied Economics, Second Class Upper Division</h4>
                    <span className="text-gray-600">09.2015 – 06.2019</span>
                  </div>
                  <p className="text-gray-600 mb-1">Chinese University of Hong Kong (CUHK), Shenzhen, China</p>
                  <p className="text-gray-600">GPA: 3.3/4.0</p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-1">Visiting Program</h4>
                  <p className="text-gray-600">University of California, Irvine, United States</p>
                  <p className="text-gray-600">London School of Economics and Political Science, United Kingdom</p>
                </div>
              </div>
            </div>

            {/* Research Experience */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                Research Experience
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-800">Research Assistant</h4>
                    <span className="text-gray-600">Jun 2024 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-3">Supervisor: Prof. Galinato, Washington State University</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Conducted randomized controlled trial on organic vegetable technology impacts in the Philippines</li>
                    <li>Analyzed gender-based agricultural labor productivity changes and income group variations</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-800">Research Assistant</h4>
                    <span className="text-gray-600">Jan 2023 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-3">Supervisor: Prof. Seollee Park, Washington State University</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Studied the effects of Problem Management Plus (PM+) intervention on maternal mental health and child undernutrition</li>
                    <li>Conducted data analysis, paper writing, and traveled to Nigeria for experiment training</li>
                    <li>Worked closely with local teams to design experiments and questionnaires for a randomized control trial of 800 caregivers</li>
                    <li>Created audio assistant survey tools for sensitive questions and trained data collectors in Gombe, Nigeria</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-800">Research Assistant</h4>
                    <span className="text-gray-600">Jan 2022 – Dec 2022</span>
                  </div>
                  <p className="text-gray-600 mb-3">Supervisor: Prof. Jake Wagner, Washington State University</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Conducted research on transportation economics and developed code for analyzing big data spanning two decades of import/export data</li>
                    <li>Co-authored research on optimal pricing policies for campus parking</li>
                    <li>Collaborated on research examining the impacts of COVID-19 on U.S. containerized agricultural exports</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Working Papers */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Working Papers</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Competing for Clean Air: Dynamic Incentives in China's Environmental Protection Interviews
                    </h4>
                    <span className="text-gray-600">03.2024 – Current</span>
                  </div>
                  <p className="text-gray-600">
                    Examines the Environmental Protection Interview (EPI) campaign-style environmental policy in China using near real-time air quality data and Difference-in-Differences approach. Finds that cities at risk of being interviewed achieve PM2.5 reductions of 15.7 μg/m³—nearly four times larger than previous estimates, with effects most pronounced at year-end coinciding with annual evaluations.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Assessing the Economic Impacts of Technological Intervention on Organic Vegetable Farm Profitability and Gender Roles in Organic Farming
                    </h4>
                    <span className="text-gray-600">Jun 2024 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-1">with Prof. Galinato</p>
                  <p className="text-gray-600">
                    Determines whether agricultural labor productivity across genders changes after introduction of organic vegetable technologies through a randomized controlled trial in the Philippines. Finds significant increases in female labor during fertilizer and pesticide application stages for low-income households and reductions in labor productivity gaps across all income groups.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Birth Timing Decisions, China's Two-Child Allowance, and Women's Human Capital
                    </h4>
                    <span className="text-gray-600">Jan 2023 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-1">with Ben Cowan</p>
                  <p className="text-gray-600">
                    Critically examines the decline in fertility rates in China using a two-stage, discrete-choice model that enables individuals to make fertility decisions based on utility maximization. Empirically validates the model using Chinese Family Panel Survey data from 2010 to 2020, elucidating the roles of human-capital accumulation returns, child value, time costs, and compliance penalties.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      The Effects of a Psychological Support Intervention for Mothers on Children's Nutrition and Maternal Psychosocial Well-being
                    </h4>
                    <span className="text-gray-600">Jan 2023 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-1">with Seollee Park and Jennifer Ostrowski</p>
                  <p className="text-gray-600">
                    Examines the impacts of psychological support interventions on maternal mental health outcomes and child nutritional status through randomized controlled trial methodology with 800 caregivers.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      The Impacts of COVID-19 on U.S. Containerized Agricultural Exports
                    </h4>
                    <span className="text-gray-600">Jan 2022</span>
                  </div>
                  <p className="text-gray-600 mb-1">with Jake Wagner, Eric Jessup, and Bart Kenner</p>
                  <p className="text-gray-600">
                    Measures impacts of COVID-19 on monthly U.S. containerized agricultural export volumes using near-saturated fixed effects panel data model. Results show heterogeneous reductions through time: 4.6% reduction from March 2020-May 2021, 11.1% from May 2021-January 2022, with effects most pronounced across origin ports, commodities, and destination countries.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">Optimal Pricing Policies for Campus Parking</h4>
                    <span className="text-gray-600">Jan 2022</span>
                  </div>
                  <p className="text-gray-600 mb-1">with Jake Wagner and D. Moore</p>
                  <p className="text-gray-600">
                    Develops economic models for optimizing campus parking pricing strategies to improve efficiency and accessibility.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Role of Public Sentiment in Evaluating Lockdown Effects on Mobility: An Application of Natural Language Processing Method
                    </h4>
                    <span className="text-gray-600">Sep 2020 – Current</span>
                  </div>
                  <p className="text-gray-600 mb-1">with Xiaorui Qu, Qinan Lu, Liufang Su and Gunning Shi</p>
                  <p className="text-gray-600">
                    Investigates the influence of public sentiment and health policies on behavioral changes using daily COVID-related tweets and sentiment analysis through natural language processing. Employs Regression Discontinuity in Time Series (RDiT) method with county-level data from March to April 2020, finding that neutral-tone sentiment has the most pronounced negative impact on mobility.
                  </p>
                </div>
              </div>
            </div>

            {/* Teaching Experience */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                Teaching Experience
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">Instructor</h4>
                    <span className="text-gray-600">Jan 2025 – May 2025</span>
                  </div>
                  <p className="text-gray-600 mb-3">Washington State University</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>ECONS 320: Money and Banking (Online) - Received 4.5/5 in course evaluations</li>
                    <li>ECONS 323: Labor Economics (Online) - Received 4.5/5 in course evaluations</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">Teaching Assistant</h4>
                    <span className="text-gray-600">Sep 2021 – Dec 2021</span>
                  </div>
                  <p className="text-gray-600 mb-3">Washington State University</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>ECONS 101: Fundamentals of Microeconomics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Presentations */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Presentations</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Competing for Clean Air: Dynamic Incentives in China's Environmental Protection Interviews
                    </h4>
                    <span className="text-gray-600">Upcoming 2025</span>
                  </div>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Association of Environmental and Resource Economists (AERE), May 2025</li>
                    <li>Western Economic Association International (WEAI), June 2025</li>
                    <li>WSU Student Seminar, November 2025</li>
                    <li>Selected for presentation at 2025 AAEA Annual Meeting</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Competing for Clean Air: Dynamic Incentives in China's Environmental Protection Interviews
                    </h4>
                    <span className="text-gray-600">Recent</span>
                  </div>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Northwest Development Workshop, June 2024</li>
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xl font-semibold text-gray-800">Optimal Pricing Policies for Campus Parking</h4>
                    <span className="text-gray-600">Oct 2022</span>
                  </div>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Region 10 Transportation Conference</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Skills</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Programming:</h4>
                  <p className="text-gray-600">
                    R, Python (rasterio, pandas, xarray, sklearn, numpy, pytorch), STATA, LaTeX
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">AI Tools:</h4>
                  <p className="text-gray-600">
                    Claude, ChatGPT, Gemini, Cursor - proficient in leveraging AI assistants for research, writing, and
                    coding
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Research:</h4>
                  <p className="text-gray-600">
                    Natural Language Processing, Econometrics, Experimental Design, Field Research, Survey Design, Data
                    Analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Other Experience */}
            <div>
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Other Experience</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">Drama Writing:</h4>
                  <p className="text-gray-600">
                    Worked as a playwright in the university's club; Original work <span className="italic">Bourdieu in a Restaurant</span> joined Shenzhen-Hong Kong-Macao drama festival; Won a local award for playwriting.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">Part Time Work:</h4>
                  <p className="text-gray-600">
                    Worked as an editor for the marketing department for School of Management and Economics. Joined several economics seminars and interviewed professors.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">
                    Reading Ability and Literature & Sociology Interest:
                  </h4>
                  <p className="text-gray-600">
                    Read in a wide range and sufficient scale; Completed more than 10 courses in the School of Humanity and achieved a GPA above 3.7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download CV Button */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Need a printable version?</h2>
          <Button asChild className="bg-[#FFC107] hover:bg-[#FFA000] text-black px-6 py-2 rounded-full font-semibold transition-colors">
            <a href="/CV.pdf" download>
              <Download className="mr-2 h-4 w-4" /> Download Full CV (PDF)
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}

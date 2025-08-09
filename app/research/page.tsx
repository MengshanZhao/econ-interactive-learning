import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, User } from "lucide-react"

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Research</h1>
          <p className="text-xl max-w-3xl">
            My research focuses on development economics, health outcomes, and environmental policy. I use econometric
            methods, field experiments, and data analysis to address important questions in these areas.
          </p>
        </div>
      </section>

      {/* Fieldwork Highlight moved below Working Papers */}

      {/* Working Papers */}
      <section className="py-16 bg-card" id="working-papers">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Working Papers</h2>

          <div className="space-y-12">
            <div
              className="bg-card rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300"
              id="clean-air"
            >
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                Competing for Clean Air: Dynamic Incentives in China's Environmental Protection Interviews
              </h3>
              <div className="flex flex-wrap gap-4 mb-4 text-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-foreground" />
                  <span>March 2024 - Current</span>
                </div>
              </div>
              <p className="text-foreground mb-6">
                This study examines the Environmental Protection Interview (EPI), a campaign-style environmental policy in China that subjects poorly performing cities to central government scrutiny. Using near real-time air quality data from the Tracking Air Pollution in China (TAP) project and a Difference-in-Differences approach, I demonstrate that previous studies substantially underestimated the policy's impact by overlooking its dynamic competitive structure. I show that cities at risk of being interviewed (top 15 most polluted) achieve PM2.5 reductions of 15.7 μg/m³—nearly four times larger than previous estimates that focused only on initially interviewed cities. The effects are most pronounced at year-end, coinciding with annual evaluations, and lead to significant reductions in household healthcare expenditures, revealing how local governments strategically respond to the EPI's ranking system.
              </p>
              <div className="bg-card p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-2">Presentations:</h4>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li>Association of Environmental and Resource Economists (AERE), May 2025</li>
                  <li>Western Economic Association International (WEAI), June 2025</li>
                  <li>WSU Student Seminar, November 2025</li>
                  <li>Selected for presentation at 2025 AAEA Annual Meeting</li>
                  <li>Northwest Development Workshop, June 2024</li>
                </ul>
              </div>
              <Button>Request Draft</Button>
            </div>

            <div
              className="bg-card rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300"
              id="birth-timing"
            >
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                Birth Timing Decisions, China's Two-Child Allowance, and Women's Human Capital
              </h3>
              <div className="flex flex-wrap gap-4 mb-4 text-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-foreground" />
                  <span>January 2023 - Current</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-foreground" />
                  <span>with Ben Cowan</span>
                </div>
              </div>
              <p className="text-foreground mb-6">
                This research critically examines the decline in fertility rates in China beginning in the 1980s when the one-child policy was introduced, focusing on the transition to the two-child policy. I employ a two-stage, discrete-choice model that enables individuals to make fertility decisions based on utility maximization. The model elucidates the roles and relationships of return rates on human-capital accumulation, personal value of the child, time costs associated with child-rearing, and potential penalties for non-compliance in shaping these decisions. Using Chinese Family Panel Survey data from 2010 to 2020 with a log-linear approach, I demonstrate that women with low wage returns to human capital are more likely to favor giving birth at least once, ceteris paribus.
              </p>
              <Button>Request Draft</Button>
            </div>

            <div className="bg-card rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold mb-3 text-foreground">Optimal Pricing Policies for Campus Parking</h3>
              <div className="flex flex-wrap gap-4 mb-4 text-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-foreground" />
                  <span>January 2022 - Current</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-foreground" />
                  <span>with Jake Wagner and D. Moore</span>
                </div>
              </div>
              <p className="text-foreground mb-6">
                This paper develops comprehensive economic models for optimizing campus parking pricing strategies to improve both efficiency and accessibility. We analyze various pricing mechanisms and their effects on parking utilization patterns, congestion reduction, and user satisfaction across different campus constituencies. The research provides actionable insights for university administrators seeking to balance revenue generation, parking availability, and equitable access for students, faculty, and staff.
              </p>
              <div className="bg-card p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-foreground mb-2">Presentations:</h4>
                <ul className="list-disc list-inside text-foreground">
                  <li>Region 10 Transportation Conference, October 2022</li>
                </ul>
              </div>
              <Button>Request Draft</Button>
            </div>

            <div className="bg-card rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                The Impacts of COVID-19 on U.S. Containerized Agricultural Exports
              </h3>
              <div className="flex flex-wrap gap-4 mb-4 text-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-foreground" />
                  <span>January 2022 - Current</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-foreground" />
                  <span>with Jake Wagner, Eric Jessup, and Bart Kenner</span>
                </div>
              </div>
              <p className="text-foreground mb-6">
                This study measures the impacts of COVID-19 on monthly U.S. containerized agricultural export volumes using a near-saturated fixed effects panel data model. Results show heterogeneous reductions in containerized agricultural export volumes through time: monthly exports fell by 4.6% from March 2020-May 2021, by 11.1% from May 2021-January 2022, and by 7.5% over the full period from March 2020-August 2022. Impacts vary significantly across origin ports (Long Beach, CA fell 25% vs. Houston, TX fell &lt;1%), commodities (cotton exports fell 25% while tobacco increased 27%), and destination countries (exports to China increased 12% while exports to Japan fell 26%). The analysis includes port-commodity, port-destination, and commodity-destination pairs to evaluate substitution effects at granular levels.
              </p>
              <Button>Request Draft</Button>
            </div>

            <div
              className="bg-card rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300"
              id="organic-farming-gender"
            >
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                Assessing the Economic Impacts of Technological Intervention on Organic Vegetable Farm Profitability and Gender Roles in Organic Farming
              </h3>
              <div className="flex flex-wrap gap-4 mb-4 text-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-foreground" />
                  <span>June 2024 - Current</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-foreground" />
                  <span>with Prof. Galinato</span>
                </div>
              </div>
              <p className="text-foreground mb-6">
                This study determines whether agricultural labor productivity across genders changes following the introduction of organic vegetable technologies through a randomized controlled trial with vegetable farmers in rural households in the Philippines. We introduce household training in the production and use of different organic vegetable technologies to examine gender-specific responses. Exposure to organic vegetable training significantly increased female labor during fertilizer and pesticide application stages for low-income households, with no significant effect for middle and high-income households. The intervention reduced labor productivity gaps across all income groups, with the largest effect for low-income households, pointing to the potential for organic vegetable technology as a means of reducing gender-based productivity disparities.
              </p>
              <Button>Request Draft</Button>
            </div>

            <div
              className="bg-card rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow duration-300"
              id="public-sentiment"
            >
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                The Role of Public Sentiment in Evaluating Lockdown Effects on Mobility: An Application of Natural Language Processing Method
              </h3>
              <div className="flex flex-wrap gap-4 mb-4 text-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-foreground" />
                  <span>September 2020 - Current</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-foreground" />
                  <span>with Xiaorui Qu, Qinan Lu, Liufang Su and Gunning Shi</span>
                </div>
              </div>
              <p className="text-foreground mb-6">
                This paper investigates the potential influence of public sentiment and health policies on behavioral changes, specifically focusing on mobility during COVID-19. We employ daily counts of COVID-related tweets and sentiment trends derived using a natural language processing model to gauge public sentiment. Using Regression Discontinuity in Time Series (RDiT) method with county-level daily data from March to April 2020, we find that lockdown implementation leads to a significant 5.5% reduction in mobility, but this impact is only observed for ten days. Importantly, neutral-tone sentiment has the most pronounced negative impact on mobility compared to both negative and positive sentiments—substituting 3% of positive sentiment tweets with neutral-tone sentiment results in similar magnitude effects on mobility reduction as lockdown policies. This emphasizes the importance of considering public sentiment alongside policy measures to avoid overestimation issues.
              </p>
              <Button>Request Draft</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fieldwork Highlight: now placed after Working Papers */}
      <section className="py-16 bg-card" id="maternal-health">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Fieldwork Highlight: Maternal Health in Nigeria</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/images/fieldwork-nigeria.jpeg"
                alt="Fieldwork in Nigeria"
                width={600}
                height={400}
                className="field-photo rounded-lg object-cover w-full"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Problem Management Plus (PM+) Intervention</h3>
              <p className="text-foreground mb-4">
                As part of my research on maternal mental health and child undernutrition, I conducted fieldwork in
                Gombe, Nigeria. This project examines the effects of Problem Management Plus (PM+) intervention on
                maternal mental health and child nutrition outcomes.
              </p>
              <p className="text-foreground mb-4">
                Working closely with local teams, I helped design experiments and questionnaires for a randomized
                control trial involving 800 caregivers. I also created audio assistant survey tools for sensitive
                questions and trained data collectors in the field.
              </p>
              <p className="text-foreground mb-6">
                This research aims to provide evidence-based recommendations for improving maternal mental health
                interventions in low-resource settings and understanding their impact on child development outcomes.
              </p>
              <div className="flex items-center text-foreground mb-4">
                <Calendar className="h-5 w-5 mr-2 text-foreground" />
                <span>January 2023 - Present</span>
              </div>
              <div className="flex items-center text-foreground">
                <User className="h-5 w-5 mr-2 text-foreground" />
                <span>Supervisor: Prof. Seollee Park</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Interests */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Research Interests</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-foreground">Development Economics</h3>
              <p className="text-foreground">
                Studying economic development in low and middle-income countries, with a focus on interventions that can
                improve welfare and reduce poverty.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-foreground">Health Economics</h3>
              <p className="text-foreground">
                Investigating maternal and child health outcomes, mental health interventions, and the economic impacts
                of health policies.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-foreground">Environmental Economics</h3>
              <p className="text-foreground">
                Analyzing environmental policies, air quality regulations, and their effects on health outcomes and
                economic behavior.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-foreground">Labor Economics</h3>
              <p className="text-foreground">
                Examining labor market outcomes, human capital development, and the relationship between education,
                fertility, and labor force participation.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-foreground">Transportation Economics</h3>
              <p className="text-foreground">
                Studying transportation systems, pricing mechanisms, and their effects on economic efficiency and
                welfare.
              </p>
            </div>
            <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold mb-4 text-foreground">Applied Econometrics</h3>
              <p className="text-foreground">
                Developing and applying econometric methods to analyze causal relationships and policy effects in
                various economic contexts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

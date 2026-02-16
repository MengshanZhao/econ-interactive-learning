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
              <a href="/CV/CV_Mengshan_Oct4.pdf" download>
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
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Mengshan Zhao</h2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                <div>
                  <p>PhD Candidate in Agricultural Economics</p>
                  <p>Washington State University</p>
                  <p>2020 NE Wilson Rd (Campus), Pullman, WA 99163</p>
                </div>
                <div>
                  <p>Email: <a href="mailto:mengshan.zhao@wsu.edu" className="text-blue-600 hover:text-blue-800">mengshan.zhao@wsu.edu</a></p>
                  <p>Phone: (608) 334-7814</p>
                  <p>Website: <a href="https://www.mengshanzhao.com" className="text-blue-600 hover:text-blue-800">www.mengshanzhao.com</a></p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Education</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-800 font-semibold">Ph.D., Agricultural Economics, Washington State University, 2021–Present (expected 2026)</p>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">M.S., Agricultural and Applied Economics, University of Wisconsin–Madison, 2019–2021</p>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">B.B.A. (Hons.), Applied Economics, The Chinese University of Hong Kong, Shenzhen, 2015–2019</p>
                </div>
                <div>
                  <p className="text-gray-600 italic">Visiting Programs: University of California, Irvine; London School of Economics and Political Science</p>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">References</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Chair: Seollee Park</h4>
                  <p className="text-gray-600 mb-1">Assistant Professor</p>
                  <p className="text-gray-600 mb-1">School of Economic Sciences & Paul G. Allen School for Global Health</p>
                  <p className="text-gray-600 mb-1">Washington State University</p>
                  <p className="text-gray-600 mb-1">2020 NE Wilson Rd, Pullman, WA 99163</p>
                  <p className="text-gray-600 mb-1">Email: <a href="mailto:seollee.park@wsu.edu" className="text-blue-600 hover:text-blue-800">seollee.park@wsu.edu</a></p>
                  <p className="text-gray-600">Phone: 509-335-8521</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Shanthi Manian</h4>
                  <p className="text-gray-600 mb-1">Associate Professor</p>
                  <p className="text-gray-600 mb-1">School of Economic Sciences & Paul G. Allen School for Global Health</p>
                  <p className="text-gray-600 mb-1">Washington State University</p>
                  <p className="text-gray-600 mb-1">Pullman, WA 99163</p>
                  <p className="text-gray-600 mb-1">Email: <a href="mailto:shanthi.manian@wsu.edu" className="text-blue-600 hover:text-blue-800">shanthi.manian@wsu.edu</a></p>
                  <p className="text-gray-600">Phone: 509-335-8739</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Benjamin Cowan</h4>
                  <p className="text-gray-600 mb-1">Professor</p>
                  <p className="text-gray-600 mb-1">School of Economic Sciences</p>
                  <p className="text-gray-600 mb-1">Washington State University</p>
                  <p className="text-gray-600 mb-1">Pullman, WA 99163</p>
                  <p className="text-gray-600 mb-1">Email: <a href="mailto:ben.cowan@wsu.edu" className="text-blue-600 hover:text-blue-800">ben.cowan@wsu.edu</a></p>
                  <p className="text-gray-600">Phone: 509-335-2184</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Gregmar I. Galinato</h4>
                  <p className="text-gray-600 mb-1">Professor</p>
                  <p className="text-gray-600 mb-1">School of Economic Sciences</p>
                  <p className="text-gray-600 mb-1">Washington State University</p>
                  <p className="text-gray-600 mb-1">Pullman, WA 99163</p>
                  <p className="text-gray-600 mb-1">Email: <a href="mailto:ggalinato@wsu.edu" className="text-blue-600 hover:text-blue-800">ggalinato@wsu.edu</a></p>
                  <p className="text-gray-600">Phone: 509-335-6382</p>
                </div>
              </div>
            </div>

            {/* Research Assistant Experience */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                Research Assistant Experience
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-800">Research Assistant, Prof. Seollee Park, Washington State University <span className="text-gray-600 italic">2023–Present</span></p>
                </div>
                <div>
                  <p className="text-gray-800">Research Assistant, Prof. Jake Wagner, Washington State University <span className="text-gray-600 italic">2022</span></p>
                </div>
              </div>
            </div>

        

            {/* Teaching Experience */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">
                Teaching Experience
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Instructor, Washington State University <span className="text-gray-600 italic">Jan 2025 -- Jan 2026</span></h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>ECONS 320: Money and Banking (Online) — Course evaluations: 4.5/5</li>
                    <li>ECONS 323: Labor Economics (Online) — Course evaluations: 4.5/5</li>
                    <li>ECONS 335: Business Finance (Online) — Ongoing</li>
                    <li>ECONS 426: Transportation Economics and Supply Chain Analysis (Online) — Ongoing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Teaching Assistant, Washington State University <span className="text-gray-600 italic">Sep 2021 -- Dec 2021</span></h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                    <li>ECONS 101: Fundamentals of Microeconomics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Grant */}
              <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Grant</h3>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-gray-800">Addressing Maternal Mental Health and Child Undernutrition in Nigeria through Psychological Support <span className="text-gray-600 italic font-normal">2023–2025</span></h4>
                <p className="text-gray-600">CEGA, UC Berkeley, $75,000. Lead PI: Seollee Park; Role: <span className="italic">Additional Investigator</span>.</p>
              </div>
            </div>

            {/* Conference Presentations */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Conference Presentations</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Competing for Clean Air: Dynamic Incentives in China's Environmental Protection Interviews</h4>
                  <div className="ml-4">
                    <p className="text-gray-600 italic mb-1">2025: Association of Environmental and Resource Economists (AERE, May), Western Economic Association International (WEAI, June), WSU Student Seminar (Nov), selected for presentation at 2025 AAEA Annual Meeting</p>
                    <p className="text-gray-600 italic">2024: Northwest Development Workshop (June 2024)</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Optimal Pricing Policies for Campus Parking</h4>
                  <div className="ml-4">
                    <p className="text-gray-600 italic">Region 10 Transportation Conference (Oct 2022)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Awards & Fellowships */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Awards & Fellowships</h3>
              <div className="space-y-2">
                <p className="text-gray-800">Felloni, Giorgio, and Luisa SES Fellowship, Washington State University</p>
              </div>
            </div>

            {/* Professional Service */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Professional Service</h3>
              <div className="space-y-2">
                <p className="text-gray-800">Section Chair - AERE, WEAI <span className="text-gray-600 italic">2025</span></p>
                <p className="text-gray-800"><span className="font-semibold">Volunteer, Social Platform Team</span> — Committee on Women in Agricultural Economics (CWAE)</p>
              </div>
            </div>

    

            {/* Research */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 text-gray-800">Research</h3>
              
              {/* Job Market Paper */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Job Market Paper</h4>
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-800">When the Worst Compete: Strategic Responses to Environmental Protection Interviews in China</h5>
                  <p className="text-gray-600 italic">Draft available upon request</p>
                  <p className="text-gray-600">
                    This paper explores the dynamic incentives embedded in ranking-based environmental governance, investigating how governments strategically respond to competitive performance evaluations. Using China's Environmental Protection Interview (EPI)—a high-profile, ranking-driven policy targeting underperforming cities—as an empirical case, I leverage high-frequency air-quality data and a difference-in-differences framework to analyze behavior under pressure. Contrary to existing literature, which typically estimates modest pollution reductions for formally sanctioned cities, my analysis shows that cities preemptively reduce PM2.5 by approximately 15.7 μg/m³, nearly four times prior estimates when facing the risk of evaluation sanctions. These reductions exhibit pronounced seasonality, peaking at evaluation periods, indicating short-term strategic efforts by local governments to enhance rankings. The policy also yields measurable healthcare cost savings primarily during narrow evaluation windows. Political factors shape these responses: cities with extensive elite ties intensify short term reductions around evaluation periods, whereas those near capital region oversight sustain steadier improvements throughout the year. Importantly, political connections shift effort across the calendar without increasing the total annual effect. A tournament model explains why elite ties and geographic adjacency generate different patterns by separating rank loss costs from pollution damage costs. Taken together, the findings highlight both the advantages and drawbacks of rank-ordered policy design and underscore the importance of aligning short-term incentives with long-term public-health goals.
                  </p>
                </div>
              </div>

              {/* Working Papers */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Working Papers</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Family Plans and Planning Policy: The Role of Women's Human Capital in Shaping China's Fertility Trends</h5>
                    <p className="text-gray-600 italic mb-2">with Benjamin Cowan, draft available upon request</p>
                    <p className="text-gray-600">
                      This paper investigates the impact of women's higher education on fertility decisions in China, focusing on cohorts subject to the One-Child and Second-Child Policies. Using provincial per capita college access at age 17 as an instrument, we isolate exogenous variation in educational attainment stemming from centrally managed quota systems for university enrollment. Drawing on the 2020 China Family Panel Survey, our 2SLS estimates indicate that each additional year of education delays the age at first birth by 0.31 years and reduces total fertility by 0.085 children. We find no significant effect on childbearing within policy limits, but a sizable and significant decline in higher-order births that would violate family planning regulations. This pattern suggests that the channel through which education affects fertility operates primarily via increased compliance with population control policies, rather than shifts in preferences or biological constraints. Further analysis reveals that formal employment and institutional penalties—rather than monetary fines—are likely to mediate this compliance effect. Through this study, we contribute to the broader discourse on the socio-economic factors shaping reproductive behaviors in contemporary China, emphasizing the pivotal role of education in aligning individual fertility choices with national policy objectives.
                    </p>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Assessing the Impact of Organic Farm Training on Crop Productivity by Gender</h5>
                    <p className="text-gray-600 italic mb-2">with Shanthi Manian, Gregmar I. Galinato, Seollee Park, Suzette P. Galinato, Christian Paul L. Fang, Amelia Bello, Shaira Mae C. Calayugan, and Lorna Sister</p>
                    <p className="text-gray-600">
                      The objective of this article is to determine the impact of teaching organic vegetable technology interventions on household labor use and labor productivity across genders. We conduct a randomized controlled trial where we introduce household organic vegetable training to vegetable farmers in rural farm households in the Philippines. We find a (1) significant increase in female labor man-days and workers attributed to the organic vegetable technology intervention during the fertilizer, pesticide, and, to a lesser extent, harvesting stages of production for low wealth households and farms that plant multiple types of vegetables. When we(2) examine the high wealth households and those that plant only one type of crop, the effect of the intervention on female labor is either negative or insignificant. The difference in impact of the intervention by wealth is likely due to the low wealth households employing labor intensive agricultural technology while high wealth households employ capital intensive technology. Prior to the intervention, male household labor productivity is larger than female household labor productivity. After the intervention, there was a reduction in the gender labor productivity gap for low wealth households but the impact is not significant. Our results point to the potential for introducing organic technology and practices during the entire production process as a means of reducing the gender labor productivity gap for low-wealth households that utilize labor-intensive agricultural technology.
                    </p>
                  </div>
                </div>
              </div>

              {/* Work in Progress */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Work in Progress</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Addressing Maternal Mental Health and Child Undernutrition in Nigeria through Psychological Support</h5>
                    <p className="text-gray-600 italic mb-2">with Seollee Park and Jennifer Ostrowski</p>
                    <p className="text-gray-600">
                      Maternal mental health is a serious yet neglected challenge in developing countries, with depression rates ranging from 15–57% globally. Poor maternal mental health undermines childcare, feeding practices, and women's empowerment, with cascading effects on children's nutrition and development. This study investigates whether integrating psychological support into nutrition programs can improve both maternal and child outcomes. We implement a randomized controlled trial in Gombe State, Nigeria, where mothers of acutely malnourished children under five who exhibit at least mild depressive symptoms are offered Problem Management Plus (PM+), a WHO-designed, low-intensity psychological intervention focused on stress management and problem-solving skills. The intervention is delivered alongside the government's community-based management of acute malnutrition (CMAM) program. We measure impacts across six domains: maternal psychosocial wellbeing, caregiving, child feeding, child development, child nutrition, and child health. To probe mechanisms, we also assess changes in women's empowerment, decision-making power, cognitive and socio-emotional skills, and intra-household dynamics including intimate partner violence. To date, we have screened over 5,400 caregivers, enrolling 754 caregiver–child pair. Baseline surveys are complete, and endline data collection has been completed for 562 of the enrolled caregiver. The project provides timely evidence on whether scaling psychological support through existing nutrition platforms can improve maternal and child health at low cost in resource-constrained settings.
                    </p>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Organic Farming Training, Child Nutrition, and Intra-Household Mechanisms in Rural Philippines</h5>
                    <p className="text-gray-600 italic mb-2">with Shanthi Manian, Gregmar I. Galinato, Seollee Park, Suzette P. Galinato, Christian Paul L. Fang, Amelia Bello, Shaira Mae C. Calayugan, and Lorna Sister</p>
                    <p className="text-gray-600">
                      This project is embedded within a randomized controlled trial (RCT) in rural Philippines. We examine the impacts of organic farming technology training on child anthropometric and nutritional outcomes, focusing on the causal pathways through which such effects may arise. Using experimental household decision-making games, we construct an intra-household bargaining power index and analyze shifts in expenditures and time allocation as potential mechanisms linking training adoption to improvements in child well-being. Our results indicate that, while the intervention shows no significant effect on child outcomes for intention-to-treat (ITT) effect, local average treatment effect (LATE) estimates suggest meaningful impacts among households that adopt the technologies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Other Publications and Projects */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Other Publications and Projects</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Role of Public Sentiment in Evaluating Lockdown Effects on Mobility: An Application of the Natural Language Processing Method</h5>
                    <p className="text-gray-600 italic mb-2">with Xiaorui Qiu, Qinan Lu, Liufang Su, and Guanming Shi; under review at Economic Modelling</p>
                    <p className="text-gray-600">
                      This study uses county-level COVID-19 tweet sentiment (March–April 2020) to evaluate lockdown effects on mobility. Employing a Regression Discontinuity in Time model, we find lockdowns reduced mobility by 5.5% for about 10 days, with neutral-tone sentiment exerting the strongest negative impact on mobility indices. Results highlight the role of public sentiment in evaluating policy effects.
                    </p>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">The Impacts of COVID-19 on Containerized Agricultural Exports</h5>
                    <p className="text-gray-600 italic mb-2">with Jake Wagner, Eric Jessup, and Ben Kenner</p>
                    <p className="text-gray-600">
                      Analyzes the disruptions of COVID-19 on U.S. agricultural container exports, focusing on logistics bottlenecks and supply chain resilience.
                    </p>
                  </div>

                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">Optimal Pricing Policies for Campus Parking</h5>
                    <p className="text-gray-600 italic mb-2">with Jake Wagner and David Moore; draft available upon request</p>
                    <p className="text-gray-600">
                      Explores efficient pricing structures for campus parking to balance demand management, revenue generation, and equity concerns.
                    </p>
                  </div>
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
            <a href="/CV/CV_Mengshan_Oct4.pdf" download>
              <Download className="mr-2 h-4 w-4" /> Download Full CV (PDF)
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}

import type { CandidateId } from "./v2"

export interface CareerRecord {
  role: string
  company: string
  start: string
  end?: string
  location: string
  description: string
  details: string
  compensation?: string
}
export interface EducationRecord {
  school: string
  degree: string
  period: string
  description: string
  details?: string
}
interface PortfolioProject {
  name: string
  description: string
  tools: string
}
interface DetailedProfile {
  career: CareerRecord[]
  education: EducationRecord[]
  portfolioSince: string
  projects: PortfolioProject[]
  skillGroups: { name: string; skills: string[] }[]
}

// These dates, institutions, estimates and portfolio entries are fictional demo data.
export const profileAsOf = "2026-11"
export const candidateProfileDetails: Record<CandidateId, DetailedProfile> = {
  A: {
    career: [
      {
        role: "Regional Operations Director",
        company: "Westbridge Services",
        start: "2020-01",
        location: "Chicago, Illinois",
        compensation: "$175K–$195K USD / year",
        description:
          "Supported expansion from four to twelve service locations, introducing standard operating routines and regional performance reporting.",
        details:
          "Partnered with regional and site leaders to align service standards, workforce plans and operating reviews. Coached managers on resolving delivery issues and maintaining consistent customer service.",
      },
      {
        role: "Operations Manager",
        company: "Parkfield Facilities",
        start: "2016-04",
        end: "2019-12",
        location: "Evanston, Illinois",
        description:
          "Managed day-to-day facilities service delivery, workforce scheduling and customer escalations.",
        details:
          "Established weekly operating reviews covering staffing, service quality and open customer issues. Coached frontline supervisors and coordinated corrective actions with support teams.",
      },
      {
        role: "Operations Supervisor",
        company: "Parkfield Facilities",
        start: "2014-01",
        end: "2016-03",
        location: "Rockford, Illinois",
        description:
          "Supervised frontline service teams, allocating daily workloads and coordinating site coverage.",
        details:
          "Prepared workforce schedules, coordinated local suppliers and onboarded new site employees. Maintained operating records and escalated service risks to the operations manager.",
      },
    ],
    education: [
      {
        school: "Westhaven University",
        degree: "BSc, Business Management",
        period: "Sep 2010 – May 2014",
        description:
          "Business operations, organizational management and finance.",
        details:
          "Final-year project focused on service delivery and performance measurement across regional businesses.",
      },
      {
        school: "Brookfield Business School",
        degree: "Certificate, Operations Leadership",
        period: "Sep 2018 – Jun 2019",
        description:
          "People leadership, operating reviews and continuous improvement.",
      },
    ],
    portfolioSince: "2020",
    projects: [
      {
        name: "Multi-site operating playbook",
        description:
          "Developed a shared operating playbook during expansion from four to twelve locations, documenting service routines, site onboarding and escalation responsibilities.",
        tools: "Operating procedures · Site onboarding",
      },
      {
        name: "Regional performance dashboard",
        description:
          "Built a Power BI dashboard consolidating service performance, workforce coverage and customer issues for weekly regional operating reviews.",
        tools: "Power BI · Excel",
      },
      {
        name: "Site-leader development",
        description:
          "Designed an onboarding and coaching programme for regional supervisors, covering workforce planning, service standards and performance conversations.",
        tools: "Manager coaching · Workforce planning",
      },
      {
        name: "Service escalation process",
        description:
          "Mapped customer issue workflows and introduced clear escalation routes, response ownership and follow-up tracking for site teams.",
        tools: "Process mapping · Service quality",
      },
      {
        name: "Supplier review framework",
        description:
          "Created a supplier review framework with shared scorecards, service expectations and action tracking for local managers.",
        tools: "Vendor management · Scorecards",
      },
    ],
    skillGroups: [
      {
        name: "Operations",
        skills: [
          "Multi-site operations",
          "Service delivery",
          "Regional expansion",
          "Workforce planning",
        ],
      },
      {
        name: "Leadership",
        skills: [
          "Team development",
          "Site-leader coaching",
          "Stakeholder management",
        ],
      },
      {
        name: "Systems & reporting",
        skills: [
          "Power BI",
          "Excel",
          "Performance dashboards",
          "Operating reviews",
        ],
      },
      {
        name: "Process improvement",
        skills: [
          "Process mapping",
          "Standard operating procedures",
          "Service quality",
        ],
      },
      {
        name: "Commercial operations",
        skills: [
          "Budget management",
          "Vendor management",
          "Customer retention",
        ],
      },
    ],
  },
  B: {
    career: [
      {
        role: "Integration Director",
        company: "Horizon Business Services",
        start: "2019-01",
        location: "Milwaukee, Wisconsin",
        compensation: "$185K–$215K USD / year",
        description:
          "Led two acquisition integrations, aligning operating processes, management reporting and team transitions across acquired service businesses.",
        details:
          "Coordinated finance, people and operations workstreams, established integration milestones and chaired progress reviews with senior stakeholders. Supported acquired leadership teams through changes to responsibilities and reporting lines.",
      },
      {
        role: "Operations Manager",
        company: "Oakfield Services",
        start: "2015-03",
        end: "2018-12",
        location: "Madison, Wisconsin",
        description:
          "Managed service operations and delivered cross-functional improvement initiatives with finance and people teams.",
        details:
          "Prepared operating plans and performance reports, coordinated local change programmes and worked with managers to resolve service and resourcing issues.",
      },
      {
        role: "Operations Team Lead",
        company: "Oakfield Services",
        start: "2012-01",
        end: "2015-02",
        location: "Racine, Wisconsin",
        description:
          "Led frontline service teams, managing daily schedules, customer handovers and service issue resolution.",
        details:
          "Introduced scheduling routines and coordinated customer handovers with commercial teams. Supported supervisors with operational reporting and follow-up on service commitments.",
      },
    ],
    education: [
      {
        school: "Brookfield Business School",
        degree: "MBA, General Management",
        period: "Sep 2017 – Jun 2019",
        description:
          "Corporate strategy, organizational change and acquisition integration.",
        details:
          "Capstone project explored operating-model choices following a business acquisition.",
      },
      {
        school: "Westhaven University",
        degree: "BSc, Business Management",
        period: "Sep 2008 – May 2012",
        description: "Business operations, accounting and people management.",
      },
    ],
    portfolioSince: "2019",
    projects: [
      {
        name: "Acquisition integration programme",
        description:
          "Directed operational workstreams for two acquisition integrations, defining milestones, coordinating functional leads and tracking delivery through governance reviews.",
        tools: "Integration planning · Workstream governance",
      },
      {
        name: "Shared operating model",
        description:
          "Designed a shared operating model for acquired businesses, aligning team responsibilities, management reporting and core service processes.",
        tools: "Operating-model design · Process mapping",
      },
      {
        name: "Integration performance dashboard",
        description:
          "Built an integration dashboard in Power BI to track milestones, operating measures, risks and actions throughout the transition.",
        tools: "Power BI · Excel",
      },
      {
        name: "Leadership transition plan",
        description:
          "Developed a leadership transition plan with communication milestones, stakeholder responsibilities and support for new reporting relationships.",
        tools: "Change management · Stakeholder planning",
      },
      {
        name: "Post-integration review",
        description:
          "Facilitated post-integration reviews, documenting unresolved issues, lessons learned and follow-up actions with functional owners.",
        tools: "Retrospectives · Action tracking",
      },
    ],
    skillGroups: [
      {
        name: "Integration",
        skills: [
          "Acquisition integration",
          "Workstream planning",
          "Operating-model design",
          "Transition management",
        ],
      },
      {
        name: "Leadership",
        skills: [
          "Cross-functional leadership",
          "Change management",
          "Stakeholder alignment",
        ],
      },
      {
        name: "Systems & reporting",
        skills: [
          "Power BI",
          "Excel",
          "Integration dashboards",
          "Milestone tracking",
        ],
      },
      {
        name: "Process improvement",
        skills: [
          "Process mapping",
          "Governance design",
          "Continuous improvement",
        ],
      },
      {
        name: "Commercial operations",
        skills: [
          "Operational planning",
          "Budget coordination",
          "Service continuity",
        ],
      },
    ],
  },
  C: {
    career: [
      {
        role: "Operations Consultant",
        company: "Independent",
        start: "2020-01",
        location: "Columbus, Ohio",
        compensation: "Compensation not disclosed",
        description:
          "Advised service businesses on growth planning, operational improvement and integration support.",
        details:
          "Supported client teams with integration planning, stakeholder workshops and operating process reviews. Prepared recommendations and action plans for leadership discussions.",
      },
      {
        role: "Regional Manager",
        company: "Cedarpoint Services",
        start: "2012-05",
        end: "2019-12",
        location: "Cincinnati, Ohio",
        description:
          "Supported regional service operations, working with local managers on delivery performance and process improvement.",
        details:
          "Coordinated regional operating reviews, consolidated site reports and followed up on service improvement actions with local management teams.",
      },
      {
        role: "Site Manager",
        company: "Cedarpoint Services",
        start: "2008-01",
        end: "2012-04",
        location: "Dayton, Ohio",
        description:
          "Managed daily site activities, workforce coverage and customer service coordination.",
        details:
          "Prepared staffing schedules and operating reports, coordinated local suppliers and resolved day-to-day delivery issues with frontline teams.",
      },
    ],
    education: [
      {
        school: "Northgate University",
        degree: "BA, Business Administration",
        period: "Sep 2004 – May 2008",
        description:
          "Operations management, organizational behaviour and business planning.",
        details:
          "Coursework included service-business strategy and practical performance analysis.",
      },
      {
        school: "Westhaven University",
        degree: "Certificate, Change Leadership",
        period: "Sep 2019 – Jun 2020",
        description:
          "Change communication, stakeholder engagement and transition planning.",
      },
    ],
    portfolioSince: "2020",
    projects: [
      {
        name: "Growth planning support",
        description:
          "Prepared growth planning recommendations for service businesses, assessing operating capacity, market priorities and implementation requirements.",
        tools: "Business planning · Market assessment",
      },
      {
        name: "Integration advisory support",
        description:
          "Supported integration planning through stakeholder interviews, process reviews and preparation of transition actions for client leadership teams.",
        tools: "Integration support · Stakeholder mapping",
      },
      {
        name: "Operations review framework",
        description:
          "Developed an Excel-based operating review framework to record service issues, compare local processes and track agreed actions.",
        tools: "Excel · Process mapping",
      },
      {
        name: "Leadership workshop programme",
        description:
          "Designed and facilitated leadership workshops to agree operating priorities, clarify responsibilities and plan communications through change.",
        tools: "Workshop facilitation · Change communication",
      },
      {
        name: "Service improvement roadmap",
        description:
          "Produced service improvement roadmaps with prioritised actions, nominated owners and review milestones for client teams.",
        tools: "Action planning · Service quality",
      },
    ],
    skillGroups: [
      {
        name: "Operations",
        skills: [
          "Operations improvement",
          "Service delivery",
          "Regional management",
        ],
      },
      {
        name: "Growth & integration support",
        skills: [
          "Growth planning",
          "Integration support",
          "Transition planning",
        ],
      },
      {
        name: "Leadership",
        skills: [
          "Stakeholder management",
          "Workshop facilitation",
          "Change communication",
        ],
      },
      {
        name: "Systems & reporting",
        skills: ["Excel", "Operating reports", "Action tracking"],
      },
      {
        name: "Process improvement",
        skills: ["Process mapping", "Service reviews", "Improvement roadmaps"],
      },
    ],
  },
}

function monthIndex(value: string) {
  const [year, month] = value.split("-").map(Number)
  return year * 12 + month - 1
}
export function careerMonths(job: CareerRecord) {
  return (
    monthIndex(job.end ?? profileAsOf) -
    monthIndex(job.start) +
    (job.end ? 1 : 0)
  )
}
export function tenureLabel(months: number) {
  const years = Math.floor(months / 12),
    remaining = months % 12
  return (
    [
      years ? `${years} yr${years === 1 ? "" : "s"}` : "",
      remaining ? `${remaining} mo${remaining === 1 ? "" : "s"}` : "",
    ]
      .filter(Boolean)
      .join(" ") || "0 mos"
  )
}
export function careerMetrics(career: CareerRecord[]) {
  const total = career.reduce((sum, job) => sum + careerMonths(job), 0)
  return {
    average: tenureLabel(Math.round(total / career.length)),
    current: tenureLabel(careerMonths(career[0])),
    total: tenureLabel(total),
  }
}

import type { CandidateId } from './v2'

interface DirectoryProfile {
  title:string
  employer:string
  location:string
  email:string
  phone:string
  years:number
  introduction:string
  skills:readonly string[]
  experience:readonly {role:string;company:string;period:string;description:string}[]
  education:string
}

// Fictional résumé details for the demo. Supplied search evidence stays in model.ts.
export const candidateDirectory:Readonly<Record<CandidateId,DirectoryProfile>>={
  A:{
    title:'Regional Operations Director',employer:'Westbridge Services',location:'Chicago, IL',email:'claire.bennett@example.com',phone:'+1 (312) 555-0101',years:12,
    introduction:'Operations leader focused on multi-site growth, service consistency and developing regional teams.',
    skills:['Multi-site operations','Regional expansion','Service delivery','Team leadership'],
    experience:[
      {role:'Regional Operations Director',company:'Westbridge Services',period:'2020–present',description:'Helped expand the operation from four to twelve locations, aligning site routines and regional reporting.'},
      {role:'Operations Manager',company:'Parkfield Facilities',period:'2014–2020',description:'Led day-to-day service delivery and coached local operations teams.'},
    ],
    education:'BSc, Business Management · Westhaven University',
  },
  B:{
    title:'Integration Director',employer:'Horizon Business Services',location:'Milwaukee, WI',email:'marcus.reed@example.com',phone:'+1 (414) 555-0102',years:14,
    introduction:'Integration leader who brings acquired businesses together through practical operating plans and close work with local teams.',
    skills:['Acquisition integration','Change management','Operating models','Cross-functional leadership'],
    experience:[
      {role:'Integration Director',company:'Horizon Business Services',period:'2019–present',description:'Led two acquisition integrations, coordinating operating processes, reporting and team transitions.'},
      {role:'Operations Manager',company:'Oakfield Services',period:'2012–2019',description:'Managed service operations and worked with finance and people teams on operational improvements.'},
    ],
    education:'MBA · Brookfield Business School',
  },
  C:{
    title:'Operations Consultant',employer:'Independent',location:'Columbus, OH',email:'daniel.foster@example.com',phone:'+1 (614) 555-0103',years:18,
    introduction:'Operations consultant describing a background in business growth and integration support. The scope of integration ownership needs confirmation.',
    skills:['Operations improvement','Growth planning','Integration support','Stakeholder management'],
    experience:[
      {role:'Operations Consultant',company:'Independent',period:'2020–present',description:'Advises service businesses on growth and integration projects. Personal integration responsibility remains to be verified.'},
      {role:'Regional Manager',company:'Cedarpoint Services',period:'2008–2020',description:'Supported regional operations and service improvement. The number of locations overseen has not been established.'},
    ],
    education:'BA, Business Administration · Northgate University',
  },
}

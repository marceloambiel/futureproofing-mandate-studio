// Fictional source documents and their extracted fields for the demo.
const company = [
  {id:'company',label:'Company',value:'Northline Services Group'},
  {id:'sector',label:'Sector',value:'Commercial facilities & maintenance services'},
  {id:'headquarters',label:'Headquarters',value:'Chicago, Illinois'},
  {id:'ownership',label:'Ownership',value:'Private · growth-investor backed'},
  {id:'team',label:'Team size',value:'About 650 employees'},
  {id:'revenue',label:'Annual revenue',value:'About $180M'},
  {id:'footprint',label:'Footprint',value:'12 locations · 2 acquisitions'},
]
const role = [
  {id:'role',label:'Role',value:'Head of Operations'},
  {id:'reports',label:'Reports to',value:'CEO'},
  {id:'direct',label:'Direct reports',value:'6 regional operations leaders'},
  {id:'location',label:'Location',value:'Chicago · regular site travel'},
  {id:'employment',label:'Employment',value:'Permanent · full-time'},
  {id:'salary',label:'Base salary',value:'$190K–$220K USD / year'},
  {id:'bonus',label:'Bonus',value:'25% of base salary (target)'},
]
const process = {id:'process',label:'Selection process',value:'CEO and CFO interviews, followed by a site visit.'}
const originalSearch = [
  {id:'priority',label:'Priority',value:'Geographic expansion and capacity for growth.'},
  {id:'experience',label:'Experience',value:'Regional expansion and multi-site service operations.'},
  {id:'first90',label:'First 90 days',value:'Assess site capacity and agree a geographic growth plan.'},
  {id:'start',label:'Start target',value:'Within 60 days'},process,
]
const revisedSearch = [
  {id:'priority',label:'Priority',value:'Integrate two acquisitions into one operating model.'},
  {id:'experience',label:'Experience',value:'Acquisition integration and multi-site service operations.'},
  {id:'first90',label:'First 90 days',value:'Agree an integration plan and shared operating measures.'},
  {id:'start',label:'Start target',value:'Within 60 days'},process,
]
const commonSections = [
  {id:'company',title:'About Northline',paragraphs:['Northline Services Group provides commercial facilities and maintenance services. We are headquartered in Chicago, Illinois, privately held and backed by a growth investor. The group employs approximately 650 people and generates about $180 million in annual revenue.','We operate 12 locations, including two recently acquired businesses. Our customers rely on consistent service delivery, responsive local teams and clear accountability. The role covers the full operating network.']},
  {id:'role',title:'Role and reporting line',paragraphs:['The Head of Operations will report directly to Maya Chen, CEO, and lead six regional operations leaders. This is a permanent, full-time appointment based in Chicago, with regular travel to our operating locations.','The position owns day-to-day service delivery, regional operating performance, workforce planning and development of site leadership. The successful candidate will partner with finance, people and commercial teams to balance service quality, operational capacity and profitable growth.']},
  {id:'package',title:'Compensation and working arrangements',paragraphs:['The base salary range is $190,000–$220,000 USD per year, with a target bonus of 25% of base salary. We expect the leader to spend time with site teams as well as at the Chicago headquarters.','We would like the appointed candidate to start within 60 days. Please confirm notice period, location and willingness to travel early in the process. Raise any constraints with our team before arranging final interviews.']},
  {id:'process',title:'Search process and client contacts',paragraphs:['Mandate Studio should prepare a focused list of relevant operations leaders, summarising their experience and the questions that need to be explored. Please distinguish experience the candidate has described from responsibilities that have been confirmed.','The process will include interviews with the CEO and CFO, followed by a site visit. Maya Chen is the client lead for this assignment; Caroline S. is the lead advisor coordinating the search. Please keep candidate approaches and our hiring plans confidential.']},
]
export const clientBriefContent = {
  original:{
    summary:'Find a Head of Operations to lead geographic expansion across a 12-location service business. The new leader should be ready to start within 60 days.',
    facts:{company,role,search:originalSearch},
    sections:[commonSections[0],
      {id:'priority',title:'Why we are hiring',paragraphs:['We are hiring a Head of Operations to lead our next phase of geographic expansion. Our immediate priority is to build the operating capacity, leadership structure and repeatable routines needed to support entry into new markets. The two recent acquisitions form part of our existing network; direct acquisition-integration experience is not a requirement in this original brief.']},
      commonSections[1],
      {id:'experience',title:'Experience and capabilities required',paragraphs:['We need a leader with a strong track record in multi-site service operations and regional expansion. They should be able to explain how they have built site capacity, supported new-location openings and developed regional leaders while protecting service quality.','Please explore the scale of each candidate’s responsibility, the locations they directly oversaw and their role in growth decisions. We value practical operating judgement, clear communication and the ability to earn the trust of frontline teams.']},
      {id:'first90',title:'Priorities for the first 90 days',paragraphs:['Assess the capacity and performance of the current 12-location network. Meet regional leaders, identify constraints on expansion and agree a geographic growth plan with the CEO and CFO.','The initial output should be a view of site readiness, leadership gaps and the resources required for the next phase of expansion, supported by clear operating measures.']},
      commonSections[2],commonSections[3]],
  },
  revised:{
    summary:'Find a Head of Operations to integrate two acquisitions across 12 locations. The new leader should be ready to start within 60 days.',
    facts:{company,role,search:revisedSearch},
    sections:[commonSections[0],
      {id:'priority',title:'Why we are hiring',paragraphs:['Our hiring priority has changed. We now need a Head of Operations to integrate our two recently acquired businesses into one operating model across all 12 locations. Geographic expansion is no longer the immediate focus of this appointment. The leader must stabilise delivery, align regional teams and create a consistent way of running the business.']},
      commonSections[1],
      {id:'experience',title:'Experience and capabilities required',paragraphs:['Direct acquisition-integration leadership is now essential. We need someone who has personally owned the operational integration of acquired businesses, rather than only supporting a wider programme. Please establish the number of integrations, the candidate’s decision-making responsibility and the changes they delivered.','The candidate must also bring multi-site service operations experience. Please confirm how many locations they directly oversaw, the regional leaders reporting to them and how they maintained service standards through change. We value practical operating judgement, clear communication and the ability to earn the trust of frontline teams.']},
      {id:'first90',title:'Priorities for the first 90 days',paragraphs:['Meet leaders across the acquired and existing businesses, map differences in operating processes and agree a practical integration plan with the CEO and CFO. Introduce shared operating measures and a clear cadence for reviewing service, staffing and delivery issues.','The initial output should be a sequenced integration plan with named owners, visible risks and agreed measures of progress. Protect customer delivery while aligning site routines and management responsibilities.']},
      commonSections[2],commonSections[3]],
  },
} as const

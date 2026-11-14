import { candidates, mandate, type Candidate } from './model'
import { candidateDirectory } from './candidate-directory'
import type { ComparisonCriterion } from './comparison-sources'

export const comparisonCriteria=[{id:'integration',label:'Acquisition integration'},{id:'scale',label:'Multi-site operations'},{id:'availability',label:'Start date'},{id:'location',label:'Location'}] as const
export function getComparisonStatus(candidate:Candidate,criterion:ComparisonCriterion) {
  if(criterion==='availability')return candidate.availabilityDays<=mandate.startWithinDays?'match':'unmet'
  if(criterion==='location')return candidateDirectory[candidate.id].location.startsWith('Chicago')?'match':'attention'
  return candidate[criterion].kind==='provided'?'match':candidate[criterion].kind==='unverified'?'attention':'neutral'
}
export function getComparisonQuestions(profiles:readonly Candidate[]=candidates) {
  return profiles.flatMap(candidate=>comparisonCriteria.filter(criterion=>getComparisonStatus(candidate,criterion.id)!=='match').map(criterion=>{
    const questions={
      integration:candidate.id==='A'?candidate.question:'Which acquisition integrations did you personally lead, and what decisions and outcomes were you responsible for?',
      scale:'How many locations did you directly oversee, and what was your operating responsibility?',
      availability:`Can you start within the client’s ${mandate.startWithinDays}-day target rather than ${candidate.availabilityDays} days? If not, what is your earliest available start date?`,
      location:'Can you be based in Chicago and travel regularly to the operating sites?',
    }
    return {candidateId:candidate.id,candidateName:candidate.name,criterion:criterion.id,label:criterion.label,question:questions[criterion.id]}
  }))
}
const originalQuestions=candidates.map(candidate=>`${candidate.name}: ${candidate.question}`).join('\n\n')
export function prepareDiscussionQuestions(existing:string,profiles:readonly Candidate[]=candidates) {
  const preserved=existing===originalQuestions?'':existing.trim()
  const missing=getComparisonQuestions(profiles).filter(item=>!preserved.includes(item.question))
  const sections=profiles.map(candidate=>{
    const questions=missing.filter(item=>item.candidateId===candidate.id)
    return questions.length?`${candidate.name}:\n${questions.map(item=>`• ${item.label}: ${item.question}`).join('\n')}`:''
  }).filter(Boolean)
  return [preserved,...sections].filter(Boolean).join('\n\n')
}

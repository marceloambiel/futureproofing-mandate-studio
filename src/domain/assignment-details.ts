import { clientBriefDocuments } from './v2'
export const detailSections=['search','role','company'] as const
export type DetailSection=typeof detailSections[number]
export interface DetailVersion{values:Record<string,string>;at:string;kind:'source'|'edit'|'restore'}
export interface AssignmentDetailEdits{revision:number;requiresReview:boolean;sections:Partial<Record<DetailSection,DetailVersion[]>>}
export function sourceDetailValues(section:DetailSection){return Object.fromEntries(clientBriefDocuments[0].facts[section].map(fact=>[fact.id,fact.value]))}
export function validDetailValues(section:DetailSection,value:unknown):value is Record<string,string>{
 if(!value||typeof value!=='object'||Array.isArray(value))return false
 const values=value as Record<string,unknown>
 const keys=clientBriefDocuments[0].facts[section].map(fact=>fact.id)
 return Object.keys(values).length===keys.length&&keys.every(key=>typeof values[key]==='string'&&values[key].trim().length>0&&values[key].length<=2000)
}
export function isAssignmentDetailEdits(value:unknown):value is AssignmentDetailEdits{
 if(!value||typeof value!=='object')return false
 const record=value as AssignmentDetailEdits
 return Number.isSafeInteger(record.revision)&&record.revision>=1&&typeof record.requiresReview==='boolean'&&!!record.sections&&typeof record.sections==='object'&&!Array.isArray(record.sections)&&Object.keys(record.sections).every(key=>detailSections.includes(key as DetailSection))&&detailSections.every(section=>{
  const versions=record.sections[section]
  return versions===undefined||(Array.isArray(versions)&&versions.length>0&&versions.every(version=>version&&validDetailValues(section,version.values)&&typeof version.at==='string'&&Number.isFinite(Date.parse(version.at))&&['source','edit','restore'].includes(version.kind)))
 })
}

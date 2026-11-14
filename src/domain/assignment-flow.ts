export const assignmentStages=['overview','searching','candidates','drafting','discussion'] as const
export type AssignmentStage=typeof assignmentStages[number]
export interface AssignmentProgress {briefVersion:string;stage:AssignmentStage}
export const generationDuration={candidates:2400,discussion:2600} as const
export function isAssignmentProgress(value:unknown):value is AssignmentProgress {
  if(!value||typeof value!=='object')return false
  const record=value as Record<string,unknown>
  return typeof record.briefVersion==='string'&&assignmentStages.includes(record.stage as AssignmentStage)
}
export function canAdvanceAssignment(current:AssignmentStage,next:AssignmentStage){return assignmentStages.indexOf(next)===assignmentStages.indexOf(current)+1}
export function assignmentStageIndex(stage:AssignmentStage){return assignmentStages.indexOf(stage)}

import { isAssignmentDetailEdits, sourceDetailValues, validDetailValues, type AssignmentDetailEdits, type DetailSection } from '@/domain/assignment-details'
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { getAssignmentChanges, sampleAssignment, clientBriefDocuments, type CandidateId } from '../domain/v2'
import type { StorageLike } from './persistence'
import { canAdvanceAssignment, isAssignmentProgress, type AssignmentProgress, type AssignmentStage } from '@/domain/assignment-flow'

export const V2_PREFERENCES_KEY = 'mandate-studio:v2:preferences'
interface Preferences { schemaVersion: 1; includedIds: CandidateId[]; acknowledgedChangeIds: string[]; viewedChangeIds?:string[]; presentedChangeIds?:string[]; assignmentDetails?:AssignmentDetailEdits; assignmentProgress?:AssignmentProgress }
interface PreferenceView extends Preferences { persistence: 'persistent' | 'memory' }
const candidateIds = sampleAssignment.candidateIds
const realChangeIds = getAssignmentChanges().map(change => change.id)
const defaults = (): Preferences => ({ schemaVersion: 1, includedIds: [...candidateIds], acknowledgedChangeIds: [] })

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return record.schemaVersion === 1 && Array.isArray(record.includedIds) && Array.isArray(record.acknowledgedChangeIds) &&
    record.includedIds.every(id => candidateIds.includes(id as CandidateId)) && new Set(record.includedIds).size === record.includedIds.length &&
    record.acknowledgedChangeIds.every(id => typeof id === 'string' && realChangeIds.includes(id)) && new Set(record.acknowledgedChangeIds).size === record.acknowledgedChangeIds.length && (record.viewedChangeIds===undefined||(Array.isArray(record.viewedChangeIds)&&record.viewedChangeIds.every(id=>typeof id==='string'&&realChangeIds.includes(id))&&new Set(record.viewedChangeIds).size===record.viewedChangeIds.length)) && (record.presentedChangeIds===undefined||(Array.isArray(record.presentedChangeIds)&&record.presentedChangeIds.every(id=>typeof id==='string'&&realChangeIds.includes(id))&&new Set(record.presentedChangeIds).size===record.presentedChangeIds.length)) && (record.assignmentProgress===undefined||isAssignmentProgress(record.assignmentProgress)) && (record.assignmentDetails===undefined||isAssignmentDetailEdits(record.assignmentDetails))
}

function browserStorage(): StorageLike {
  try { return window.localStorage }
  catch {
    const denied = () => { throw new Error('Browser storage is unavailable.') }
    return { getItem: denied, setItem: denied, removeItem: denied }
  }
}

function loadPreferences(storage: StorageLike): PreferenceView {
  try {
    const raw = storage.getItem(V2_PREFERENCES_KEY)
    if (raw === null) return { ...defaults(), persistence: 'persistent' }
    const parsed: unknown = JSON.parse(raw)
    if (isPreferences(parsed)) return { ...parsed, includedIds: candidateIds.filter(id => parsed.includedIds.includes(id)), persistence: 'persistent' }
  } catch { /* Keep the stored value intact; local comparison controls can still work in memory. */ }
  return { ...defaults(), persistence: 'memory' }
}

class PreferenceSession {
  private storage: StorageLike
  private view: PreferenceView
  private listeners = new Set<() => void>()

  constructor(storage: StorageLike) { this.storage = storage; this.view = loadPreferences(storage) }
  getSnapshot = () => this.view
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(view: PreferenceView) { this.view = view; this.listeners.forEach(listener => listener()) }
  private update(change: (state: Preferences) => Preferences) {
    const loaded = this.view.persistence === 'persistent' ? loadPreferences(this.storage) : this.view
    const latest = loaded.persistence === 'memory' ? { ...this.view, persistence: 'memory' as const } : loaded
    const { persistence: storageMode, ...preferences } = latest
    const next = change(preferences)
    let persistence = storageMode
    if (persistence === 'persistent') {
      try { this.storage.setItem(V2_PREFERENCES_KEY, JSON.stringify(next)) }
      catch { persistence = 'memory' }
    }
    this.publish({ ...next, persistence })
  }
  setIncluded = (id: CandidateId, included: boolean) => {
    if (!candidateIds.includes(id)) return
    this.update(state => ({ ...state, includedIds: candidateIds.filter(candidateId => candidateId === id ? included : state.includedIds.includes(candidateId)) }))
  }
  acknowledgeChange = (id: string) => {
    if (!realChangeIds.includes(id)) return
    this.update(state => ({ ...state, acknowledgedChangeIds: [...new Set([...state.acknowledgedChangeIds, id])] }))
  }
  markChangeViewed = (id:string) => {
    if(!realChangeIds.includes(id)||this.view.viewedChangeIds?.includes(id))return
    this.update(state=>({...state,viewedChangeIds:[...new Set([...(state.viewedChangeIds??[]),id])]}))
  }
  markChangePresented = (id:string) => {
    if(!realChangeIds.includes(id)||this.view.presentedChangeIds?.includes(id))return
    this.update(state=>({...state,presentedChangeIds:[...new Set([...(state.presentedChangeIds??[]),id])]}))
  }
  saveAssignmentDetails = (section:DetailSection,values:Record<string,string>,kind:'edit'|'restore'='edit') => {
    if(!validDetailValues(section,values))return false
    const trimmed=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.trim()]))
    this.update(state=>{
      const history=state.assignmentDetails?.sections[section]??[{values:sourceDetailValues(section),at:clientBriefDocuments[0].recordedAt,kind:'source' as const}]
      if(JSON.stringify(history[0].values)===JSON.stringify(trimmed))return state
      return {...state,assignmentProgress:{briefVersion:clientBriefDocuments[0].version,stage:'overview'},assignmentDetails:{revision:(state.assignmentDetails?.revision??0)+1,requiresReview:true,sections:{...state.assignmentDetails?.sections,[section]:[{values:trimmed,at:new Date().toISOString(),kind},...history]}}}
    })
    return true
  }
  advanceAssignment = (next:AssignmentStage) => {
    const briefVersion=clientBriefDocuments[0].version
    this.update(state=>{
      const current=state.assignmentProgress?.briefVersion===briefVersion?state.assignmentProgress.stage:'overview'
      if(!canAdvanceAssignment(current,next))return state
      return {...state,assignmentProgress:{briefVersion,stage:next},...(state.assignmentDetails&&next==='searching'?{assignmentDetails:{...state.assignmentDetails,requiresReview:false}}:{})}
    })
  }
  receiveExternal = () => {
    if (this.view.persistence === 'persistent') {
      const loaded = loadPreferences(this.storage)
      this.publish(loaded.persistence === 'memory' ? { ...this.view, persistence: 'memory' } : loaded)
    }
  }
  reset = () => {
    try { this.storage.removeItem(V2_PREFERENCES_KEY); this.publish({ ...defaults(), persistence: 'persistent' }) }
    catch { this.publish({ ...defaults(), persistence: 'memory' }) }
  }
}

const WorkspaceV2Context = createContext<PreferenceSession | null>(null)
export function WorkspaceV2Provider({ children }: { children: ReactNode }) {
  const [session] = useState(() => new PreferenceSession(browserStorage()))
  useEffect(() => {
    const receive = (event: StorageEvent) => { if (event.key === V2_PREFERENCES_KEY || event.key === null) session.receiveExternal() }
    window.addEventListener('storage', receive)
    return () => window.removeEventListener('storage', receive)
  }, [session])
  return <WorkspaceV2Context.Provider value={session}>{children}</WorkspaceV2Context.Provider>
}

export function useWorkspaceV2() {
  const session = useContext(WorkspaceV2Context)
  if (!session) throw new Error('Workspace comparison views need a WorkspaceV2Provider.')
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot)
  return { ...state, presentedChangeIds:state.presentedChangeIds??[], markChangePresented:session.markChangePresented, viewedChangeIds:state.viewedChangeIds??[], markChangeViewed:session.markChangeViewed, saveAssignmentDetails:session.saveAssignmentDetails, setIncluded: session.setIncluded, acknowledgeChange: session.acknowledgeChange, advanceAssignment:session.advanceAssignment, reset: session.reset }
}

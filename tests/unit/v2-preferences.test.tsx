import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { WorkspaceV2Provider, useWorkspaceV2, V2_PREFERENCES_KEY } from '../../src/state/WorkspaceV2Provider'
import { getAssignmentChanges } from '../../src/domain/v2'

const changeId = getAssignmentChanges()[0].id
function PreferencesHarness() {
  const state = useWorkspaceV2()
  return <><output aria-label="membership">{state.includedIds.join(',')}</output><output aria-label="acknowledgements">{state.acknowledgedChangeIds.join(',')}</output><output aria-label="storage mode">{state.persistence}</output><button onClick={()=>state.setIncluded('A',false)}>Remove A</button><button onClick={()=>state.setIncluded('A',true)}>Add A</button><button onClick={()=>state.acknowledgeChange(changeId)}>Acknowledge real change</button><button onClick={()=>state.acknowledgeChange('invented-change')}>Attempt invalid acknowledgement</button><button onClick={state.reset}>Reset preferences</button></>
}
function renderPreferences(){return render(<WorkspaceV2Provider><PreferencesHarness/></WorkspaceV2Provider>)}
afterEach(()=>{cleanup();vi.restoreAllMocks();localStorage.clear()})

describe('V212 V237 validated local preferences and recovery',()=>{
  it.each([
    ['malformed JSON','{bad'],
    ['unsupported schema',JSON.stringify({schemaVersion:99,includedIds:['A'],acknowledgedChangeIds:[]})],
    ['unknown candidate',JSON.stringify({schemaVersion:1,includedIds:['D'],acknowledgedChangeIds:[]})],
    ['duplicate candidate',JSON.stringify({schemaVersion:1,includedIds:['A','A'],acknowledgedChangeIds:[]})],
    ['invented presentation event',JSON.stringify({schemaVersion:1,includedIds:['A'],acknowledgedChangeIds:[],presentedChangeIds:['invented-change']})],
    ['invented change event',JSON.stringify({schemaVersion:1,includedIds:['A'],acknowledgedChangeIds:['invented-change']})],
  ])('preserves %s raw storage and falls back to honest memory controls',(_label,raw)=>{
    localStorage.setItem(V2_PREFERENCES_KEY,raw)
    renderPreferences()
    expect(screen.getByLabelText('membership')).toHaveTextContent('A,B,C')
    expect(screen.getByLabelText('storage mode')).toHaveTextContent('memory')
    fireEvent.click(screen.getByRole('button',{name:'Remove A',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('B,C')
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBe(raw)
  })
  it('denied reads do not prevent reversible memory-only comparison',()=>{
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('denied')})
    renderPreferences()
    expect(screen.getByLabelText('storage mode')).toHaveTextContent('memory')
    fireEvent.click(screen.getByRole('button',{name:'Remove A',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('B,C')
    fireEvent.click(screen.getByRole('button',{name:'Add A',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('A,B,C')
  })
  it('denied writes preserve the requested comparison change and never claim durable saving',()=>{
    renderPreferences()
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota')})
    fireEvent.click(screen.getByRole('button',{name:'Remove A',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('B,C')
    expect(screen.getByLabelText('storage mode')).toHaveTextContent('memory')
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBeNull()
    fireEvent.click(screen.getByRole('button',{name:'Add A',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('A,B,C')
    expect(screen.getByLabelText('storage mode')).toHaveTextContent('memory')
  })
  it('explicit reset removes only preferences and restores initial membership',()=>{
    localStorage.setItem('mandate-studio:v1','keep original saved document')
    localStorage.setItem('unrelated:key','keep unrelated data')
    renderPreferences()
    fireEvent.click(screen.getByRole('button',{name:'Remove A',exact:true}))
    fireEvent.click(screen.getByRole('button',{name:'Acknowledge real change',exact:true}))
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toContain(changeId)
    fireEvent.click(screen.getByRole('button',{name:'Reset preferences',exact:true}))
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBeNull()
    expect(localStorage.getItem('mandate-studio:v1')).toBe('keep original saved document')
    expect(localStorage.getItem('unrelated:key')).toBe('keep unrelated data')
    expect(screen.getByLabelText('membership')).toHaveTextContent('A,B,C')
    expect(screen.getByLabelText('acknowledgements')).toHaveTextContent('')
  })
  it('reset denial stays in memory and preserves stored raw preferences',()=>{
    const raw=JSON.stringify({schemaVersion:1,includedIds:['B'],acknowledgedChangeIds:[changeId]})
    localStorage.setItem(V2_PREFERENCES_KEY,raw)
    renderPreferences()
    vi.spyOn(Storage.prototype,'removeItem').mockImplementation(()=>{throw new Error('denied')})
    fireEvent.click(screen.getByRole('button',{name:'Reset preferences',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('A,B,C')
    expect(screen.getByLabelText('storage mode')).toHaveTextContent('memory')
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBe(raw)
  })
  it('cross-tab events reload valid preferences and preserve later independent choices',()=>{
    renderPreferences()
    const external={schemaVersion:1,includedIds:['A','B'],acknowledgedChangeIds:[changeId]}
    localStorage.setItem(V2_PREFERENCES_KEY,JSON.stringify(external))
    act(()=>window.dispatchEvent(new StorageEvent('storage',{key:V2_PREFERENCES_KEY,newValue:JSON.stringify(external)})))
    expect(screen.getByLabelText('membership')).toHaveTextContent('A,B')
    expect(screen.getByLabelText('acknowledgements')).toHaveTextContent(changeId)
    fireEvent.click(screen.getByRole('button',{name:'Remove A',exact:true}))
    const persisted=JSON.parse(localStorage.getItem(V2_PREFERENCES_KEY)!)
    expect(persisted.includedIds).toEqual(['B'])
    expect(persisted.acknowledgedChangeIds).toEqual([changeId])
  })
  it('ignores invented acknowledgement IDs and reloads latest persisted membership before writing',()=>{
    renderPreferences()
    fireEvent.click(screen.getByRole('button',{name:'Attempt invalid acknowledgement',exact:true}))
    expect(localStorage.getItem(V2_PREFERENCES_KEY)).toBeNull()
    localStorage.setItem(V2_PREFERENCES_KEY,JSON.stringify({schemaVersion:1,includedIds:['A','B'],acknowledgedChangeIds:[changeId]}))
    fireEvent.click(screen.getByRole('button',{name:'Remove A',exact:true}))
    expect(screen.getByLabelText('membership')).toHaveTextContent('B')
    expect(JSON.parse(localStorage.getItem(V2_PREFERENCES_KEY)!).acknowledgedChangeIds).toEqual([changeId])
  })
})

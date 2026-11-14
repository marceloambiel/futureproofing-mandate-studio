import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { WorkspaceSession, type SessionView } from './session';
import { STORAGE_KEY, type StorageLike } from './persistence';

const WorkspaceContext = createContext<WorkspaceSession | null>(null);
function browserStorage(): StorageLike {
  try { return window.localStorage; }
  catch {
    const denied = () => { throw new Error('Browser storage is unavailable.'); };
    return { getItem: denied, setItem: denied, removeItem: denied };
  }
}

export function WorkspaceProvider({ children, storage }: { children: ReactNode; storage?: StorageLike }) {
  const [session] = useState(() => new WorkspaceSession(storage ?? browserStorage()));
  useEffect(() => {
    const receive = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) session.receiveExternal(); };
    window.addEventListener('storage', receive);
    return () => window.removeEventListener('storage', receive);
  }, [session]);
  return <WorkspaceContext.Provider value={session}>{children}</WorkspaceContext.Provider>;
}

// A paired provider and hook form the public state interface used by every workspace view.
export function useWorkspace(): SessionView & { session: WorkspaceSession } {
  const session = useContext(WorkspaceContext);
  if (!session) throw new Error('Workspace views need a WorkspaceProvider.');
  const view = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  return { ...view, session };
}

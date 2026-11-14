import { useRef, type ReactElement } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Candidate } from "@/domain/model"
import { useWorkspaceV2 } from "@/state/WorkspaceV2Provider"

export function ConfirmCandidateRemoval({
  candidate,
  children,
}: {
  candidate: Candidate
  children: ReactElement
}) {
  const { setIncluded } = useWorkspaceV2()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  return (
    <Dialog>
      <DialogTrigger ref={triggerRef} render={children} />
      <DialogContent
        confirmation
        className="workspace-dialog candidate-removal-dialog"
        initialFocus={cancelRef}
        finalFocus={() =>
          triggerRef.current?.isConnected
            ? triggerRef.current
            : (document.querySelector<HTMLButtonElement>(
                `[data-candidate-id="${candidate.id}"] .candidate-card-view`
              ) ??
              document.querySelector<HTMLButtonElement>(
                ".candidate-add-trigger"
              ))
        }
      >
        <DialogHeader>
          <DialogTitle>Remove {candidate.name}?</DialogTitle>
          <DialogDescription>
            This will remove them from the assignment. You can add them again
            later.
          </DialogDescription>
        </DialogHeader>
        <div className="workspace-actions candidate-removal-actions">
          <DialogClose render={<Button ref={cancelRef} variant="outline" />}>
            Cancel
          </DialogClose>
          <DialogClose
            render={<Button />}
            onClick={() => setIncluded(candidate.id, false)}
          >
            Remove candidate
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

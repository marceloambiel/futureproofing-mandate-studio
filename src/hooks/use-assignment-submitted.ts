import { getCurrent } from "@/domain/model"
import { useWorkspace } from "@/state/WorkspaceProvider"
import { useWorkspaceV2 } from "@/state/WorkspaceV2Provider"

/** A submitted brief only completes the assignment while it matches the reviewed details. */
export function useAssignmentSubmitted() {
  const { state } = useWorkspace()
  const { assignmentDetails } = useWorkspaceV2()
  const current = getCurrent(state)
  return (
    current.status === "ready" &&
    !assignmentDetails?.requiresReview &&
    (current.content.assignmentDetailsRevision ?? 0) >=
      (assignmentDetails?.revision ?? 0)
  )
}

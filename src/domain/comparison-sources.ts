import type { Candidate } from "./model"
import { candidateDirectory } from "./candidate-directory"
import { candidateProfileDetails } from "./candidate-profile-details"

export type ComparisonCriterion =
  "integration" | "scale" | "availability" | "location"
export function getComparisonSource(
  candidate: Candidate,
  criterion: ComparisonCriterion
) {
  if (criterion === "location")
    return {
      label: "CV · Contact details",
      quote: candidateDirectory[candidate.id].location,
      careerIndex: -1,
      part: "location" as const,
      note: candidateDirectory[candidate.id].location.startsWith("Chicago")
        ? undefined
        : "Confirm relocation to Chicago and availability for regular site travel.",
    }
  if (criterion === "availability")
    return {
      label: "Candidate record · Availability",
      quote: candidate.statement,
      careerIndex: -1,
      part: "availability" as const,
      note: undefined,
    }
  const careerIndex = candidate.id === "C" && criterion === "scale" ? 1 : 0
  const job = candidateProfileDetails[candidate.id].career[careerIndex]
  const part =
    (criterion === "integration" && candidate.id !== "B") ||
    (criterion === "scale" && candidate.id !== "A")
      ? ("details" as const)
      : ("description" as const)
  const note =
    candidate[criterion].kind === "unknown"
      ? criterion === "integration"
        ? "The CV does not specify ownership of an acquisition integration."
        : "The CV does not state the number of locations directly managed."
      : candidate[criterion].kind === "unverified"
        ? "The CV describes integration support; personal ownership and scope still need confirmation."
        : undefined
  return {
    label: `CV · ${job.company} · ${job.role}`,
    quote: job[part],
    careerIndex,
    part,
    note,
  }
}

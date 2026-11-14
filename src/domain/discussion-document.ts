import type { AssignmentDetailEdits } from "./assignment-details"
import { safeFontSize } from "./document-font-size"
import {
  candidates,
  revisedSummary,
  type BriefContent,
  type Candidate,
} from "./model"
import { clientBriefDocuments } from "./v2"
import { candidateDirectory } from "./candidate-directory"
import { candidateProfileDetails } from "./candidate-profile-details"
import { prepareDiscussionQuestions } from "./comparison"

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!
  )
const paragraph = (value: string) => `<p>${escape(value)}</p>`
const labelled = (label: string, value: string) =>
  `<p><strong>${escape(label)}</strong> ${escape(value)}</p>`
const list = (items: readonly string[]) =>
  `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`
export function discussionOpening(content: BriefContent) {
  return content.summary === revisedSummary
    ? clientBriefDocuments[0].summary
    : content.summary
}
export function buildDiscussionDocument(
  content: BriefContent,
  profiles: readonly Candidate[] = candidates,
  details?: AssignmentDetailEdits
) {
  const brief = clientBriefDocuments[content.alignment === "expansion" ? 1 : 0]
  const fact = (group: "company" | "role" | "search", id: string) =>
    details?.sections[group]?.[0].values[id] ??
    brief.facts[group].find((item) => item.id === id)?.value ??
    ""
  const questions = prepareDiscussionQuestions(content.questions, profiles)
  const questionBlocks = questions
    .split("\n\n")
    .map((block) => {
      const lines = block.split("\n")
      if (lines[0].endsWith(":") && lines.length > 1)
        return `<h3>${escape(lines[0].slice(0, -1))}</h3>${list(
          lines.slice(1).map((line) => line.replace(/^[•-]\s*/, ""))
        )
          .replace("<ul>", "<ol>")
          .replace("</ul>", "</ol>")}`
      return paragraph(block)
    })
    .join("")
  return `<h1>Northline Integration Search</h1><p>Client discussion brief · ${escape(fact("role", "role"))}</p><p><strong>Client:</strong> ${escape(fact("company", "company"))}<br><strong>Client lead:</strong> Maya Chen, CEO<br><strong>Lead advisor:</strong> Caroline S.</p>
<section data-brief-section="opening"><h2>Assignment objective</h2>${paragraph(discussionOpening(content))}</section>
<section data-brief-section="context"><h2>Client requirements</h2><h3>Company context</h3>${paragraph(`Northline is a privately held, growth-investor-backed commercial facilities and maintenance services business, headquartered in Chicago. The group has about 650 employees, approximately $180M in annual revenue and 12 locations, including two recently acquired businesses.`)}
<h3>Search priorities</h3>${labelled("Priority:", fact("search", "priority"))}${labelled("Experience required:", fact("search", "experience"))}${labelled("First 90 days:", fact("search", "first90"))}
<h3>Role and package</h3>${labelled("Reporting line:", `${fact("role", "reports")}, with ${fact("role", "direct").toLowerCase()} as direct reports.`)}${labelled("Location:", `${fact("role", "location")}. ${fact("role", "employment")}.`)}${labelled("Compensation:", `${fact("role", "salary")}, with a target bonus of ${fact("role", "bonus")}.`)}${labelled("Start target:", `${fact("search", "start")}.`)}
<h3>Selection process</h3>${paragraph(fact("search", "process"))}</section>
<section data-brief-section="candidates"><h2>Candidates for discussion</h2>${
    profiles.length
      ? profiles
          .map((candidate) => {
            const profile = candidateDirectory[candidate.id]
            const career = candidateProfileDetails[candidate.id].career[0]
            const project = candidateProfileDetails[candidate.id].projects[0]
            const location = profile.location.startsWith("Chicago")
              ? "Based in Chicago."
              : `Based in ${profile.location}; relocation to Chicago and regular site travel need confirmation.`
            return `<section><h3>${escape(candidate.name)}</h3><p><em>${escape(`${profile.title} · ${profile.employer}`)}</em></p>${labelled("At a glance:", `${profile.years} years in operations. ${location} Available in ${candidate.availabilityDays} days.`)}${labelled("Recent experience:", career.description)}${labelled(`Relevant project — ${project.name}:`, project.description)}<blockquote>${labelled("Points to clarify:", candidate.limitation)}</blockquote></section>`
          })
          .join("")
      : paragraph("No candidates are currently included in the comparison.")
  }</section>
<section data-brief-section="questions"><h2>Questions for the next conversations</h2>${questionBlocks || paragraph("Add candidates to the comparison to prepare follow-up questions.")}</section>
<section data-brief-section="nextsteps"><h2>Proposed next steps</h2>${list(["Confirm integration ownership, operating scale, start dates and relocation requirements with each candidate before making a recommendation.", "Discuss whether the 60-day start requirement is firm. Keep the current requirement unless the client agrees to change it.", "Agree which candidates should meet the CEO and CFO, followed by a site visit. Record the evidence still required and the owner of each follow-up."]).replace("<ul>", "<ol>").replace("</ul>", "</ol>")}${paragraph("This brief supports the client discussion. No preferred candidate or hiring recommendation has been agreed.")}</section>`
}

/** Keep stored rich text limited to ordinary document markup; never execute pasted HTML. */
export function sanitizeDiscussionHtml(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html
  const allowed = new Set([
    "H1",
    "H2",
    "H3",
    "H4",
    "P",
    "DIV",
    "SPAN",
    "SECTION",
    "UL",
    "OL",
    "LI",
    "STRONG",
    "B",
    "EM",
    "I",
    "U",
    "BR",
    "BLOCKQUOTE",
  ])
  const sections = new Set([
    "opening",
    "context",
    "candidates",
    "questions",
    "nextsteps",
  ])
  for (const element of Array.from(template.content.querySelectorAll("*"))) {
    if (
      ["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH"].includes(
        element.tagName
      )
    ) {
      element.remove()
      continue
    }
    const fontSize = safeFontSize(
      (element as HTMLElement).style?.fontSize ?? ""
    )
    if (element.tagName === "FONT") {
      const span = document.createElement("span")
      if (fontSize) span.style.fontSize = fontSize
      span.append(...element.childNodes)
      element.replaceWith(span)
      continue
    }
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      continue
    }
    for (const attr of Array.from(element.attributes))
      if (
        attr.name !== "data-brief-section" ||
        element.tagName !== "SECTION" ||
        !sections.has(attr.value)
      )
        element.removeAttribute(attr.name)
    if (fontSize) (element as HTMLElement).style.fontSize = fontSize
  }
  return template.innerHTML
}
export function readDiscussionFields(editor: HTMLElement) {
  function text(section: string) {
    const node = editor.querySelector<HTMLElement>(
      `[data-brief-section="${section}"]`
    )
    if (!node) return ""
    return Array.from(node.querySelectorAll("p,h3,li"))
      .map((element) => element.textContent?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
  }
  return {
    summary: text("opening"),
    questions: text("questions"),
    documentHtml: sanitizeDiscussionHtml(editor.innerHTML),
  }
}

import { useState } from "react"
import {
  candidateProfileDetails,
  careerMonths,
  tenureLabel,
  type CareerRecord,
  type EducationRecord,
} from "@/domain/candidate-profile-details"
import {
  getComparisonSource,
  type ComparisonCriterion,
} from "@/domain/comparison-sources"
import { type Candidate } from "@/domain/model"

function RecordDescription({
  summary,
  details,
  highlight,
}: {
  summary: string
  details?: string
  highlight?: "description" | "details"
}) {
  const [expanded, setExpanded] = useState(highlight === "details")
  return (
    <div className="profile-record-description">
      <p
        tabIndex={highlight === "description" ? -1 : undefined}
        data-comparison-focus={highlight === "description" || undefined}
        className={
          highlight === "description" ? "profile-source-focus" : undefined
        }
      >
        {summary}
      </p>
      {expanded && (
        <p
          tabIndex={highlight === "details" ? -1 : undefined}
          data-comparison-focus={highlight === "details" || undefined}
          className={
            highlight === "details" ? "profile-source-focus" : undefined
          }
        >
          {details}
        </p>
      )}
      {details && (
        <button
          type="button"
          className="profile-read-more"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  )
}
const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
const monthLabel = (value: string) =>
  monthFormat.format(new Date(`${value}-01T00:00:00Z`))

// Supplied logo images, consistently assigned to each fictional employer.
const companyLogos: Record<string, string> = {
  "Westbridge Services": "westbridge-services",
  "Parkfield Facilities": "parkfield-facilities",
  "Horizon Business Services": "horizon-business-services",
  "Oakfield Services": "oakfield-services",
  Independent: "independent",
  "Cedarpoint Services": "cedarpoint-services",
}
function CompanyLogo({ name }: { name: string }) {
  return (
    <img
      className="profile-company-logo"
      src={`/company-logos/${companyLogos[name]}.png`}
      alt=""
      width={44}
      height={44}
    />
  )
}
function CareerItem({
  job,
  highlight,
}: {
  job: CareerRecord
  highlight?: "description" | "details"
}) {
  return (
    <article className="profile-career-record">
      <CompanyLogo name={job.company} />
      <div>
        <div className="profile-career-heading">
          <h3>{job.role}</h3>
          <p className="profile-record-company">{job.company}</p>
        </div>
        <div className="profile-career-metadata">
          <p className="profile-record-meta">
            {monthLabel(job.start)} –{" "}
            {job.end ? monthLabel(job.end) : "Present"} ·{" "}
            {tenureLabel(careerMonths(job))}
          </p>
          <p className="profile-record-meta">{job.location}</p>
        </div>
        <RecordDescription
          summary={job.description}
          details={job.details}
          highlight={highlight}
        />
      </div>
    </article>
  )
}
export function ProfileExperience({
  candidate,
  source,
}: {
  candidate: Candidate
  source?: ComparisonCriterion
}) {
  const target = source ? getComparisonSource(candidate, source) : undefined
  return (
    <section className="profile-tab-section">
      <div className="profile-career-list">
        {candidateProfileDetails[candidate.id].career.map((job, index) => (
          <CareerItem
            key={`${job.company}-${job.start}`}
            job={job}
            highlight={
              (target?.part === "description" || target?.part === "details") &&
              target.careerIndex === index
                ? target.part
                : undefined
            }
          />
        ))}
      </div>
    </section>
  )
}
function EducationItem({ record }: { record: EducationRecord }) {
  return (
    <article className="profile-education-record">
      <div>
        <h3>{record.school}</h3>
        <p className="profile-record-meta">{record.degree}</p>
        <p className="profile-record-meta">{record.period}</p>
        <RecordDescription
          summary={record.description}
          details={record.details}
        />
      </div>
    </article>
  )
}
export function ProfileEducation({ candidate }: { candidate: Candidate }) {
  return (
    <section className="profile-tab-section">
      <div className="profile-education-list">
        {candidateProfileDetails[candidate.id].education.map((record) => (
          <EducationItem key={record.degree} record={record} />
        ))}
      </div>
    </section>
  )
}
export function ProfileProjects({ candidate }: { candidate: Candidate }) {
  return (
    <section className="profile-tab-section">
      <div className="profile-portfolio-projects">
        <ul>
          {candidateProfileDetails[candidate.id].projects.map((project) => (
            <li key={project.name}>
              <span className="profile-project-bullet" aria-hidden="true" />
              <div>
                <h4>{project.name}</h4>
                <p>{project.description}</p>
                <p className="profile-project-tools">{project.tools}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
export function ProfileSkillMap({ candidate }: { candidate: Candidate }) {
  return (
    <section className="profile-tab-section">
      <div className="profile-skill-groups">
        {candidateProfileDetails[candidate.id].skillGroups.map((group) => (
          <section key={group.name}>
            <h3>{group.name}</h3>
            <ul>
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}

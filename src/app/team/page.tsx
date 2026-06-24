"use client";

// 團隊與招募(階段一寫死):現役成員 + 校友 + 職缺 + 應徵範本(複製按鈕)。

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { CopyButton } from "@/components/CopyButton";
import { PageNav } from "@/components/PageNav";

export default function TeamPage() {
  const { t } = useLanguage();
  const team = t.team;

  const navItems = [
    { id: "members", label: team.membersHeading },
    { id: "alumni", label: team.alumniHeading },
    { id: "jobs", label: team.jobsHeading },
    { id: "template", label: team.templateHeading },
  ];

  return (
    <>
      <PageNav items={navItems} />
      {/* 現役成員 */}
      <Section id="members" heading={team.membersHeading} intro={team.intro}>
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {team.members.map((m, i) => (
            <div key={i} className="bg-background p-8">
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="mt-1 text-sm font-medium text-foreground/70">
                {m.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {m.topic}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 校友去向 */}
      <Section id="alumni" heading={team.alumniHeading} bordered>
        <ul className="divide-y divide-line border-y border-line">
          {team.alumni.map((a, i) => (
            <li
              key={i}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="font-mono text-sm text-muted sm:w-16">
                {a.year}
              </span>
              <span className="w-28 shrink-0 font-medium">{a.name}</span>
              <span className="text-muted">{a.destination}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 招募職缺 */}
      <Section id="jobs" heading={team.jobsHeading} intro={team.jobsIntro} bordered>
        <div className="space-y-px overflow-hidden border border-line bg-line">
          {team.jobs.map((job, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 bg-background p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-base font-semibold">{job.title}</h3>
                <p className="mt-1 text-sm text-muted">{job.desc}</p>
              </div>
              <span
                className={`inline-flex w-fit shrink-0 items-center px-3 py-1 text-xs font-medium ${
                  job.status === "open"
                    ? "border border-line-strong text-foreground"
                    : "bg-line text-muted"
                }`}
              >
                {job.status === "open" ? team.statusOpen : team.statusFull}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 應徵範本 + 複製按鈕 */}
      <Section id="template" heading={team.templateHeading} intro={team.templateIntro} bordered>
        <div className="border border-line">
          <pre className="overflow-x-auto whitespace-pre-wrap p-6 font-sans text-sm leading-relaxed text-foreground/80">
            {team.templateBody}
          </pre>
          <div className="border-t border-line p-6">
            <CopyButton
              text={team.templateBody}
              label={team.copyLabel}
              copiedLabel={team.copiedLabel}
            />
          </div>
        </div>
      </Section>
    </>
  );
}

"use client";

// 團隊與招募(前台):成員/校友/職缺來自後台 CMS;intro/標題/應徵範本仍為 i18n 文案。

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { CopyButton } from "@/components/CopyButton";
import { PageNav } from "@/components/PageNav";

export interface TeamData {
  members: {
    id: string;
    name: string;
    tier: "POSTDOC" | "PHD" | "MASTER" | "UNDERGRAD";
    photoUrl: string | null;
    researchTopic: string | null;
  }[];
  alumni: { id: string; name: string; gradYear: number; destination: string }[];
  jobs: {
    id: string;
    title: string;
    recruitStatus: "OPEN" | "FULL";
    slots: number | null;
    description: string;
  }[];
}

export function TeamContent({ data }: { data: TeamData }) {
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
        {data.members.length === 0 ? (
          <p className="text-sm text-muted">{team.emptyMembers}</p>
        ) : (
          <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {data.members.map((m) => (
              <div key={m.id} className="flex gap-4 bg-background p-8">
                {m.photoUrl && (
                  <Image
                    src={m.photoUrl}
                    alt={m.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-20 shrink-0 border border-line object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="mt-1 text-sm font-medium text-foreground/70">
                    {team.tierLabels[m.tier]}
                  </p>
                  {m.researchTopic && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {m.researchTopic}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 校友去向 */}
      <Section id="alumni" heading={team.alumniHeading} bordered>
        {data.alumni.length === 0 ? (
          <p className="text-sm text-muted">{team.emptyAlumni}</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {data.alumni.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-6"
              >
                <span className="font-mono text-sm text-muted sm:w-16">
                  {a.gradYear}
                </span>
                <span className="w-28 shrink-0 font-medium">{a.name}</span>
                <span className="text-muted">{a.destination}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 招募職缺 */}
      <Section id="jobs" heading={team.jobsHeading} intro={team.jobsIntro} bordered>
        {data.jobs.length === 0 ? (
          <p className="text-sm text-muted">{team.emptyJobs}</p>
        ) : (
          <div className="space-y-px overflow-hidden border border-line bg-line">
            {data.jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-2 bg-background p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-muted">{job.description}</p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 items-center px-3 py-1 text-xs font-medium ${
                    job.recruitStatus === "OPEN"
                      ? "border border-line-strong text-foreground"
                      : "bg-line text-muted"
                  }`}
                >
                  {job.recruitStatus === "OPEN" ? team.statusOpen : team.statusFull}
                  {job.slots != null ? ` · ${job.slots}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 應徵範本 + 複製按鈕(寫死文案) */}
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

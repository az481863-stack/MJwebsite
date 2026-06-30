"use client";

// 團隊與招募(前台):成員/校友/職缺來自後台 CMS;intro/標題/應徵範本仍為 i18n 文案。

import type { TeamTier } from "@/generated/prisma/client";
import { useLanguage } from "@/lib/i18n/context";
import { ZoomableImage } from "@/components/ZoomableImage";
import { Section } from "@/components/ui/Section";
import { CopyButton } from "@/components/CopyButton";
import { PageNav } from "@/components/PageNav";

// 現役成員前台分組顯示的層級順序(由上到下)。層級內順序仍由後台拖曳(sortOrder)決定。
const TIER_ORDER: TeamTier[] = [
  "PROFESSOR",
  "DISTINGUISHED_PROFESSOR",
  "EMERITUS_PROFESSOR",
  "ASSOC_PROFESSOR",
  "ASST_PROFESSOR",
  "VISITING_PROFESSOR",
  "ADJUNCT_PROFESSOR",
  "POSTDOC",
  "STAFF",
  "PHD",
  "MASTER",
  "UNDERGRAD",
];

export interface TeamData {
  members: {
    id: string;
    name: string;
    tier: TeamTier;
    photoUrl: string | null;
    researchTopic: string | null;
  }[];
  alumni: {
    id: string;
    name: string;
    gradYear: number;
    destination: string;
    photoUrl: string | null;
  }[];
  jobs: {
    id: string;
    title: string;
    titleEn: string | null;
    recruitStatus: "OPEN" | "FULL";
    slots: number | null;
    description: string;
    descriptionEn: string | null;
  }[];
}

export function TeamContent({ data }: { data: TeamData }) {
  const { t, lang } = useLanguage();
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
          <div className="space-y-10">
            {TIER_ORDER.map((tier) => {
              const group = data.members.filter((m) => m.tier === tier);
              if (group.length === 0) return null;
              return (
                <div key={tier}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
                    {team.tierLabels[tier]}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {group.map((m) => (
                      <div
                        key={m.id}
                        className="flex gap-4 border border-line bg-background p-8"
                      >
                        {m.photoUrl && (
                          <ZoomableImage
                            src={m.photoUrl}
                            alt={m.name}
                            width={80}
                            height={80}
                            thumbClassName="h-20 w-20 border border-line object-cover"
                          />
                        )}
                        <div>
                          <h4 className="text-lg font-semibold">{m.name}</h4>
                          {m.researchTopic && (
                            <p className="mt-2 text-sm leading-relaxed text-muted">
                              {m.researchTopic}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
                className="flex items-center gap-4 py-4"
              >
                {a.photoUrl ? (
                  <ZoomableImage
                    src={a.photoUrl}
                    alt={a.name}
                    width={48}
                    height={48}
                    thumbClassName="h-12 w-12 rounded-full border border-line object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-foreground/[0.03] text-sm text-muted"
                  >
                    {a.name.slice(0, 1)}
                  </span>
                )}
                <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-6">
                  <span className="font-mono text-sm text-muted sm:w-16">
                    {a.gradYear}
                  </span>
                  <span className="w-28 shrink-0 font-medium">{a.name}</span>
                  <span className="text-muted">{a.destination}</span>
                </div>
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
                  <h3 className="text-base font-semibold">
                    {(lang === "en" ? job.titleEn : null) || job.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                    {(lang === "en" ? job.descriptionEn : null) || job.description}
                  </p>
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

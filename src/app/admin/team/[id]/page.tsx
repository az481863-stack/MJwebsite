import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTeamMember } from "../actions";
import { TeamForm } from "../team-form";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  const { id } = await params;
  const m = await prisma.teamMember.findUnique({ where: { id } });
  if (!m || m.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯成員</h1>
      <TeamForm
        action={updateTeamMember}
        initial={{
          id: m.id,
          name: m.name,
          tier: m.tier,
          photoUrl: m.photoUrl,
          researchTopic: m.researchTopic,
          sortOrder: m.sortOrder,
        }}
      />
    </div>
  );
}

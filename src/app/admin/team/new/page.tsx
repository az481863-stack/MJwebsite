import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createTeamMember } from "../actions";
import { TeamForm } from "../team-form";

export default async function NewTeamMemberPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增成員</h1>
      <TeamForm action={createTeamMember} />
    </div>
  );
}

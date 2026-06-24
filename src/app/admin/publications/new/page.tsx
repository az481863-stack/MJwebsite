import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createPublication } from "../actions";
import { PublicationForm } from "../publication-form";

export default async function NewPublicationPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增 Publication</h1>
      <PublicationForm
        action={createPublication}
        canPublish={roleAtLeast(me.role, "ADMIN")}
      />
    </div>
  );
}

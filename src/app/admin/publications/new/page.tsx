import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createPublication } from "../actions";
import { PublicationForm } from "../publication-form";

export default async function NewPublicationPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增 Publication</h1>
      <PublicationForm action={createPublication} canPublish={true} />
    </div>
  );
}

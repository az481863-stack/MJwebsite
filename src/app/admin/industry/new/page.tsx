import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createIndustry } from "../actions";
import { IndustryForm } from "../industry-form";

export default async function NewIndustryPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增產學/專利項目</h1>
      <IndustryForm action={createIndustry} />
    </div>
  );
}

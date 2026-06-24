import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createJob } from "../actions";
import { JobForm } from "../job-form";

export default async function NewJobPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增職缺</h1>
      <JobForm action={createJob} />
    </div>
  );
}

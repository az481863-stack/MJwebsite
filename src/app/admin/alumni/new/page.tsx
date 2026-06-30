import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createAlumnus } from "../actions";
import { AlumnusForm } from "../alumni-form";

export default async function NewAlumnusPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增歷屆成員</h1>
      <AlumnusForm action={createAlumnus} />
    </div>
  );
}

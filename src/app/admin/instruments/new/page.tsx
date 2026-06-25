import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { InstrumentForm } from "../instrument-form";
import { createInstrument } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewInstrumentPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/admin/instruments");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">新增儀器</h1>
      <div className="mt-6">
        <InstrumentForm action={createInstrument} />
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InstrumentForm } from "../../instrument-form";
import { updateInstrument } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditInstrumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/admin/instruments");

  const inst = await prisma.instrument.findFirst({
    where: { id, deletedAt: null },
    include: { managers: { include: { member: { select: { loginEmail: true } } } } },
  });
  if (!inst) notFound();

  const managerEmails = inst.managers.map((m) => m.member.loginEmail).join(", ");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">編輯儀器</h1>
      <div className="mt-6">
        <InstrumentForm
          action={updateInstrument}
          initial={{
            id: inst.id,
            name: inst.name,
            purpose: inst.purpose,
            photoUrl: inst.photoUrl,
            status: inst.status,
            sortOrder: inst.sortOrder,
            managerEmails,
          }}
        />
      </div>
    </div>
  );
}

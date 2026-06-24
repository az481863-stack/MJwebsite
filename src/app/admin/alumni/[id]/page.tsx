import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAlumnus } from "../actions";
import { AlumnusForm } from "../alumni-form";

export default async function EditAlumnusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  const { id } = await params;
  const a = await prisma.alumnus.findUnique({ where: { id } });
  if (!a || a.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯校友</h1>
      <AlumnusForm
        action={updateAlumnus}
        initial={{
          id: a.id,
          name: a.name,
          gradYear: a.gradYear,
          destination: a.destination,
          sortOrder: a.sortOrder,
        }}
      />
    </div>
  );
}

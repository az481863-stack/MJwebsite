import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateJob } from "../actions";
import { JobForm } from "../job-form";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  const { id } = await params;
  const j = await prisma.jobOpening.findUnique({ where: { id } });
  if (!j || j.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯職缺</h1>
      <JobForm
        action={updateJob}
        initial={{
          id: j.id,
          title: j.title,
          titleEn: j.titleEn,
          recruitStatus: j.recruitStatus,
          slots: j.slots,
          description: j.description,
          descriptionEn: j.descriptionEn,
          sortOrder: j.sortOrder,
        }}
      />
    </div>
  );
}

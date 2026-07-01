import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateIndustry } from "../actions";
import { IndustryForm } from "../industry-form";

export default async function EditIndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  const { id } = await params;
  const it = await prisma.industryItem.findUnique({ where: { id } });
  if (!it || it.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯產學/專利項目</h1>
      <IndustryForm
        action={updateIndustry}
        initial={{
          id: it.id,
          category: it.category,
          title: it.title,
          titleEn: it.titleEn,
          description: it.description,
          descriptionEn: it.descriptionEn,
          sortOrder: it.sortOrder,
        }}
      />
    </div>
  );
}

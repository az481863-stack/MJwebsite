import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HighSchoolForm } from "./highschool-form";

export default async function HighSchoolAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const msg = await prisma.highSchoolMessage.findFirst({
    where: { deletedAt: null },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">給高中生的話</h1>
        <p className="mt-1 text-sm text-muted">單篇引導長文,編輯後即更新前台。</p>
      </header>
      <HighSchoolForm
        initialContent={msg?.content ?? ""}
        initialContentEn={msg?.contentEn ?? ""}
        initialPublished={msg?.status === "PUBLISHED"}
      />
    </div>
  );
}

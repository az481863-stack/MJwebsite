import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCourse } from "../actions";
import { CourseForm } from "../course-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  const { id } = await params;
  const c = await prisma.course.findUnique({ where: { id } });
  if (!c || c.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯課程</h1>
      <CourseForm
        action={updateCourse}
        initial={{
          id: c.id,
          name: c.name,
          nameEn: c.nameEn,
          outline: c.outline,
          outlineEn: c.outlineEn,
          handoutUrl: c.handoutUrl,
          sortOrder: c.sortOrder,
        }}
      />
    </div>
  );
}

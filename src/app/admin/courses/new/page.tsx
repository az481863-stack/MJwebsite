import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createCourse } from "../actions";
import { CourseForm } from "../course-form";

export default async function NewCoursePage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增課程</h1>
      <CourseForm action={createCourse} />
    </div>
  );
}

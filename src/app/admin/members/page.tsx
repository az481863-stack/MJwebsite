// 會員管理頁(B):需 ADMIN 以上。列出會員、邀請、改角色、停用/還原。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { MembersAdmin } from "./members-admin";

export default async function MembersPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/login");

  const members = await prisma.member.findMany({
    where: { deletedAt: null },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  const superadminCount = members.filter(
    (m) => m.role === "SUPERADMIN" && m.status !== "DISABLED",
  ).length;

  return (
    <Container className="max-w-4xl py-16">
      <MembersAdmin
        myId={me.id}
        canManageRoles={me.role === "SUPERADMIN"}
        superadminCount={superadminCount}
        members={members.map((m) => ({
          id: m.id,
          loginEmail: m.loginEmail,
          role: m.role,
          status: m.status,
        }))}
      />
    </Container>
  );
}

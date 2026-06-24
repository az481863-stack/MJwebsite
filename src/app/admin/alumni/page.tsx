import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

export default async function AlumniAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.alumnus.findMany({
      where: { deletedAt: null },
      orderBy: [{ gradYear: "desc" }, { sortOrder: "asc" }],
    }),
    prisma.alumnus.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <AdminListShell
      title="校友去向"
      basePath="/admin/alumni"
      model="alumnus"
      items={items}
      deleted={deleted}
      renderRow={(a) => (
        <p className="text-sm">
          <span className="font-medium">{a.name}</span>
          <span className="text-muted"> · {a.gradYear} · {a.destination}</span>
        </p>
      )}
      renderDeleted={(a) => `${a.name}(${a.gradYear})`}
    />
  );
}

import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePublication } from "../actions";
import { PublicationForm } from "../publication-form";

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  const { id } = await params;
  const p = await prisma.publication.findUnique({ where: { id } });
  if (!p || p.deletedAt) notFound();

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  // 學生只能編輯自己尚未發布的草稿。
  if (!isAdmin && (p.createdBy !== me.id || p.status !== "DRAFT")) {
    redirect("/admin/publications");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯 Publication</h1>
      <PublicationForm
        action={updatePublication}
        canPublish={isAdmin}
        initial={{
          id: p.id,
          authors: p.authors,
          title: p.title,
          venue: p.venue,
          year: p.year,
          doiUrl: p.doiUrl,
          highlight: p.highlight,
        }}
      />
    </div>
  );
}

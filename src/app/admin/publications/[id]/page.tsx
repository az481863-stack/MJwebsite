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
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");
  const { id } = await params;
  const p = await prisma.publication.findUnique({ where: { id } });
  if (!p || p.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯 Publication</h1>
      <PublicationForm
        action={updatePublication}
        canPublish={true}
        initial={{
          id: p.id,
          authors: p.authors,
          title: p.title,
          venue: p.venue,
          year: p.year,
          doiUrl: p.doiUrl,
          abstract: p.abstract,
          imageUrl: p.imageUrl,
          highlight: p.highlight,
        }}
      />
    </div>
  );
}

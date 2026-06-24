import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { ContactContent } from "./contact-content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  if (!settings.showContact) notFound();
  return <ContactContent />;
}

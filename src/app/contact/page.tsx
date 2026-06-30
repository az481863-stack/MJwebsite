import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { ContactContent } from "./contact-content";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  if (!settings.showContact) notFound();
  return (
    <ContactContent
      overrides={{
        labNameZh: settings.contactLabNameZh,
        labNameEn: settings.contactLabNameEn,
        addressZh: settings.contactAddressZh,
        addressEn: settings.contactAddressEn,
        email: settings.contactEmail,
        phone: settings.contactPhone,
        officeHoursZh: settings.contactOfficeHoursZh,
        officeHoursEn: settings.contactOfficeHoursEn,
      }}
    />
  );
}

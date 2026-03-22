import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/project/dashboard-shell";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/server/auth";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const user = await getSessionUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const dictionary = getDictionary(locale);

  return <DashboardShell locale={locale} dictionary={dictionary} />;
}

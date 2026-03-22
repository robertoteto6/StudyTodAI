import { DashboardShell } from "@/components/project/dashboard-shell";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return <DashboardShell locale={locale} dictionary={dictionary.dashboard} />;
}

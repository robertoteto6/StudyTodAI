import { redirect } from "next/navigation";
import { LandingShell } from "@/components/project/landing-shell";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/server/auth";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const user = await getSessionUser();
  const dictionary = getDictionary(locale);

  if (user) {
    redirect(`/${locale}/projects`);
  }

  return <LandingShell locale={locale} dictionary={dictionary} />;
}

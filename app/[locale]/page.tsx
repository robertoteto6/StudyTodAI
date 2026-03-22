import { LandingShell } from "@/components/project/landing-shell";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return <LandingShell locale={locale} dictionary={dictionary} />;
}

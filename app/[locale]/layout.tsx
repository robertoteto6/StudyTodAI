import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { getSafeLocale, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = getSafeLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return (
    <div className="min-h-screen">
      <AppHeader
        locale={locale}
        dashboardLabel={dictionary.nav.dashboard}
        loginLabel={dictionary.nav.login}
      />
      {children}
    </div>
  );
}

import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { DocumentLocaleSync } from "@/components/layout/document-locale-sync";
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
      <DocumentLocaleSync locale={locale} />
      <AppHeader locale={locale} dictionary={dictionary} />
      {children}
    </div>
  );
}

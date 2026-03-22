import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/server/auth";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getSafeLocale(rawLocale);
  const user = await getSessionUser();

  if (user) {
    redirect(`/${locale}/projects`);
  }

  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center justify-center px-4 py-8 sm:px-6">
      <AuthCard locale={locale} dictionary={dictionary} />
    </main>
  );
}

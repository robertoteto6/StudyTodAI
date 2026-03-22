import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/project/workspace-shell";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSessionUser } from "@/lib/server/auth";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale: rawLocale, projectId } = await params;
  const locale = getSafeLocale(rawLocale);
  const user = await getSessionUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const dictionary = getDictionary(locale);

  return <WorkspaceShell locale={locale} projectId={projectId} dictionary={dictionary} />;
}

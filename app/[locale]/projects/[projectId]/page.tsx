import { WorkspaceShell } from "@/components/project/workspace-shell";
import { getSafeLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale: rawLocale, projectId } = await params;
  const locale = getSafeLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return <WorkspaceShell locale={locale} projectId={projectId} dictionary={dictionary.workspace} />;
}

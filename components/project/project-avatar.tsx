import {
  Brain,
  BriefcaseBusiness,
  Calculator,
  Code2,
  DraftingCompass,
  FileText,
  FlaskConical,
  FolderKanban,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  LibraryBig,
  Lightbulb,
  Microscope,
  NotebookPen,
  Rocket,
  Sparkles,
  Sigma,
  Target,
} from "lucide-react";
import {
  DEFAULT_PROJECT_ICON,
  getProjectStyleOption,
  type ProjectIconKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const containerSizes = {
  sm: "h-11 w-11 rounded-[1.2rem]",
  md: "h-14 w-14 rounded-[1.55rem]",
  lg: "h-[4.5rem] w-[4.5rem] rounded-[1.8rem]",
} as const;

const iconSizes = {
  sm: "h-4.5 w-4.5",
  md: "h-5.5 w-5.5",
  lg: "h-7 w-7",
} as const;

export function ProjectAvatar({
  icon,
  accentColor,
  size = "md",
  className,
}: {
  icon?: string;
  accentColor?: string;
  size?: keyof typeof containerSizes;
  className?: string;
}) {
  const style = getProjectStyleOption(accentColor);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border border-white/20 text-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.8)] ring-1 ring-black/5",
        containerSizes[size],
        className,
      )}
      style={{ background: style.gradient }}
    >
      {renderProjectIcon(icon, iconSizes[size])}
    </span>
  );
}

function renderProjectIcon(icon: string | undefined, className: string) {
  switch ((icon as ProjectIconKey) ?? DEFAULT_PROJECT_ICON) {
    case "notebook-pen":
      return <NotebookPen aria-hidden className={className} strokeWidth={2.05} />;
    case "file-text":
      return <FileText aria-hidden className={className} strokeWidth={2.05} />;
    case "calculator":
      return <Calculator aria-hidden className={className} strokeWidth={2.05} />;
    case "sigma":
      return <Sigma aria-hidden className={className} strokeWidth={2.05} />;
    case "brain":
      return <Brain aria-hidden className={className} strokeWidth={2.05} />;
    case "code":
      return <Code2 aria-hidden className={className} strokeWidth={2.05} />;
    case "languages":
      return <Languages aria-hidden className={className} strokeWidth={2.05} />;
    case "globe":
      return <Globe aria-hidden className={className} strokeWidth={2.05} />;
    case "microscope":
      return <Microscope aria-hidden className={className} strokeWidth={2.05} />;
    case "flask":
      return <FlaskConical aria-hidden className={className} strokeWidth={2.05} />;
    case "landmark":
      return <Landmark aria-hidden className={className} strokeWidth={2.05} />;
    case "folder-kanban":
      return <FolderKanban aria-hidden className={className} strokeWidth={2.05} />;
    case "drafting-compass":
      return <DraftingCompass aria-hidden className={className} strokeWidth={2.05} />;
    case "lightbulb":
      return <Lightbulb aria-hidden className={className} strokeWidth={2.05} />;
    case "target":
      return <Target aria-hidden className={className} strokeWidth={2.05} />;
    case "briefcase":
      return <BriefcaseBusiness aria-hidden className={className} strokeWidth={2.05} />;
    case "graduation-cap":
      return <GraduationCap aria-hidden className={className} strokeWidth={2.05} />;
    case "rocket":
      return <Rocket aria-hidden className={className} strokeWidth={2.05} />;
    case "sparkles":
      return <Sparkles aria-hidden className={className} strokeWidth={2.05} />;
    case "book-open":
    default:
      return <LibraryBig aria-hidden className={className} strokeWidth={2.05} />;
  }
}

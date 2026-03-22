import {
  BookOpenText,
  Brain,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  PenTool,
  Rocket,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  DEFAULT_PROJECT_ICON,
  getProjectStyleOption,
  type ProjectIconKey,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const PROJECT_ICONS: Record<ProjectIconKey, LucideIcon> = {
  "book-open": BookOpenText,
  "graduation-cap": GraduationCap,
  brain: Brain,
  lightbulb: Lightbulb,
  rocket: Rocket,
  target: Target,
  flask: FlaskConical,
  "pen-tool": PenTool,
};

const containerSizes = {
  sm: "h-10 w-10 rounded-2xl",
  md: "h-12 w-12 rounded-[1.1rem]",
  lg: "h-14 w-14 rounded-[1.35rem]",
} as const;

const iconSizes = {
  sm: "h-4.5 w-4.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export function getProjectIconComponent(icon?: string) {
  return PROJECT_ICONS[(icon as ProjectIconKey) ?? DEFAULT_PROJECT_ICON] ?? PROJECT_ICONS[DEFAULT_PROJECT_ICON];
}

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
        "inline-flex items-center justify-center border border-white/30 text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.65)]",
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
  switch (icon) {
    case "graduation-cap":
      return <GraduationCap aria-hidden className={className} strokeWidth={2.1} />;
    case "brain":
      return <Brain aria-hidden className={className} strokeWidth={2.1} />;
    case "lightbulb":
      return <Lightbulb aria-hidden className={className} strokeWidth={2.1} />;
    case "rocket":
      return <Rocket aria-hidden className={className} strokeWidth={2.1} />;
    case "target":
      return <Target aria-hidden className={className} strokeWidth={2.1} />;
    case "flask":
      return <FlaskConical aria-hidden className={className} strokeWidth={2.1} />;
    case "pen-tool":
      return <PenTool aria-hidden className={className} strokeWidth={2.1} />;
    case "book-open":
    default:
      return <BookOpenText aria-hidden className={className} strokeWidth={2.1} />;
  }
}

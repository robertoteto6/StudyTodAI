export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const SUPPORTED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export const PROJECT_STYLE_OPTIONS = [
  {
    accentColor: "#0f766e",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #0f766e 55%, #042f2e 100%)",
  },
  {
    accentColor: "#ef8354",
    gradient: "linear-gradient(135deg, #f8b26a 0%, #ef8354 52%, #9a3412 100%)",
  },
  {
    accentColor: "#7c3aed",
    gradient: "linear-gradient(135deg, #c084fc 0%, #7c3aed 52%, #312e81 100%)",
  },
  {
    accentColor: "#0f4c81",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #0f4c81 52%, #172554 100%)",
  },
  {
    accentColor: "#be185d",
    gradient: "linear-gradient(135deg, #f472b6 0%, #be185d 48%, #500724 100%)",
  },
  {
    accentColor: "#4f46e5",
    gradient: "linear-gradient(135deg, #818cf8 0%, #4f46e5 48%, #1e1b4b 100%)",
  },
] as const;

export const PROJECT_ICON_OPTIONS = [
  { value: "book-open", label: "Book" },
  { value: "graduation-cap", label: "Cap" },
  { value: "brain", label: "Brain" },
  { value: "lightbulb", label: "Lightbulb" },
  { value: "rocket", label: "Rocket" },
  { value: "target", label: "Target" },
  { value: "flask", label: "Flask" },
  { value: "pen-tool", label: "Pen" },
] as const;

export type ProjectIconKey = (typeof PROJECT_ICON_OPTIONS)[number]["value"];

export const PROJECT_ACCENT_COLORS = PROJECT_STYLE_OPTIONS.map((style) => style.accentColor);
export const DEFAULT_PROJECT_STYLE = PROJECT_STYLE_OPTIONS[0].accentColor;
export const DEFAULT_PROJECT_ICON: ProjectIconKey = PROJECT_ICON_OPTIONS[0].value;

export function getProjectStyleOption(accentColor?: string) {
  return (
    PROJECT_STYLE_OPTIONS.find((style) => style.accentColor === accentColor) ??
    PROJECT_STYLE_OPTIONS[0]
  );
}

export const DEFAULT_CHAT_TITLE = "Project assistant";

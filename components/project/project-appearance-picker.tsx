"use client";

import { Check, Sparkles } from "lucide-react";
import { useId } from "react";
import { ProjectAvatar } from "@/components/project/project-avatar";
import { PROJECT_ICON_OPTIONS, PROJECT_STYLE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProjectAppearancePickerDictionary = {
  title: string;
  namePlaceholder: string;
  projectIcon: string;
  accentColor: string;
  colorPalette: string;
  previewTitle: string;
  projectIconLabels: Record<string, string>;
};

export function ProjectAppearancePicker({
  value,
  projectName,
  dictionary,
  onChange,
}: {
  value: {
    icon: string;
    accentColor: string;
  };
  projectName: string;
  dictionary: ProjectAppearancePickerDictionary;
  onChange(field: "icon" | "accentColor", value: string): void;
}) {
  const baseId = useId();
  const previewTitle = projectName.trim() || dictionary.namePlaceholder;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] shadow-[var(--shadow-panel)]">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6 p-5 sm:p-6">
          <div className="space-y-2">
            <p className="caps-label text-xs text-[var(--color-ink-soft)]">{dictionary.title}</p>
        <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
          {dictionary.title}
        </h3>
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
          {dictionary.projectIcon} / {dictionary.colorPalette}
        </p>
      </div>

          <fieldset className="space-y-3">
            <legend className="caps-label text-xs text-[var(--color-ink-soft)]">
              {dictionary.projectIcon}
            </legend>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
              {PROJECT_ICON_OPTIONS.map((option) => {
                const checked = value.icon === option.value;

                return (
                  <label
                    key={option.value}
                    className={cn(
                      "group cursor-pointer rounded-[1.45rem] border p-3 transition-all duration-200 focus-within:ring-4 focus-within:ring-[var(--color-focus-ring-soft)]",
                      checked
                        ? "border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                        : "border-[var(--color-line)] bg-[color:rgba(255,255,255,0.44)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]",
                    )}
                  >
                    <input
                      className="sr-only"
                      checked={checked}
                      name={`${baseId}-icon`}
                      type="radio"
                      value={option.value}
                      onChange={() => onChange("icon", option.value)}
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ProjectAvatar
                        accentColor={value.accentColor}
                        icon={option.value}
                        size="sm"
                        className={checked ? "scale-[1.03]" : ""}
                      />
                      <span className="text-[11px] font-medium leading-4 text-[var(--color-ink-soft)]">
                        {dictionary.projectIconLabels[option.value] ?? option.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="caps-label text-xs text-[var(--color-ink-soft)]">
              {dictionary.colorPalette}
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {PROJECT_STYLE_OPTIONS.map((style) => {
                const checked = value.accentColor === style.accentColor;

                return (
                  <label
                    key={style.accentColor}
                    className={cn(
                      "cursor-pointer rounded-[1.4rem] border p-2.5 transition-all duration-200 focus-within:ring-4 focus-within:ring-[var(--color-focus-ring-soft)]",
                      checked
                        ? "border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                        : "border-[var(--color-line)] bg-[color:rgba(255,255,255,0.44)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]",
                    )}
                  >
                    <input
                      className="sr-only"
                      checked={checked}
                      name={`${baseId}-accentColor`}
                      type="radio"
                      value={style.accentColor}
                      onChange={() => onChange("accentColor", style.accentColor)}
                    />
                    <div className="flex items-center gap-3">
                      <span
                        className="relative block h-12 flex-1 overflow-hidden rounded-[1rem] border border-white/15"
                        style={{ background: style.gradient }}
                      >
                        {checked ? (
                          <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/88 text-slate-900 shadow-sm">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <aside className="border-t border-[var(--color-line)] bg-[color:rgba(16,33,43,0.03)] p-5 sm:p-6 xl:border-l xl:border-t-0">
          <div className="space-y-4">
            <p className="caps-label text-xs text-[var(--color-ink-soft)]">{dictionary.previewTitle}</p>
            <div className="rounded-[1.8rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{previewTitle}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{dictionary.title}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center rounded-[1.8rem] border border-dashed border-[var(--color-line)] bg-[color:rgba(255,255,255,0.34)] px-6 py-7">
                <ProjectAvatar accentColor={value.accentColor} icon={value.icon} size="lg" />
              </div>

              <div className="mt-5 space-y-2 rounded-[1.25rem] bg-[color:rgba(255,255,255,0.34)] p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--color-ink-soft)]">{dictionary.projectIcon}</span>
                  <span className="font-medium text-[var(--color-ink)]">
                    {dictionary.projectIconLabels[value.icon] ??
                      PROJECT_ICON_OPTIONS.find((option) => option.value === value.icon)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--color-ink-soft)]">{dictionary.accentColor}</span>
                  <span className="inline-flex h-6 w-10 rounded-full border border-white/20" style={{ background: PROJECT_STYLE_OPTIONS.find((style) => style.accentColor === value.accentColor)?.gradient }} />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

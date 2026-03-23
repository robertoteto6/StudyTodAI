"use client";

import { useId } from "react";
import { ProjectAvatar } from "@/components/project/project-avatar";
import { PROJECT_ICON_OPTIONS, PROJECT_STYLE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProjectAppearancePickerDictionary = {
  title: string;
  namePlaceholder: string;
  projectIcon: string;
  accentColor: string;
  previewTitle: string;
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
    <section className="space-y-5 rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-5 shadow-[var(--shadow-soft)]">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-[var(--color-ink)]">{dictionary.title}</h3>
        <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
          {dictionary.projectIcon} + {dictionary.accentColor}
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="caps-label text-xs text-[var(--color-ink-soft)]">
          {dictionary.projectIcon}
        </legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {PROJECT_ICON_OPTIONS.map((option) => {
            const checked = value.icon === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "group flex cursor-pointer items-center justify-center rounded-[1.35rem] border p-3 transition-all duration-200 focus-within:ring-4 focus-within:ring-[var(--color-focus-ring-soft)]",
                  checked
                    ? "border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                    : "border-[var(--color-line)] bg-[color:rgba(255,255,255,0.42)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]",
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
                <ProjectAvatar
                  accentColor={value.accentColor}
                  icon={option.value}
                  size="sm"
                  className={checked ? "scale-105" : ""}
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="caps-label text-xs text-[var(--color-ink-soft)]">
          {dictionary.accentColor}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {PROJECT_STYLE_OPTIONS.map((style) => {
            const checked = value.accentColor === style.accentColor;

            return (
              <label
                key={style.accentColor}
                className={cn(
                  "cursor-pointer rounded-[1.35rem] border p-2.5 transition-all duration-200 focus-within:ring-4 focus-within:ring-[var(--color-focus-ring-soft)]",
                  checked
                    ? "border-[var(--color-ink)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                    : "border-[var(--color-line)] bg-[color:rgba(255,255,255,0.42)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]",
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
                  <ProjectAvatar accentColor={style.accentColor} icon={value.icon} size="sm" />
                  <span
                    className="block h-11 flex-1 rounded-[1rem] border border-white/20"
                    style={{ background: style.gradient }}
                  />
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <section className="space-y-3">
        <p className="caps-label text-xs text-[var(--color-ink-soft)]">{dictionary.previewTitle}</p>
        <div className="rounded-[1.6rem] border border-[var(--color-line)] bg-[color:rgba(255,255,255,0.36)] p-5">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-start sm:text-left">
            <ProjectAvatar accentColor={value.accentColor} icon={value.icon} size="lg" />
            <div>
              <p className="text-base font-semibold text-[var(--color-ink)]">{previewTitle}</p>
              <p className="text-sm text-[var(--color-ink-soft)]">{dictionary.title}</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

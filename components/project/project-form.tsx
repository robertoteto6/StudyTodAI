"use client";

import { ChevronDown, LoaderCircle, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProjectAvatar } from "@/components/project/project-avatar";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { PROJECT_ICON_OPTIONS, PROJECT_STYLE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProjectFormValues = {
  name: string;
  description: string;
  subject: string;
  accentColor: string;
  icon: string;
};

type ProjectFormDictionary = {
  createModeTitle: string;
  editModeTitle: string;
  createHint: string;
  editHint: string;
  name: string;
  descriptionField: string;
  subject: string;
  accentColor: string;
  projectIcon: string;
  colorPalette: string;
  createCta: string;
  saveChanges: string;
  cancelEdit: string;
};

export function ProjectForm({
  mode,
  values,
  busy,
  showCancel = false,
  dictionary,
  onChange,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  values: ProjectFormValues;
  busy: boolean;
  showCancel?: boolean;
  dictionary: ProjectFormDictionary;
  onChange(field: keyof ProjectFormValues, value: string): void;
  onSubmit(event: React.FormEvent<HTMLFormElement>): void;
  onCancel?: () => void;
}) {
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const styleMenuRef = useRef<HTMLDivElement | null>(null);
  const currentTitle = values.name.trim() || dictionary.name;

  useEffect(() => {
    if (!isStyleMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        styleMenuRef.current &&
        event.target instanceof Node &&
        !styleMenuRef.current.contains(event.target)
      ) {
        setIsStyleMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsStyleMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStyleMenuOpen]);

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <p className="caps-label text-xs text-[var(--color-ink-soft)]">
          {mode === "create" ? dictionary.createModeTitle : dictionary.editModeTitle}
        </p>
        <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
          {mode === "create" ? dictionary.createHint : dictionary.editHint}
        </p>
      </div>

      <Input
        placeholder={dictionary.name}
        value={values.name}
        onChange={(event) => onChange("name", event.target.value)}
        required
      />

      {mode === "edit" ? (
        <Input
          placeholder={dictionary.subject}
          value={values.subject}
          onChange={(event) => onChange("subject", event.target.value)}
        />
      ) : null}

      <Textarea
        rows={4}
        placeholder={dictionary.descriptionField}
        value={values.description}
        onChange={(event) => onChange("description", event.target.value)}
      />

      <div ref={styleMenuRef} className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <Palette className="h-4 w-4 text-[var(--color-accent-strong)]" />
          {dictionary.accentColor}
        </div>

        <div className="rounded-[1.7rem] border border-[var(--color-line)] bg-white/70 p-3 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <ProjectAvatar accentColor={values.accentColor} icon={values.icon} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                  {currentTitle}
                </p>
                <p className="text-xs text-[var(--color-ink-soft)]">
                  {dictionary.projectIcon} · {dictionary.colorPalette}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-controls="project-style-panel"
              aria-expanded={isStyleMenuOpen}
              onClick={() => setIsStyleMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            >
              <Palette className="h-4.5 w-4.5" />
            </button>
          </div>

          <div
            className={cn(
              "grid transition-all duration-200 ease-out",
              isStyleMenuOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div
                id="project-style-panel"
                className="rounded-[1.4rem] border border-[var(--color-line)] bg-[var(--color-surface-strong)] p-4"
              >
                <div className="space-y-4">
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="caps-label text-xs text-[var(--color-ink-soft)]">
                        {dictionary.projectIcon}
                      </p>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[var(--color-ink-soft)] transition-transform",
                          isStyleMenuOpen ? "rotate-180" : "",
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {PROJECT_ICON_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-label={option.label}
                          onClick={() => onChange("icon", option.value)}
                          className={cn(
                            "flex items-center justify-center rounded-[1.2rem] border p-2 transition",
                            values.icon === option.value
                              ? "border-[var(--color-ink)] bg-white shadow-[var(--shadow-soft)]"
                              : "border-[var(--color-line)] bg-white/70 hover:border-[var(--color-accent)]",
                          )}
                        >
                          <ProjectAvatar
                            accentColor={values.accentColor}
                            icon={option.value}
                            size="sm"
                          />
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <p className="caps-label text-xs text-[var(--color-ink-soft)]">
                      {dictionary.colorPalette}
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {PROJECT_STYLE_OPTIONS.map((style) => (
                        <button
                          key={style.accentColor}
                          type="button"
                          aria-label={style.accentColor}
                          onClick={() => onChange("accentColor", style.accentColor)}
                          className={cn(
                            "rounded-[1.2rem] border p-2 transition",
                            values.accentColor === style.accentColor
                              ? "border-[var(--color-ink)] bg-white shadow-[var(--shadow-soft)]"
                              : "border-[var(--color-line)] bg-white/70 hover:border-[var(--color-accent)]",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <ProjectAvatar
                              accentColor={style.accentColor}
                              icon={values.icon}
                              size="sm"
                            />
                            <span
                              className="block h-10 flex-1 rounded-2xl border border-white/35"
                              style={{ background: style.gradient }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button aria-busy={busy} disabled={busy || !values.name.trim()} type="submit">
          {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? dictionary.createCta : dictionary.saveChanges}
        </Button>
        {showCancel && onCancel ? (
          <Button disabled={busy} type="button" variant="secondary" onClick={onCancel}>
            {dictionary.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

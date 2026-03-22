"use client";

import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { PROJECT_ACCENT_COLORS } from "@/lib/constants";

export type ProjectFormValues = {
  name: string;
  description: string;
  subject: string;
  accentColor: string;
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
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-ink-soft)]">
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
      <Input
        placeholder={dictionary.subject}
        value={values.subject}
        onChange={(event) => onChange("subject", event.target.value)}
      />
      <Textarea
        rows={4}
        placeholder={dictionary.descriptionField}
        value={values.description}
        onChange={(event) => onChange("description", event.target.value)}
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
          <Palette className="h-4 w-4 text-[var(--color-accent-strong)]" />
          {dictionary.accentColor}
        </div>
        <div className="flex flex-wrap gap-2">
          {PROJECT_ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange("accentColor", color)}
              className={`h-10 w-10 rounded-full border-2 transition ${
                values.accentColor === color
                  ? "scale-105 border-[var(--color-ink)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button disabled={busy || !values.name.trim()} type="submit">
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

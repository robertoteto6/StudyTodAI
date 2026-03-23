"use client";

import { LoaderCircle } from "lucide-react";
import { ProjectAppearancePicker } from "@/components/project/project-appearance-picker";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

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
  appearanceTitle: string;
  accentColor: string;
  projectIcon: string;
  colorPalette: string;
  previewTitle: string;
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

      <ProjectAppearancePicker
        value={{ icon: values.icon, accentColor: values.accentColor }}
        projectName={values.name}
        dictionary={{
          title: dictionary.appearanceTitle,
          namePlaceholder: dictionary.name,
          projectIcon: dictionary.projectIcon,
          accentColor: dictionary.accentColor,
          previewTitle: dictionary.previewTitle,
        }}
        onChange={onChange}
      />

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

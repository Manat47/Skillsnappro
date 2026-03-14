"use client";

import { FormEvent, useEffect, useState } from "react";
import { ProjectFormValues, ProjectStatus } from "./project-types";

const VISIBILITY_OPTIONS: Array<{ value: ProjectFormValues["visibility"]; label: string }> = [
  { value: "PUBLIC", label: "Public" },
  { value: "UNLISTED", label: "Unlisted" },
  { value: "PRIVATE", label: "Private" },
];

type ProjectFormProps = {
  initialValues: ProjectFormValues;
  onSubmit: (values: ProjectFormValues) => void | Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  status?: ProjectStatus;
};

export default function ProjectForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  readOnly = false,
  status,
}: ProjectFormProps) {
  const [form, setForm] = useState<ProjectFormValues>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  function handleFieldChange<K extends keyof ProjectFormValues>(
    field: K,
    value: ProjectFormValues[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      title: form.title.trim(),
      short_description: form.short_description.trim(),
      description: form.description.trim(),
      cover_image_url: form.cover_image_url.trim(),
      visibility: form.visibility,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {status ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Status</p>
          <p className="mt-1 text-sm text-slate-600">{status}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="project-title">
            Title
          </label>
          <input
            id="project-title"
            type="text"
            required
            maxLength={120}
            value={form.title}
            readOnly={readOnly}
            onChange={(event) => handleFieldChange("title", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            placeholder="Project title"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="project-visibility">
            Visibility
          </label>
          <select
            id="project-visibility"
            value={form.visibility}
            disabled={readOnly}
            onChange={(event) =>
              handleFieldChange("visibility", event.target.value as ProjectFormValues["visibility"])
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 disabled:bg-slate-100"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="project-short-description">
          Short description
        </label>
        <input
          id="project-short-description"
          type="text"
          maxLength={200}
          value={form.short_description}
          readOnly={readOnly}
          onChange={(event) => handleFieldChange("short_description", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="One-line summary"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="project-description">
          Description
        </label>
        <textarea
          id="project-description"
          rows={7}
          maxLength={5000}
          value={form.description}
          readOnly={readOnly}
          onChange={(event) => handleFieldChange("description", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="Explain what the project does and what you built."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="project-cover-image">
          Cover image URL
        </label>
        <input
          id="project-cover-image"
          type="url"
          value={form.cover_image_url}
          readOnly={readOnly}
          onChange={(event) => handleFieldChange("cover_image_url", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="https://example.com/cover.jpg"
        />
      </div>

      {!readOnly ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-w-32 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      ) : null}
    </form>
  );
}

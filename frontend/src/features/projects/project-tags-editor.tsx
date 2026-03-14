"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { getProjectErrorMessage } from "./get-project-error-message";
import { ProjectTag } from "./project-types";

type ProjectTagsEditorProps = {
  projectId: number;
  readOnly: boolean;
};

type UpdateProjectTagsResponse = ProjectTag[];

export default function ProjectTagsEditor({ projectId, readOnly }: ProjectTagsEditorProps) {
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadTags() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await api.get<ProjectTag[]>(`/projects/${projectId}/tags`);
        setTags(response.data);
        setTagInput(response.data.map((tag) => tag.name).join(", "));
      } catch (error) {
        setLoadError(getProjectErrorMessage(error, "Unable to load project tags right now."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadTags();
  }, [projectId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedTagNames = Array.from(
      new Set(
        tagInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );

    if (parsedTagNames.length === 0) {
      setSaveError("At least one tag is required.");
      setSuccessMessage(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const response = await api.put<UpdateProjectTagsResponse>(`/projects/${projectId}/tags`, {
        tagNames: parsedTagNames,
      });

      setTags(response.data);
      setTagInput(response.data.map((tag) => tag.name).join(", "));
      setSuccessMessage("Project tags updated successfully.");
    } catch (error) {
      setSaveError(getProjectErrorMessage(error, "Unable to save project tags right now."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Loading project tags...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Project tags</h3>
        <p className="mt-1 text-sm text-slate-600">
          Edit the complete tag list as comma-separated values. Saving replaces the full set.
        </p>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}

      {readOnly ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {tagInput || "No tags on this project yet."}
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="project-tags">
              Tags
            </label>
            <textarea
              id="project-tags"
              rows={4}
              value={tagInput}
              onChange={(event) => {
                setTagInput(event.target.value);
                setSaveError(null);
                setSuccessMessage(null);
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              placeholder="react, nextjs, portfolio"
            />
          </div>

          {saveError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {saveError}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-w-32 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Saving..." : "Save tags"}
          </button>
        </form>
      )}
    </div>
  );
}

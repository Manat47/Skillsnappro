"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { getProjectErrorMessage } from "./get-project-error-message";
import { ProjectMedia, ProjectMediaType } from "./project-types";

type ProjectMediaManagerProps = {
  projectId: number;
  readOnly: boolean;
};

type CreateMediaPayload = {
  type: ProjectMediaType;
  url: string;
  title?: string;
  description?: string;
  order?: number;
};

type UpdateMediaPayload = {
  url?: string;
  title?: string;
  description?: string;
  order?: number;
};

type MediaFormState = {
  type: ProjectMediaType;
  url: string;
  title: string;
  description: string;
  order: string;
};

const MEDIA_TYPE_OPTIONS: Array<{ value: ProjectMediaType; label: string }> = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "LINK", label: "Link" },
  { value: "FILE", label: "File" },
];

const EMPTY_CREATE_FORM: MediaFormState = {
  type: "IMAGE",
  url: "",
  title: "",
  description: "",
  order: "",
};

function createEditFormState(media: ProjectMedia): MediaFormState {
  return {
    type: media.type,
    url: media.url ?? "",
    title: media.title ?? "",
    description: media.description ?? "",
    order: media.order?.toString() ?? "",
  };
}

export default function ProjectMediaManager({
  projectId,
  readOnly,
}: ProjectMediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<ProjectMedia[]>([]);
  const [createForm, setCreateForm] = useState<MediaFormState>(EMPTY_CREATE_FORM);
  const [editForms, setEditForms] = useState<Record<number, MediaFormState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingMediaId, setSavingMediaId] = useState<number | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadMedia() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await api.get<ProjectMedia[]>(`/projects/${projectId}/media`);
        setMediaItems(response.data);
        setEditForms(
          Object.fromEntries(
            response.data.map((media) => [media.id, createEditFormState(media)]),
          ),
        );
      } catch (error) {
        setLoadError(getProjectErrorMessage(error, "Unable to load project media right now."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadMedia();
  }, [projectId]);

  function updateCreateForm<K extends keyof MediaFormState>(field: K, value: MediaFormState[K]) {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));
    setActionError(null);
    setSuccessMessage(null);
  }

  function updateEditForm(
    mediaId: number,
    field: keyof Omit<MediaFormState, "type">,
    value: string,
  ) {
    setEditForms((current) => ({
      ...current,
      [mediaId]: {
        ...current[mediaId],
        [field]: value,
      },
    }));
    setActionError(null);
    setSuccessMessage(null);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const payload: CreateMediaPayload = {
        type: createForm.type,
        url: createForm.url.trim(),
        ...(createForm.title.trim() ? { title: createForm.title.trim() } : {}),
        ...(createForm.description.trim()
          ? { description: createForm.description.trim() }
          : {}),
        ...(createForm.order.trim() ? { order: Number(createForm.order) } : {}),
      };

      await api.post<ProjectMedia>(`/projects/${projectId}/media`, payload);

      const response = await api.get<ProjectMedia[]>(`/projects/${projectId}/media`);
      setMediaItems(response.data);
      setEditForms(
        Object.fromEntries(
          response.data.map((media) => [media.id, createEditFormState(media)]),
        ),
      );
      setCreateForm(EMPTY_CREATE_FORM);
      setSuccessMessage("Project media added successfully.");
    } catch (error) {
      setActionError(getProjectErrorMessage(error, "Unable to add project media right now."));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdate(mediaId: number, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentForm = editForms[mediaId];

    if (!currentForm) {
      return;
    }

    setSavingMediaId(mediaId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const payload: UpdateMediaPayload = {
        ...(currentForm.url.trim() ? { url: currentForm.url.trim() } : {}),
        ...(currentForm.title.trim() ? { title: currentForm.title.trim() } : {}),
        ...(currentForm.description.trim()
          ? { description: currentForm.description.trim() }
          : {}),
        ...(currentForm.order.trim() ? { order: Number(currentForm.order) } : {}),
      };

      await api.patch<ProjectMedia>(`/projects/${projectId}/media/${mediaId}`, payload);

      const response = await api.get<ProjectMedia[]>(`/projects/${projectId}/media`);
      setMediaItems(response.data);
      setEditForms(
        Object.fromEntries(
          response.data.map((media) => [media.id, createEditFormState(media)]),
        ),
      );
      setSuccessMessage("Project media updated successfully.");
    } catch (error) {
      setActionError(getProjectErrorMessage(error, "Unable to update project media right now."));
    } finally {
      setSavingMediaId(null);
    }
  }

  async function handleDelete(mediaId: number) {
    const confirmed = window.confirm("Delete this media item?");

    if (!confirmed) {
      return;
    }

    setDeletingMediaId(mediaId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await api.delete(`/projects/${projectId}/media/${mediaId}`);

      const response = await api.get<ProjectMedia[]>(`/projects/${projectId}/media`);
      setMediaItems(response.data);
      setEditForms(
        Object.fromEntries(
          response.data.map((media) => [media.id, createEditFormState(media)]),
        ),
      );
      setSuccessMessage("Project media deleted successfully.");
    } catch (error) {
      setActionError(getProjectErrorMessage(error, "Unable to delete project media right now."));
    } finally {
      setDeletingMediaId(null);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Project media</h3>
        <p className="mt-1 text-sm text-slate-600">
          Keep a simple list of media links for this project. This first version uses URL-based
          media only.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {loadError}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {!readOnly ? (
        <form className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleCreate}>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Add media</h4>
            <p className="mt-1 text-sm text-slate-600">
              URL must be a valid absolute URL. If order is left blank, backend default ordering is
              used.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="create-media-type">
                Type
              </label>
              <select
                id="create-media-type"
                value={createForm.type}
                onChange={(event) =>
                  updateCreateForm("type", event.target.value as ProjectMediaType)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              >
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="create-media-order">
                Order
              </label>
              <input
                id="create-media-order"
                type="number"
                value={createForm.order}
                onChange={(event) => updateCreateForm("order", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="create-media-url">
              URL
            </label>
            <input
              id="create-media-url"
              type="url"
              required
              value={createForm.url}
              onChange={(event) => updateCreateForm("url", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              placeholder="https://example.com/resource"
            />
            <p className="text-xs text-slate-500">Must be a valid URL accepted by backend validation.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="create-media-title">
                Title
              </label>
              <input
                id="create-media-title"
                type="text"
                value={createForm.title}
                onChange={(event) => updateCreateForm("title", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="Optional title"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="create-media-description">
                Description
              </label>
              <input
                id="create-media-description"
                type="text"
                value={createForm.description}
                onChange={(event) => updateCreateForm("description", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="Optional description"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex min-w-32 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isCreating ? "Adding..." : "Add media"}
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You can view media items, but only the project owner can manage them.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Loading project media...
        </div>
      ) : null}

      {!isLoading && mediaItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          No media items have been added to this project yet.
        </div>
      ) : null}

      {!isLoading && mediaItems.length > 0 ? (
        <div className="grid gap-4">
          {mediaItems.map((media) => {
            const editForm = editForms[media.id] ?? createEditFormState(media);

            return (
              <article
                key={media.id}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {media.title || media.type}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{media.type}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">order {media.order}</span>
                    </div>
                  </div>
                  {readOnly ? null : (
                    <button
                      type="button"
                      onClick={() => handleDelete(media.id)}
                      disabled={deletingMediaId === media.id}
                      className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingMediaId === media.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>

                <p className="break-all text-sm text-slate-600">{media.url}</p>
                {media.description ? (
                  <p className="text-sm text-slate-600">{media.description}</p>
                ) : null}

                {readOnly ? null : (
                  <form className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4" onSubmit={(event) => handleUpdate(media.id, event)}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Type
                        </label>
                        <input
                          type="text"
                          value={media.type}
                          readOnly
                          className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className="block text-sm font-medium text-slate-700"
                          htmlFor={`media-order-${media.id}`}
                        >
                          Order
                        </label>
                        <input
                          id={`media-order-${media.id}`}
                          type="number"
                          value={editForm.order}
                          onChange={(event) => updateEditForm(media.id, "order", event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium text-slate-700"
                        htmlFor={`media-url-${media.id}`}
                      >
                        URL
                      </label>
                      <input
                        id={`media-url-${media.id}`}
                        type="url"
                        value={editForm.url}
                        onChange={(event) => updateEditForm(media.id, "url", event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                        placeholder="https://example.com/resource"
                      />
                      <p className="text-xs text-slate-500">
                        Must be a valid URL accepted by backend validation.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          className="block text-sm font-medium text-slate-700"
                          htmlFor={`media-title-${media.id}`}
                        >
                          Title
                        </label>
                        <input
                          id={`media-title-${media.id}`}
                          type="text"
                          value={editForm.title}
                          onChange={(event) => updateEditForm(media.id, "title", event.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                          placeholder="Optional title"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          className="block text-sm font-medium text-slate-700"
                          htmlFor={`media-description-${media.id}`}
                        >
                          Description
                        </label>
                        <input
                          id={`media-description-${media.id}`}
                          type="text"
                          value={editForm.description}
                          onChange={(event) =>
                            updateEditForm(media.id, "description", event.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                          placeholder="Optional description"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingMediaId === media.id}
                      className="inline-flex min-w-32 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {savingMediaId === media.id ? "Saving..." : "Save media"}
                    </button>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

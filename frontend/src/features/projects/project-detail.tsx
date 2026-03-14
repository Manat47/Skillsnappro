"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import ProjectForm from "./project-form";
import ProjectMediaManager from "./project-media-manager";
import ProjectMembersManager from "./project-members-manager";
import ProjectTagsEditor from "./project-tags-editor";
import {
  createEmptyProjectFormValues,
  CurrentUser,
  ProjectDetail as ProjectDetailType,
  ProjectFormValues,
  ProjectMutationResponse,
  toProjectFormValues,
} from "./project-types";
import { getProjectErrorMessage } from "./get-project-error-message";

type ProjectDetailProps = {
  projectId: string;
};

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetailType | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProject() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [authResponse, projectResponse] = await Promise.all([
          api.get<CurrentUser>("/auth/me"),
          api.get<ProjectDetailType>(`/projects/${projectId}`),
        ]);

        setCurrentUser(authResponse.data);
        setProject(projectResponse.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        setLoadError(getProjectErrorMessage(error, "Unable to load this project right now."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProject();
  }, [projectId, router]);

  const isOwner = useMemo(() => {
    if (!project || !currentUser) {
      return false;
    }

    return project.ownerId === currentUser.userId;
  }, [currentUser, project]);

  async function handleUpdate(values: ProjectFormValues) {
    if (!project || !isOwner) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title: values.title || undefined,
        short_description: values.short_description || undefined,
        description: values.description || undefined,
        cover_image_url: values.cover_image_url || undefined,
        visibility: values.visibility,
      };

      const response = await api.patch<ProjectMutationResponse>(`/projects/${project.id}`, payload);
      setProject((current) =>
        current
          ? {
              ...current,
              ...response.data,
            }
          : current,
      );
      setSuccessMessage("Project updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setSaveError(getProjectErrorMessage(error, "Unable to update this project right now."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!project || !isOwner) {
      return;
    }

    const confirmed = window.confirm("Delete this project?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      await api.delete(`/projects/${project.id}`);
      router.push("/me/projects");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setSaveError(getProjectErrorMessage(error, "Unable to delete this project right now."));
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Loading project details...
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
        {loadError || "Project not found."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-slate-900">Created</p>
          <p className="mt-1 text-sm text-slate-600">
            {new Date(project.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">Last updated</p>
          <p className="mt-1 text-sm text-slate-600">
            {new Date(project.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      {!isOwner ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          You can view this project, but only the owner can edit or delete it.
        </div>
      ) : null}

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

      <ProjectForm
        initialValues={project ? toProjectFormValues(project) : createEmptyProjectFormValues()}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
        isSubmitting={isSaving}
        readOnly={!isOwner}
        status={project.status}
      />

      <ProjectTagsEditor projectId={project.id} readOnly={!isOwner} />
      <ProjectMembersManager projectId={project.id} readOnly={!isOwner} />
      <ProjectMediaManager projectId={project.id} readOnly={!isOwner} />

      {isOwner ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex min-w-32 items-center justify-center rounded-lg border border-rose-300 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete project"}
        </button>
      ) : null}
    </div>
  );
}

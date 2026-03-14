"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import ProjectForm from "./project-form";
import {
  createEmptyProjectFormValues,
  ProjectFormValues,
  ProjectMutationResponse,
  ProjectSummary,
} from "./project-types";
import { getProjectErrorMessage } from "./get-project-error-message";

export default function ProjectsManager() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [createFormValues, setCreateFormValues] = useState(createEmptyProjectFormValues());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProjects() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await api.get<ProjectSummary[]>("/projects/me");
        setProjects(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        setLoadError(getProjectErrorMessage(error, "Unable to load your projects right now."));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjects();
  }, [router]);

  async function handleCreate(values: ProjectFormValues) {
    setIsCreating(true);
    setCreateError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title: values.title,
        short_description: values.short_description || undefined,
        description: values.description || undefined,
        cover_image_url: values.cover_image_url || undefined,
        visibility: values.visibility,
      };

      await api.post<ProjectMutationResponse>("/projects", payload);
      setCreateFormValues(createEmptyProjectFormValues());
      setSuccessMessage("Project created successfully.");

      const response = await api.get<ProjectSummary[]>("/projects/me");
      setProjects(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setCreateError(getProjectErrorMessage(error, "Unable to create your project right now."));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(projectId: number) {
    const confirmed = window.confirm("Delete this project?");

    if (!confirmed) {
      return;
    }

    setDeletingProjectId(projectId);
    setCreateError(null);
    setSuccessMessage(null);

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((current) => current.filter((project) => project.id !== projectId));
      setSuccessMessage("Project deleted successfully.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setCreateError(getProjectErrorMessage(error, "Unable to delete this project right now."));
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Create project</h3>
          <p className="mt-1 text-sm text-slate-600">
            Add a new project to your portfolio using the main CRUD endpoint.
          </p>
        </div>

        {createError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {createError}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <ProjectForm
          initialValues={createFormValues}
          onSubmit={handleCreate}
          submitLabel="Create project"
          isSubmitting={isCreating}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">My project list</h3>
          <p className="mt-1 text-sm text-slate-600">
            Review your existing projects and open the detail page to edit them.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Loading your projects...
          </div>
        ) : null}

        {loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        {!isLoading && !loadError && projects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            You have not created any projects yet.
          </div>
        ) : null}

        {!isLoading && !loadError ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-slate-900">{project.title}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{project.visibility}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{project.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open detail
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingProjectId === project.id}
                      className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  {project.short_description || "No short description yet."}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

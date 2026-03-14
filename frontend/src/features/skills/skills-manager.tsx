"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAccessToken, getAccessToken } from "@/lib/auth";

type Skill = {
  id: number;
  name: string;
};

type ReplaceSkillsResponse = {
  message: string;
  skills: Skill[];
};

export default function SkillsManager() {
  const router = useRouter();
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadSkills() {
      try {
        const [masterResponse, currentResponse] = await Promise.all([
          api.get<Skill[]>("/skills"),
          api.get<Skill[]>("/profile/me/skills"),
        ]);

        setMasterSkills(masterResponse.data);
        setSelectedSkillIds(currentResponse.data.map((skill) => skill.id));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        setLoadError(getSkillsErrorMessage(error, "Unable to load skills right now."));
      } finally {
        setIsLoading(false);
      }
    }

    loadSkills();
  }, [router]);

  function toggleSkill(skillId: number) {
    setSelectedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId].sort((left, right) => left - right),
    );
    setSaveError(null);
    setSuccessMessage(null);
  }

  function clearAllSkills() {
    setSelectedSkillIds([]);
    setSaveError(null);
    setSuccessMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const response = await api.put<ReplaceSkillsResponse>("/profile/me/skills", {
        skillIds: selectedSkillIds,
      });

      setSelectedSkillIds(response.data.skills.map((skill) => skill.id));
      setSuccessMessage(response.data.message || "Skills updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setSaveError(getSkillsErrorMessage(error, "Unable to save your skills right now."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Loading your skills...
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Selected skills</p>
          <p className="mt-1 text-sm text-slate-600">
            {selectedSkillIds.length} of {masterSkills.length} chosen
          </p>
        </div>
        <button
          type="button"
          onClick={clearAllSkills}
          disabled={isSaving || selectedSkillIds.length === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

      {masterSkills.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          No skills are available in the master list yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {masterSkills.map((skill) => {
            const checked = selectedSkillIds.includes(skill.id);

            return (
              <label
                key={skill.id}
                htmlFor={`skill-${skill.id}`}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  checked
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                <input
                  id={`skill-${skill.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSkill(skill.id)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium">{skill.name}</span>
              </label>
            );
          })}
        </div>
      )}

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
        {isSaving ? "Saving..." : "Save skills"}
      </button>
    </form>
  );
}

function getSkillsErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(", ");
    }
  }

  return fallback;
}

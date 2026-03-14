"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearAccessToken, getAccessToken } from "@/lib/auth";

type Profile = {
  id: number;
  full_name: string;
  bio: string | null;
  avatar_url: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
};

type UpdateProfileResponse = {
  message: string;
  profile: Profile;
};

type FormState = {
  full_name: string;
  bio: string;
  avatar_url: string;
  visibility: Profile["visibility"];
};

const INITIAL_FORM_STATE: FormState = {
  full_name: "",
  bio: "",
  avatar_url: "",
  visibility: "PUBLIC",
};

const VISIBILITY_OPTIONS: Array<{ value: Profile["visibility"]; label: string }> = [
  { value: "PUBLIC", label: "Public" },
  { value: "UNLISTED", label: "Unlisted" },
  { value: "PRIVATE", label: "Private" },
];

export default function ProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
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

    async function loadProfile() {
      try {
        const response = await api.get<Profile>("/profile/me");
        setForm({
          full_name: response.data.full_name ?? "",
          bio: response.data.bio ?? "",
          avatar_url: response.data.avatar_url ?? "",
          visibility: response.data.visibility,
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearAccessToken();
          router.replace("/login");
          return;
        }

        setLoadError(getProfileErrorMessage(error, "Unable to load your profile right now."));
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function handleFieldChange<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        bio: form.bio.trim() || undefined,
        avatar_url: form.avatar_url.trim() || undefined,
        visibility: form.visibility,
      };

      const response = await api.patch<UpdateProfileResponse>("/profile/me", payload);
      setForm({
        full_name: response.data.profile.full_name ?? "",
        bio: response.data.profile.bio ?? "",
        avatar_url: response.data.profile.avatar_url ?? "",
        visibility: response.data.profile.visibility,
      });
      setSuccessMessage(response.data.message || "Profile updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      setSaveError(getProfileErrorMessage(error, "Unable to save your profile right now."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Loading your profile...
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
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="profile-full-name">
            Full name
          </label>
          <input
            id="profile-full-name"
            type="text"
            required
            maxLength={120}
            value={form.full_name}
            onChange={(event) => handleFieldChange("full_name", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="profile-visibility">
            Visibility
          </label>
          <select
            id="profile-visibility"
            value={form.visibility}
            onChange={(event) =>
              handleFieldChange("visibility", event.target.value as FormState["visibility"])
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
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
        <label className="block text-sm font-medium text-slate-700" htmlFor="profile-avatar-url">
          Avatar URL
        </label>
        <input
          id="profile-avatar-url"
          type="url"
          value={form.avatar_url}
          onChange={(event) => handleFieldChange("avatar_url", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="profile-bio">
          Bio
        </label>
        <textarea
          id="profile-bio"
          rows={6}
          maxLength={500}
          value={form.bio}
          onChange={(event) => handleFieldChange("bio", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
          placeholder="Write a short introduction about yourself."
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
        {isSaving ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function getProfileErrorMessage(error: unknown, fallback: string) {
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

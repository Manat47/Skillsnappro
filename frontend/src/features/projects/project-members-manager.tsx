"use client";

import { FormEvent, useEffect, useState } from "react";
import api from "@/lib/api";
import { getProjectErrorMessage } from "./get-project-error-message";
import { ProjectMember, ProjectMemberRole } from "./project-types";

type ProjectMembersManagerProps = {
  projectId: number;
  readOnly: boolean;
};

type AddMemberResponse = {
  message: string;
  userId: number;
};

type UpdateMemberRoleResponse = {
  message: string;
  userId: number;
  role: ProjectMemberRole;
};

type RemoveMemberResponse = {
  message: string;
  userId: number;
};

const EDITABLE_MEMBER_ROLES: Array<{ value: ProjectMemberRole; label: string }> = [
  { value: "MAINTAINER", label: "Maintainer" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

const FRIENDLY_BACKEND_ERRORS: Record<string, string> = {
  "User not found": "No user exists with that userId.",
  "User is already a member": "That user is already a member of this project.",
  "Owner is already the owner": "The project owner cannot be added as a member.",
  "Member not found": "That member was not found on this project.",
  "Cannot remove owner": "The project owner cannot be removed from the member list.",
  "Not your project": "Only the project owner can manage members.",
};

export default function ProjectMembersManager({
  projectId,
  readOnly,
}: ProjectMembersManagerProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [userIdInput, setUserIdInput] = useState("");
  const [roleInput, setRoleInput] = useState<ProjectMemberRole>("MEMBER");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [changingMemberId, setChangingMemberId] = useState<number | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
        setMembers(response.data);
      } catch (error) {
        setLoadError(
          getFriendlyProjectMemberError(error, "Unable to load project members right now."),
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMembers();
  }, [projectId]);

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedUserId = Number(userIdInput);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setActionError("Enter a valid numeric userId.");
      setSuccessMessage(null);
      return;
    }

    setIsAdding(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await api.post<AddMemberResponse>(`/projects/${projectId}/members`, {
        userId: parsedUserId,
        role: roleInput,
      });

      setUserIdInput("");
      setRoleInput("MEMBER");
      setSuccessMessage(response.data.message || "Member added successfully.");

      const membersResponse = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
      setMembers(membersResponse.data);
    } catch (error) {
      setActionError(getFriendlyProjectMemberError(error, "Unable to add this member right now."));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRoleChange(memberUserId: number, role: ProjectMemberRole) {
    setChangingMemberId(memberUserId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await api.patch<UpdateMemberRoleResponse>(
        `/projects/${projectId}/members/${memberUserId}`,
        { role },
      );

      setMembers((current) =>
        current.map((member) =>
          member.user.id === memberUserId ? { ...member, role: response.data.role } : member,
        ),
      );
      setSuccessMessage(response.data.message || "Member role updated successfully.");
    } catch (error) {
      setActionError(getFriendlyProjectMemberError(error, "Unable to update this member right now."));
    } finally {
      setChangingMemberId(null);
    }
  }

  async function handleRemoveMember(memberUserId: number) {
    const confirmed = window.confirm("Remove this member from the project?");

    if (!confirmed) {
      return;
    }

    setRemovingMemberId(memberUserId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const response = await api.delete<RemoveMemberResponse>(
        `/projects/${projectId}/members/${memberUserId}`,
      );

      setMembers((current) => current.filter((member) => member.user.id !== memberUserId));
      setSuccessMessage(response.data.message || "Member removed successfully.");
    } catch (error) {
      setActionError(getFriendlyProjectMemberError(error, "Unable to remove this member right now."));
    } finally {
      setRemovingMemberId(null);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Project members</h3>
        <p className="mt-1 text-sm text-slate-600">
          Manage project members through userId in this first version. Search and invite flows are
          not available yet.
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
        <form className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_14rem_auto]" onSubmit={handleAddMember}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="project-member-user-id">
              Member userId
            </label>
            <input
              id="project-member-user-id"
              type="number"
              min={1}
              inputMode="numeric"
              value={userIdInput}
              onChange={(event) => setUserIdInput(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
              placeholder="123"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="project-member-role">
              Role
            </label>
            <select
              id="project-member-role"
              value={roleInput}
              onChange={(event) => setRoleInput(event.target.value as ProjectMemberRole)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            >
              {EDITABLE_MEMBER_ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAdding}
              className="inline-flex min-w-32 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isAdding ? "Adding..." : "Add member"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You can view the member list, but only the project owner can manage members.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Loading project members...
        </div>
      ) : null}

      {!isLoading && members.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          No members have been added to this project yet.
        </div>
      ) : null}

      {!isLoading && members.length > 0 ? (
        <div className="grid gap-3">
          {members.map((member) => (
            <article
              key={member.user.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{member.user.email}</p>
                  <p className="text-xs text-slate-500">userId: {member.user.id}</p>
                  <p className="text-xs text-slate-500">
                    Joined: {new Date(member.joinedAt).toLocaleString()}
                  </p>
                </div>

                {readOnly ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {member.role}
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={member.role}
                      disabled={changingMemberId === member.user.id}
                      onChange={(event) =>
                        handleRoleChange(member.user.id, event.target.value as ProjectMemberRole)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 disabled:bg-slate-100"
                    >
                      {EDITABLE_MEMBER_ROLES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={removingMemberId === member.user.id}
                      className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingMemberId === member.user.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getFriendlyProjectMemberError(error: unknown, fallback: string) {
  const message = getProjectErrorMessage(error, fallback);
  return FRIENDLY_BACKEND_ERRORS[message] || message;
}

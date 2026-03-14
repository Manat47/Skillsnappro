export type ProjectVisibility = "PUBLIC" | "PRIVATE" | "UNLISTED";
export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED";

export type ProjectSummary = {
  id: number;
  title: string;
  short_description: string | null;
  cover_image_url: string | null;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = {
  id: number;
  ownerId: number;
  title: string;
  short_description: string | null;
  description: string | null;
  cover_image_url: string | null;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMutationResponse = {
  id: number;
  title: string;
  short_description: string | null;
  description: string | null;
  cover_image_url: string | null;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectFormValues = {
  title: string;
  short_description: string;
  description: string;
  cover_image_url: string;
  visibility: ProjectVisibility;
};

export type CurrentUser = {
  userId: number;
  email: string;
  role: string;
};

export type ProjectTag = {
  id: number;
  name: string;
  deletedAt: string | null;
};

export type ProjectMemberRole = "OWNER" | "MAINTAINER" | "MEMBER" | "VIEWER";

export type ProjectMember = {
  role: ProjectMemberRole;
  joinedAt: string;
  user: {
    id: number;
    email: string;
  };
};

export type ProjectMediaType = "IMAGE" | "VIDEO" | "LINK" | "FILE";

export type ProjectMedia = {
  id: number;
  type: ProjectMediaType;
  url: string;
  title: string | null;
  description: string | null;
  order: number;
  projectId: number;
  deletedAt: string | null;
};

export function createEmptyProjectFormValues(): ProjectFormValues {
  return {
    title: "",
    short_description: "",
    description: "",
    cover_image_url: "",
    visibility: "PUBLIC",
  };
}

export function toProjectFormValues(project: ProjectDetail): ProjectFormValues {
  return {
    title: project.title ?? "",
    short_description: project.short_description ?? "",
    description: project.description ?? "",
    cover_image_url: project.cover_image_url ?? "",
    visibility: project.visibility,
  };
}

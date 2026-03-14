import AppShell from "@/components/layout/app-shell";
import ProjectDetail from "@/features/projects/project-detail";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  return (
    <AppShell
      title="Project Detail"
      description="Review a single project, update it if you are the owner, or keep it read-only if you are not."
    >
      <ProjectDetail projectId={id} />
    </AppShell>
  );
}

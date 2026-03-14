import AppShell from "@/components/layout/app-shell";
import ProjectsManager from "@/features/projects/projects-manager";

export default function MyProjectsPage() {
  return (
    <AppShell
      title="My Projects"
      description="Create projects, review your current list, and open each detail page to edit."
    >
      <ProjectsManager />
    </AppShell>
  );
}

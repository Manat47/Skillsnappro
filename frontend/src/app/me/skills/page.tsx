import AppShell from "@/components/layout/app-shell";
import SkillsManager from "@/features/skills/skills-manager";

export default function MySkillsPage() {
  return (
    <AppShell
      title="My Skills"
      description="Choose the skills you want to show on your profile and replace the full set when saving."
    >
      <SkillsManager />
    </AppShell>
  );
}

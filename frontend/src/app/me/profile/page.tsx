import AppShell from "@/components/layout/app-shell";
import ProfileForm from "@/features/profile/profile-form";

export default function MyProfilePage() {
  return (
    <AppShell
      title="My Profile"
      description="View and update the profile data stored in your SkillSnapPro account."
    >
      <ProfileForm />
    </AppShell>
  );
}

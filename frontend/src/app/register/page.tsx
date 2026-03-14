import AppShell from "@/components/layout/app-shell";
import RegisterForm from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <AppShell
      title="Register"
      description="Create your SkillSnapPro account using the backend auth API."
    >
      <RegisterForm />
    </AppShell>
  );
}

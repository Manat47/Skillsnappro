import AppShell from "@/components/layout/app-shell";
import LoginForm from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AppShell
      title="Login"
      description="Sign in with your SkillSnapPro account to continue to your profile."
    >
      <LoginForm />
    </AppShell>
  );
}

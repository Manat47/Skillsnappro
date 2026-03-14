import Link from "next/link";
import { ReactNode } from "react";

type AppShellProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

const NAV_ITEMS = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/me/profile", label: "My Profile" },
  { href: "/me/skills", label: "My Skills" },
  { href: "/me/projects", label: "My Projects" },
];

export default function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4">
          <h1 className="text-xl font-semibold">SkillSnapPro</h1>
          <nav className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </main>
    </div>
  );
}

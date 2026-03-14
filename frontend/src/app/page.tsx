import Link from "next/link";
import AppShell from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell
      title="Frontend Scaffold Ready"
      description="Phase FE-1 is set up. Use the routes below to continue implementation."
    >
      <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
        <li>
          <Link href="/login" className="text-blue-700 hover:underline">
            /login
          </Link>
        </li>
        <li>
          <Link href="/register" className="text-blue-700 hover:underline">
            /register
          </Link>
        </li>
        <li>
          <Link href="/me/profile" className="text-blue-700 hover:underline">
            /me/profile
          </Link>
        </li>
        <li>
          <Link href="/me/skills" className="text-blue-700 hover:underline">
            /me/skills
          </Link>
        </li>
        <li>
          <Link href="/me/projects" className="text-blue-700 hover:underline">
            /me/projects
          </Link>
        </li>
      </ul>
    </AppShell>
  );
}

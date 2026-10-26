"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { DeployWizard } from "@/components/DeployWizard";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d12] text-sm text-zinc-500">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d12]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
      {can(user.role, "deploy") ? <DeployWizard /> : null}
    </div>
  );
}

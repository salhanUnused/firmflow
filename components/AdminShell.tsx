"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/admin");
      return;
    }
    if (!user.platformAdmin) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  if (!ready || !user?.platformAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d12] text-sm text-zinc-500">
        Loading console…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d12]">
      {open ? (
        <button
          className="fixed inset-0 z-30 bg-black/65 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(20rem,86vw)] flex-col border-r border-white/10 bg-[#0e1118] px-4 py-4 transition-transform duration-200 lg:static lg:w-60 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Logo href="/admin/dashboard" size={34} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-6 px-2 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          Platform console
        </p>
        <nav className="mt-2 flex-1 space-y-0.5">
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm",
              pathname.startsWith("/admin")
                ? "bg-white/8 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <LayoutDashboard size={16} />
            Overview
          </Link>
        </nav>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate px-2 text-sm text-white">{user.fullName}</p>
          <p className="truncate px-2 text-xs text-zinc-500">{user.email}</p>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            Workspace
          </Link>
          <button
            onClick={() => {
              void signOut().then(() => {
                window.location.href = "/admin";
              });
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d12]/92 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-white lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-medium tracking-tight text-white sm:text-lg">
                {title}
              </h1>
              {subtitle ? (
                <p className="truncate text-xs text-zinc-500 sm:text-sm">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

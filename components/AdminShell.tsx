"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MenuToggleIcon } from "@/components/MobileNav";
import { ScreenLoader } from "@/components/ScreenLoader";
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready || !user?.platformAdmin) {
    return <ScreenLoader label="Loading console…" />;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0d12]">
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-[#05060a]/80 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-label="Close menu"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(20.5rem,86vw)] flex-col border-r border-white/10 bg-[#0e1118] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:pt-4",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Logo href="/admin/dashboard" size={34} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <MenuToggleIcon open />
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
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d12]">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-white lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <MenuToggleIcon open={open} />
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

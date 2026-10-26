"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Cpu,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Radio,
  Rocket,
  ScrollText,
  Settings,
  Users,
  CircuitBoard,
  Shield,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { MenuToggleIcon } from "@/components/MobileNav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useFleet } from "@/lib/store";
import { can } from "@/lib/roles";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, action: "viewFleet" as const },
  { href: "/projects", label: "Projects", icon: FolderKanban, action: "viewFleet" as const },
  { href: "/devices", label: "Devices", icon: Radio, action: "viewFleet" as const },
  { href: "/firmware", label: "Firmware", icon: Cpu, action: "viewFleet" as const },
  { href: "/deployments", label: "Deployments", icon: Rocket, action: "viewFleet" as const },
  { href: "/telemetry", label: "Telemetry", icon: Activity, action: "viewFleet" as const },
  { href: "/logs", label: "Logs", icon: ScrollText, action: "viewFleet" as const },
  { href: "/alerts", label: "Alerts", icon: Bell, action: "viewFleet" as const },
  { href: "/audit", label: "Audit", icon: FileText, action: "viewAudit" as const },
  { href: "/team", label: "Team", icon: Users, action: "manageTeam" as const },
  { href: "/billing", label: "Billing", icon: CreditCard, action: "manageBilling" as const },
  { href: "/hardware", label: "ESP32", icon: CircuitBoard, action: "viewFleet" as const },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { org } = useFleet();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-[#05060a]/80 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(20.5rem,86vw)] flex-col border-r border-white/10 bg-[#0e1118] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:static lg:z-auto lg:w-60 lg:translate-x-0 lg:pt-4",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Logo href="/dashboard" size={34} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <MenuToggleIcon open />
          </button>
        </div>
        <p className="mt-6 truncate px-2 text-[11px] text-zinc-500">
          {org?.name ?? user?.orgName} · {org?.plan ?? user?.plan}
        </p>
        <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto pb-4">
          {nav
            .filter((item) => can(user?.role, item.action))
            .map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-white/8 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t border-white/10 pt-4">
          {user ? (
            <div className="mb-3 px-2">
              <p className="truncate text-sm text-white">{user.fullName}</p>
              <p className="truncate text-xs capitalize text-zinc-500">
                {user.role} · {user.title}
              </p>
            </div>
          ) : null}
          {user?.platformAdmin ? (
            <Link
              href="/admin/dashboard"
              onClick={onClose}
              className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <Shield size={16} />
              Platform
            </Link>
          ) : null}
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm",
              pathname === "/settings"
                ? "bg-white/8 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <Settings size={16} />
            Settings
          </Link>
          <button
            onClick={() => {
              onClose();
              void signOut().then(() => {
                window.location.href = "/";
              });
            }}
            className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

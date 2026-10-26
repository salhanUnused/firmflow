"use client";

import { Menu, Rocket } from "lucide-react";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export function Topbar({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle?: string;
  onMenu: () => void;
}) {
  const { openWizard } = useFleet();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d12]/92 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 text-white lg:hidden"
            onClick={onMenu}
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
        <div className="flex items-center gap-2">
          {user ? (
            <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[11px] capitalize text-zinc-400 sm:inline">
              {user.role}
            </span>
          ) : null}
          {can(user?.role, "deploy") ? (
            <Button
              className="h-10 px-3 text-xs sm:h-9 sm:text-sm"
              onClick={() => openWizard()}
            >
              <Rocket size={14} />
              <span className="hidden xs:inline sm:inline">OTA</span>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

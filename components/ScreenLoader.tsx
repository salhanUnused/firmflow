"use client";

import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function ScreenLoader({
  label = "Loading FirmFlow…",
  overlay = false,
}: {
  label?: string;
  overlay?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-5 bg-[#0b0d12]",
        overlay ? "fixed inset-0 z-[80]" : "min-h-screen w-full",
      )}
    >
      <span className="flex items-center gap-2.5">
        <LogoMark size={36} />
        <span className="text-[15px] font-medium tracking-[-0.02em] text-white">
          FirmFlow
        </span>
      </span>
      <span className="ff-spinner" />
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}

export function RouteProgress() {
  return (
    <div
      className="ff-route-progress pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 overflow-hidden"
      aria-hidden
    >
      <div className="ff-route-progress-bar h-full w-1/3 bg-[#2f6dff]" />
    </div>
  );
}

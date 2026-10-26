"use client";

import { cn } from "@/lib/utils";

export function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-[18px]" aria-hidden>
      <span
        className={cn(
          "absolute left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "top-[6px] rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[6px] h-0.5 w-full rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-0.5 w-full rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "top-[6px] -rotate-45" : "top-[12px]",
        )}
      />
    </span>
  );
}

export function MobileDrawer({
  open,
  onClose,
  side = "right",
  hideFrom = "md",
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  hideFrom?: "md" | "lg";
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const hidden = hideFrom === "lg" ? "lg:hidden" : "md:hidden";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80]",
        hidden,
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[#05060a]/80 transition-opacity duration-300 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal={open}
        aria-labelledby={labelledBy}
        className={cn(
          "absolute inset-y-0 flex w-full max-w-[22rem] flex-col overflow-y-auto overscroll-contain border-white/10 bg-[#0e1118] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        {children}
      </div>
    </div>
  );
}

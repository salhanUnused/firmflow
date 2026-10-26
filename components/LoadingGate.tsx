"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RouteProgress, ScreenLoader } from "@/components/ScreenLoader";
import { useAuth } from "@/lib/auth";
import { subscribeLoading } from "@/lib/loading-bus";

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth();
  const pathname = usePathname();
  const [pending, setPending] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const skipFirstNav = useRef(true);

  useEffect(() => subscribeLoading(setPending), []);

  useEffect(() => {
    if (!ready) return;
    if (skipFirstNav.current) {
      skipFirstNav.current = false;
      return;
    }
    setNavigating(true);
    const timer = window.setTimeout(() => setNavigating(false), 450);
    return () => window.clearTimeout(timer);
  }, [pathname, ready]);

  const showBar = ready && (pending > 0 || navigating);

  return (
    <>
      {!ready ? <ScreenLoader overlay label="Restoring session…" /> : null}
      {showBar ? <RouteProgress /> : null}
      {children}
    </>
  );
}

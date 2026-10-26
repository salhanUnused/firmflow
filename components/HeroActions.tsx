"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function HeroActions() {
  const { user } = useAuth();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href={user ? "/dashboard" : "/signup"}
        className="inline-flex items-center rounded-md bg-[#2b5cff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3d6bff]"
      >
        {user ? "Open dashboard" : "Create account"}
      </Link>
      {user ? null : (
        <Link
          href="/login"
          className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}

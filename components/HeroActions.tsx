"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenLoader } from "@/components/ScreenLoader";
import { useAuth } from "@/lib/auth";

export function HeroActions() {
  const router = useRouter();
  const { user, signInDemo } = useAuth();
  const [busy, setBusy] = useState(false);

  const openDemo = async () => {
    setBusy(true);
    try {
      if (!user) await signInDemo("admin");
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {busy ? <ScreenLoader overlay label="Opening Helio Labs…" /> : null}
      <Link
        href={user ? "/dashboard" : "/signup"}
        className="inline-flex items-center rounded-md bg-[#2b5cff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3d6bff]"
      >
        {user ? "Open dashboard" : "Create account"}
      </Link>
      <button
        type="button"
        onClick={() => void openDemo()}
        className="inline-flex items-center rounded-md border border-white/15 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
      >
        View Helio Labs demo
      </button>
    </div>
  );
}

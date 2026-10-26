"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ScreenLoader } from "@/components/ScreenLoader";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user, signInDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const enterDemo = async () => {
    setBusy(true);
    try {
      await signInDemo("admin");
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d12]/90 backdrop-blur-md">
      {busy ? <ScreenLoader overlay label="Opening Helio Labs…" /> : null}
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size={38} />
        <nav className="hidden items-center gap-7 text-[13px] text-zinc-400 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-[#2b5cff] px-3.5 py-2 text-[13px] font-medium text-white"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-[13px] text-zinc-300 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#2b5cff] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#3d6bff]"
              >
                Create account
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col border-l border-white/10 bg-[#0e1118] px-6 pb-8 pt-5">
            <div className="mb-10 flex items-center justify-between">
              <Logo size={36} />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/8 py-4 text-2xl font-medium tracking-tight"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 grid gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#2b5cff] px-4 py-3 text-center text-sm font-medium"
                  onClick={() => setOpen(false)}
                >
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-md border border-white/12 px-4 py-3 text-center text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-[#2b5cff] px-4 py-3 text-center text-sm font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Create account
                  </Link>
                  <button
                    type="button"
                    className="py-2 text-sm text-zinc-400"
                    onClick={() => {
                      setOpen(false);
                      void enterDemo();
                    }}
                  >
                    Jump into the Helio Labs demo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

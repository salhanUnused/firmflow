"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MenuToggleIcon, MobileDrawer } from "@/components/MobileNav";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const titleId = useId();

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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d12]/90 backdrop-blur-md">
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
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
          >
            <MenuToggleIcon open={open} />
          </button>
        </div>
      </header>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        hideFrom="md"
        labelledBy={titleId}
      >
        <div id="site-mobile-nav" className="flex min-h-full flex-col px-5 py-5">
          <div className="flex items-center justify-between">
            <Logo size={36} />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-white"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <MenuToggleIcon open />
            </button>
          </div>
          <p id={titleId} className="absolute h-px w-px overflow-hidden opacity-0">
            Site menu
          </p>
          <nav className="mt-8 flex flex-1 flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/8 py-4 text-2xl font-medium tracking-tight text-white"
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
                  className="rounded-md border border-white/12 bg-white/[0.03] px-4 py-3 text-center text-sm"
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
              </>
            )}
          </div>
        </div>
      </MobileDrawer>
    </>
  );
}

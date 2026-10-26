import Link from "next/link";
import { Logo } from "@/components/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "#product", label: "Device inventory" },
      { href: "#features", label: "OTA updates" },
      { href: "#features", label: "Rollback" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/signup", label: "Get access" },
      { href: "/login", label: "Sign in" },
      { href: "mailto:hello@firmflow.io", label: "hello@firmflow.io" },
    ],
  },
  {
    title: "Docs",
    links: [
      { href: "#how-it-works", label: "Lifecycle" },
      { href: "/firmware", label: "Release channels" },
      { href: "/deployments", label: "Deployments" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#08090d]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo size={40} />
          <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-500">
            Firmware for the devices you already shipped. Built for small
            electronics teams who cannot staff a full OTA group.
          </p>
          <p className="mt-6 text-xs text-zinc-600">
            Helio Labs workspace · Bengaluru
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 FirmFlow. All rights reserved.</p>
          <p>No hardware in this demo. Updates are simulated.</p>
        </div>
      </div>
    </footer>
  );
}

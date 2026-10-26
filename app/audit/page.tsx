"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { formatTime } from "@/lib/utils";

export default function AuditPage() {
  const { audit } = useFleet();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !can(user.role, "viewAudit")) router.replace("/dashboard");
  }, [user, router]);

  if (!can(user?.role, "viewAudit")) return null;

  return (
    <AppShell
      title="Audit log"
      subtitle="Every sign-in, upload, live deploy, rollback and role change is recorded."
    >
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {audit.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 whitespace-nowrap text-zinc-400">
                  {formatTime(event.at)}
                </td>
                <td className="px-4 py-3 text-zinc-300">{event.actorEmail}</td>
                <td className="px-4 py-3 font-mono text-xs text-sky-200">{event.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{event.target}</td>
                <td className="px-4 py-3 text-zinc-300">{event.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

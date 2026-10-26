"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeploymentBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export default function DeploymentsPage() {
  const router = useRouter();
  const { deployments, openWizard } = useFleet();
  const { user } = useAuth();

  return (
    <AppShell
      title="Deployments"
      subtitle="Track firmware rollout progress and roll back if needed."
    >
      {can(user?.role, "deploy") ? (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => openWizard()}>
            Start OTA Update
          </Button>
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-white/8">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Firmware</th>
              <th className="px-4 py-3 font-medium">Devices</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Progress</th>
              <th className="px-4 py-3 font-medium">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {deployments.map((deployment) => (
              <tr
                key={deployment.id}
                className="cursor-pointer bg-white/[0.015] hover:bg-white/[0.04]"
                onClick={() => router.push(`/deployments/${deployment.id}`)}
              >
                <td className="px-4 py-3 font-mono text-sky-200">
                  {deployment.firmwareVersion}
                  {deployment.rollbackTo ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-violet-300">
                      rollback
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{deployment.deviceCount}</td>
                <td className="px-4 py-3">
                  <DeploymentBadge status={deployment.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="progress-bar h-full"
                        style={{ width: `${deployment.progress}%` }}
                      />
                    </div>
                    {deployment.progress}%
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  <Link href={`/deployments/${deployment.id}`}>
                    {formatTime(deployment.createdAt)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

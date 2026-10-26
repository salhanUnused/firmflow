"use client";

import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useFleet } from "@/lib/store";
import type { Deployment } from "@/types";

export function DeploymentProgress({ deployment }: { deployment: Deployment }) {
  const { devices } = useFleet();
  const isRollback = Boolean(deployment.rollbackTo);
  const complete = deployment.status === "completed";

  return (
    <div className="space-y-4">
      {deployment.deviceIds.map((id) => {
        const device = devices.find((item) => item.id === id);
        const value = deployment.deviceProgress[id] ?? deployment.progress;
        return (
          <div key={id} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">
                  {device?.name ?? id}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  {device?.deviceId} · {device?.platform}
                  {deployment.results[id]?.status
                    ? ` · ${deployment.results[id].status}`
                    : ""}
                  {deployment.results[id]?.error
                    ? ` · ${deployment.results[id].error}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {device ? <StatusBadge status={device.status} /> : null}
                <span className="font-mono text-sm text-sky-200">{value}%</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className={cn("h-full rounded-full transition-all duration-300", complete ? "bg-emerald-400" : "progress-bar")}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
      {isRollback ? (
        <p className="text-center text-xs text-violet-300">
          Restoring previous firmware {deployment.rollbackTo}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { Cpu, Radio, ShieldCheck } from "lucide-react";
import { ChannelBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui";
import { formatTime } from "@/lib/utils";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import type { FirmwareRelease } from "@/types";

export function FirmwareCard({ release }: { release: FirmwareRelease }) {
  const { openWizard } = useFleet();
  const { user } = useAuth();

  return (
    <article className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f6dff]/12 text-[#8fb4ff]">
            <Cpu size={18} />
          </span>
          <div>
            <h3 className="font-mono text-lg font-semibold text-white">
              {release.version}
            </h3>
            <p className="text-xs text-slate-500">{formatTime(release.createdAt)}</p>
          </div>
        </div>
        <ChannelBadge channel={release.channel} />
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">
        {release.description}
      </p>
      <dl className="mt-4 space-y-1.5 text-xs text-zinc-500">
        <div className="flex justify-between gap-3">
          <dt>Platforms</dt>
          <dd className="text-zinc-300">{release.platforms.join(", ")}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Min version</dt>
          <dd className="font-mono text-zinc-300">{release.minVersion}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Hardware</dt>
          <dd className="text-zinc-300">
            {release.hardwareRevisions.length ? release.hardwareRevisions.join(", ") : "any"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-1">
            <ShieldCheck size={12} /> SHA-256
          </dt>
          <dd className="max-w-[10rem] truncate font-mono text-zinc-300">
            {release.sha256}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Size</dt>
          <dd>{(release.size / 1024).toFixed(1)} KB</dd>
        </div>
      </dl>
      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
        <p className="flex items-center gap-1.5 text-sm text-slate-400">
          <Radio size={14} />
          {release.deviceCount} devices
        </p>
        {can(user?.role, "deploy") ? (
          <Button
            variant="secondary"
            className="h-9 px-3 text-xs"
            onClick={() =>
              openWizard({ firmwareVersion: release.version, firmwareId: release.id })
            }
          >
            Deploy
          </Button>
        ) : (
          <span className="text-xs text-zinc-500">Read only</span>
        )}
      </div>
    </article>
  );
}

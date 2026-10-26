import type { DeviceStatus, DeploymentStatus, FirmwareChannel } from "@/types";
import { cn } from "@/lib/utils";

const deviceStyles: Record<DeviceStatus, string> = {
  online: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  offline: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  updating: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  error: "bg-rose-400/10 text-rose-300 border-rose-400/20",
};

const deviceDot: Record<DeviceStatus, string> = {
  online: "bg-emerald-400",
  offline: "bg-slate-400",
  updating: "bg-sky-400 pulse-dot",
  error: "bg-rose-400",
};

const channelStyles: Record<FirmwareChannel, string> = {
  production: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  beta: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  deprecated: "bg-slate-400/10 text-slate-300 border-slate-400/20",
};

const deployStyles: Record<DeploymentStatus, string> = {
  queued: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  completed: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  updating: "bg-sky-400/10 text-sky-300 border-sky-400/20",
  failed: "bg-rose-400/10 text-rose-300 border-rose-400/20",
  rolled_back: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  recovering: "bg-amber-400/10 text-amber-200 border-amber-400/20",
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        deviceStyles[status],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", deviceDot[status])} />
      {status}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: FirmwareChannel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        channelStyles[channel],
      )}
    >
      {channel}
    </span>
  );
}

export function DeploymentBadge({ status }: { status: DeploymentStatus }) {
  const label =
    status === "rolled_back"
      ? "Rolled back"
      : status === "recovering"
        ? "Recovering"
        : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        deployStyles[status],
      )}
    >
      {label}
    </span>
  );
}

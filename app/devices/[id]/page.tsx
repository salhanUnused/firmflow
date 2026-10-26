"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Cpu, MapPin, Radio, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export default function DeviceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { devices, openWizard } = useFleet();
  const { user } = useAuth();
  const device = devices.find((item) => item.id === params.id);

  if (!device) {
    return (
      <AppShell title="Device">
        <p className="text-slate-400">Device not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={device.name} subtitle={device.deviceId}>
      <button
        onClick={() => router.push("/devices")}
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to devices
      </button>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{device.name}</h2>
              <p className="mt-1 font-mono text-sm text-slate-400">{device.deviceId}</p>
            </div>
            <StatusBadge status={device.status} />
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <Row icon={Cpu} label="Platform" value={device.platform} />
            <Row icon={Radio} label="Current firmware" value={device.firmware} />
            <Row icon={Timer} label="Last seen" value={device.lastSeen} />
            <Row icon={MapPin} label="Location" value={device.location} />
            <Row icon={Cpu} label="Hardware" value={device.hardwareRevision} />
            <Row icon={Radio} label="Agent" value={device.agent} />
            <Row icon={Timer} label="Last good build" value={device.lastGoodFirmware} />
          </dl>
          {can(user?.role, "deploy") ? (
            <Button
              className="mt-6 w-full"
              onClick={() => openWizard({ deviceIds: [device.id] })}
            >
              Update Firmware
            </Button>
          ) : null}
        </section>

        <div className="space-y-6">
          <History title="Firmware history" items={device.firmwareHistory} />
          <History title="Deployment history" items={device.deploymentHistory} />
        </div>
      </div>
    </AppShell>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2.5">
      <span className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />
        {label}
      </span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function History({
  title,
  items,
}: {
  title: string;
  items: { version: string; date: string; note: string }[];
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <h3 className="mb-4 font-medium">{title}</h3>
      <ol className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-slate-500">No history yet.</li>
        ) : (
          items.map((item, index) => (
            <li key={`${item.version}-${index}`} className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2f6dff]" />
              <div>
                <p className="font-mono text-sm text-sky-200">{item.version}</p>
                <p className="text-xs text-slate-500">
                  {item.date} · {item.note}
                </p>
              </div>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}

"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, inputClass } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { org } = useFleet();
  const { user, persistence } = useAuth();
  const [probe, setProbe] = useState("");
  const [result, setResult] = useState("");

  const testIsolation = async () => {
    const data = await api<{ allowed: boolean; reason?: string }>("/api/isolation", {
      method: "POST",
      body: JSON.stringify({ deviceId: probe || "dev-a1" }),
    });
    setResult(
      data.allowed
        ? "That device is in your workspace."
        : data.reason || "Blocked — another customer's device.",
    );
  };

  return (
    <AppShell title="Settings" subtitle={`${org?.name ?? "Workspace"}`}>
      <div className="grid max-w-2xl gap-4">
        <section className="rounded-lg border border-white/10 p-5">
          <h2 className="font-medium">Your account</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Name" value={user?.fullName} />
            <Row label="Email" value={user?.email} />
            <Row label="Role" value={user?.role} />
            <Row label="Plan" value={org?.plan} />
            <Row label="Persistence" value={persistence} />
          </dl>
        </section>
        {can(user?.role, "viewFleet") ? (
          <section className="rounded-lg border border-white/10 p-5">
            <h2 className="font-medium">Tenant isolation check</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Ask the API for a device id from another customer. Helio&apos;s
              <span className="font-mono"> dev-a1 </span>
              is rejected unless you are signed into Helio Labs.
            </p>
            <input
              className={`${inputClass} mt-3`}
              value={probe}
              onChange={(event) => setProbe(event.target.value)}
              placeholder="dev-a1"
            />
            <Button className="mt-3" variant="secondary" onClick={() => void testIsolation()}>
              Probe
            </Button>
            {result ? <p className="mt-3 text-sm text-zinc-300">{result}</p> : null}
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="truncate capitalize">{value}</dd>
    </div>
  );
}

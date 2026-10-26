"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { api } from "@/lib/api";
import type { PlanId } from "@/types";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { org, usage } = useFleet();
  const { refresh } = useAuth();
  const plan = org?.plan ?? "starter";
  const limits = PLANS[plan];

  const choose = async (next: PlanId) => {
    await api("/api/billing", { method: "POST", body: JSON.stringify({ plan: next }) });
    await refresh();
  };

  const rows: Array<{ label: string; used: number; max: number }> = usage
    ? [
        { label: "Devices", used: usage.devices, max: limits.devices },
        { label: "Firmware", used: usage.firmware, max: limits.firmware },
        { label: "Projects", used: usage.projects, max: limits.projects },
        { label: "Seats", used: usage.seats, max: limits.seats },
        {
          label: "Deployments this month",
          used: usage.deploymentsThisMonth,
          max: limits.deploymentsPerMonth,
        },
      ]
    : [];

  return (
    <AppShell title="Billing" subtitle="Usage limits are enforced on the server, not just in the UI.">
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((id) => (
          <article
            key={id}
            className={cn(
              "rounded-2xl border p-5",
              plan === id ? "border-[#2f6dff]/50 bg-[#2f6dff]/8" : "border-white/10",
            )}
          >
            <h2 className="text-lg font-medium">{PLANS[id].label}</h2>
            <ul className="mt-3 space-y-1 text-sm text-zinc-400">
              <li>{PLANS[id].devices} devices</li>
              <li>{PLANS[id].liveOta ? "Live ESP32 OTA" : "Simulate only"}</li>
              <li>{PLANS[id].alerts ? "Alerts on" : "No alerts"}</li>
            </ul>
            <Button
              className="mt-5 w-full"
              variant={plan === id ? "secondary" : "primary"}
              disabled={plan === id}
              onClick={() => void choose(id)}
            >
              {plan === id ? "Current plan" : `Switch to ${PLANS[id].label}`}
            </Button>
          </article>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-white/10 p-5">
        <h2 className="font-medium">Usage</h2>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-zinc-400">{row.label}</span>
                <span className="font-mono text-zinc-200">
                  {row.used} / {row.max}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full bg-[#2f6dff]"
                  style={{ width: `${Math.min(100, (row.used / Math.max(1, row.max)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

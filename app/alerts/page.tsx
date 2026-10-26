"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import { PLANS } from "@/lib/plans";

export default function AlertsPage() {
  const { alerts, alertRules, org } = useFleet();
  const { user, refresh } = useAuth();
  const allowed = org ? PLANS[org.plan].alerts : true;

  const ack = async (alertId: string) => {
    await api("/api/alerts", { method: "PATCH", body: JSON.stringify({ alertId }) });
    await refresh();
  };

  const toggle = async (ruleId: string, enabled: boolean) => {
    await api("/api/alerts", {
      method: "POST",
      body: JSON.stringify({ id: ruleId, enabled }),
    });
    await refresh();
  };

  return (
    <AppShell title="Alerts" subtitle="Offline devices, failed OTA and low heap.">
      {!allowed ? (
        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/8 p-4 text-sm text-amber-100">
          Alerts are a Starter/Growth entitlement. Upgrade in Billing.
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-white/10">
          <ul className="divide-y divide-white/8">
            {alerts.length === 0 ? (
              <li className="p-5 text-sm text-zinc-500">
                No alerts. Inject a failed update to see recovery plus a critical alert.
              </li>
            ) : (
              alerts.map((alert) => (
                <li key={alert.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm text-white">{alert.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {alert.detail} · {formatTime(alert.at)}
                    </p>
                  </div>
                  {can(user?.role, "acknowledgeAlerts") && !alert.acknowledged ? (
                    <Button
                      variant="secondary"
                      className="h-9 text-xs"
                      onClick={() => void ack(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {alert.acknowledged ? "Acked" : alert.severity}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="space-y-3">
          {alertRules.map((rule) => (
            <label
              key={rule.id}
              className="flex min-h-14 items-center justify-between rounded-lg border border-white/10 p-4"
            >
              <div>
                <p className="text-sm text-white">{rule.name}</p>
                <p className="text-xs text-zinc-500">{rule.type}</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#2f6dff]"
                checked={rule.enabled}
                disabled={!can(user?.role, "manageAlerts") || !allowed}
                onChange={(event) => void toggle(rule.id, event.target.checked)}
              />
            </label>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

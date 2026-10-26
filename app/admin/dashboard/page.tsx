"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Button, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/plans";
import { useAuth } from "@/lib/auth";
import { formatTime } from "@/lib/utils";
import type { PlanId, PlatformOverview } from "@/types";

export default function AdminDashboardPage() {
  const { refresh } = useAuth();
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteError, setInviteError] = useState("");

  const load = useCallback(async () => {
    const data = await api<{ overview: PlatformOverview }>("/api/admin/overview");
    setOverview(data.overview);
  }, []);

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load console.");
    });
  }, [load]);

  const changePlan = async (orgId: string, plan: PlanId) => {
    await api("/api/admin/plan", {
      method: "POST",
      body: JSON.stringify({ orgId, plan }),
    });
    await load();
  };

  const invite = async () => {
    setInviteError("");
    try {
      await api("/api/admin/operators", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });
      setFullName("");
      setEmail("");
      setPassword("");
      await refresh();
      await load();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Invite failed.");
    }
  };

  return (
    <AdminShell
      title="Platform overview"
      subtitle="All workspaces, operators, and entitlements."
    >
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {overview ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Workspaces" value={overview.totals.orgs} />
            <Stat label="Users" value={overview.totals.users} />
            <Stat label="Devices" value={overview.totals.devices} />
            <Stat label="Firmware" value={overview.totals.firmware} />
            <Stat label="Deployments" value={overview.totals.deployments} />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Persistence: {overview.persistence}
          </p>

          <section className="mt-8">
            <h2 className="mb-3 font-medium">Workspaces</h2>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Devices</th>
                    <th className="px-4 py-3">Firmware</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {overview.orgs.map((org) => (
                    <tr key={org.id}>
                      <td className="px-4 py-3 text-white">{org.name}</td>
                      <td className="px-4 py-3">
                        <select
                          className={`${inputClass} max-w-[9rem] py-1.5`}
                          value={org.plan}
                          onChange={(event) =>
                            void changePlan(org.id, event.target.value as PlanId)
                          }
                        >
                          {(Object.keys(PLANS) as PlanId[]).map((plan) => (
                            <option key={plan} value={plan}>
                              {PLANS[plan].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">{org.seats}</td>
                      <td className="px-4 py-3">{org.devices}</td>
                      <td className="px-4 py-3">{org.firmware}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {formatTime(org.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-white/10 p-5">
              <h2 className="font-medium">Operators</h2>
              <ul className="mt-4 divide-y divide-white/8">
                {overview.operators.map((operator) => (
                  <li key={operator.id} className="py-3">
                    <p className="text-sm text-white">{operator.fullName}</p>
                    <p className="text-xs text-zinc-500">{operator.email}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-white/10 p-5">
              <h2 className="font-medium">Invite an operator</h2>
              <div className="mt-4 space-y-3">
                <Field label="Name">
                  <input
                    className={inputClass}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    className={inputClass}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field label="Password">
                  <input
                    className={inputClass}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                  />
                </Field>
                {inviteError ? (
                  <p className="text-sm text-rose-300">{inviteError}</p>
                ) : null}
                <Button
                  onClick={() => void invite()}
                  disabled={!fullName || !email || password.length < 8}
                >
                  Add operator
                </Button>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-2xl text-white">{value}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { can, ROLE_LABEL } from "@/lib/roles";
import { Button, Field, inputClass } from "@/components/ui";
import { api } from "@/lib/api";
import type { UserRole } from "@/types";

export default function TeamPage() {
  const { user, team, updateRole, refresh } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !can(user.role, "manageTeam")) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!can(user?.role, "manageTeam")) return null;

  const invite = async () => {
    setError("");
    try {
      await api("/api/team", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password, role }),
      });
      setFullName("");
      setEmail("");
      setPassword("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed.");
    }
  };

  return (
    <AppShell title="Team" subtitle="Who can upload firmware, deploy, or only watch.">
      <p className="mb-5 max-w-2xl text-sm leading-6 text-zinc-500">
        Admin manages seats. Engineers upload firmware and start live OTA.
        Operators register devices and run simulations. Viewers are read-only.
      </p>
      <div className="overflow-hidden rounded-lg border border-white/10">
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {team.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-3 text-white">{member.fullName}</td>
                <td className="px-4 py-3 text-zinc-400">{member.email}</td>
                <td className="px-4 py-3 text-zinc-400">{member.title}</td>
                <td className="px-4 py-3">
                  <select
                    className={`${inputClass} max-w-[10rem] py-1.5`}
                    value={member.role}
                    onChange={(event) =>
                      void updateRole(member.id, event.target.value as UserRole)
                    }
                  >
                    {(["admin", "engineer", "operator", "viewer"] as UserRole[]).map(
                      (item) => (
                        <option key={item} value={item}>
                          {ROLE_LABEL[item]}
                        </option>
                      ),
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="divide-y divide-white/8 md:hidden">
          {team.map((member) => (
            <li key={member.id} className="p-4">
              <p className="text-white">{member.fullName}</p>
              <p className="text-xs text-zinc-500">{member.email}</p>
              <select
                className={`${inputClass} mt-3 py-1.5`}
                value={member.role}
                onChange={(event) =>
                  void updateRole(member.id, event.target.value as UserRole)
                }
              >
                {(["admin", "engineer", "operator", "viewer"] as UserRole[]).map((item) => (
                  <option key={item} value={item}>
                    {ROLE_LABEL[item]}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      <section className="mt-6 max-w-xl rounded-lg border border-white/10 p-5">
        <h2 className="font-medium">Invite a seat</h2>
        <div className="mt-4 space-y-3">
          <Field label="Name">
            <input className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Temporary password">
            <input className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              {(["engineer", "operator", "viewer"] as UserRole[]).map((item) => (
                <option key={item} value={item}>
                  {ROLE_LABEL[item]}
                </option>
              ))}
            </select>
          </Field>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button onClick={() => void invite()} disabled={!fullName || !email || password.length < 8}>
            Add member
          </Button>
        </div>
      </section>
    </AppShell>
  );
}

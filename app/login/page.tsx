"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button, Field, inputClass } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { DEMO_PASSWORD, TEAM } from "@/lib/demo-users";
import { ROLE_LABEL } from "@/lib/roles";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState("admin@firmflow.io");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Logo className="justify-center" />
        <h1 className="mt-8 text-center text-2xl font-medium tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Helio Labs demo or your own workspace
        </p>
        <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
          <Field label="Work email">
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          No account?{" "}
          <Link href="/signup" className="text-zinc-200 underline-offset-2 hover:underline">
            Create one
          </Link>
        </p>
        <div className="mt-8 rounded-lg border border-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
            Demo accounts · password {DEMO_PASSWORD}
          </p>
          <ul className="mt-3 space-y-2">
            {TEAM.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-white/5"
                  onClick={() => {
                    setEmail(member.email);
                    setPassword(DEMO_PASSWORD);
                    void (async () => {
                      setBusy(true);
                      setError("");
                      try {
                        await signInDemo(member.role);
                        router.push("/dashboard");
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Demo sign-in failed.");
                      } finally {
                        setBusy(false);
                      }
                    })();
                  }}
                >
                  <span>
                    {member.fullName}
                    <span className="block text-xs text-zinc-500">{member.email}</span>
                  </span>
                  <span className="text-xs text-zinc-400">{ROLE_LABEL[member.role]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

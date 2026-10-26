"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ScreenLoader } from "@/components/ScreenLoader";
import { Button, Field, inputClass } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      {busy ? <ScreenLoader overlay label="Signing in…" /> : null}
      <div className="mx-auto w-full max-w-md">
        <Logo className="justify-center" />
        <h1 className="mt-8 text-center text-2xl font-medium tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Engineers, operators, and viewers. Admins use a separate sign-in.
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
        <p className="mt-3 text-center text-sm text-zinc-600">
          Workspace admin?{" "}
          <Link href="/admin" className="text-zinc-400 underline-offset-2 hover:underline">
            Sign in as admin
          </Link>
        </p>
      </div>
    </div>
  );
}

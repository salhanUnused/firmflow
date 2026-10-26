"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ScreenLoader } from "@/components/ScreenLoader";
import { Button, Field, inputClass } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("Production");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signUp({ fullName, email, password, orgName, projectName });
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] px-4 py-10">
      {busy ? <ScreenLoader overlay label="Creating workspace…" /> : null}
      <div className="mx-auto w-full max-w-md">
        <Logo className="justify-center" />
        <h1 className="mt-8 text-center text-2xl font-medium tracking-tight">
          Create your workspace
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Creates an engineer account. Workspace admins register at /admin.
        </p>
        <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
          <Field label="Full name">
            <input
              className={inputClass}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Work email">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Company / workspace">
            <input
              className={inputClass}
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              placeholder="Northwind IoT"
              required
            />
          </Field>
          <Field label="First project">
            <input
              className={inputClass}
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Field label="Confirm password">
            <input
              className={inputClass}
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-200 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-zinc-600">
          Need the admin role?{" "}
          <Link href="/admin" className="text-zinc-400 underline-offset-2 hover:underline">
            Register as admin
          </Link>
        </p>
      </div>
    </div>
  );
}

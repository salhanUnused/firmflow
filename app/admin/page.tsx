"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ScreenLoader } from "@/components/ScreenLoader";
import { Button, Field, inputClass } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function AdminGatePage() {
  const router = useRouter();
  const { user, ready, signInAdmin, registerAdmin } = useAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [orgName, setOrgName] = useState("");
  const [inviteSecret, setInviteSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    if (user.platformAdmin) {
      router.replace("/admin/dashboard");
      return;
    }
    if (user.role === "admin") {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const next =
        mode === "signin"
          ? await signInAdmin(email, password)
          : await registerAdmin({
              fullName,
              email,
              password,
              orgName,
              inviteSecret: inviteSecret || undefined,
            });
      router.push(next.platformAdmin ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] px-4 py-10">
      {busy ? <ScreenLoader overlay label="Signing in…" /> : null}
      <div className="mx-auto w-full max-w-md">
        <Logo className="justify-center" href="/admin" />
        <h1 className="mt-8 text-center text-2xl font-medium tracking-tight">
          Admin
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Register or sign in with the admin role. Team members use the normal login.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-1 rounded-lg border border-white/10 p-1">
          <button
            type="button"
            className={cn(
              "rounded-md py-2 text-sm",
              mode === "signin" ? "bg-white/10 text-white" : "text-zinc-500",
            )}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md py-2 text-sm",
              mode === "register" ? "bg-white/10 text-white" : "text-zinc-500",
            )}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)}>
          {mode === "register" ? (
            <>
              <Field label="Full name">
                <input
                  className={inputClass}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </Field>
              <Field label="Workspace name">
                <input
                  className={inputClass}
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                  placeholder="Acme Robotics"
                  required
                />
              </Field>
            </>
          ) : null}
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </Field>
          {mode === "register" ? (
            <>
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
              <Field label="Operator secret (optional)">
                <input
                  className={inputClass}
                  type="password"
                  value={inviteSecret}
                  onChange={(event) => setInviteSecret(event.target.value)}
                  placeholder="Only if PLATFORM_ADMIN_SECRET is set"
                />
              </Field>
            </>
          ) : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <Button type="submit" className="h-11 w-full" disabled={busy}>
            {busy
              ? "Working…"
              : mode === "signin"
                ? "Sign in as admin"
                : "Create admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}

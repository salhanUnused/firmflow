"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Modal } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { compatibility } from "@/lib/compat";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { DeployMode, RecoveryStrategy } from "@/types";

const steps = ["Select Firmware", "Select Devices", "Review"];

export function DeployWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    wizard,
    closeWizard,
    firmware,
    devices,
    org,
    setWizardFirmware,
    toggleWizardDevice,
    setWizardMode,
    setWizardRecovery,
    setWizardFailure,
    startDeployment,
  } = useFleet();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (wizard.open) {
      setStep(0);
      setError("");
    }
  }, [wizard.open]);

  const release = firmware.find((item) => item.version === wizard.firmwareVersion);
  const selected = devices.filter((device) => wizard.deviceIds.includes(device.id));
  const liveAllowed = org ? PLANS[org.plan].liveOta && can(user?.role, "liveDeploy") : false;

  const resetAndClose = () => {
    setStep(0);
    closeWizard();
  };

  const deploy = async () => {
    setBusy(true);
    setError("");
    try {
      const id = await startDeployment();
      setStep(0);
      closeWizard();
      if (id) router.push(`/deployments/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start deployment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={wizard.open}
      onClose={resetAndClose}
      title="OTA firmware update"
      subtitle="Simulate a rollout, or queue a live update for ESP32 / virtual agents."
      wide
    >
      <div className="mb-5 grid grid-cols-3 gap-2">
        {steps.map((label, index) => (
          <div key={label} className="text-center">
            <div
              className={cn(
                "mb-1 h-1 rounded-full",
                index <= step ? "bg-[#2f6dff]" : "bg-white/10",
              )}
            />
            <p className={cn("text-[11px]", index === step ? "text-white" : "text-slate-500")}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <Field label="Firmware">
            <select
              value={wizard.firmwareVersion}
              onChange={(event) => setWizardFirmware(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#070d18] px-3 py-2.5 text-sm outline-none focus:border-[#2f6dff]/70"
            >
              {firmware
                .filter((item) => item.channel !== "deprecated")
                .map((item) => (
                  <option key={item.id} value={item.version}>
                    {item.version} · {item.channel} · {item.platforms.join("/")}
                  </option>
                ))}
            </select>
          </Field>
          {release ? (
            <div className="rounded-xl border border-white/8 p-3 text-xs text-zinc-400">
              <p>
                SHA-256 <span className="font-mono text-zinc-200">{release.sha256.slice(0, 20)}…</span>
              </p>
              <p className="mt-1">
                Compatible with {release.platforms.join(", ")}
                {release.hardwareRevisions.length
                  ? ` · hw ${release.hardwareRevisions.join(", ")}`
                  : " · any hardware rev"}
                {" · min "}
                {release.minVersion}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {devices.map((device) => {
            const checked = wizard.deviceIds.includes(device.id);
            const compat = release ? compatibility(release, device) : { ok: true, reasons: [] };
            return (
              <label
                key={device.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3",
                  !compat.ok
                    ? "border-white/8 opacity-50"
                    : checked
                      ? "border-[#2f6dff]/50 bg-[#2f6dff]/10"
                      : "border-white/8 bg-white/[0.02]",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!compat.ok}
                    onChange={() => toggleWizardDevice(device.id)}
                    className="accent-[#2f6dff]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{device.name}</p>
                    <p className="truncate font-mono text-xs text-slate-500">
                      {device.deviceId} · {device.firmware} · {device.platform}
                    </p>
                    {!compat.ok ? (
                      <p className="mt-1 text-[11px] text-amber-200">{compat.reasons[0]}</p>
                    ) : null}
                  </div>
                </div>
                <StatusBadge status={device.status} />
              </label>
            );
          })}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm">
          <Row label="Firmware" value={wizard.firmwareVersion} />
          <Row label="Devices" value={String(wizard.deviceIds.length)} />
          <Field label="Mode">
            <select
              className="w-full rounded-lg border border-white/10 bg-[#070d18] px-3 py-2 text-sm"
              value={wizard.mode}
              onChange={(event) => setWizardMode(event.target.value as DeployMode)}
            >
              <option value="simulate">Simulate (inspect results, no hardware)</option>
              <option value="live" disabled={!liveAllowed}>
                Live (ESP32 / virtual agent must authenticate)
              </option>
            </select>
          </Field>
          <Field label="Recovery">
            <select
              className="w-full rounded-lg border border-white/10 bg-[#070d18] px-3 py-2 text-sm"
              value={wizard.recovery}
              onChange={(event) => setWizardRecovery(event.target.value as RecoveryStrategy)}
            >
              <option value="auto_rollback">Auto-rollback last good build</option>
              <option value="retry">Hold and retry</option>
              <option value="hold">Hold failed devices</option>
            </select>
          </Field>
          {wizard.mode === "simulate" ? (
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={wizard.injectFailure}
                onChange={(event) => setWizardFailure(event.target.checked)}
                className="accent-[#2f6dff]"
              />
              Inject a verification failure on the first device (tests recovery)
            </label>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            {selected.map((device) => (
              <span
                key={device.id}
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300"
              >
                {device.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={step === 0 ? resetAndClose : () => setStep(step - 1)}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < 2 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && wizard.deviceIds.length === 0}
          >
            Continue
          </Button>
        ) : (
          <Button onClick={() => void deploy()} disabled={wizard.deviceIds.length === 0 || busy}>
            {busy ? "Starting…" : "Start deployment"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

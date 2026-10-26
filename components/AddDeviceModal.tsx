"use client";

import { useState } from "react";
import { Button, Field, Modal, inputClass } from "@/components/ui";
import { useFleet } from "@/lib/store";
import type { DeviceAgent, Platform } from "@/types";

export function AddDeviceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addDevice, projects, lastToken } = useFleet();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<Platform>("ESP32");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [location, setLocation] = useState("");
  const [hardwareRevision, setHardwareRevision] = useState("rev-c");
  const [agent, setAgent] = useState<DeviceAgent>("virtual");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await addDevice({
        name: name.trim(),
        platform,
        projectId: projectId || projects[0]?.id,
        location,
        hardwareRevision,
        agent,
      });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register device.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register device"
      subtitle="Creates a device token. Shown once — copy it for the ESP32 sketch."
    >
      <div className="space-y-4">
        <Field label="Device name">
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sensor Hub A2"
          />
        </Field>
        <Field label="Project">
          <select
            className={inputClass}
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Platform">
            <select
              className={inputClass}
              value={platform}
              onChange={(event) => setPlatform(event.target.value as Platform)}
            >
              <option value="ESP32">ESP32</option>
              <option value="STM32">STM32</option>
              <option value="nRF52">nRF52</option>
            </select>
          </Field>
          <Field label="Hardware rev">
            <input
              className={inputClass}
              value={hardwareRevision}
              onChange={(event) => setHardwareRevision(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Location">
          <input
            className={inputClass}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Plant floor · Bay 3"
          />
        </Field>
        <Field label="Agent">
          <select
            className={inputClass}
            value={agent}
            onChange={(event) => setAgent(event.target.value as DeviceAgent)}
          >
            <option value="virtual">Virtual agent (in-browser)</option>
            <option value="esp32">Real ESP32</option>
          </select>
        </Field>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {lastToken ? (
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/8 p-3">
            <p className="text-xs uppercase tracking-wider text-emerald-200">
              Device token — copy now
            </p>
            <p className="mt-2 break-all font-mono text-xs text-white">{lastToken.token}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => void submit()} disabled={!name.trim() || busy}>
          {busy ? "Registering…" : "Register"}
        </Button>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Button, Field, Modal, inputClass } from "@/components/ui";
import { useFleet } from "@/lib/store";
import type { FirmwareChannel, Platform } from "@/types";

const PLATFORMS: Platform[] = ["ESP32", "STM32", "nRF52"];

export function CreateFirmwareModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { createFirmware, projects } = useFleet();
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState<FirmwareChannel>("beta");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>(["ESP32"]);
  const [minVersion, setMinVersion] = useState("v1.0.0");
  const [hardwareRevisions, setHardwareRevisions] = useState("rev-c");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  };

  const submit = async () => {
    if (!version.trim() || !description.trim() || !file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("version", version.trim());
      form.set("description", description.trim());
      form.set("channel", channel);
      form.set("projectId", projectId);
      form.set("platforms", platforms.join(","));
      form.set("minVersion", minVersion);
      form.set("hardwareRevisions", hardwareRevisions);
      form.set("file", file);
      await createFirmware(form);
      setVersion("");
      setDescription("");
      setFile(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload firmware release"
      subtitle="Compatibility is checked before any device can download this binary."
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Version">
          <input
            className={inputClass}
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            placeholder="1.5.0"
          />
        </Field>
        <Field label="Release channel">
          <select
            className={inputClass}
            value={channel}
            onChange={(event) => setChannel(event.target.value as FirmwareChannel)}
          >
            <option value="beta">Beta</option>
            <option value="production">Production</option>
          </select>
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
        <Field label="Minimum running version">
          <input
            className={inputClass}
            value={minVersion}
            onChange={(event) => setMinVersion(event.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Compatible platforms">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <label
                  key={platform}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                    className="accent-[#2f6dff]"
                  />
                  {platform}
                </label>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Hardware revisions">
          <input
            className={inputClass}
            value={hardwareRevisions}
            onChange={(event) => setHardwareRevisions(event.target.value)}
            placeholder="rev-c, rev-d"
          />
        </Field>
        <Field label="Firmware binary">
          <input
            className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
            type="file"
            accept=".bin,.elf,.hex,application/octet-stream"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="mt-2 text-xs text-sky-300"
            onClick={() =>
              setFile(
                new File(
                  [`FIRM FLOW PLACEHOLDER ${version || "v0.0.1"}\n`],
                  `${version || "firmware"}.bin`,
                  { type: "application/octet-stream" },
                ),
              )
            }
          >
            Use a placeholder .bin for virtual agents
          </button>
          {file ? <p className="mt-1 text-xs text-zinc-500">{file.name}</p> : null}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-24 resize-none`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Improved sensor stability and connectivity."
            />
          </Field>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => void submit()}
          disabled={!version.trim() || !description.trim() || !file || busy}
        >
          {busy ? "Uploading…" : "Upload release"}
        </Button>
      </div>
    </Modal>
  );
}

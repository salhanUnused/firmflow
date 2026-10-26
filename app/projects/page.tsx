"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Field, Modal, inputClass } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { formatTime } from "@/lib/utils";

export default function ProjectsPage() {
  const { projects, devices, firmware, createProject } = useFleet();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      await createProject({ name, description });
      setName("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project.");
    }
  };

  return (
    <AppShell
      title="Projects"
      subtitle="Tenants isolate devices, firmware and deployments per project inside your org."
    >
      {can(user?.role, "manageProjects") ? (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            New project
          </Button>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const deviceCount = devices.filter((item) => item.projectId === project.id).length;
          const releaseCount = firmware.filter((item) => item.projectId === project.id).length;
          return (
            <article key={project.id} className="rounded-2xl border border-white/8 p-5">
              <h2 className="text-lg font-medium text-white">{project.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">{project.description || "No description"}</p>
              <p className="mt-4 text-xs text-zinc-500">
                {deviceCount} devices · {releaseCount} releases · {formatTime(project.createdAt)}
              </p>
            </article>
          );
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Create project">
        <div className="space-y-4">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Description">
            <textarea
              className={`${inputClass} min-h-20 resize-none`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

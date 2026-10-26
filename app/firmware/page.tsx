"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FirmwareCard } from "@/components/FirmwareCard";
import { CreateFirmwareModal } from "@/components/CreateFirmwareModal";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export default function FirmwarePage() {
  const { firmware } = useFleet();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <AppShell
      title="Firmware"
      subtitle="Upload a binary, inspect compatibility, then simulate or live-deploy."
    >
      {can(user?.role, "createFirmware") ? (
        <div className="mb-5 flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus size={15} />
            Create Firmware Release
          </Button>
        </div>
      ) : (
        <p className="mb-5 text-sm text-zinc-500">
          Your role can inspect releases. Creating a build needs an engineer or admin.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {firmware.map((release) => (
          <FirmwareCard key={release.id} release={release} />
        ))}
      </div>
      {can(user?.role, "createFirmware") ? (
        <CreateFirmwareModal open={open} onClose={() => setOpen(false)} />
      ) : null}
    </AppShell>
  );
}

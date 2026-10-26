"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DeviceTable } from "@/components/DeviceTable";
import { AddDeviceModal } from "@/components/AddDeviceModal";
import { Button } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export default function DevicesPage() {
  const { devices, openWizard } = useFleet();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <AppShell
      title="Devices"
      subtitle="Register and monitor connected devices in the fleet."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{devices.length} devices in this workspace</p>
        <div className="flex gap-2">
          {can(user?.role, "deploy") ? (
            <Button variant="secondary" onClick={() => openWizard()}>
              Update Firmware
            </Button>
          ) : null}
          {can(user?.role, "addDevice") ? (
            <Button onClick={() => setOpen(true)}>
              <Plus size={15} />
              Add Device
            </Button>
          ) : null}
        </div>
      </div>
      <DeviceTable devices={devices} />
      {can(user?.role, "addDevice") ? (
        <AddDeviceModal open={open} onClose={() => setOpen(false)} />
      ) : null}
    </AppShell>
  );
}

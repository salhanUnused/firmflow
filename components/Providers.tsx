"use client";

import { FleetProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { VirtualAgents } from "@/components/VirtualAgents";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FleetProvider>
        <VirtualAgents />
        {children}
      </FleetProvider>
    </AuthProvider>
  );
}

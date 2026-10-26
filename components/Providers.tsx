"use client";

import { FleetProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { VirtualAgents } from "@/components/VirtualAgents";
import { LoadingGate } from "@/components/LoadingGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LoadingGate>
        <FleetProvider>
          <VirtualAgents />
          {children}
        </FleetProvider>
      </LoadingGate>
    </AuthProvider>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type {
  DeployMode,
  DeployWizardState,
  Device,
  DeviceAgent,
  FirmwareChannel,
  FirmwareRelease,
  OrgState,
  Platform,
  RecoveryStrategy,
} from "@/types";

const TOKEN_KEY = "firmflow-device-tokens-v1";

interface FleetContextValue {
  org: OrgState["org"] | null;
  projects: OrgState["projects"];
  devices: Device[];
  firmware: FirmwareRelease[];
  deployments: OrgState["deployments"];
  telemetry: OrgState["telemetry"];
  logs: OrgState["logs"];
  alerts: OrgState["alerts"];
  alertRules: OrgState["alertRules"];
  audit: OrgState["audit"];
  stats: OrgState["stats"];
  usage: OrgState["usage"] | null;
  activities: OrgState["activities"];
  wizard: DeployWizardState;
  lastToken: { deviceId: string; token: string } | null;
  tokens: Record<string, string>;
  addDevice: (input: {
    name: string;
    platform: Platform;
    projectId?: string;
    location?: string;
    hardwareRevision?: string;
    agent?: DeviceAgent;
  }) => Promise<Device>;
  createFirmware: (input: FormData) => Promise<void>;
  createProject: (input: { name: string; description: string }) => Promise<void>;
  openWizard: (input?: { firmwareVersion?: string; firmwareId?: string; deviceIds?: string[] }) => void;
  closeWizard: () => void;
  setWizardFirmware: (version: string) => void;
  toggleWizardDevice: (id: string) => void;
  setWizardMode: (mode: DeployMode) => void;
  setWizardRecovery: (recovery: RecoveryStrategy) => void;
  setWizardFailure: (value: boolean) => void;
  startDeployment: () => Promise<string | null>;
  rollbackDeployment: (id: string) => Promise<string | null>;
}

const defaultWizard: DeployWizardState = {
  open: false,
  firmwareVersion: "",
  deviceIds: [],
  mode: "simulate",
  recovery: "auto_rollback",
  injectFailure: false,
};

const FleetContext = createContext<FleetContextValue | null>(null);

function loadTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const { state, refresh, user } = useAuth();
  const [wizard, setWizard] = useState<DeployWizardState>(defaultWizard);
  const [lastToken, setLastToken] = useState<{ deviceId: string; token: string } | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const wizardRef = useRef(wizard);
  wizardRef.current = wizard;

  useEffect(() => {
    setTokens(loadTokens());
  }, []);

  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(() => {
      void refresh();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [user, refresh]);

  const persistToken = (deviceId: string, token: string) => {
    const next = { ...loadTokens(), [deviceId]: token };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(next));
    setTokens(next);
  };

  const addDevice = useCallback(
    async (input: {
      name: string;
      platform: Platform;
      projectId?: string;
      location?: string;
      hardwareRevision?: string;
      agent?: DeviceAgent;
    }) => {
      const data = await api<{ device: Device; token: string }>("/api/devices", {
        method: "POST",
        body: JSON.stringify(input),
      });
      persistToken(data.device.id, data.token);
      setLastToken({ deviceId: data.device.id, token: data.token });
      await refresh();
      return data.device;
    },
    [refresh],
  );

  const createFirmware = useCallback(
    async (input: FormData) => {
      await api("/api/firmware", {
        method: "POST",
        body: input,
        headers: {},
      });
      await refresh();
    },
    [refresh],
  );

  const createProject = useCallback(
    async (input: { name: string; description: string }) => {
      await api("/api/projects", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await refresh();
    },
    [refresh],
  );

  const openWizard = useCallback(
    (input?: { firmwareVersion?: string; firmwareId?: string; deviceIds?: string[] }) => {
      const fallback = state?.firmware.find((item) => item.channel !== "deprecated");
      setWizard({
        open: true,
        firmwareVersion: input?.firmwareVersion ?? fallback?.version ?? "",
        firmwareId: input?.firmwareId ?? fallback?.id,
        deviceIds: input?.deviceIds ?? [],
        mode: "simulate",
        recovery: "auto_rollback",
        injectFailure: false,
      });
    },
    [state?.firmware],
  );

  const closeWizard = useCallback(() => {
    setWizard((prev) => ({ ...prev, open: false }));
  }, []);

  const setWizardFirmware = useCallback(
    (version: string) => {
      const release = state?.firmware.find((item) => item.version === version);
      setWizard((prev) => ({
        ...prev,
        firmwareVersion: version,
        firmwareId: release?.id,
      }));
    },
    [state?.firmware],
  );

  const toggleWizardDevice = useCallback((id: string) => {
    setWizard((prev) => ({
      ...prev,
      deviceIds: prev.deviceIds.includes(id)
        ? prev.deviceIds.filter((item) => item !== id)
        : [...prev.deviceIds, id],
    }));
  }, []);

  const setWizardMode = useCallback((mode: DeployMode) => {
    setWizard((prev) => ({ ...prev, mode }));
  }, []);

  const setWizardRecovery = useCallback((recovery: RecoveryStrategy) => {
    setWizard((prev) => ({ ...prev, recovery }));
  }, []);

  const setWizardFailure = useCallback((value: boolean) => {
    setWizard((prev) => ({ ...prev, injectFailure: value }));
  }, []);

  const startDeployment = useCallback(async () => {
    const current = wizardRef.current;
    const release =
      state?.firmware.find((item) => item.version === current.firmwareVersion) ??
      state?.firmware.find((item) => item.id === current.firmwareId);
    if (!release || current.deviceIds.length === 0) return null;
    const data = await api<{ deployment: { id: string } }>("/api/deployments", {
      method: "POST",
      body: JSON.stringify({
        firmwareId: release.id,
        deviceIds: current.deviceIds,
        mode: current.mode,
        recovery: current.recovery,
        injectFailure: current.injectFailure,
      }),
    });
    await refresh();
    return data.deployment.id;
  }, [refresh, state?.firmware]);

  const rollbackDeployment = useCallback(
    async (id: string) => {
      const data = await api<{ deployment: { id: string } }>(
        `/api/deployments/${id}/rollback`,
        { method: "POST" },
      );
      await refresh();
      return data.deployment.id;
    },
    [refresh],
  );

  const emptyStats = { total: 0, online: 0, updating: 0, offline: 0, error: 0 };

  const value = useMemo<FleetContextValue>(
    () => ({
      org: state?.org ?? null,
      projects: state?.projects ?? [],
      devices: state?.devices ?? [],
      firmware: state?.firmware ?? [],
      deployments: state?.deployments ?? [],
      telemetry: state?.telemetry ?? [],
      logs: state?.logs ?? [],
      alerts: state?.alerts ?? [],
      alertRules: state?.alertRules ?? [],
      audit: state?.audit ?? [],
      stats: state?.stats ?? emptyStats,
      usage: state?.usage ?? null,
      activities: state?.activities ?? [],
      wizard,
      lastToken,
      tokens,
      addDevice,
      createFirmware,
      createProject,
      openWizard,
      closeWizard,
      setWizardFirmware,
      toggleWizardDevice,
      setWizardMode,
      setWizardRecovery,
      setWizardFailure,
      startDeployment,
      rollbackDeployment,
    }),
    [
      state,
      wizard,
      lastToken,
      tokens,
      addDevice,
      createFirmware,
      createProject,
      openWizard,
      closeWizard,
      setWizardFirmware,
      toggleWizardDevice,
      setWizardMode,
      setWizardRecovery,
      setWizardFailure,
      startDeployment,
      rollbackDeployment,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error("useFleet must be used within FleetProvider");
  }
  return context;
}

export function seedTokenFor(deviceId: string) {
  return `seed-token-${deviceId}`;
}

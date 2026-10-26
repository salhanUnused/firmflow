import type {
  Deployment,
  Device,
  FirmwareRelease,
  FleetStats,
} from "@/types";

type SeedDevice = Omit<
  Device,
  | "orgId"
  | "projectId"
  | "lastGoodFirmware"
  | "lastSeenAt"
  | "hardwareRevision"
  | "agent"
  | "tokenHash"
>;
type SeedFirmware = Omit<
  FirmwareRelease,
  | "orgId"
  | "projectId"
  | "platforms"
  | "minVersion"
  | "hardwareRevisions"
  | "sha256"
  | "size"
  | "signature"
  | "blobId"
  | "fileName"
>;
type SeedDeployment = Omit<
  Deployment,
  | "orgId"
  | "projectId"
  | "firmwareId"
  | "createdBy"
  | "results"
  | "mode"
  | "recovery"
  | "injectFailure"
>;

export const INITIAL_STATS: FleetStats = {
  total: 128,
  online: 114,
  updating: 8,
  offline: 6,
  error: 1,
};

export const INITIAL_DEVICES: SeedDevice[] = [
  {
    id: "dev-a1",
    name: "Sensor Hub A1",
    deviceId: "FF-A1-8C2E",
    platform: "ESP32",
    firmware: "v1.3.0",
    status: "online",
    lastSeen: "12s ago",
    location: "Plant floor · Bay 3",
    firmwareHistory: [
      { version: "v1.3.0", date: "Jul 18, 2026", note: "Production rollout" },
      { version: "v1.2.1", date: "Mar 02, 2026", note: "Initial production" },
      { version: "v1.1.8", date: "Nov 12, 2025", note: "Pilot firmware" },
    ],
    deploymentHistory: [
      { version: "v1.3.0", date: "Jul 18, 2026", note: "Completed · 100%" },
      { version: "v1.2.1", date: "Mar 02, 2026", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-b7",
    name: "Gateway B7",
    deviceId: "FF-B7-91AF",
    platform: "STM32",
    firmware: "v1.2.1",
    status: "online",
    lastSeen: "28s ago",
    location: "Edge closet · Rack 2",
    firmwareHistory: [
      { version: "v1.2.1", date: "Mar 04, 2026", note: "Production release" },
      { version: "v1.1.8", date: "Oct 30, 2025", note: "Field trial" },
    ],
    deploymentHistory: [
      { version: "v1.2.1", date: "Mar 04, 2026", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-c4",
    name: "Tracker C4",
    deviceId: "FF-C4-44D1",
    platform: "nRF52",
    firmware: "v1.1.8",
    status: "offline",
    lastSeen: "14h ago",
    location: "Yard · Asset trailer",
    firmwareHistory: [
      { version: "v1.1.8", date: "Nov 12, 2025", note: "Deprecated channel" },
    ],
    deploymentHistory: [
      { version: "v1.1.8", date: "Nov 12, 2025", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-d2",
    name: "Controller D2",
    deviceId: "FF-D2-B71C",
    platform: "ESP32",
    firmware: "v1.3.0",
    status: "updating",
    lastSeen: "Live",
    location: "Line 4 · Control cabinet",
    firmwareHistory: [
      { version: "v1.3.0", date: "Jul 18, 2026", note: "Production rollout" },
      { version: "v1.2.1", date: "Mar 02, 2026", note: "Initial production" },
    ],
    deploymentHistory: [
      { version: "v1.4.0", date: "Sep 3, 2026", note: "Updating · 68%" },
      { version: "v1.3.0", date: "Jul 18, 2026", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-e5",
    name: "Meter E5",
    deviceId: "FF-E5-0A19",
    platform: "STM32",
    firmware: "v1.3.0",
    status: "online",
    lastSeen: "1m ago",
    location: "Utility room · Panel C",
    firmwareHistory: [
      { version: "v1.3.0", date: "Jul 19, 2026", note: "Production rollout" },
      { version: "v1.2.1", date: "Mar 03, 2026", note: "Initial production" },
    ],
    deploymentHistory: [
      { version: "v1.3.0", date: "Jul 19, 2026", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-f8",
    name: "Node F8",
    deviceId: "FF-F8-6E40",
    platform: "ESP32",
    firmware: "v1.2.1",
    status: "online",
    lastSeen: "4m ago",
    location: "Cold storage · Zone B",
    firmwareHistory: [
      { version: "v1.2.1", date: "Mar 02, 2026", note: "Initial production" },
    ],
    deploymentHistory: [
      { version: "v1.2.1", date: "Mar 02, 2026", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-g3",
    name: "Beacon G3",
    deviceId: "FF-G3-22B8",
    platform: "nRF52",
    firmware: "v1.3.0",
    status: "online",
    lastSeen: "9s ago",
    location: "Warehouse · Aisle 12",
    firmwareHistory: [
      { version: "v1.3.0", date: "Jul 18, 2026", note: "Production rollout" },
    ],
    deploymentHistory: [
      { version: "v1.3.0", date: "Jul 18, 2026", note: "Completed · 100%" },
    ],
  },
  {
    id: "dev-h9",
    name: "Relay H9",
    deviceId: "FF-H9-DA03",
    platform: "STM32",
    firmware: "v1.2.1",
    status: "error",
    lastSeen: "38m ago",
    location: "Pump station · West",
    firmwareHistory: [
      { version: "v1.2.1", date: "Mar 08, 2026", note: "Production release" },
    ],
    deploymentHistory: [
      { version: "v1.2.1", date: "Mar 08, 2026", note: "Failed · retry queued" },
    ],
  },
];

export const INITIAL_FIRMWARE: SeedFirmware[] = [
  {
    id: "fw-140",
    version: "v1.4.0",
    channel: "beta",
    description: "Improved sensor stability and connectivity.",
    deviceCount: 12,
    createdAt: "2026-08-28T14:10:00.000Z",
  },
  {
    id: "fw-130",
    version: "v1.3.0",
    channel: "production",
    description: "Improved device reliability and bug fixes.",
    deviceCount: 84,
    createdAt: "2026-07-18T09:00:00.000Z",
  },
  {
    id: "fw-121",
    version: "v1.2.1",
    channel: "production",
    description: "Initial production release.",
    deviceCount: 26,
    createdAt: "2026-03-02T11:20:00.000Z",
  },
  {
    id: "fw-118",
    version: "v1.1.8",
    channel: "deprecated",
    description: "Legacy field-trial build. Scheduled for retirement.",
    deviceCount: 6,
    createdAt: "2025-11-12T16:00:00.000Z",
  },
];

export const INITIAL_DEPLOYMENTS: SeedDeployment[] = [
  {
    id: "dep-130",
    firmwareVersion: "v1.3.0",
    deviceIds: ["dev-a1", "dev-d2", "dev-e5", "dev-g3"],
    deviceCount: 84,
    status: "completed",
    progress: 100,
    createdAt: "2026-07-18T09:12:00.000Z",
    previousVersions: {},
    deviceProgress: {},
    simulate: false,
  },
  {
    id: "dep-140-beta",
    firmwareVersion: "v1.4.0",
    deviceIds: ["dev-d2"],
    deviceCount: 12,
    status: "updating",
    progress: 68,
    createdAt: "2026-09-03T08:40:00.000Z",
    previousVersions: { "dev-d2": "v1.3.0" },
    deviceProgress: { "dev-d2": 68 },
    simulate: false,
  },
  {
    id: "dep-122",
    firmwareVersion: "v1.2.2",
    deviceIds: ["dev-b7", "dev-f8"],
    deviceCount: 32,
    status: "completed",
    progress: 100,
    createdAt: "2026-05-09T13:05:00.000Z",
    previousVersions: {},
    deviceProgress: {},
    simulate: false,
  },
];

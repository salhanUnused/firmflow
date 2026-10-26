export type DeviceStatus = "online" | "offline" | "updating" | "error";
export type FirmwareChannel = "production" | "beta" | "deprecated";
export type DeploymentStatus =
  | "queued"
  | "updating"
  | "completed"
  | "failed"
  | "rolled_back"
  | "recovering";
export type Platform = "ESP32" | "STM32" | "nRF52";
export type UserRole = "admin" | "engineer" | "operator" | "viewer";
export type PlanId = "free" | "starter" | "growth";
export type DeviceAgent = "virtual" | "esp32";
export type DeployMode = "simulate" | "live";
export type RecoveryStrategy = "auto_rollback" | "hold" | "retry";
export type AlertSeverity = "info" | "warning" | "critical";

export interface FirmwareEvent {
  version: string;
  date: string;
  note: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanId;
  city: string;
  createdAt: string;
  usageMonth: string;
  deploymentsThisMonth: number;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
}

export interface Device {
  id: string;
  orgId: string;
  projectId: string;
  name: string;
  deviceId: string;
  platform: Platform;
  firmware: string;
  lastGoodFirmware: string;
  status: DeviceStatus;
  lastSeen: string;
  lastSeenAt: string;
  location: string;
  hardwareRevision: string;
  agent: DeviceAgent;
  tokenHash: string;
  firmwareHistory: FirmwareEvent[];
  deploymentHistory: FirmwareEvent[];
}

export interface FirmwareRelease {
  id: string;
  orgId: string;
  projectId: string;
  version: string;
  description: string;
  channel: FirmwareChannel;
  deviceCount: number;
  createdAt: string;
  platforms: Platform[];
  minVersion: string;
  hardwareRevisions: string[];
  sha256: string;
  size: number;
  signature: string;
  blobId: string;
  fileName: string;
}

export interface DeviceTargetResult {
  status: "pending" | "updating" | "verified" | "failed" | "rolled_back";
  error?: string;
  verifiedAt?: string;
}

export interface Deployment {
  id: string;
  orgId: string;
  projectId: string;
  firmwareVersion: string;
  firmwareId: string;
  deviceIds: string[];
  deviceCount: number;
  status: DeploymentStatus;
  progress: number;
  createdAt: string;
  createdBy: string;
  previousVersions: Record<string, string>;
  deviceProgress: Record<string, number>;
  results: Record<string, DeviceTargetResult>;
  mode: DeployMode;
  recovery: RecoveryStrategy;
  simulate: boolean;
  injectFailure: boolean;
  rollbackTo?: string;
  sourceDeploymentId?: string;
}

export interface PendingOta {
  deviceId: string;
  orgId: string;
  deploymentId: string;
  firmwareId: string;
  version: string;
  createdAt: string;
}

export interface TelemetrySample {
  id: string;
  orgId: string;
  deviceId: string;
  at: string;
  rssi: number;
  uptimeSec: number;
  freeHeap: number;
  firmware: string;
  temperature?: number;
}

export interface DeviceLog {
  id: string;
  orgId: string;
  deviceId: string;
  at: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
}

export interface AlertRule {
  id: string;
  orgId: string;
  name: string;
  enabled: boolean;
  type: "device_offline" | "update_failed" | "heap_low" | "rssi_low";
  threshold: number;
  notifyEmail: boolean;
}

export interface Alert {
  id: string;
  orgId: string;
  ruleId: string;
  deviceId?: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  at: string;
  acknowledged: boolean;
}

export interface AuditEvent {
  id: string;
  orgId: string;
  at: string;
  actorId: string;
  actorEmail: string;
  action: string;
  target: string;
  detail: string;
  ip?: string;
}

export interface FleetStats {
  total: number;
  online: number;
  updating: number;
  offline: number;
  error: number;
}

export interface DeployWizardState {
  open: boolean;
  firmwareVersion: string;
  firmwareId?: string;
  deviceIds: string[];
  mode: DeployMode;
  recovery: RecoveryStrategy;
  injectFailure: boolean;
}

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  title: string;
  initials: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  title: string;
  orgId: string;
  orgName: string;
  plan: PlanId;
  platformAdmin: boolean;
}

export interface PlatformOrgRow {
  id: string;
  name: string;
  slug: string;
  plan: PlanId;
  createdAt: string;
  seats: number;
  devices: number;
  firmware: number;
  deployments: number;
}

export interface PlatformOverview {
  persistence: string;
  operators: Array<{
    id: string;
    email: string;
    fullName: string;
    createdAt: string;
  }>;
  orgs: PlatformOrgRow[];
  totals: {
    orgs: number;
    users: number;
    devices: number;
    firmware: number;
    deployments: number;
  };
}

export interface ActivityItem {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface UsageSnapshot {
  devices: number;
  firmware: number;
  projects: number;
  seats: number;
  deploymentsThisMonth: number;
}

export interface OrgState {
  org: Organization;
  projects: Project[];
  devices: Device[];
  firmware: FirmwareRelease[];
  deployments: Deployment[];
  telemetry: TelemetrySample[];
  logs: DeviceLog[];
  alerts: Alert[];
  alertRules: AlertRule[];
  audit: AuditEvent[];
  team: TeamMember[];
  stats: FleetStats;
  usage: UsageSnapshot;
  activities: ActivityItem[];
}

export interface PublicDevice {
  id: string;
  name: string;
  deviceId: string;
  platform: Platform;
  firmware: string;
  hardwareRevision: string;
  projectId: string;
}

export interface OtaManifest {
  update: boolean;
  version?: string;
  sha256?: string;
  size?: number;
  signature?: string;
  url?: string;
}

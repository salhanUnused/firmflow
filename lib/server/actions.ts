import { compatibility, normalizeVersion } from "@/lib/compat";
import {
  PLANS,
  assertWithinLimit,
  currentMonthKey,
  EntitlementError,
} from "@/lib/plans";
import { assertCan, can, ForbiddenError } from "@/lib/roles";
import {
  deviceToken,
  hashPassword,
  sha256,
  signFirmwareHash,
  verifyPassword,
} from "@/lib/server/crypto";
import { ensureSeed, HELIO_ORG_ID, HELIO_PROJECT_ID } from "@/lib/server/seed";
import { readBlob, saveBlob, withWorld, type UserRecord, type World } from "@/lib/server/store";
import { formatRelative, initials, slugify, uid } from "@/lib/utils";
import type {
  AlertRule,
  AuthUser,
  DeployMode,
  Device,
  DeviceAgent,
  DeviceLog,
  FirmwareChannel,
  OrgState,
  Platform,
  Project,
  RecoveryStrategy,
  UserRole,
} from "@/types";
import { ACTIVITIES } from "@/lib/demo-users";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function notFound(what = "Resource"): never {
  throw new ApiError(404, `${what} not found.`);
}

function audit(
  world: World,
  user: UserRecord,
  action: string,
  target: string,
  detail: string,
) {
  world.audit.unshift({
    id: uid("aud"),
    orgId: user.orgId,
    at: new Date().toISOString(),
    actorId: user.id,
    actorEmail: user.email,
    action,
    target,
    detail,
  });
  world.audit = world.audit.slice(0, 500);
}

function orgOf(world: World, orgId: string) {
  return world.orgs.find((item) => item.id === orgId);
}

function usageOf(world: World, orgId: string) {
  const org = orgOf(world, orgId);
  const month = currentMonthKey();
  if (org && org.usageMonth !== month) {
    org.usageMonth = month;
    org.deploymentsThisMonth = 0;
  }
  return {
    devices: world.devices.filter((item) => item.orgId === orgId).length,
    firmware: world.firmware.filter((item) => item.orgId === orgId).length,
    projects: world.projects.filter((item) => item.orgId === orgId).length,
    seats: world.users.filter((item) => item.orgId === orgId).length,
    deploymentsThisMonth: org?.deploymentsThisMonth ?? 0,
  };
}

function refreshDeviceCounts(world: World, orgId: string) {
  for (const release of world.firmware.filter((item) => item.orgId === orgId)) {
    release.deviceCount = world.devices.filter(
      (device) => device.orgId === orgId && device.firmware === release.version,
    ).length;
  }
}

function statsOf(world: World, orgId: string) {
  const devices = world.devices.filter((item) => item.orgId === orgId);
  return {
    total: devices.length,
    online: devices.filter((item) => item.status === "online").length,
    updating: devices.filter((item) => item.status === "updating").length,
    offline: devices.filter((item) => item.status === "offline").length,
    error: devices.filter((item) => item.status === "error").length,
  };
}

function toAuthUser(world: World, user: UserRecord): AuthUser {
  const org = orgOf(world, user.orgId);
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    title: user.title,
    orgId: user.orgId,
    orgName: org?.name ?? "Workspace",
    plan: org?.plan ?? "free",
  };
}

function publicDevice(device: Device): Device {
  return { ...device, tokenHash: "" };
}

export function scopedState(world: World, user: UserRecord): OrgState {
  const org = orgOf(world, user.orgId);
  if (!org) notFound("Organization");
  const devices = world.devices
    .filter((item) => item.orgId === user.orgId)
    .map((device) => ({
      ...publicDevice(device),
      lastSeen: formatRelative(device.lastSeenAt),
    }));
  const team = world.users
    .filter((item) => item.orgId === user.orgId)
    .map((member) => ({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      title: member.title,
      initials: initials(member.fullName),
    }));
  return {
    org,
    projects: world.projects.filter((item) => item.orgId === user.orgId),
    devices,
    firmware: world.firmware.filter((item) => item.orgId === user.orgId),
    deployments: world.deployments.filter((item) => item.orgId === user.orgId),
    telemetry: world.telemetry.filter((item) => item.orgId === user.orgId).slice(0, 400),
    logs: world.logs.filter((item) => item.orgId === user.orgId).slice(0, 400),
    alerts: world.alerts.filter((item) => item.orgId === user.orgId).slice(0, 100),
    alertRules: world.alertRules.filter((item) => item.orgId === user.orgId),
    audit: can(user.role, "viewAudit")
      ? world.audit.filter((item) => item.orgId === user.orgId).slice(0, 200)
      : [],
    team,
    stats: statsOf(world, user.orgId),
    usage: usageOf(world, user.orgId),
    activities:
      user.orgId === HELIO_ORG_ID
        ? ACTIVITIES
        : world.audit
            .filter((item) => item.orgId === user.orgId)
            .slice(0, 6)
            .map((item) => ({
              id: item.id,
              time: formatRelative(item.at),
              title: item.action,
              detail: item.detail,
            })),
  };
}

export async function bootstrap() {
  return withWorld(async (world) => {
    await ensureSeed(world);
    return world;
  });
}

export async function findUserById(id: string) {
  return withWorld(async (world) => {
    await ensureSeed(world);
    return world.users.find((item) => item.id === id) ?? null;
  });
}

export async function signInUser(email: string, password: string) {
  return withWorld(async (world) => {
    await ensureSeed(world);
    const user = world.users.find((item) => item.email === email.trim().toLowerCase());
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new ApiError(401, "Email or password is wrong.");
    }
    audit(world, user, "auth.sign_in", user.id, "Signed in");
    return toAuthUser(world, user);
  });
}

export async function signUpUser(input: {
  fullName: string;
  email: string;
  password: string;
  orgName: string;
  projectName: string;
}) {
  if (input.password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }
  return withWorld(async (world) => {
    await ensureSeed(world);
    const email = input.email.trim().toLowerCase();
    if (world.users.some((item) => item.email === email)) {
      throw new ApiError(409, "An account with that email already exists.");
    }
    const now = new Date().toISOString();
    const orgId = uid("org");
    const projectId = uid("proj");
    const userId = uid("usr");
    world.orgs.push({
      id: orgId,
      name: input.orgName.trim() || "New workspace",
      slug: slugify(input.orgName),
      plan: "starter",
      city: "",
      createdAt: now,
      usageMonth: currentMonthKey(),
      deploymentsThisMonth: 0,
    });
    world.projects.push({
      id: projectId,
      orgId,
      name: input.projectName.trim() || "Production",
      slug: slugify(input.projectName || "production"),
      description: "Default project",
      createdAt: now,
    });
    await ensureFactoryFirmware(world, orgId, projectId);
    const user: UserRecord = {
      id: userId,
      email,
      passwordHash: hashPassword(input.password),
      fullName: input.fullName.trim(),
      role: "admin",
      title: "Owner",
      orgId,
      createdAt: now,
    };
    world.users.push(user);
    world.alertRules.push(
      {
        id: uid("rule"),
        orgId,
        name: "Device silent > 15 minutes",
        enabled: true,
        type: "device_offline",
        threshold: 15,
        notifyEmail: true,
      },
      {
        id: uid("rule"),
        orgId,
        name: "OTA verification failed",
        enabled: true,
        type: "update_failed",
        threshold: 1,
        notifyEmail: true,
      },
    );
    audit(world, user, "org.created", orgId, `Created workspace ${input.orgName}`);
    audit(world, user, "project.created", projectId, `Created project ${input.projectName}`);
    return toAuthUser(world, user);
  });
}

export async function getStateForUser(userId: string) {
  return withWorld(async (world) => {
    await ensureSeed(world);
    const user = world.users.find((item) => item.id === userId);
    if (!user) throw new ApiError(401, "Session expired.");
    return {
      user: toAuthUser(world, user),
      state: scopedState(world, user),
      persistence: process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "local",
    };
  });
}

function requireUser(world: World, userId: string) {
  const user = world.users.find((item) => item.id === userId);
  if (!user) throw new ApiError(401, "Session expired.");
  return user;
}

function requireProject(world: World, orgId: string, projectId?: string) {
  const projects = world.projects.filter((item) => item.orgId === orgId);
  const project = projectId
    ? projects.find((item) => item.id === projectId)
    : projects[0];
  if (!project) notFound("Project");
  return project;
}

export async function createProject(userId: string, input: { name: string; description: string }) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "manageProjects");
    const org = orgOf(world, user.orgId);
    if (!org) notFound("Organization");
    assertWithinLimit(usageOf(world, user.orgId), PLANS[org.plan], "projects");
    const project: Project = {
      id: uid("proj"),
      orgId: user.orgId,
      name: input.name.trim(),
      slug: slugify(input.name),
      description: input.description.trim(),
      createdAt: new Date().toISOString(),
    };
    world.projects.push(project);
    audit(world, user, "project.created", project.id, project.name);
    return project;
  });
}

export async function registerDevice(
  userId: string,
  input: {
    name: string;
    platform: Platform;
    projectId?: string;
    location?: string;
    hardwareRevision?: string;
    agent?: DeviceAgent;
  },
) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "addDevice");
    const org = orgOf(world, user.orgId);
    if (!org) notFound("Organization");
    assertWithinLimit(usageOf(world, user.orgId), PLANS[org.plan], "devices");
    const project = requireProject(world, user.orgId, input.projectId);
    await ensureFactoryFirmware(world, user.orgId, project.id);
    const token = deviceToken();
    const now = new Date().toISOString();
    const device: Device = {
      id: uid("dev"),
      orgId: user.orgId,
      projectId: project.id,
      name: input.name.trim(),
      deviceId: `FF-${input.platform.slice(0, 3).toUpperCase()}-${uid("X").slice(-4)}`,
      platform: input.platform,
      firmware: "v0.0.0",
      lastGoodFirmware: "v0.0.0",
      status: input.agent === "esp32" ? "offline" : "online",
      lastSeen: "just now",
      lastSeenAt: now,
      location: input.location?.trim() || "Unassigned",
      hardwareRevision: input.hardwareRevision?.trim() || "rev-c",
      agent: input.agent ?? "virtual",
      tokenHash: sha256(token),
      firmwareHistory: [
        { version: "v0.0.0", date: new Date().toLocaleDateString("en-US"), note: "Registered" },
      ],
      deploymentHistory: [],
    };
    world.devices.unshift(device);
    world.logs.unshift({
      id: uid("log"),
      orgId: user.orgId,
      deviceId: device.id,
      at: now,
      level: "info",
      message: `Registered as ${device.agent} device`,
    });
    audit(
      world,
      user,
      "device.registered",
      device.id,
      `${device.name} (${device.deviceId}) on ${device.platform}`,
    );
    refreshDeviceCounts(world, user.orgId);
    return { device: publicDevice(device), token };
  });
}

export async function createFirmwareRelease(
  userId: string,
  input: {
    version: string;
    description: string;
    channel: FirmwareChannel;
    projectId?: string;
    platforms: Platform[];
    minVersion?: string;
    hardwareRevisions?: string[];
    fileName: string;
    bytes: Buffer;
  },
) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "createFirmware");
    const org = orgOf(world, user.orgId);
    if (!org) notFound("Organization");
    assertWithinLimit(usageOf(world, user.orgId), PLANS[org.plan], "firmware");
    const project = requireProject(world, user.orgId, input.projectId);
    const version = normalizeVersion(input.version);
    if (
      world.firmware.some((item) => item.orgId === user.orgId && item.version === version)
    ) {
      throw new ApiError(409, `${version} already exists in this workspace.`);
    }
    if (input.bytes.length > 4_000_000) {
      throw new ApiError(413, "Firmware files must be 4 MB or smaller.");
    }
    const digest = sha256(input.bytes);
    const blobId = uid("blob");
    await saveBlob(blobId, input.bytes);
    const release = {
      id: uid("fw"),
      orgId: user.orgId,
      projectId: project.id,
      version,
      description: input.description.trim(),
      channel: input.channel,
      deviceCount: 0,
      createdAt: new Date().toISOString(),
      platforms: input.platforms.length ? input.platforms : (["ESP32"] as Platform[]),
      minVersion: input.minVersion ? normalizeVersion(input.minVersion) : "v0.0.0",
      hardwareRevisions: input.hardwareRevisions?.filter(Boolean) ?? [],
      sha256: digest,
      size: input.bytes.length,
      signature: signFirmwareHash(digest),
      blobId,
      fileName: input.fileName,
    };
    world.firmware.unshift(release);
    audit(
      world,
      user,
      "firmware.uploaded",
      release.id,
      `${version} · ${digest.slice(0, 12)} · ${release.platforms.join(",")}`,
    );
    return release;
  });
}

async function ensureFactoryFirmware(world: World, orgId: string, projectId: string) {
  if (world.firmware.some((item) => item.orgId === orgId && item.version === "v0.0.0")) {
    return;
  }
  const bytes = Buffer.from("FIRM FLOW FACTORY v0.0.0\n", "utf8");
  const blobId = uid("blob");
  await saveBlob(blobId, bytes);
  const digest = sha256(bytes);
  world.firmware.push({
    id: uid("fw"),
    orgId,
    projectId,
    version: "v0.0.0",
    description: "Factory image recorded at registration.",
    channel: "production",
    deviceCount: 0,
    createdAt: new Date().toISOString(),
    platforms: ["ESP32", "STM32", "nRF52"],
    minVersion: "v0.0.0",
    hardwareRevisions: [],
    sha256: digest,
    size: bytes.length,
    signature: signFirmwareHash(digest),
    blobId,
    fileName: "factory-v0.0.0.bin",
  });
}

function rollMonth(org: NonNullable<ReturnType<typeof orgOf>>) {
  const month = currentMonthKey();
  if (org.usageMonth !== month) {
    org.usageMonth = month;
    org.deploymentsThisMonth = 0;
  }
}

type DeployInput = {
  firmwareId: string;
  deviceIds: string[];
  mode: DeployMode;
  recovery: RecoveryStrategy;
  injectFailure?: boolean;
  rollbackTo?: string;
  sourceDeploymentId?: string;
};

function startDeploymentIn(world: World, user: UserRecord, input: DeployInput) {
  assertCan(user.role, input.mode === "live" ? "liveDeploy" : "deploy");
  if (input.rollbackTo) assertCan(user.role, "rollback");
  const org = orgOf(world, user.orgId);
  if (!org) notFound("Organization");
  rollMonth(org);
  assertWithinLimit(usageOf(world, user.orgId), PLANS[org.plan], "deploymentsPerMonth");
  if (input.mode === "live" && !PLANS[org.plan].liveOta) {
    throw new EntitlementError("Live ESP32 OTA requires Starter or Growth.");
  }
  const release = world.firmware.find(
    (item) => item.id === input.firmwareId && item.orgId === user.orgId,
  );
  if (!release) notFound("Firmware");
  const devices = world.devices.filter(
    (item) => item.orgId === user.orgId && input.deviceIds.includes(item.id),
  );
  if (devices.length === 0) throw new ApiError(400, "Select at least one device.");

  const incompatible = devices
    .map((device) => ({ device, compat: compatibility(release, device) }))
    .filter((item) => !item.compat.ok);
  if (incompatible.length && !input.rollbackTo) {
    throw new ApiError(
      409,
      `Incompatible: ${incompatible
        .map((item) => `${item.device.name} (${item.compat.reasons[0]})`)
        .join("; ")}`,
    );
  }

  const id = uid("dep");
  const previousVersions = Object.fromEntries(
    devices.map((device) => [device.id, device.firmware]),
  );
  const deviceProgress = Object.fromEntries(devices.map((device) => [device.id, 0]));
  const results = Object.fromEntries(
    devices.map((device) => [device.id, { status: "pending" as const }]),
  );
  const deployment = {
    id,
    orgId: user.orgId,
    projectId: release.projectId,
    firmwareVersion: release.version,
    firmwareId: release.id,
    deviceIds: devices.map((device) => device.id),
    deviceCount: devices.length,
    status: "updating" as const,
    progress: 0,
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    previousVersions,
    deviceProgress,
    results,
    mode: input.mode,
    recovery: input.recovery,
    simulate: input.mode === "simulate",
    injectFailure: Boolean(input.injectFailure),
    rollbackTo: input.rollbackTo,
    sourceDeploymentId: input.sourceDeploymentId,
  };
  world.deployments.unshift(deployment);
  org.deploymentsThisMonth += 1;

  for (const device of devices) {
    device.status = "updating";
    device.deploymentHistory.unshift({
      version: release.version,
      date: new Date().toLocaleDateString("en-US"),
      note: input.mode === "simulate" ? "Simulated OTA" : "Live OTA queued",
    });
    if (input.mode === "live") {
      world.pendingOta = world.pendingOta.filter((item) => item.deviceId !== device.id);
      world.pendingOta.push({
        deviceId: device.id,
        orgId: user.orgId,
        deploymentId: id,
        firmwareId: release.id,
        version: release.version,
        createdAt: new Date().toISOString(),
      });
    }
  }

  audit(
    world,
    user,
    input.rollbackTo ? "deployment.rollback" : "deployment.started",
    id,
    `${input.mode} ${release.version} → ${devices.length} devices`,
  );
  return deployment;
}

export async function startDeployment(userId: string, input: DeployInput) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    return startDeploymentIn(world, user, input);
  });
}

export async function tickSimulations() {
  return withWorld(async (world) => {
    const now = Date.now();
    for (const deployment of world.deployments) {
      if (!deployment.simulate || deployment.status !== "updating") continue;
      let total = 0;
      for (const deviceId of deployment.deviceIds) {
        const current = deployment.deviceProgress[deviceId] ?? 0;
        if (current >= 100) {
          total += 100;
          continue;
        }
        const failThis =
          deployment.injectFailure &&
          deviceId === deployment.deviceIds[0] &&
          current >= 55;
        if (failThis) {
          deployment.deviceProgress[deviceId] = current;
          deployment.results[deviceId] = {
            status: "failed",
            error: "Signature verify failed (injected)",
          };
          const device = world.devices.find((item) => item.id === deviceId);
          if (device) {
            device.status = "error";
            device.firmware = deployment.previousVersions[deviceId] ?? device.lastGoodFirmware;
            appendLog(world, device, "error", "Simulated OTA failed; staying on last good build");
            raiseAlert(world, device, "update_failed", `${device.name} failed OTA`, "Injected verification failure");
          }
          continue;
        }
        deployment.deviceProgress[deviceId] = Math.min(100, current + 10 + Math.round(Math.random() * 12));
        total += deployment.deviceProgress[deviceId];
      }

      const failed = deployment.deviceIds.filter(
        (id) => deployment.results[id]?.status === "failed",
      );
      const done = deployment.deviceIds.every(
        (id) =>
          (deployment.deviceProgress[id] ?? 0) >= 100 ||
          deployment.results[id]?.status === "failed",
      );
      const progressed = deployment.deviceIds.filter(
        (id) => (deployment.deviceProgress[id] ?? 0) >= 100 && deployment.results[id]?.status !== "failed",
      );
      deployment.progress = Math.round(total / Math.max(1, deployment.deviceIds.length));

      if (!done) continue;

      for (const deviceId of progressed) {
        const device = world.devices.find((item) => item.id === deviceId);
        if (!device) continue;
        completeDeviceUpdate(world, device, deployment.firmwareVersion, "Simulated OTA verified");
        deployment.results[deviceId] = {
          status: "verified",
          verifiedAt: new Date(now).toISOString(),
        };
        deployment.deviceProgress[deviceId] = 100;
      }

      if (failed.length && deployment.recovery === "auto_rollback") {
        deployment.status = "recovering";
        queueAutoRollback(world, deployment, failed);
      } else if (failed.length) {
        deployment.status = "failed";
      } else {
        deployment.status = deployment.rollbackTo ? "rolled_back" : "completed";
        deployment.progress = 100;
        deployment.simulate = false;
      }
      refreshDeviceCounts(world, deployment.orgId);
    }
    markOffline(world, now);
    return true;
  });
}

function appendLog(
  world: World,
  device: Device,
  level: "debug" | "info" | "warn" | "error",
  message: string,
) {
  world.logs.unshift({
    id: uid("log"),
    orgId: device.orgId,
    deviceId: device.id,
    at: new Date().toISOString(),
    level,
    message,
  });
  world.logs = world.logs.slice(0, 2000);
}

function raiseAlert(
  world: World,
  device: Device,
  type: AlertRule["type"],
  title: string,
  detail: string,
) {
  const rule = world.alertRules.find(
    (item) => item.orgId === device.orgId && item.type === type && item.enabled,
  );
  if (!rule) return;
  const recent = world.alerts.find(
    (item) =>
      item.orgId === device.orgId &&
      item.deviceId === device.id &&
      item.title === title &&
      Date.now() - new Date(item.at).getTime() < 120_000,
  );
  if (recent) return;
  world.alerts.unshift({
    id: uid("alrt"),
    orgId: device.orgId,
    ruleId: rule.id,
    deviceId: device.id,
    severity: type === "update_failed" ? "critical" : "warning",
    title,
    detail,
    at: new Date().toISOString(),
    acknowledged: false,
  });
}

function completeDeviceUpdate(
  world: World,
  device: Device,
  version: string,
  note: string,
) {
  device.firmware = version;
  device.lastGoodFirmware = version;
  device.status = "online";
  device.lastSeenAt = new Date().toISOString();
  device.lastSeen = "just now";
  device.firmwareHistory.unshift({
    version,
    date: new Date().toLocaleDateString("en-US"),
    note,
  });
}

function queueAutoRollback(
  world: World,
  source: World["deployments"][number],
  failedIds: string[],
) {
  const actor = world.users.find((item) => item.orgId === source.orgId && item.role === "admin");
  if (!actor) return;
  const restore = source.previousVersions[failedIds[0]];
  const restoreRelease = world.firmware.find(
    (item) => item.orgId === source.orgId && item.version === restore,
  );
  if (!restoreRelease) {
    source.status = "failed";
    return;
  }
  const existing = world.deployments.find(
    (item) => item.sourceDeploymentId === source.id && item.rollbackTo,
  );
  if (existing) return;
  const id = uid("dep");
  const devices = world.devices.filter((item) => failedIds.includes(item.id));
  world.deployments.unshift({
    id,
    orgId: source.orgId,
    projectId: source.projectId,
    firmwareVersion: restoreRelease.version,
    firmwareId: restoreRelease.id,
    deviceIds: failedIds,
    deviceCount: failedIds.length,
    status: "updating",
    progress: 0,
    createdAt: new Date().toISOString(),
    createdBy: actor.id,
    previousVersions: Object.fromEntries(failedIds.map((item) => [item, source.firmwareVersion])),
    deviceProgress: Object.fromEntries(failedIds.map((item) => [item, 0])),
    results: Object.fromEntries(failedIds.map((item) => [item, { status: "pending" as const }])),
    mode: source.mode,
    recovery: "hold",
    simulate: source.mode === "simulate",
    injectFailure: false,
    rollbackTo: restoreRelease.version,
    sourceDeploymentId: source.id,
  });
  source.status = "failed";
  for (const device of devices) {
    device.status = "updating";
    if (source.mode === "live") {
      world.pendingOta = world.pendingOta.filter((item) => item.deviceId !== device.id);
      world.pendingOta.push({
        deviceId: device.id,
        orgId: device.orgId,
        deploymentId: id,
        firmwareId: restoreRelease.id,
        version: restoreRelease.version,
        createdAt: new Date().toISOString(),
      });
    }
  }
  world.audit.unshift({
    id: uid("aud"),
    orgId: source.orgId,
    at: new Date().toISOString(),
    actorId: actor.id,
    actorEmail: actor.email,
    action: "deployment.auto_rollback",
    target: id,
    detail: `Auto-recovery to ${restoreRelease.version} after failed ${source.firmwareVersion}`,
  });
}

function markOffline(world: World, now: number) {
  for (const device of world.devices) {
    if (device.status === "updating") continue;
    const age = now - new Date(device.lastSeenAt).getTime();
    if (age > 15 * 60_000 && device.status !== "offline" && device.status !== "error") {
      device.status = "offline";
      raiseAlert(
        world,
        device,
        "device_offline",
        `${device.name} went silent`,
        "No heartbeat for 15 minutes",
      );
    }
  }
}

export async function rollbackDeployment(userId: string, deploymentId: string) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    const source = world.deployments.find(
      (item) => item.id === deploymentId && item.orgId === user.orgId,
    );
    if (!source) notFound("Deployment");
    const restore = Object.values(source.previousVersions)[0];
    if (!restore) throw new ApiError(400, "No previous version recorded.");
    const release = world.firmware.find(
      (item) => item.orgId === user.orgId && item.version === restore,
    );
    if (!release) {
      throw new ApiError(400, `Previous firmware ${restore} is not in the catalog.`);
    }
    return startDeploymentIn(world, user, {
      firmwareId: release.id,
      deviceIds: source.deviceIds,
      mode: source.mode,
      recovery: "hold",
      rollbackTo: restore,
      sourceDeploymentId: source.id,
    });
  });
}

export async function updateMemberRole(userId: string, memberId: string, role: UserRole) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "manageTeam");
    const member = world.users.find(
      (item) => item.id === memberId && item.orgId === user.orgId,
    );
    if (!member) notFound("Member");
    member.role = role;
    audit(world, user, "team.role_changed", member.id, `${member.email} → ${role}`);
    return member;
  });
}

export async function inviteMember(
  userId: string,
  input: { fullName: string; email: string; role: UserRole; password: string; title?: string },
) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "manageTeam");
    const org = orgOf(world, user.orgId);
    if (!org) notFound("Organization");
    assertWithinLimit(usageOf(world, user.orgId), PLANS[org.plan], "seats");
    const email = input.email.trim().toLowerCase();
    if (world.users.some((item) => item.email === email)) {
      throw new ApiError(409, "That email is already registered.");
    }
    const member: UserRecord = {
      id: uid("usr"),
      email,
      passwordHash: hashPassword(input.password),
      fullName: input.fullName.trim(),
      role: input.role,
      title: input.title?.trim() || "Member",
      orgId: user.orgId,
      createdAt: new Date().toISOString(),
    };
    world.users.push(member);
    audit(world, user, "team.invited", member.id, `${email} as ${input.role}`);
    return member;
  });
}

export async function changePlan(userId: string, plan: "free" | "starter" | "growth") {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "manageBilling");
    const org = orgOf(world, user.orgId);
    if (!org) notFound("Organization");
    org.plan = plan;
    audit(world, user, "billing.plan_changed", org.id, plan);
    return org;
  });
}

export async function upsertAlertRule(
  userId: string,
  rule: Partial<World["alertRules"][number]> & { id?: string },
) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "manageAlerts");
    const org = orgOf(world, user.orgId);
    if (!org) notFound("Organization");
    if (!PLANS[org.plan].alerts) {
      throw new EntitlementError("Alerts require Starter or Growth.");
    }
    if (rule.id) {
      const existing = world.alertRules.find(
        (item) => item.id === rule.id && item.orgId === user.orgId,
      );
      if (!existing) notFound("Alert rule");
      Object.assign(existing, rule, { orgId: user.orgId });
      audit(world, user, "alert.rule_updated", existing.id, existing.name);
      return existing;
    }
    const created = {
      id: uid("rule"),
      orgId: user.orgId,
      name: rule.name ?? "New rule",
      enabled: rule.enabled ?? true,
      type: rule.type ?? "device_offline",
      threshold: rule.threshold ?? 15,
      notifyEmail: rule.notifyEmail ?? true,
    };
    world.alertRules.push(created);
    audit(world, user, "alert.rule_created", created.id, created.name);
    return created;
  });
}

export async function acknowledgeAlert(userId: string, alertId: string) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    assertCan(user.role, "acknowledgeAlerts");
    const alert = world.alerts.find(
      (item) => item.id === alertId && item.orgId === user.orgId,
    );
    if (!alert) notFound("Alert");
    alert.acknowledged = true;
    audit(world, user, "alert.acknowledged", alert.id, alert.title);
    return alert;
  });
}

function bearerToken(header: string | null) {
  if (!header) return null;
  const [type, token] = header.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

function deviceByToken(world: World, token: string) {
  const hash = sha256(token);
  const device = world.devices.find((item) => item.tokenHash === hash);
  if (!device) throw new ApiError(401, "Unknown device token.");
  return device;
}

export async function deviceHeartbeat(
  authorization: string | null,
  body: {
    firmware?: string;
    rssi?: number;
    uptimeSec?: number;
    freeHeap?: number;
    temperature?: number;
  },
) {
  return withWorld(async (world) => {
    const token = bearerToken(authorization);
    if (!token) throw new ApiError(401, "Missing device token.");
    const device = deviceByToken(world, token);
    const now = new Date().toISOString();
    device.lastSeenAt = now;
    device.lastSeen = "just now";
    if (device.status === "offline") device.status = "online";
    if (body.firmware && body.firmware !== device.firmware && device.status !== "updating") {
      device.firmware = body.firmware;
    }
    world.telemetry.unshift({
      id: uid("tel"),
      orgId: device.orgId,
      deviceId: device.id,
      at: now,
      rssi: body.rssi ?? -60,
      uptimeSec: body.uptimeSec ?? 0,
      freeHeap: body.freeHeap ?? 120000,
      firmware: body.firmware ?? device.firmware,
      temperature: body.temperature,
    });
    world.telemetry = world.telemetry.slice(0, 4000);
    if (body.freeHeap && body.freeHeap < 40960) {
      raiseAlert(world, device, "heap_low", `${device.name} low heap`, `${body.freeHeap} bytes free`);
    }
    appendLog(world, device, "debug", `Heartbeat ${body.firmware ?? device.firmware}`);
    return {
      ok: true,
      deviceId: device.deviceId,
      firmware: device.firmware,
      pending: world.pendingOta.some((item) => item.deviceId === device.id),
    };
  });
}

export async function deviceOtaCheck(authorization: string | null, origin: string) {
  return withWorld(async (world) => {
    const token = bearerToken(authorization);
    if (!token) throw new ApiError(401, "Missing device token.");
    const device = deviceByToken(world, token);
    const pending = world.pendingOta.find((item) => item.deviceId === device.id);
    if (!pending) return { update: false as const };
    const release = world.firmware.find(
      (item) => item.id === pending.firmwareId && item.orgId === device.orgId,
    );
    if (!release) return { update: false as const };
    const deployment = world.deployments.find((item) => item.id === pending.deploymentId);
    if (deployment) {
      deployment.results[device.id] = { status: "updating" };
      device.status = "updating";
    }
    return {
      update: true as const,
      version: release.version,
      sha256: release.sha256,
      size: release.size,
      signature: release.signature,
      url: `${origin}/api/device/ota/file`,
    };
  });
}

export async function deviceOtaFile(authorization: string | null) {
  return withWorld(async (world) => {
    const token = bearerToken(authorization);
    if (!token) throw new ApiError(401, "Missing device token.");
    const device = deviceByToken(world, token);
    const pending = world.pendingOta.find((item) => item.deviceId === device.id);
    if (!pending) throw new ApiError(404, "No firmware pending.");
    const release = world.firmware.find(
      (item) => item.id === pending.firmwareId && item.orgId === device.orgId,
    );
    if (!release) notFound("Firmware");
    const bytes = await readBlob(release.blobId);
    if (!bytes) throw new ApiError(404, "Firmware blob missing.");
    return { bytes, release };
  });
}

export async function deviceOtaResult(
  authorization: string | null,
  body: { ok: boolean; version?: string; sha256?: string; error?: string },
) {
  return withWorld(async (world) => {
    const token = bearerToken(authorization);
    if (!token) throw new ApiError(401, "Missing device token.");
    const device = deviceByToken(world, token);
    const pending = world.pendingOta.find((item) => item.deviceId === device.id);
    const deployment = pending
      ? world.deployments.find((item) => item.id === pending.deploymentId)
      : world.deployments.find(
          (item) => item.orgId === device.orgId && item.deviceIds.includes(device.id) && item.status === "updating",
        );
    world.pendingOta = world.pendingOta.filter((item) => item.deviceId !== device.id);

    if (body.ok) {
      const version = body.version ?? pending?.version ?? device.firmware;
      completeDeviceUpdate(world, device, version, "Live OTA verified");
      appendLog(world, device, "info", `Installed and verified ${version}`);
      if (deployment) {
        deployment.results[device.id] = {
          status: "verified",
          verifiedAt: new Date().toISOString(),
        };
        deployment.deviceProgress[device.id] = 100;
      }
    } else {
      device.status = "error";
      device.firmware = device.lastGoodFirmware;
      appendLog(
        world,
        device,
        "error",
        `OTA failed: ${body.error ?? "unknown"} — recovery keeps ${device.lastGoodFirmware}`,
      );
      raiseAlert(
        world,
        device,
        "update_failed",
        `${device.name} failed OTA`,
        body.error ?? "Verification or install failed",
      );
      if (deployment) {
        deployment.results[device.id] = {
          status: "failed",
          error: body.error ?? "install failed",
        };
      }
    }

    if (deployment) {
      const ids = deployment.deviceIds;
      const finished = ids.every(
        (id) =>
          deployment.results[id]?.status === "verified" ||
          deployment.results[id]?.status === "failed",
      );
      const verified = ids.filter((id) => deployment.results[id]?.status === "verified").length;
      deployment.progress = Math.round((verified / Math.max(1, ids.length)) * 100);
      if (finished) {
        const failed = ids.filter((id) => deployment.results[id]?.status === "failed");
        if (failed.length && deployment.recovery === "auto_rollback" && !deployment.rollbackTo) {
          queueAutoRollback(world, deployment, failed);
        } else if (failed.length) {
          deployment.status = "failed";
        } else {
          deployment.status = deployment.rollbackTo ? "rolled_back" : "completed";
          deployment.progress = 100;
        }
      }
    }
    refreshDeviceCounts(world, device.orgId);
    return { ok: true, firmware: device.firmware, status: device.status };
  });
}

export async function devicePushLogs(
  authorization: string | null,
  entries: Array<{ level?: DeviceLog["level"]; message: string }>,
) {
  return withWorld(async (world) => {
    const token = bearerToken(authorization);
    if (!token) throw new ApiError(401, "Missing device token.");
    const device = deviceByToken(world, token);
    for (const entry of entries.slice(0, 50)) {
      appendLog(world, device, entry.level ?? "info", entry.message);
    }
    return { ok: true };
  });
}

export async function isolationProbe(userId: string, targetDeviceId: string) {
  return withWorld(async (world) => {
    const user = requireUser(world, userId);
    const device = world.devices.find((item) => item.id === targetDeviceId);
    if (!device || device.orgId !== user.orgId) {
      return { allowed: false, reason: "Device does not belong to this workspace." };
    }
    return { allowed: true, device: publicDevice(device) };
  });
}

export { ForbiddenError, EntitlementError };

import { hashPassword, sha256, signFirmwareHash } from "@/lib/server/crypto";
import { saveBlob, type World } from "@/lib/server/store";
import { DEMO_PASSWORD, TEAM } from "@/lib/demo-users";
import { INITIAL_DEPLOYMENTS, INITIAL_DEVICES, INITIAL_FIRMWARE } from "@/lib/mock-data";
import type {
  AlertRule,
  Device,
  FirmwareRelease,
  Organization,
  Project,
} from "@/types";

export const HELIO_ORG_ID = "org-helio";
export const HELIO_PROJECT_ID = "proj-helio-prod";

function blobFor(version: string) {
  return Buffer.from(
    `FIRM FLOW FIRMWARE ${version}\nplatform=ESP32\nbuilt=seed\n`,
    "utf8",
  );
}

export async function ensureSeed(world: World) {
  if (world.orgs.some((org) => org.id === HELIO_ORG_ID)) {
    return;
  }

  const now = "2026-09-03T08:00:00.000Z";
  const org: Organization = {
    id: HELIO_ORG_ID,
    name: "Helio Labs",
    slug: "helio-labs",
    plan: "growth",
    city: "Bengaluru",
    createdAt: now,
    usageMonth: "2026-09",
    deploymentsThisMonth: 14,
  };

  const project: Project = {
    id: HELIO_PROJECT_ID,
    orgId: HELIO_ORG_ID,
    name: "Production fleet",
    slug: "production",
    description: "Helio Labs field devices across plant floor, yard, and pump stations.",
    createdAt: now,
  };

  world.orgs.push(org);
  world.projects.push(project);

  const passwordHash = hashPassword(DEMO_PASSWORD);
  for (const member of TEAM) {
    world.users.push({
      id: member.id,
      email: member.email.toLowerCase(),
      passwordHash,
      fullName: member.fullName,
      role: member.role,
      title: member.title,
      orgId: HELIO_ORG_ID,
      createdAt: now,
    });
  }

  const devices: Device[] = INITIAL_DEVICES.map((device, index) => ({
    ...device,
    orgId: HELIO_ORG_ID,
    projectId: HELIO_PROJECT_ID,
    lastGoodFirmware: device.firmware,
    lastSeenAt: new Date(Date.now() - index * 20_000).toISOString(),
    hardwareRevision: device.platform === "ESP32" ? "rev-c" : "rev-b",
    agent: device.platform === "ESP32" ? "virtual" : "virtual",
    tokenHash: sha256(`seed-token-${device.id}`),
  }));
  world.devices.push(...devices);

  for (const release of INITIAL_FIRMWARE) {
    const bytes = blobFor(release.version);
    const blobId = `blob-${release.id}`;
    await saveBlob(blobId, bytes);
    const digest = sha256(bytes);
    const full: FirmwareRelease = {
      ...release,
      orgId: HELIO_ORG_ID,
      projectId: HELIO_PROJECT_ID,
      platforms:
        release.version === "v1.4.0"
          ? ["ESP32"]
          : ["ESP32", "STM32", "nRF52"],
      minVersion: release.version === "v1.4.0" ? "v1.2.0" : "v1.0.0",
      hardwareRevisions: release.version === "v1.4.0" ? ["rev-c"] : [],
      sha256: digest,
      size: bytes.length,
      signature: signFirmwareHash(digest),
      blobId,
      fileName: `${release.version}.bin`,
    };
    world.firmware.push(full);
  }

  world.deployments.push(
    ...INITIAL_DEPLOYMENTS.map((deployment) => ({
      ...deployment,
      orgId: HELIO_ORG_ID,
      projectId: HELIO_PROJECT_ID,
      firmwareId:
        world.firmware.find((item) => item.version === deployment.firmwareVersion)?.id ??
        "fw-130",
      createdBy: TEAM[0].id,
      results: Object.fromEntries(
        deployment.deviceIds.map((id) => [
          id,
          {
            status:
              deployment.status === "completed"
                ? ("verified" as const)
                : ("updating" as const),
          },
        ]),
      ),
      mode: "simulate" as const,
      recovery: "auto_rollback" as const,
      injectFailure: false,
    })),
  );

  const defaultRules: AlertRule[] = [
    {
      id: "rule-offline",
      orgId: HELIO_ORG_ID,
      name: "Device silent > 15 minutes",
      enabled: true,
      type: "device_offline",
      threshold: 15,
      notifyEmail: true,
    },
    {
      id: "rule-fail",
      orgId: HELIO_ORG_ID,
      name: "OTA verification failed",
      enabled: true,
      type: "update_failed",
      threshold: 1,
      notifyEmail: true,
    },
    {
      id: "rule-heap",
      orgId: HELIO_ORG_ID,
      name: "Free heap below 40 KB",
      enabled: true,
      type: "heap_low",
      threshold: 40960,
      notifyEmail: false,
    },
  ];
  world.alertRules.push(...defaultRules);

  world.audit.push({
    id: "aud-seed",
    orgId: HELIO_ORG_ID,
    at: now,
    actorId: TEAM[0].id,
    actorEmail: TEAM[0].email,
    action: "workspace.seeded",
    target: HELIO_ORG_ID,
    detail: "Helio Labs demo workspace created",
  });
}

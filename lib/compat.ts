import type { Device, FirmwareRelease } from "@/types";

export function parseVersion(version: string) {
  const cleaned = version.trim().replace(/^v/i, "");
  const [major, minor, patch] = cleaned.split(".").map((part) => {
    const value = Number.parseInt(part, 10);
    return Number.isFinite(value) ? value : 0;
  });
  return { major: major ?? 0, minor: minor ?? 0, patch: patch ?? 0 };
}

export function compareVersions(a: string, b: string) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
}

export function normalizeVersion(version: string) {
  const parsed = parseVersion(version);
  return `v${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export interface CompatResult {
  ok: boolean;
  reasons: string[];
}

export function compatibility(
  release: FirmwareRelease,
  device: Device,
): CompatResult {
  const reasons: string[] = [];
  if (!release.platforms.includes(device.platform)) {
    reasons.push(`Built for ${release.platforms.join(", ")}, not ${device.platform}`);
  }
  if (
    release.hardwareRevisions.length > 0 &&
    !release.hardwareRevisions.includes(device.hardwareRevision)
  ) {
    reasons.push(
      `Hardware ${device.hardwareRevision} is not in ${release.hardwareRevisions.join(", ")}`,
    );
  }
  if (release.minVersion && compareVersions(device.firmware, release.minVersion) < 0) {
    reasons.push(`Device is on ${device.firmware}; needs at least ${release.minVersion}`);
  }
  if (device.firmware === release.version) {
    reasons.push("Device is already on this version");
  }
  return { ok: reasons.length === 0, reasons };
}

import type { PlanId, UsageSnapshot } from "@/types";

export interface PlanLimits {
  id: PlanId;
  label: string;
  devices: number;
  firmware: number;
  projects: number;
  seats: number;
  liveOta: boolean;
  alerts: boolean;
  deploymentsPerMonth: number;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    label: "Free",
    devices: 5,
    firmware: 3,
    projects: 1,
    seats: 2,
    liveOta: false,
    alerts: false,
    deploymentsPerMonth: 10,
  },
  starter: {
    id: "starter",
    label: "Starter",
    devices: 50,
    firmware: 40,
    projects: 5,
    seats: 8,
    liveOta: true,
    alerts: true,
    deploymentsPerMonth: 200,
  },
  growth: {
    id: "growth",
    label: "Growth",
    devices: 500,
    firmware: 200,
    projects: 25,
    seats: 25,
    liveOta: true,
    alerts: true,
    deploymentsPerMonth: 2000,
  },
};

export function currentMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export class EntitlementError extends Error {
  code = "ENTITLEMENT";
  constructor(message: string) {
    super(message);
    this.name = "EntitlementError";
  }
}

export function assertWithinLimit(
  usage: UsageSnapshot,
  limits: PlanLimits,
  kind: keyof Omit<PlanLimits, "id" | "label" | "liveOta" | "alerts">,
) {
  const used =
    kind === "devices"
      ? usage.devices
      : kind === "firmware"
        ? usage.firmware
        : kind === "projects"
          ? usage.projects
          : kind === "seats"
            ? usage.seats
            : usage.deploymentsThisMonth;
  if (used >= limits[kind]) {
    throw new EntitlementError(
      `${limits.label} plan allows ${limits[kind]} ${kind}. Upgrade to continue.`,
    );
  }
}

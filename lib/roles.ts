import type { UserRole } from "@/types";

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  engineer: "Engineer",
  operator: "Operator",
  viewer: "Viewer",
};

export function can(role: UserRole | null | undefined, action: Action) {
  if (!role) return false;
  return ACTIONS[action].includes(role);
}

export type Action =
  | "viewFleet"
  | "manageProjects"
  | "addDevice"
  | "createFirmware"
  | "deploy"
  | "liveDeploy"
  | "rollback"
  | "manageTeam"
  | "resetDemo"
  | "editSettings"
  | "manageBilling"
  | "viewAudit"
  | "manageAlerts"
  | "acknowledgeAlerts";

const ACTIONS: Record<Action, UserRole[]> = {
  viewFleet: ["admin", "engineer", "operator", "viewer"],
  manageProjects: ["admin", "engineer"],
  addDevice: ["admin", "engineer", "operator"],
  createFirmware: ["admin", "engineer"],
  deploy: ["admin", "engineer", "operator"],
  liveDeploy: ["admin", "engineer"],
  rollback: ["admin", "engineer"],
  manageTeam: ["admin"],
  resetDemo: ["admin"],
  editSettings: ["admin"],
  manageBilling: ["admin"],
  viewAudit: ["admin", "engineer"],
  manageAlerts: ["admin", "engineer"],
  acknowledgeAlerts: ["admin", "engineer", "operator"],
};

export class ForbiddenError extends Error {
  code = "FORBIDDEN";
  constructor(message = "Your role cannot do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(role: UserRole, action: Action) {
  if (!can(role, action)) {
    throw new ForbiddenError(
      `The ${ROLE_LABEL[role]} role cannot ${action.replace(/[A-Z]/g, (s) => ` ${s.toLowerCase()}`)}.`,
    );
  }
}

import type { ActivityItem, TeamMember } from "@/types";

export const ORG = {
  id: "org-helio",
  name: "Helio Labs",
  slug: "helio-labs",
  plan: "Early access",
};

export const TEAM: TeamMember[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    fullName: "Aisha Rahman",
    email: "admin@firmflow.io",
    role: "admin",
    title: "Founder",
    initials: "AR",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    fullName: "Priya Nair",
    email: "priya.nair@firmflow.io",
    role: "engineer",
    title: "Firmware lead",
    initials: "PN",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    fullName: "Marcus Chen",
    email: "marcus.chen@firmflow.io",
    role: "operator",
    title: "Field ops",
    initials: "MC",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    fullName: "Sofia Alvarez",
    email: "sofia.alvarez@firmflow.io",
    role: "viewer",
    title: "Support",
    initials: "SA",
  },
];

export const DUMMY_USER_IDS = new Set(TEAM.map((member) => member.id));
export const DUMMY_USER_EMAILS = new Set(
  TEAM.map((member) => member.email.toLowerCase()),
);

export const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    time: "08:40",
    title: "v1.4.0 beta rolling to Controller D2",
    detail: "12 devices in the canary group, currently 68%.",
  },
  {
    id: "act-2",
    time: "07:12",
    title: "Relay H9 flash error",
    detail: "STM32 at Pump station West failed during v1.2.1 retry.",
  },
  {
    id: "act-3",
    time: "Yesterday",
    title: "Tracker C4 went quiet",
    detail: "nRF52 on the yard trailer last reported 14 hours ago.",
  },
];

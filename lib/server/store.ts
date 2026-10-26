import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DUMMY_USER_EMAILS, DUMMY_USER_IDS } from "@/lib/demo-users";
import type {
  Alert,
  AlertRule,
  AuditEvent,
  Deployment,
  Device,
  DeviceLog,
  FirmwareRelease,
  Organization,
  PendingOta,
  Project,
  TelemetrySample,
  UserRole,
} from "@/types";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  title: string;
  orgId: string;
  createdAt: string;
  platformAdmin?: boolean;
}

export interface World {
  version: 1;
  users: UserRecord[];
  orgs: Organization[];
  projects: Project[];
  devices: Device[];
  firmware: FirmwareRelease[];
  deployments: Deployment[];
  pendingOta: PendingOta[];
  telemetry: TelemetrySample[];
  logs: DeviceLog[];
  alerts: Alert[];
  alertRules: AlertRule[];
  audit: AuditEvent[];
}

const emptyWorld = (): World => ({
  version: 1,
  users: [],
  orgs: [],
  projects: [],
  devices: [],
  firmware: [],
  deployments: [],
  pendingOta: [],
  telemetry: [],
  logs: [],
  alerts: [],
  alertRules: [],
  audit: [],
});

const FILE = join(process.cwd(), ".data", "world.json");
const BLOB_DIR = join(process.cwd(), ".data", "blobs");

let memory: World | null = null;
let queue: Promise<unknown> = Promise.resolve();

function supabaseAdmin(): SupabaseClient | null {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readFromFile(): Promise<World | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as World;
  } catch {
    return null;
  }
}

async function writeToFile(world: World) {
  await mkdir(dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(world), "utf8");
}

async function readFromSupabase(client: SupabaseClient): Promise<World | null> {
  const { data, error } = await client
    .from("world_kv")
    .select("value")
    .eq("key", "world")
    .maybeSingle();
  if (error || !data?.value) return null;
  return data.value as World;
}

async function writeToSupabase(client: SupabaseClient, world: World) {
  const { error } = await client.from("world_kv").upsert({
    key: "world",
    value: world,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

function normalizeWorld(world: World) {
  world.users = world.users.filter(
    (user) =>
      !DUMMY_USER_IDS.has(user.id) && !DUMMY_USER_EMAILS.has(user.email.toLowerCase()),
  );
  for (const user of world.users) {
    if (user.platformAdmin == null) user.platformAdmin = false;
  }
}

export async function loadWorld(): Promise<World> {
  if (memory) {
    normalizeWorld(memory);
    return memory;
  }
  const client = supabaseAdmin();
  if (client) {
    const remote = await readFromSupabase(client);
    if (remote?.version === 1) {
      normalizeWorld(remote);
      memory = remote;
      return memory;
    }
  }
  const file = await readFromFile();
  if (file?.version === 1) {
    normalizeWorld(file);
    memory = file;
    return memory;
  }
  memory = emptyWorld();
  return memory;
}

export async function saveWorld(world: World) {
  memory = world;
  const client = supabaseAdmin();
  if (client) {
    await writeToSupabase(client, world);
    return;
  }
  await writeToFile(world);
}

export async function withWorld<T>(fn: (world: World) => Promise<T> | T): Promise<T> {
  let release: (value?: unknown) => void = () => {};
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const previous = queue;
  queue = gate;
  await previous;
  try {
    const world = await loadWorld();
    const result = await fn(world);
    await saveWorld(world);
    return result;
  } finally {
    release();
  }
}

export async function saveBlob(id: string, bytes: Buffer) {
  const client = supabaseAdmin();
  if (client) {
    const { error } = await client.from("firmware_blobs").upsert({
      id,
      bytes: bytes.toString("base64"),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  }
  await mkdir(BLOB_DIR, { recursive: true });
  await writeFile(join(BLOB_DIR, `${id}.bin`), bytes);
}

export async function readBlob(id: string): Promise<Buffer | null> {
  const client = supabaseAdmin();
  if (client) {
    const { data } = await client
      .from("firmware_blobs")
      .select("bytes")
      .eq("id", id)
      .maybeSingle();
    if (!data?.bytes) return null;
    return Buffer.from(data.bytes, "base64");
  }
  try {
    return await readFile(join(BLOB_DIR, `${id}.bin`));
  } catch {
    return null;
  }
}

export function persistenceMode() {
  if (supabaseAdmin()) return "supabase" as const;
  if (process.env.VERCEL) return "memory" as const;
  return "file" as const;
}

import { beginLoading, endLoading, shouldTrackPath } from "@/lib/loading-bus";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const track = shouldTrackPath(path, init?.method);
  if (track) beginLoading();
  try {
    const res = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(init?.headers ?? {}),
      },
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  } finally {
    if (track) endLoading();
  }
}

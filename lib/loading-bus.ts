type Listener = (count: number) => void;

const listeners = new Set<Listener>();
let count = 0;

function emit() {
  for (const listener of listeners) listener(count);
}

export function subscribeLoading(listener: Listener) {
  listeners.add(listener);
  listener(count);
  return () => {
    listeners.delete(listener);
  };
}

export function beginLoading() {
  count += 1;
  emit();
}

export function endLoading() {
  count = Math.max(0, count - 1);
  emit();
}

export function shouldTrackPath(path: string, method?: string) {
  const verb = (method ?? "GET").toUpperCase();
  if (path.startsWith("/api/device/")) return false;
  if (path === "/api/state" && verb === "GET") return false;
  if (path === "/api/auth/session" && verb === "GET") return false;
  return path.startsWith("/api/");
}

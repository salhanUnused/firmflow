import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

const KEY_LEN = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, KEY_LEN);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function sha256(data: Buffer | string) {
  return createHash("sha256").update(data).digest("hex");
}

export function hmacSign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function hmacVerify(value: string, signature: string, secret: string) {
  const expected = Buffer.from(hmacSign(value, secret), "hex");
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export function randomToken(bytes = 24) {
  return randomBytes(bytes).toString("hex");
}

export function deviceToken() {
  return `ffd_${randomToken(24)}`;
}

export function signingSecret() {
  return (
    process.env.FIRMWARE_SIGNING_SECRET ||
    process.env.SESSION_SECRET ||
    "firmflow-dev-signing-secret"
  );
}

export function sessionSecret() {
  return process.env.SESSION_SECRET || "firmflow-dev-session-secret";
}

export function signFirmwareHash(sha: string) {
  return hmacSign(sha, signingSecret());
}

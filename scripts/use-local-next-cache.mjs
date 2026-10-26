import { existsSync, lstatSync, mkdirSync, readlinkSync, rmSync, symlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const projectRoot = process.cwd();
const localDir = join(homedir(), "Library", "Caches", "firmflow-next");
const links = [
  { from: join(projectRoot, ".next"), to: localDir },
  {
    from: join(localDir, "node_modules"),
    to: join(projectRoot, "node_modules"),
  },
];

mkdirSync(localDir, { recursive: true });

function alreadyLinked(from, to) {
  try {
    return lstatSync(from).isSymbolicLink() && readlinkSync(from) === to;
  } catch {
    return false;
  }
}

for (const { from, to } of links) {
  if (alreadyLinked(from, to)) continue;
  if (existsSync(from)) {
    rmSync(from, { recursive: true, force: true });
  }
  symlinkSync(to, from);
}

console.log(`Next.js cache → ${localDir}`);

#!/usr/bin/env node
// Repoint the frontend at a different club API host.
//
// The backend origin has to appear in two places that must never drift apart:
//   1. vercel.json    -> the production /api rewrite
//   2. vite.config.ts -> the local dev proxy default
//
// If only one is updated, the site works in dev and breaks in production (or the
// reverse), and the failure looks like a login bug rather than a routing mistake.
//
// Usage:
//   node scripts/set-backend.mjs https://api.example.com
//   node scripts/set-backend.mjs --show

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERCEL_JSON = join(root, "vercel.json");
const VITE_CONFIG = join(root, "vite.config.ts");

const API_TARGET_RE = /(const API_TARGET =\s*\n?\s*process\.env\.VITE_API_TARGET \?\? ")([^"]+)(")/;

function currentOrigins() {
  const vercel = JSON.parse(readFileSync(VERCEL_JSON, "utf8"));
  const rewrite = vercel.rewrites?.find((r) => r.source === "/api/:path*");
  const viteMatch = readFileSync(VITE_CONFIG, "utf8").match(API_TARGET_RE);
  return {
    production: rewrite ? new URL(rewrite.destination).origin : null,
    dev: viteMatch ? viteMatch[2] : null,
  };
}

function show() {
  const { production, dev } = currentOrigins();
  console.log(`production (vercel.json)  ${production ?? "NOT FOUND"}`);
  console.log(`dev        (vite.config)  ${dev ?? "NOT FOUND"}`);
  if (production && dev && production !== dev) {
    console.warn("\nWARNING: the two hosts disagree. Run this script to sync them.");
    process.exitCode = 1;
  }
}

function normalise(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`"${input}" is not a valid URL. Include the scheme, e.g. https://api.example.com`);
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("The backend must be served over https (localhost excepted).");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Pass only the origin, with no path — e.g. https://api.example.com");
  }
  return url.origin;
}

function apply(origin) {
  // vercel.json — keep the /api rule ahead of the SPA catch-all.
  const vercel = JSON.parse(readFileSync(VERCEL_JSON, "utf8"));
  const idx = vercel.rewrites?.findIndex((r) => r.source === "/api/:path*") ?? -1;
  if (idx === -1) throw new Error('vercel.json has no "/api/:path*" rewrite to update.');
  if (idx !== 0) throw new Error('The "/api/:path*" rewrite must be first in vercel.json.');
  vercel.rewrites[idx].destination = `${origin}/api/:path*`;
  writeFileSync(VERCEL_JSON, `${JSON.stringify(vercel, null, 2)}\n`);

  // vite.config.ts
  const vite = readFileSync(VITE_CONFIG, "utf8");
  if (!API_TARGET_RE.test(vite)) throw new Error("Could not find API_TARGET in vite.config.ts.");
  writeFileSync(VITE_CONFIG, vite.replace(API_TARGET_RE, `$1${origin}$3`));

  console.log(`Backend set to ${origin}`);
  console.log("  vercel.json    -> updated");
  console.log("  vite.config.ts -> updated");
  console.log("\nNext: npm run build, then commit and push so Vercel picks it up.");
  console.log(`Verify with: curl -sI ${origin}/api/public/summary`);
}

const arg = process.argv[2];
if (!arg || arg === "--show") {
  show();
} else {
  try {
    apply(normalise(arg));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

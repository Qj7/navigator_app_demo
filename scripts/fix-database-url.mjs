#!/usr/bin/env node
/**
 * Rewrites DATABASE_URL in .env for Supabase transaction pooler (serverless-safe).
 * Session pooler (5432) exhausts connections on Vercel — use 6543 + pgbouncer.
 */
import { readFileSync, writeFileSync } from "node:fs";

const envPath = ".env";
const envText = readFileSync(envPath, "utf8");

const lineIndex = envText.split("\n").findIndex((line) => line.startsWith("DATABASE_URL="));
if (lineIndex === -1) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const lines = envText.split("\n");
const raw = lines[lineIndex];
const match = raw.match(/^DATABASE_URL="(.+)"$/);
if (!match) {
  console.error("DATABASE_URL must be quoted in .env");
  process.exit(1);
}

const url = new URL(match[1]);
if (url.port === "6543" && url.searchParams.get("pgbouncer") === "true") {
  console.log("DATABASE_URL already uses transaction pooler — no changes");
  process.exit(0);
}

url.port = "6543";
url.searchParams.set("pgbouncer", "true");
url.searchParams.set("connection_limit", "1");

lines[lineIndex] = `DATABASE_URL="${url.toString()}"`;
writeFileSync(envPath, lines.join("\n"));
console.log("Updated DATABASE_URL to transaction pooler (port 6543)");

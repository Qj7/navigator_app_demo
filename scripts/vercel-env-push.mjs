#!/usr/bin/env node
/**
 * Push .env variables to linked Vercel project.
 * Prereq: npx vercel login && npx vercel link
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const KEYS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const envText = readFileSync(".env", "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      const value = line.slice(i + 1).replace(/^"|"$/g, "");
      return [key, value];
    }),
);

for (const key of KEYS) {
  const value = env[key];
  if (!value) {
    console.error(`Missing ${key} in .env`);
    process.exit(1);
  }
  for (const target of ["production", "preview", "development"]) {
    console.log(`Setting ${key} (${target})...`);
    const isPublic = key.startsWith("NEXT_PUBLIC_");
    const flags = isPublic ? "--force --type config" : "--force --sensitive";
    execSync(`npx vercel env add ${key} ${target} ${flags}`, {
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
    });
  }
}

console.log("\nDone. Deploy with: npx vercel --prod");

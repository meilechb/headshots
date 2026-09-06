#!/usr/bin/env node
// Prints an ADMIN_PASSWORD_HASH for .env / Vercel. Colons are used as separators
// because Next.js expands `$VAR` references inside .env files. Usage:
//   npm run hash-password -- "your strong password"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv.slice(2).join(" ");
if (!password || password.length < 10) {
  console.error("Provide a password of at least 10 characters:\n  npm run hash-password -- \"correct horse battery staple\"");
  process.exit(1);
}

const salt = randomBytes(16).toString("base64url");
const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("base64url");
console.log(`ADMIN_PASSWORD_HASH=scrypt:16384:${salt}:${hash}`);

import { execSync } from "child_process";

execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });
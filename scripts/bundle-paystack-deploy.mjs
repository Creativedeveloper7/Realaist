import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = path.join(root, "supabase/functions");

function stripLeadingImports(src) {
  const lines = src.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === "" || t.startsWith("//")) {
      i++;
      continue;
    }
    if (t.startsWith("import ")) {
      i++;
      continue;
    }
    break;
  }
  return {
    imports: lines.slice(0, i).join("\n"),
    rest: lines.slice(i).join("\n"),
  };
}

function bundle(functionDir) {
  let s = fs.readFileSync(path.join(base, "_shared/paystackKesAmounts.ts"), "utf8");
  s = s
    .replace(/^export const /m, "const ")
    .replace(/^export function /gm, "function ")
    .replace(/^export type /gm, "type ");
  let raw = fs.readFileSync(path.join(base, functionDir, "index.ts"), "utf8");
  raw = raw.replace(
    /import\s+\{[^}]+\}\s+from\s+["']\.\.\/_shared\/paystackKesAmounts\.ts["'];\s*\r?\n/,
    "",
  );
  const { imports, rest } = stripLeadingImports(raw);
  return `${imports}\n\n${s}\n\n${rest}`;
}

const outDir = root;
fs.writeFileSync(path.join(outDir, ".bundle-initiate-host-transfer.ts"), bundle("initiate-host-transfer"));
fs.writeFileSync(path.join(outDir, ".bundle-initialize-booking-payment.ts"), bundle("initialize-booking-payment"));
console.log("OK");

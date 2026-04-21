import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function payload(name, verify_jwt) {
  const indexPath = path.join(root, "supabase/functions", name, "index.ts");
  return {
    project_id: "zviqhszbluqturpeoiuk",
    name,
    entrypoint_path: "index.ts",
    verify_jwt,
    files: [{ name: "index.ts", content: fs.readFileSync(indexPath, "utf8") }],
  };
}

const triple = [
  ["initiate-host-transfer", true],
  ["initialize-booking-payment", false],
  ["paystack-transfer-webhook", false],
];

for (const [name, vjwt] of triple) {
  const p = payload(name, vjwt);
  fs.writeFileSync(
    path.join(root, `.mcp-deploy-${name}.json`),
    JSON.stringify(p),
    "utf8",
  );
}

console.log("OK", triple.map(([n]) => n).join(", "));

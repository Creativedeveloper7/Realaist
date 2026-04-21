import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

let idx = fs.readFileSync(
  path.join(root, "supabase/functions/paystack-webhook/index.ts"),
  "utf8",
);
idx = idx.replace(
  'from "../_shared/paystackTransferEvents.ts"',
  'from "./_shared/paystackTransferEvents.ts"',
);
const sh = fs.readFileSync(
  path.join(root, "supabase/functions/_shared/paystackTransferEvents.ts"),
  "utf8",
);

const o = {
  project_id: "zviqhszbluqturpeoiuk",
  name: "paystack-webhook",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [
    { name: "index.ts", content: idx },
    { name: "_shared/paystackTransferEvents.ts", content: sh },
  ],
};

const out = path.join(root, "mcp-webhook-deploy.json");
fs.writeFileSync(out, JSON.stringify(o));
console.log("written", out, "bytes", Buffer.byteLength(JSON.stringify(o)));

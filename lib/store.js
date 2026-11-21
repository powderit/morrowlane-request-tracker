// Storage for service requests.
// Version 2: Cloudflare D1 (hosted SQLite database), bound to this Worker as `DB`.
import { getCloudflareContext } from "@opennextjs/cloudflare";

const FIELDS = "id, created_at, requester_name, location, description, priority, status";

async function db() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) {
    throw new Error("The DB database binding is missing. Check wrangler.jsonc.");
  }
  return env.DB;
}

export async function listRequests() {
  const { results } = await (await db())
    .prepare(`SELECT ${FIELDS} FROM requests ORDER BY created_at DESC, id DESC`)
    .all();
  return results;
}

export async function createRequest(fields) {
  const created_at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  return (await db())
    .prepare(
      `INSERT INTO requests (created_at, requester_name, location, description, priority, status)
       VALUES (?, ?, ?, ?, ?, 'New')
       RETURNING ${FIELDS}`
    )
    .bind(created_at, fields.requester_name, fields.location, fields.description, fields.priority)
    .first();
}

export async function updateStatus(id, status) {
  return (await db())
    .prepare(`UPDATE requests SET status = ? WHERE id = ? RETURNING ${FIELDS}`)
    .bind(status, id)
    .first();
}

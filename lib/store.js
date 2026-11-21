// Storage for service requests.
// Version 1: reads and writes data/seed-requests.csv on disk.
import { promises as fs } from "fs";
import path from "path";
import { parseCsv, toCsv, toCsvRow, COLUMNS } from "./csv";

const DATA_FILE = path.join(process.cwd(), "data", "seed-requests.csv");

async function readAll() {
  const text = await fs.readFile(DATA_FILE, "utf8");
  // Rows have no id column, so the id is the row's position in the file (1 = first row).
  return parseCsv(text).map((row, index) => ({ id: index + 1, ...row }));
}

function newestFirst(a, b) {
  const byDate = new Date(b.created_at) - new Date(a.created_at);
  return byDate !== 0 ? byDate : b.id - a.id;
}

export async function listRequests() {
  const rows = await readAll();
  return rows.sort(newestFirst);
}

export async function createRequest(fields) {
  const rows = await readAll();
  const record = {
    created_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    ...fields,
    status: "New",
  };
  const text = await fs.readFile(DATA_FILE, "utf8");
  const prefix = text.endsWith("\n") ? "" : "\n";
  await fs.appendFile(DATA_FILE, prefix + toCsvRow(record, COLUMNS) + "\n", "utf8");
  return { id: rows.length + 1, ...record };
}

export async function updateStatus(id, status) {
  const rows = await readAll();
  const row = rows.find((r) => r.id === id);
  if (!row) return null;
  row.status = status;
  await fs.writeFile(DATA_FILE, toCsv(rows, COLUMNS), "utf8");
  return row;
}

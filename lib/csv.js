// Small CSV helpers. Handles quoted fields that contain commas, quotes or line breaks.

export const COLUMNS = [
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.some((value) => value.trim() !== ""));
  const [header, ...body] = nonEmpty;
  if (!header) return [];

  return body.map((values) => {
    const record = {};
    header.forEach((name, index) => {
      record[name.trim()] = values[index] ?? "";
    });
    return record;
  });
}

function escapeField(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // Keep spreadsheet apps from treating a cell as a formula.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  if (/[",\r\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function toCsv(records, columns) {
  const lines = [columns.join(",")];
  for (const record of records) {
    lines.push(columns.map((column) => escapeField(record[column])).join(","));
  }
  return lines.join("\n") + "\n";
}

export function toCsvRow(record, columns) {
  return columns.map((column) => escapeField(record[column])).join(",");
}

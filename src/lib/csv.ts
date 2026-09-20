import type { Cell, Row } from "@/lib/types";

/**
 * A small RFC-4180 CSV parser: quoted fields, escaped quotes (""), commas and
 * newlines inside quotes, CRLF, and a UTF-8 BOM. Enough for pandas' `to_csv`.
 */
export function parseCsv(text: string): { columns: string[]; rows: Row[] } {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      record.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const nonEmpty = records.filter((r) => r.some((c) => c.trim() !== ""));
  const [header = [], ...body] = nonEmpty;
  const columns = header.map((h, i) => h.trim() || `column_${i + 1}`);

  const rows = body.map((cells) => {
    const row: Row = {};
    columns.forEach((col, i) => {
      row[col] = coerce(cells[i]);
    });
    return row;
  });

  return { columns, rows };
}

const NUMERIC = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

function coerce(raw: string | undefined): Cell {
  if (raw === undefined) return null;
  const v = raw.trim();
  if (v === "" || v.toLowerCase() === "nan" || v.toLowerCase() === "null") return null;
  if (NUMERIC.test(v)) {
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }
  return v;
}

/** Back to CSV text — used for "download this view" after sorting/filtering. */
export function toCsv(columns: string[], rows: Row[]): string {
  const esc = (v: Cell | undefined) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map(esc).join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join(
    "\n",
  );
}

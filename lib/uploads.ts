import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, extname, join } from "node:path";
import { tmpdir } from "node:os";

const BASE_UPLOAD_DIR =
  process.env.JURIAI_UPLOAD_DIR ?? join(tmpdir(), "juriai", "uploads");

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function storeUpload(file: File, caseId: string) {
  const safeCaseId = sanitizeSegment(caseId) || "case";
  const safeName = sanitizeSegment(file.name || "arquivo");
  const suffix = extname(safeName) || "";
  const fileName = `${randomUUID()}${suffix}`;
  const storagePath = join(BASE_UPLOAD_DIR, safeCaseId, fileName);

  await mkdir(dirname(storagePath), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, bytes);

  return {
    storagePath,
    fileName,
    sizeBytes: bytes.byteLength,
  };
}

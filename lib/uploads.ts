import { access, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";

const BASE_UPLOAD_DIR =
  process.env.JURIAI_UPLOAD_DIR ?? join(tmpdir(), "juriai", "uploads");
const UNSCANNED_UPLOAD_DIR = process.env.JURIAI_UNSCANNED_UPLOAD_DIR?.trim();
const QUARANTINE_UPLOAD_DIR = process.env.JURIAI_QUARANTINE_UPLOAD_DIR?.trim();

export type MalwareStorageState = "clean" | "infected" | "pending";

export function isMalwareScanningConfigured() {
  if (Boolean(UNSCANNED_UPLOAD_DIR) !== Boolean(QUARANTINE_UPLOAD_DIR)) {
    throw new Error(
      "Configure JURIAI_UNSCANNED_UPLOAD_DIR e JURIAI_QUARANTINE_UPLOAD_DIR juntos.",
    );
  }
  return Boolean(UNSCANNED_UPLOAD_DIR && QUARANTINE_UPLOAD_DIR);
}

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
  const relativeStoragePath = join(safeCaseId, fileName);
  const storagePath = join(
    /* turbopackIgnore: true */ BASE_UPLOAD_DIR,
    relativeStoragePath,
  );
  const uploadBase = isMalwareScanningConfigured()
    ? UNSCANNED_UPLOAD_DIR!
    : BASE_UPLOAD_DIR;
  const uploadPath = join(
    /* turbopackIgnore: true */ uploadBase,
    relativeStoragePath,
  );

  await mkdir(dirname(uploadPath), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(uploadPath, bytes);

  return {
    storagePath,
    uploadPath,
    fileName,
    sizeBytes: bytes.byteLength,
  };
}

export async function removeStoredUpload(storagePath: string) {
  assertUploadPath(storagePath);
  await unlink(/* turbopackIgnore: true */ storagePath).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    },
  );
}

export async function readStoredUpload(storagePath: string) {
  assertStoredPath(storagePath);
  return readFile(/* turbopackIgnore: true */ storagePath);
}

export async function getMalwareScanStorageState(
  storagePath: string,
): Promise<MalwareStorageState> {
  const relativeStoragePath = assertStoredPath(storagePath);

  if (await pathExists(storagePath)) return "clean";
  if (!isMalwareScanningConfigured()) return "pending";

  const quarantinePath = join(
    /* turbopackIgnore: true */ QUARANTINE_UPLOAD_DIR!,
    relativeStoragePath,
  );
  if (await pathExists(quarantinePath)) return "infected";

  return "pending";
}

function assertStoredPath(storagePath: string) {
  return assertPathWithinBase(storagePath, BASE_UPLOAD_DIR);
}

function assertUploadPath(storagePath: string) {
  const bases = [
    BASE_UPLOAD_DIR,
    ...(UNSCANNED_UPLOAD_DIR ? [UNSCANNED_UPLOAD_DIR] : []),
    ...(QUARANTINE_UPLOAD_DIR ? [QUARANTINE_UPLOAD_DIR] : []),
  ];

  for (const base of bases) {
    try {
      return assertPathWithinBase(storagePath, base);
    } catch {
      // Tenta o próximo diretório permitido.
    }
  }

  throw new Error("Caminho de upload inválido.");
}

function assertPathWithinBase(storagePath: string, basePath: string) {
  const base = resolve(/* turbopackIgnore: true */ basePath);
  const candidate = resolve(/* turbopackIgnore: true */ storagePath);
  const pathFromBase = relative(base, candidate);

  if (
    !storagePath ||
    pathFromBase === "" ||
    pathFromBase.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
    pathFromBase === ".." ||
    isAbsolute(pathFromBase)
  ) {
    throw new Error("Caminho de upload inválido.");
  }

  return pathFromBase;
}

async function pathExists(path: string) {
  try {
    await access(/* turbopackIgnore: true */ path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

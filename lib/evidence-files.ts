export const MAX_EVIDENCE_UPLOAD_BYTES = 20 * 1024 * 1024;

export const EVIDENCE_FILE_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.txt,.md,application/pdf,image/jpeg,image/png,image/webp,text/plain,text/markdown";

type SupportedFile = {
  mediaType: string;
  declaredTypes: Set<string>;
  hasValidSignature(bytes: Uint8Array): boolean;
};

const SUPPORTED_FILES: Record<string, SupportedFile> = {
  ".pdf": {
    mediaType: "application/pdf",
    declaredTypes: new Set(["application/pdf"]),
    hasValidSignature: (bytes) => startsWith(bytes, [0x25, 0x50, 0x44, 0x46]),
  },
  ".jpg": jpegFile(),
  ".jpeg": jpegFile(),
  ".png": {
    mediaType: "image/png",
    declaredTypes: new Set(["image/png"]),
    hasValidSignature: (bytes) =>
      startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  ".webp": {
    mediaType: "image/webp",
    declaredTypes: new Set(["image/webp"]),
    hasValidSignature: (bytes) =>
      asciiAt(bytes, 0, "RIFF") && asciiAt(bytes, 8, "WEBP"),
  },
  ".txt": textFile(["text/plain"]),
  ".md": textFile(["text/markdown", "text/plain"]),
};

export class EvidenceFileValidationError extends Error {}

export async function validateEvidenceFile(file: File) {
  if (file.size === 0) {
    throw new EvidenceFileValidationError("O arquivo está vazio.");
  }

  if (file.size > MAX_EVIDENCE_UPLOAD_BYTES) {
    throw new EvidenceFileValidationError(
      `O arquivo excede o limite de ${formatMegabytes(MAX_EVIDENCE_UPLOAD_BYTES)} MB.`,
    );
  }

  const extension = fileExtension(file.name || "");
  const supported = SUPPORTED_FILES[extension];
  if (!supported) {
    throw new EvidenceFileValidationError(
      "Formato não permitido. Envie PDF, JPG, PNG, WEBP, TXT ou Markdown.",
    );
  }

  const declaredType = file.type.trim().toLowerCase();
  if (
    declaredType &&
    declaredType !== "application/octet-stream" &&
    !supported.declaredTypes.has(declaredType)
  ) {
    throw new EvidenceFileValidationError(
      "O conteúdo declarado do arquivo não corresponde à extensão.",
    );
  }

  const sample = new Uint8Array(
    await file.slice(0, Math.min(file.size, 4096)).arrayBuffer(),
  );
  if (!supported.hasValidSignature(sample)) {
    throw new EvidenceFileValidationError(
      "A assinatura do arquivo é inválida ou não corresponde à extensão.",
    );
  }

  return { mediaType: supported.mediaType };
}

function jpegFile(): SupportedFile {
  return {
    mediaType: "image/jpeg",
    declaredTypes: new Set(["image/jpeg", "image/jpg"]),
    hasValidSignature: (bytes) => startsWith(bytes, [0xff, 0xd8, 0xff]),
  };
}

function textFile(declaredTypes: string[]): SupportedFile {
  return {
    mediaType: declaredTypes[0],
    declaredTypes: new Set(declaredTypes),
    hasValidSignature: (bytes) => !bytes.includes(0),
  };
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function asciiAt(bytes: Uint8Array, offset: number, expected: string) {
  return [...expected].every(
    (value, index) => bytes[offset + index] === value.charCodeAt(0),
  );
}

function formatMegabytes(bytes: number) {
  return Math.round(bytes / (1024 * 1024));
}

function fileExtension(filename: string) {
  const match = /(?:^|\/)(?:[^/]+?)(\.[a-zA-Z0-9]+)$/.exec(filename);
  return match?.[1]?.toLowerCase() ?? "";
}

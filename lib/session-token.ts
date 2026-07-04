import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "juriai_session";
export const IMPERSONATOR_COOKIE = "juriai_impersonator";

export type SessionTokenPurpose = "session" | "impersonator";

type SessionTokenPayload = {
  sub: string;
  purpose: SessionTokenPurpose;
  iat: number;
  exp: number;
};

const TOKEN_VERSION = "v1";
const MIN_SECRET_LENGTH = 32;
const DEVELOPMENT_SECRET =
  "juriai-development-session-secret-not-for-production";

export async function createSessionToken(
  userId: string,
  purpose: SessionTokenPurpose,
  maxAgeSeconds: number,
) {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("JURIAI_SESSION_SECRET não configurado.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    sub: userId,
    purpose,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const unsignedToken = `${TOKEN_VERSION}.${encodedPayload}`;
  const signature = await sign(unsignedToken, secret);
  return `${unsignedToken}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  expectedPurpose: SessionTokenPurpose,
): Promise<string | null> {
  if (!token) return null;

  try {
    const secret = getSessionSecret();
    if (!secret) return null;

    const [version, encodedPayload, signature, extra] = token.split(".");
    if (
      version !== TOKEN_VERSION ||
      !encodedPayload ||
      !signature ||
      extra !== undefined
    ) {
      return null;
    }

    const expectedSignature = await sign(
      `${version}.${encodedPayload}`,
      secret,
    );
    if (!constantTimeEqual(signature, expectedSignature)) return null;

    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as Partial<SessionTokenPayload>;
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof payload.sub !== "string" ||
      !payload.sub ||
      payload.purpose !== expectedPurpose ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.iat > now + 60 ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

function getSessionSecret() {
  const configured = process.env.JURIAI_SESSION_SECRET?.trim();
  if (configured) {
    if (configured.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JURIAI_SESSION_SECRET deve ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`,
      );
    }
    return configured;
  }

  return process.env.NODE_ENV === "development" ? DEVELOPMENT_SECRET : null;
}

async function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

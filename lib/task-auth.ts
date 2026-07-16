import { timingSafeEqual } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { taskAuthConfig } from "@/lib/ingestion-queue";

const oidcClient = new OAuth2Client();

export async function isAuthorizedCloudTask(request: Request) {
  const config = taskAuthConfig();
  if (!config) return false;

  const suppliedSecret = request.headers.get("x-juriai-task-token") || "";
  if (!safeEqual(suppliedSecret, config.authToken)) return false;

  const authorization =
    request.headers.get("x-serverless-authorization") ||
    request.headers.get("authorization") ||
    "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return false;

  try {
    const ticket = await oidcClient.verifyIdToken({
      idToken: match[1],
      audience: config.audience,
    });
    const payload = ticket.getPayload();
    return (
      payload?.email === config.serviceAccount &&
      payload.email_verified === true
    );
  } catch {
    return false;
  }
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return (
    leftBytes.byteLength === rightBytes.byteLength &&
    timingSafeEqual(leftBytes, rightBytes)
  );
}

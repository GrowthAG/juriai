import { GoogleAuth } from "google-auth-library";

type QueueConfig = {
  project: string;
  location: string;
  queue: string;
  baseUrl: string;
  serviceAccount: string;
  authToken: string;
};

export type EnqueueIngestionResult =
  | { queued: true; taskName: string | null }
  | { queued: false; reason: "not-configured" };

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

export async function enqueueIngestionJob(
  jobId: string,
): Promise<EnqueueIngestionResult> {
  const config = queueConfig();
  if (!config) return { queued: false, reason: "not-configured" };

  const accessToken = await auth.getAccessToken();
  if (!accessToken) {
    throw new Error("ADC não retornou token para o Cloud Tasks.");
  }

  const parent = [
    "projects",
    encodeURIComponent(config.project),
    "locations",
    encodeURIComponent(config.location),
    "queues",
    encodeURIComponent(config.queue),
  ].join("/");
  const workerUrl = `${config.baseUrl}/api/internal/ingestion-jobs/${encodeURIComponent(jobId)}/process`;
  const response = await fetch(
    `https://cloudtasks.googleapis.com/v2/${parent}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: {
          httpRequest: {
            httpMethod: "POST",
            url: workerUrl,
            headers: {
              "Content-Type": "application/json",
              "X-JuriAI-Task-Token": config.authToken,
            },
            body: Buffer.from(JSON.stringify({ jobId })).toString("base64"),
            oidcToken: {
              serviceAccountEmail: config.serviceAccount,
              audience: config.baseUrl,
            },
          },
          dispatchDeadline: "900s",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(
      `Cloud Tasks recusou o job (${response.status}): ${detail}`,
    );
  }

  const created = (await response.json()) as { name?: string };
  return { queued: true, taskName: created.name ?? null };
}

export function taskAuthConfig() {
  const config = queueConfig();
  if (!config) return null;
  return {
    audience: config.baseUrl,
    serviceAccount: config.serviceAccount,
    authToken: config.authToken,
  };
}

function queueConfig(): QueueConfig | null {
  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location = process.env.JURIAI_TASKS_LOCATION?.trim();
  const queue = process.env.JURIAI_INGESTION_QUEUE?.trim();
  const baseUrl = process.env.JURIAI_TASKS_BASE_URL?.trim().replace(/\/$/, "");
  const serviceAccount = process.env.JURIAI_TASKS_SERVICE_ACCOUNT?.trim();
  const authToken = process.env.JURIAI_TASKS_AUTH_TOKEN?.trim();

  if (
    !project ||
    !location ||
    !queue ||
    !baseUrl ||
    !serviceAccount ||
    !authToken
  ) {
    return null;
  }

  return { project, location, queue, baseUrl, serviceAccount, authToken };
}

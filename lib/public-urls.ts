const PRODUCTION_APP_URL = "https://app.juriai.adv.br";
const MARKETING_HOSTS = new Set(["juriai.adv.br", "www.juriai.adv.br"]);

export function getAppUrl() {
  const configured = process.env.JURIAI_APP_URL?.trim().replace(/\/$/, "");
  return configured ?? "";
}

export function getAppPath(path: string) {
  const appUrl = getAppUrl();
  if (!appUrl) return path;
  return new URL(path, `${appUrl}/`).toString();
}

export function isAppHost(hostHeader: string | null) {
  const host = normalizeHost(hostHeader);
  const appUrl = getAppUrl() || PRODUCTION_APP_URL;
  return host === new URL(appUrl).hostname;
}

export function isMarketingHost(hostHeader: string | null) {
  return MARKETING_HOSTS.has(normalizeHost(hostHeader));
}

function normalizeHost(hostHeader: string | null) {
  const firstHost = hostHeader?.split(",", 1)[0]?.trim().toLowerCase() ?? "";
  return firstHost.replace(/:\d+$/, "");
}

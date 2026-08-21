export function isDevBypassEnabled(): boolean {
  return process.env.JURIAI_ALLOW_DEV_BYPASS === "true";
}

export function isLocalhostHost(host: string | null): boolean {
  if (!host) return true;
  const hostname = host.split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    hostname.endsWith(".run.app")
  );
}

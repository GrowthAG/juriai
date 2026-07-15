import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.2"],
  experimental: {
    serverActions: {
      // Onboarding envia logo (ate 5MB) + papel timbrado (ate 10MB) pela
      // Server Action. O padrao do Next e 1MB. A validacao em createSubWorkspace
      // ja limita cada arquivo, entao 16MB cobre os dois com folga.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;

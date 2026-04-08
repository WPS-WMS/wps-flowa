import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Este repositório tem múltiplos apps (raiz + /frontend).
  // O build da raiz não deve falhar por tipos do app legado/multi-tenant.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

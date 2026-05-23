const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  ...(isGitHubPages
    ? {
        basePath: "/NexusAI",
        assetPrefix: "/NexusAI/",
      }
    : {}),
};

export default nextConfig;

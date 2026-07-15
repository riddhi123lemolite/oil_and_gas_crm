/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app is a fully client-rendered SPA (react-router mounted client-side),
  // so Next's own ESLint integration is skipped — we lint with the project's
  // existing config via `npm run lint`.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

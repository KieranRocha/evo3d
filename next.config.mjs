/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      // mantenha outros domínios que você já tenha configurado
    ],
  },
};
export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "images.unsplash.com",
      "cdn.jsdelivr.net",
      // mantenha outros domínios que você já tenha configurado
    ],
  },
};
export default nextConfig;

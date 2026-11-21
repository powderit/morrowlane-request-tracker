/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

// Lets `next dev` use Cloudflare bindings (like the D1 database) locally.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();

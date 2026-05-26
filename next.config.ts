import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  exclude: [/\/admin\/.*/i],
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.110', 'unsavory-eternal-wired.ngrok-free.dev']
};

export default withSerwist(nextConfig);

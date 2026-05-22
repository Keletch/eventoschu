import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  exclude: [/\/admin\/.*/i],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);

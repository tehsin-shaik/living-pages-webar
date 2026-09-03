import type { NextConfig } from "next";

const repositoryName = "living-pages-webar";
const githubPagesBasePath = `/${repositoryName}`;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH === githubPagesBasePath
    ? githubPagesBasePath
    : "";

const nextConfig: NextConfig = {
    output: "export",
    basePath,
    images: {
        unoptimized: true
    },
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath
    }
};

export default nextConfig;

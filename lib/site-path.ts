const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteBasePath = configuredBasePath.replace(/\/$/, "");

export function sitePath(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    if (normalizedPath === "/") {
        return siteBasePath || "/";
    }

    return `${siteBasePath}${normalizedPath}`;
}

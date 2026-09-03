import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://tehsin-shaik.github.io/living-pages-webar";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "Living Pages — Browser-based WebAR magazine",
    description: "Living Pages is a browser-based AR magazine that brings printed pages to life through interactive 3D scenes, movement, light, and sound.",
    openGraph: {
        title: "Living Pages — Scan the page. Watch the story step out of it.",
        description: "A field guide to worlds that refuse to stay flat: five marker-based WebAR chapters made with A-Frame and AR.js.",
        type: "website",
        url: siteUrl
    },
    twitter: {
        card: "summary_large_image",
        title: "Living Pages — Scan the page. Watch the story step out of it.",
        description: "A field guide to worlds that refuse to stay flat: five marker-based WebAR chapters made with A-Frame and AR.js."
    }
    // TODO: add an owned social-preview image once one is approved.
};

export const viewport: Viewport = {
    themeColor: "#0D1117"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body>{children}</body>
        </html>
    );
}

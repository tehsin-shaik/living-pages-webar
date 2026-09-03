import { sitePath } from "@/lib/site-path";

export function SiteHeader() {
    return (
        <header className="site-header">
            <a className="wordmark" href={sitePath("/")} aria-label="Living Pages home">
                <span className="wordmark__mark" aria-hidden="true">LP</span>
                <span className="wordmark__text">Living<br />Pages</span>
            </a>

            <nav className="site-nav" aria-label="Primary navigation">
                <a href="#chapters">Chapters</a>
                <a href="#markers">Markers</a>
                <a href="#about">About</a>
                <a className="button button--small" href={sitePath("/preflight.html")}>Launch AR</a>
            </nav>
        </header>
    );
}

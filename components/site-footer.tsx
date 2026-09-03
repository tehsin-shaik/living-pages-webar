import { sitePath } from "@/lib/site-path";

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <a className="wordmark wordmark--footer" href={sitePath("/")} aria-label="Living Pages home">
                <span className="wordmark__mark" aria-hidden="true">LP</span>
                <span className="wordmark__text">Living<br />Pages</span>
            </a>
            <p>Scan the page. Watch the story step out of it.</p>
            <div className="footer-links">
                <a href={sitePath("/preflight.html")}>Launch AR</a>
                <a href="#markers">Markers</a>
                <a href="https://github.com/tehsin-shaik/living-pages-webar" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
        </footer>
    );
}

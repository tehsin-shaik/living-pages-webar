import { sitePath } from "@/lib/site-path";

export function Launch() {
    return (
        <section className="launch section-pad section-pad--dark" aria-labelledby="launch-title">
            <div className="launch__copy">
                <p className="section-kicker">The next page is live</p>
                <h2 id="launch-title">Ready to watch it move?</h2>
                <p>Keep a marker nearby, open the camera experience, and let one of the five chapters step out of the page.</p>
            </div>
            <a className="button button--paper" href={sitePath("/preflight.html")}>Launch AR Experience <span aria-hidden="true">↗</span></a>
        </section>
    );
}

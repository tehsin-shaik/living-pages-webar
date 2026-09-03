import { chapters } from "@/data/content";
import { sitePath } from "@/lib/site-path";

export function Chapters() {
    return (
        <section className="chapters section-pad" id="chapters" aria-labelledby="chapters-title">
            <div className="section-heading section-heading--split">
                <div>
                    <p className="section-kicker">The issue</p>
                    <h2 id="chapters-title">Five ways out of the page</h2>
                </div>
                <p className="section-heading__aside">Different worlds, one editorial experiment.</p>
            </div>

            <div className="chapter-grid">
                {chapters.map((chapter) => (
                    <article
                        className={`chapter${chapter.layout === "wide" ? " chapter--wide" : ""}${chapter.layout === "feature" ? " chapter--feature" : ""}`}
                        key={chapter.number}
                    >
                        <div className="chapter__media">
                            <img
                                src={sitePath(chapter.image)}
                                alt={chapter.alt}
                                width={chapter.width}
                                height={chapter.height}
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="chapter__content">
                            <span className="chapter__number">{chapter.number}</span>
                            <p className="chapter__label">{chapter.label}</p>
                            <h3>{chapter.title}</h3>
                            <p>{chapter.description}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

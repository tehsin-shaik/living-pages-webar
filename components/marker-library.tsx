import { markers } from "@/data/content";
import { sitePath } from "@/lib/site-path";

export function MarkerLibrary() {
    return (
        <section className="markers section-pad section-pad--dark" id="markers" aria-labelledby="markers-title">
            <div className="section-heading section-heading--split">
                <div>
                    <p className="section-kicker">Print / place / scan</p>
                    <h2 id="markers-title">Marker library</h2>
                </div>
                <p className="section-heading__aside">Download an individual marker, or open it on a second device while you scan.</p>
            </div>

            <div className="marker-grid">
                {markers.map((marker) => {
                    const isPair = marker.images.length > 1;

                    return (
                        <article className={`marker-card${isPair ? " marker-card--pair" : ""}`} key={marker.number}>
                            <div className={`marker-card__image${isPair ? " marker-card__image--pair" : ""}`}>
                                {marker.images.map((image) => (
                                    <img
                                        key={image.src}
                                        src={sitePath(image.src)}
                                        alt={image.alt}
                                        width={512}
                                        height={512}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ))}
                            </div>
                            <div className="marker-card__body">
                                <span className="marker-card__number">{marker.number}</span>
                                <h3>{marker.title}</h3>
                                <p>{marker.instruction}</p>
                                <div className="marker-card__links">
                                    {marker.images.map((image) => (
                                        <span className="marker-card__link-group" key={image.src}>
                                            <a href={sitePath(image.src)} download>{image.label ? `Download ${image.label}` : "Download"}</a>
                                            <a href={sitePath(image.src)} target="_blank" rel="noopener noreferrer">{image.label ? `Open ${image.label} full size` : "Open full size"}</a>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
            <p className="marker-note"><strong>Whale note:</strong> A and B are a pair. The whale interaction requires both markers to remain visible at the same time.</p>
        </section>
    );
}

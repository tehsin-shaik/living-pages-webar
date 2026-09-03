export function HowItWorks() {
    return (
        <section className="how section-pad section-pad--paper" aria-labelledby="how-title">
            <div className="section-heading">
                <p className="section-kicker">START HERE</p>
                <h2 id="how-title">How it works</h2>
            </div>
            <ol className="steps">
                <li className="step">
                    <span className="step__number">01</span>
                    <h3>Choose a marker</h3>
                    <p>Select a marker from the library. Print it or display it at full size on a second screen.</p>
                    <a className="text-link" href="#markers">Browse the marker library <span aria-hidden="true">↓</span></a>
                </li>
                <li className="step">
                    <span className="step__number">02</span>
                    <h3>Launch the AR experience</h3>
                    <p>Open the AR experience, allow camera access, and point your camera at the full marker.</p>
                </li>
                <li className="step">
                    <span className="step__number">03</span>
                    <h3>Watch it come alive</h3>
                    <p>Keep the marker steady and fully visible as the 3D scene appears. Each experience features its own combination of animation, movement, lighting, and sound.</p>
                </li>
            </ol>
        </section>
    );
}

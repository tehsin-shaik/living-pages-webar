export function TechnicalDetails() {
    return (
        <section className="technical section-pad" aria-labelledby="technical-title">
            <div className="technical__intro">
                <div className="section-heading">
                    <p className="section-kicker">Under the surface</p>
                    <h2 id="technical-title">Made for the open web</h2>
                </div>
                <div className="technical-grid">
                    <div className="technical-item"><span>01</span><h3>Marker-based AR</h3><p>Pattern markers connect printed pages to browser-rendered scenes.</p></div>
                    <div className="technical-item"><span>02</span><h3>3D storytelling</h3><p>GLB models become characters, habitats, objects, and moving worlds.</p></div>
                    <div className="technical-item"><span>03</span><h3>Small toolkit</h3><p>HTML, vanilla JavaScript, A-Frame, AR.js, audio, and GitHub Pages.</p></div>
                    <div className="technical-item"><span>04</span><h3>Five visual languages</h3><p>Each chapter changes tone while the marker frame keeps the issue coherent.</p></div>
                </div>
            </div>
            <div className="project-guidance" aria-labelledby="guidance-title">
                <div className="guidance__copy">
                    <p className="section-kicker">Before you launch</p>
                    <h2 id="guidance-title">A camera works best with a little room.</h2>
                    <p>Use a current camera-capable mobile browser and give the marker enough light. Keep the full black-and-white border visible, hold the page steady, and expect the first runtime load to be heavier than a normal web page.</p>
                </div>
                <div className="guidance__list">
                    <p><strong>Mobile</strong><br />Open the AR experience on your phone, then display the marker on another screen or use a printout. Allow camera access when the runtime opens.</p>
                    <p><strong>Desktop</strong><br />Explore the chapters here; use a phone for AR, a second screen for the marker, or the demo images for a camera-free preview.</p>
                    <p><strong>If tracking slips</strong><br />Move back slightly, improve the light, and bring the complete marker back into frame.</p>
                </div>
            </div>
        </section>
    );
}

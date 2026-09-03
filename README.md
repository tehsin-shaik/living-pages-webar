# Living Pages

## Scan the page. Watch the story step out of it.

![Living Pages whale WebAR demo](./images/demo-images/whale-demo.png)

Living Pages is a marker-based AR magazine for the browser. Scan a printed page to reveal animated 3D scenes, movement, lighting, and sound—no app required.

[Live demo](https://tehsin-shaik.github.io/living-pages-webar/) · [Launch AR](https://tehsin-shaik.github.io/living-pages-webar/preflight.html) · [Browse markers](https://tehsin-shaik.github.io/living-pages-webar/#markers)

## Use it

1. Print a marker or display it full-size on another screen.
2. Open the AR experience on a camera-enabled device.
3. Allow camera access and keep the complete marker visible.
4. Watch the matching chapter appear.

The whale chapter requires markers A and B together.

## The five chapters

| Chapter | Marker | Scene |
| --- | --- | --- |
| Enchanted Habitat | Mushroom | Pulsing mushroom house |
| Heat Index | Earth | Rotating Earth and climate scene |
| Flight Control | Drone | Rotating aircraft with controls |
| Hero Awakening | Hero | Character, shockwave, and sound |
| Between the Pages | A + B | Whale moving between markers |

## Built with

Next.js App Router, TypeScript, A-Frame, AR.js, GLB models, and GitHub Pages static export. The landing page is built with Next.js; the camera experience remains a standalone client-side A-Frame/AR.js runtime.

## Local development

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. Camera access requires HTTPS or localhost. For the standalone HTML files, use:

```powershell
python -m http.server 8000
```

Physical marker tracking, mobile audio, and gesture behavior still require testing on real iOS and Android devices.

## Project structure

```text
app/                    Next.js pages and layout
components/             Landing-page sections
data/                   Project content
public/preflight.html   Camera permission gate
public/experience.html  A-Frame/AR.js runtime
public/                 Models, markers, images, audio, and runtime assets
docs/ATTRIBUTION.md     Model and asset credit inventory
```

## Credits and status

The 3D models were sourced from Sketchfab and remain credited to their original creators. See [`docs/ATTRIBUTION.md`](./docs/ATTRIBUTION.md) for source links and licensing details.

The project is still in development. Audio licensing and physical-device verification remain incomplete, and the printable marker PDF has not been created.

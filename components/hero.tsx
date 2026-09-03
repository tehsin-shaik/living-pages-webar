"use client";

import { useEffect, useRef } from "react";
import { sitePath } from "@/lib/site-path";

type MotionPair = readonly [number, number];

type MotionProfile = {
    figureY: MotionPair;
    figureZ: MotionPair;
    textY: MotionPair;
    tiltX: MotionPair;
    tiltY: MotionPair;
    frameScale: MotionPair;
    imageY: MotionPair;
    imageScale: MotionPair;
};

const desktopMotion: MotionProfile = {
    figureY: [18, -58],
    figureZ: [45, 0],
    textY: [0, -24],
    tiltX: [5, 0],
    tiltY: [-7, 0],
    frameScale: [0.97, 1.03],
    imageY: [14, -14],
    imageScale: [1.07, 1.025]
};

const mobileMotion: MotionProfile = {
    figureY: [9, -29],
    figureZ: [22.5, 0],
    textY: [0, -12],
    tiltX: [2.5, 0],
    tiltY: [-3.5, 0],
    frameScale: [0.985, 1.015],
    imageY: [7, -7],
    imageScale: [1.035, 1.0125]
};

const lerp = (values: MotionPair, progress: number) =>
    values[0] + (values[1] - values[0]) * progress;

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export function Hero() {
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const hero = heroRef.current;

        if (!hero) {
            return;
        }

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const mobileViewport = window.matchMedia("(max-width: 42rem)");
        const image = hero.querySelector("img");
        let animationFrame = 0;
        let heroIsNearViewport = true;
        let motionStarted = false;
        let observer: IntersectionObserver | null = null;
        let imageLoadHandler: (() => void) | null = null;
        let measurements = {
            top: 0,
            height: 1,
            viewportHeight: window.innerHeight
        };

        const setMotionState = (state: "active" | "inactive" | "reduced") => {
            hero.dataset.motionState = state;
        };

        const setFlatHero = () => {
            [
                ["--hero-progress", "0"],
                ["--hero-figure-y", "0px"],
                ["--hero-figure-z", "0px"],
                ["--hero-text-y", "0px"],
                ["--hero-tilt-x", "0deg"],
                ["--hero-tilt-y", "0deg"],
                ["--hero-frame-scale", "1"],
                ["--hero-image-y", "0px"],
                ["--hero-image-scale", "1"]
            ].forEach(([property, value]) => hero.style.setProperty(property, value));
        };

        const scheduleRender = () => {
            if (!animationFrame) {
                animationFrame = window.requestAnimationFrame(renderHero);
            }
        };

        const measureHero = () => {
            const rect = hero.getBoundingClientRect();

            measurements = {
                top: rect.top + window.scrollY,
                height: hero.offsetHeight,
                viewportHeight: window.innerHeight
            };

            scheduleRender();
        };

        const renderHero = () => {
            animationFrame = 0;

            if (!motionStarted || !heroIsNearViewport || reduceMotion.matches) {
                return;
            }

            const start = measurements.top - 1;
            const end = measurements.top + Math.max(
                measurements.height * 0.62,
                measurements.viewportHeight * 0.3
            );
            const progress = clamp(
                (window.scrollY - start) / Math.max(end - start, 1),
                0,
                1
            );
            const motion = mobileViewport.matches ? mobileMotion : desktopMotion;

            hero.style.setProperty("--hero-progress", progress.toFixed(4));
            hero.style.setProperty("--hero-figure-y", `${lerp(motion.figureY, progress)}px`);
            hero.style.setProperty("--hero-figure-z", `${lerp(motion.figureZ, progress)}px`);
            hero.style.setProperty("--hero-text-y", `${lerp(motion.textY, progress)}px`);
            hero.style.setProperty("--hero-tilt-x", `${lerp(motion.tiltX, progress)}deg`);
            hero.style.setProperty("--hero-tilt-y", `${lerp(motion.tiltY, progress)}deg`);
            hero.style.setProperty("--hero-frame-scale", lerp(motion.frameScale, progress).toFixed(4));
            hero.style.setProperty("--hero-image-y", `${lerp(motion.imageY, progress)}px`);
            hero.style.setProperty("--hero-image-scale", lerp(motion.imageScale, progress).toFixed(4));
        };

        const stopMotion = () => {
            motionStarted = false;
            heroIsNearViewport = false;

            if (animationFrame) {
                window.cancelAnimationFrame(animationFrame);
                animationFrame = 0;
            }

            observer?.disconnect();
            observer = null;
            window.removeEventListener("scroll", scheduleRender);
            window.removeEventListener("resize", measureHero);

            if (image && imageLoadHandler) {
                image.removeEventListener("load", imageLoadHandler);
                imageLoadHandler = null;
            }

            setFlatHero();
        };

        const startMotion = () => {
            if (motionStarted || reduceMotion.matches) {
                return;
            }

            motionStarted = true;
            heroIsNearViewport = true;
            setMotionState("active");
            measureHero();

            if ("IntersectionObserver" in window) {
                observer = new IntersectionObserver((entries) => {
                    heroIsNearViewport = entries.some((entry) => entry.isIntersecting);
                    setMotionState(heroIsNearViewport ? "active" : "inactive");

                    if (heroIsNearViewport) {
                        scheduleRender();
                    }
                }, { rootMargin: "20% 0px 20%" });

                observer.observe(hero);
            }

            scheduleRender();
            window.addEventListener("scroll", scheduleRender, { passive: true });
            window.addEventListener("resize", measureHero, { passive: true });

            if (image && !image.complete) {
                imageLoadHandler = measureHero;
                image.addEventListener("load", imageLoadHandler, { once: true });
            }
        };

        const handleMotionPreference = (event: MediaQueryListEvent) => {
            if (event.matches) {
                stopMotion();
                setMotionState("reduced");
            } else {
                startMotion();
            }
        };

        reduceMotion.addEventListener("change", handleMotionPreference);

        if (reduceMotion.matches) {
            setFlatHero();
            setMotionState("reduced");
        } else {
            startMotion();
        }

        return () => {
            stopMotion();
            reduceMotion.removeEventListener("change", handleMotionPreference);
        };
    }, []);

    return (
        <section ref={heroRef} className="hero section-pad" aria-labelledby="hero-title" data-motion-state="inactive">
            <div className="hero__copy">
                <p className="eyebrow">Interactive magazine / browser-based WebAR</p>
                <h1 id="hero-title">Living <em>Pages</em></h1>
                <p className="hero__tagline">Scan the page. Watch the story step out of it.</p>
                <p className="hero__intro">
                    An interactive, marker-based AR magazine that brings each page to life with 3D scenes, animation,
                    movement, light, and sound—right in your browser. No app required.
                </p>
                <div className="button-row">
                    <a className="button" href={sitePath("/preflight.html")}>Launch AR Experience</a>
                    <a className="button button--outline" href="#markers">Get the Markers</a>
                </div>
            </div>

            <figure className="hero__figure">
                <div className="hero__image-frame">
                    {/* TODO: replace this editorial spread with a compressed, muted, captioned demo video using it as the poster. */}
                    <div className="hero__spread" role="group" aria-label="Two editorial pages from the Living Pages issue">
                        <div className="hero__spread-panel">
                            <img
                                src={sitePath("/images/demo-images/whale-demo.png")}
                                alt="Editorial fish page with A and B markers from the Living Pages issue"
                                width={1639}
                                height={960}
                                decoding="async"
                            />
                        </div>
                        <div className="hero__spread-panel">
                            <img
                                src={sitePath("/images/demo-images/earth-demo.png")}
                                alt="Editorial Earth and heat page from the Living Pages issue"
                                width={1562}
                                height={1007}
                                decoding="async"
                            />
                        </div>
                    </div>
                    <span className="registration registration--top" aria-hidden="true"></span>
                    <span className="registration registration--bottom" aria-hidden="true"></span>
                </div>
                <figcaption><span>Issue 01</span><span>Five experiments / one printed surface</span></figcaption>
            </figure>
        </section>
    );
}

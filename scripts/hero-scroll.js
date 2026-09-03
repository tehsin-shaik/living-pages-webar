(() => {
    "use strict";

    const hero = document.querySelector(".hero");

    if (!hero) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileViewport = window.matchMedia("(max-width: 42rem)");

    const desktopMotion = {
        figureY: [18, -58],
        figureZ: [45, 0],
        textY: [0, -24],
        tiltX: [5, 0],
        tiltY: [-7, 0],
        frameScale: [0.97, 1.03],
        imageY: [14, -14],
        imageScale: [1.07, 1.025]
    };

    // Mobile keeps the same spatial idea at approximately half the range.
    const mobileMotion = {
        figureY: [9, -29],
        figureZ: [22.5, 0],
        textY: [0, -12],
        tiltX: [2.5, 0],
        tiltY: [-3.5, 0],
        frameScale: [0.985, 1.015],
        imageY: [7, -7],
        imageScale: [1.035, 1.0125]
    };

    const lerp = (start, end, progress) =>
        start + (end - start) * progress;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const image = hero.querySelector("img");
    let animationFrame = 0;
    let heroIsNearViewport = true;
    let motionStarted = false;
    let observer = null;
    let measurements = {
        top: 0,
        height: 1,
        viewportHeight: window.innerHeight
    };

    function setMotionState(state) {
        hero.dataset.motionState = state;
    }

    function setFlatHero() {
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
    }

    // Cache geometry outside the scroll frame so scrolling only interpolates values.
    function measureHero() {
        const rect = hero.getBoundingClientRect();

        measurements = {
            top: rect.top + window.scrollY,
            height: hero.offsetHeight,
            viewportHeight: window.innerHeight
        };

        scheduleRender();
    }

    function renderHero() {
        animationFrame = 0;

        if (!motionStarted || !heroIsNearViewport || reduceMotion.matches) {
            return;
        }

        // The range begins close to the hero's document top and ends before it leaves view.
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
        hero.style.setProperty("--hero-figure-y", `${lerp(...motion.figureY, progress)}px`);
        hero.style.setProperty("--hero-figure-z", `${lerp(...motion.figureZ, progress)}px`);
        hero.style.setProperty("--hero-text-y", `${lerp(...motion.textY, progress)}px`);
        hero.style.setProperty("--hero-tilt-x", `${lerp(...motion.tiltX, progress)}deg`);
        hero.style.setProperty("--hero-tilt-y", `${lerp(...motion.tiltY, progress)}deg`);
        hero.style.setProperty("--hero-frame-scale", lerp(...motion.frameScale, progress).toFixed(4));
        hero.style.setProperty("--hero-image-y", `${lerp(...motion.imageY, progress)}px`);
        hero.style.setProperty("--hero-image-scale", lerp(...motion.imageScale, progress).toFixed(4));
    }

    function scheduleRender() {
        if (!animationFrame) {
            animationFrame = window.requestAnimationFrame(renderHero);
        }
    }

    function stopMotion() {
        motionStarted = false;
        heroIsNearViewport = false;

        if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        window.removeEventListener("scroll", scheduleRender);
        window.removeEventListener("resize", measureHero);
        setFlatHero();
    }

    function startMotion() {
        if (motionStarted || reduceMotion.matches) {
            return;
        }

        motionStarted = true;
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
        } else {
            heroIsNearViewport = true;
        }

        scheduleRender();

        window.addEventListener("scroll", scheduleRender, { passive: true });
        window.addEventListener("resize", measureHero, { passive: true });

        if (image && !image.complete) {
            image.addEventListener("load", measureHero, { once: true });
        }
    }

    const handleMotionPreference = (event) => {
        if (event.matches) {
            stopMotion();
            setMotionState("reduced");
        } else {
            startMotion();
        }
    };

    // Register this before checking the initial preference so reduced motion can change later.
    if (reduceMotion.addEventListener) {
        reduceMotion.addEventListener("change", handleMotionPreference);
    } else {
        reduceMotion.addListener(handleMotionPreference);
    }

    if (reduceMotion.matches) {
        setFlatHero();
        setMotionState("reduced");
    } else {
        startMotion();
    }
})();

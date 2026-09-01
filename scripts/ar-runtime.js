(() => {
    "use strict";

    if (window.AFRAME && !AFRAME.components["embedded-animation-mixer"]) {
        AFRAME.registerComponent("embedded-animation-mixer", {
            schema: {
                clip: { type: "string", default: "" },
                timeScale: { type: "number", default: 1 }
            },

            init() {
                this.mixer = null;
                this.action = null;
                this.model = null;
                this.handleModelLoaded = (event) => this.start(event.detail && event.detail.model);
                this.el.addEventListener("model-loaded", this.handleModelLoaded);

                const gltfModel = this.el.components && this.el.components["gltf-model"];
                if (gltfModel && gltfModel.model) {
                    this.start(gltfModel.model);
                }
            },

            start(model) {
                if (!model || this.model === model) {
                    return;
                }

                this.releaseMixer();
                this.model = model;

                const clips = Array.isArray(model.animations) ? model.animations : [];
                if (!clips.length) {
                    console.info("[Living Pages] Whale model contains no embedded animation clips.");
                    return;
                }

                let clip = this.data.clip
                    ? clips.find((candidate) => candidate.name === this.data.clip)
                    : clips[0];

                if (!clip) {
                    console.warn(`[Living Pages] Animation clip "${this.data.clip}" was not found. Using the first clip.`);
                    clip = clips[0];
                }

                this.mixer = new THREE.AnimationMixer(model);
                this.action = this.mixer.clipAction(clip);
                this.action.setEffectiveTimeScale(this.data.timeScale);
                this.action.play();
                console.info(`[Living Pages] Whale animation playing: ${clip.name || "unnamed clip"}.`);
            },

            tick(_time, delta) {
                if (this.mixer) {
                    this.mixer.update(delta / 1000);
                }
            },

            releaseMixer() {
                if (this.action) {
                    this.action.stop();
                    this.action = null;
                }

                if (this.mixer) {
                    this.mixer.stopAllAction();
                    this.mixer.uncacheRoot(this.model);
                    this.mixer = null;
                }
            },

            remove() {
                this.el.removeEventListener("model-loaded", this.handleModelLoaded);
                this.releaseMixer();
                this.model = null;
            }
        });
    }

    const initRuntime = () => {
        const scene = document.querySelector("a-scene");

        if (!scene || scene.dataset.runtimeInitialized === "true") {
            return;
        }

        scene.dataset.runtimeInitialized = "true";

        const ui = {
            loading: document.querySelector("#loading-status"),
            camera: document.querySelector("#camera-status"),
            marker: document.querySelector("#marker-status"),
            sceneName: document.querySelector("#scene-name"),
            sceneInstruction: document.querySelector("#scene-instruction"),
            live: document.querySelector("#ar-live-status"),
            cameraError: document.querySelector("#camera-error"),
            cameraErrorMessage: document.querySelector("#camera-error-message"),
            soundToggle: document.querySelector("#sound-toggle"),
            droneControls: document.querySelector("#drone-controls")
        };

        const fish = document.querySelector("#fish");
        const markerA = document.querySelector("#markerA");
        const markerB = document.querySelector("#markerB");
        const startPoint = document.querySelector("#start-point");
        const endPoint = document.querySelector("#end-point");
        const drone = document.querySelector("#drone-wrapper");
        const heroMarker = document.querySelector("#hero-marker");
        const musicEntity = document.querySelector("#hero-music");

        const markerConfig = {
            "mushroom-marker": {
                element: document.querySelector("#mushroom-marker"),
                name: "Enchanted Habitat",
                instruction: "Keep the mushroom marker steady to reveal the breathing house.",
                found: "Mushroom marker found. Keep it steady to reveal the house.",
                priority: 1
            },
            "earth-marker": {
                element: document.querySelector("#earth-marker"),
                name: "Heat Index",
                instruction: "Keep the Earth marker in view to see the rotating climate chapter.",
                found: "Earth marker found. Keep it in view to see the climate chapter.",
                priority: 2
            },
            "drone-marker": {
                element: document.querySelector("#drone-marker"),
                name: "Flight Control",
                instruction: "Swipe on the camera view or use the directional controls to move the aircraft.",
                found: "Drone marker found. Swipe or use the directional controls to move the aircraft.",
                priority: 3
            },
            "hero-marker": {
                element: heroMarker,
                name: "Hero Awakening",
                instruction: "Keep the hero marker in view to reveal the hero and shockwave.",
                found: "Hero marker found. Sound is currently muted.",
                priority: 4
            },
            markerA: {
                element: markerA,
                name: "Between the Pages",
                instruction: "Marker A found. Now show marker B.",
                found: "Marker A found. Now show marker B.",
                priority: 5
            },
            markerB: {
                element: markerB,
                name: "Between the Pages",
                instruction: "Marker B found. Now show marker A.",
                found: "Marker B found. Now show marker A.",
                priority: 6
            }
        };

        const modelConfig = [
            { id: "mushroom-model", element: document.querySelector("#mushroom-marker [gltf-model]"), name: "Enchanted Habitat" },
            { id: "earth-model", element: document.querySelector("#earth-marker [gltf-model]"), name: "Heat Index" },
            { id: "drone-model", element: document.querySelector("#drone-marker [gltf-model]"), name: "Flight Control" },
            { id: "hero-model", element: document.querySelector("#hero-marker [gltf-model]"), name: "Hero Awakening" },
            { id: "whale-model", element: fish, name: "Between the Pages" }
        ];

        const modelStates = new Map();
        const visibleMarkers = new Set();
        const markerListeners = [];
        const sceneListeners = [];
        let lastAnnouncement = "";
        let cameraReady = false;
        let markerWasDetected = false;
        let droneMarkerVisible = false;
        let soundEnabled = false;
        let soundMuted = true;
        let soundUnavailable = false;
        let whaleFrame = 0;
        let whaleJumping = false;
        let whaleCooldownTimer = 0;
        let canvasAttachTimer = 0;
        let pointerStart = null;
        let canvas = null;
        let canvasListenersAttached = false;
        const whaleDuration = 2400;
        const whaleCooldown = 700;
        const droneLimit = 1.5;

        const setText = (element, text) => {
            if (element && element.textContent !== text) {
                element.textContent = text;
            }
        };

        const announce = (message) => {
            if (!ui.live || lastAnnouncement === message) {
                return;
            }

            lastAnnouncement = message;
            ui.live.textContent = message;
        };

        const logRuntimeError = (message, detail) => {
            console.error(`[Living Pages] ${message}`, detail || "");
        };

        const updateLoadingStatus = () => {
            const knownModels = Array.from(modelStates.values()).filter((state) => state === "loaded" || state === "failed").length;
            const failedModels = Array.from(modelStates.values()).filter((state) => state === "failed").length;

            if (knownModels < modelConfig.length) {
                setText(ui.loading, `Loading 3D scenes ${knownModels} of ${modelConfig.length}...`);
                return;
            }

            if (failedModels) {
                setText(ui.loading, `${failedModels} scene${failedModels === 1 ? "" : "s"} failed to load. Other scenes may still be available.`);
            } else if (cameraReady) {
                setText(ui.loading, "Scenes ready. Point the camera at a marker.");
            } else {
                setText(ui.loading, "3D scenes ready. Preparing the camera...");
            }
        };

        const markModelState = (model, state) => {
            if (!model || modelStates.get(model.id) === state) {
                return;
            }

            modelStates.set(model.id, state);
            updateLoadingStatus();
        };

        const registerModelListeners = () => {
            modelConfig.forEach((model) => {
                if (!model.element) {
                    markModelState(model, "failed");
                    logRuntimeError(`Model element missing for ${model.name}.`);
                    return;
                }

                const onLoaded = (event) => {
                    markModelState(model, "loaded");
                    console.info(`[Living Pages] Loaded ${model.name}.`, event.detail && event.detail.model);
                };

                const onError = (event) => {
                    markModelState(model, "failed");
                    logRuntimeError(`Could not load ${model.name}.`, event.detail || event);
                    announce(`${model.name} failed to load. Other chapters may still be available.`);
                };

                model.element.addEventListener("model-loaded", onLoaded);
                model.element.addEventListener("model-error", onError);
                markerListeners.push(
                    { element: model.element, type: "model-loaded", handler: onLoaded },
                    { element: model.element, type: "model-error", handler: onError }
                );

                const gltfModel = model.element.components && model.element.components["gltf-model"];
                if (gltfModel && gltfModel.model) {
                    markModelState(model, "loaded");
                } else {
                    modelStates.set(model.id, "loading");
                }
            });

            updateLoadingStatus();
        };

        const setCameraError = (message) => {
            setText(ui.cameraErrorMessage, message);
            setText(ui.camera, message);
            if (ui.cameraError) {
                ui.cameraError.hidden = false;
            }
            announce(message);
        };

        const hasWebGL = () => {
            const testCanvas = document.createElement("canvas");
            return Boolean(testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"));
        };

        const isCameraContextSupported = () => {
            const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
            const secure = window.isSecureContext || localHost;
            const cameraApi = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

            if (!secure) {
                setCameraError("Camera access requires HTTPS or localhost.");
                return false;
            }

            if (!cameraApi) {
                setCameraError("This browser does not expose the camera API needed for AR.");
                return false;
            }

            if (!hasWebGL()) {
                setCameraError("This browser does not appear to support the WebGL needed to render the AR scenes.");
                return false;
            }

            return true;
        };

        const getMarkerMessage = () => {
            const aVisible = visibleMarkers.has("markerA");
            const bVisible = visibleMarkers.has("markerB");

            if (aVisible && bVisible) {
                return {
                    name: "Between the Pages",
                    instruction: "Both markers found. Sending the whale between the pages.",
                    message: "Both markers found. Sending the whale between the pages."
                };
            }

            if (aVisible) {
                return {
                    name: "Between the Pages",
                    instruction: "Marker A found. Now show marker B.",
                    message: "Marker A found. Now show marker B."
                };
            }

            if (bVisible) {
                return {
                    name: "Between the Pages",
                    instruction: "Marker B found. Now show marker A.",
                    message: "Marker B found. Now show marker A."
                };
            }

            const active = Object.values(markerConfig)
                .filter((config) => config.element && visibleMarkers.has(config.element.id))
                .sort((first, second) => first.priority - second.priority)[0];

            if (active) {
                return {
                    name: active.name,
                    instruction: active.instruction,
                    message: active.found
                };
            }

            return {
                name: "Waiting for a marker",
                instruction: "Keep a complete black-and-white marker border in view.",
                message: markerWasDetected
                    ? "Marker lost. Keep the complete black-and-white border in view."
                    : "Point the camera at a marker."
            };
        };

        const updateMarkerStatus = () => {
            const current = getMarkerMessage();
            setText(ui.marker, current.message);
            setText(ui.sceneName, current.name);
            setText(ui.sceneInstruction, current.instruction);
            announce(current.message);
        };

        const getSound = () => musicEntity && musicEntity.components && musicEntity.components.sound;

        const stopHeroSound = () => {
            const sound = getSound();
            if (sound && typeof sound.stopSound === "function") {
                sound.stopSound();
            }
        };

        const playHeroSound = () => {
            if (!soundEnabled || soundMuted || !heroMarker || !heroMarker.object3D.visible) {
                return;
            }

            const sound = getSound();
            if (!sound || typeof sound.playSound !== "function") {
                soundUnavailable = true;
                logRuntimeError("Hero sound component is not ready.");
                announce("Sound is not ready in this browser. Marker tracking can continue.");
                return;
            }

            try {
                const result = sound.playSound();
                if (result && typeof result.catch === "function") {
                    result.catch((error) => {
                        soundUnavailable = true;
                        logRuntimeError("Hero audio playback was blocked.", error);
                        announce("Sound could not start. Marker tracking can continue.");
                    });
                }
            } catch (error) {
                soundUnavailable = true;
                logRuntimeError("Hero audio playback failed.", error);
                announce("Sound could not start. Marker tracking can continue.");
            }
        };

        const updateSoundButton = () => {
            if (!ui.soundToggle) {
                return;
            }

            if (!soundEnabled) {
                setText(ui.soundToggle, "Enable sound");
                ui.soundToggle.setAttribute("aria-pressed", "false");
            } else if (soundMuted) {
                setText(ui.soundToggle, "Unmute sound");
                ui.soundToggle.setAttribute("aria-pressed", "false");
            } else {
                setText(ui.soundToggle, "Mute sound");
                ui.soundToggle.setAttribute("aria-pressed", "true");
            }
        };

        const setDroneControlsVisible = (visible) => {
            droneMarkerVisible = visible;
            if (ui.droneControls) {
                ui.droneControls.hidden = !visible;
            }
        };

        const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

        const moveDrone = (direction) => {
            if (!droneMarkerVisible || !drone || !drone.object3D) {
                return;
            }

            const position = drone.object3D.position;
            const distance = 0.5;

            if (direction === "left") position.x = clamp(position.x - distance, -droneLimit, droneLimit);
            if (direction === "right") position.x = clamp(position.x + distance, -droneLimit, droneLimit);
            if (direction === "up") position.y = clamp(position.y + distance, -droneLimit, droneLimit);
            if (direction === "down") position.y = clamp(position.y - distance, -droneLimit, droneLimit);

            announce(`Drone moved ${direction}.`);
        };

        const handlePointerDown = (event) => {
            if (!event.isPrimary) {
                return;
            }

            pointerStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
        };

        const handlePointerUp = (event) => {
            if (!pointerStart || event.pointerId !== pointerStart.pointerId) {
                return;
            }

            const deltaX = event.clientX - pointerStart.x;
            const deltaY = event.clientY - pointerStart.y;
            const horizontal = Math.abs(deltaX);
            const vertical = Math.abs(deltaY);
            const minimumSwipe = 28;
            pointerStart = null;

            if (Math.max(horizontal, vertical) < minimumSwipe) {
                return;
            }

            if (horizontal >= vertical) {
                moveDrone(deltaX < 0 ? "left" : "right");
            } else {
                moveDrone(deltaY < 0 ? "up" : "down");
            }
        };

        const handlePointerCancel = () => {
            pointerStart = null;
        };

        const attachCanvasControls = () => {
            if (canvasListenersAttached) {
                return;
            }

            canvas = scene.canvas || (scene.renderer && scene.renderer.domElement);
            if (!canvas) {
                return;
            }

            canvas.addEventListener("pointerdown", handlePointerDown, { passive: true });
            canvas.addEventListener("pointerup", handlePointerUp, { passive: true });
            canvas.addEventListener("pointercancel", handlePointerCancel, { passive: true });
            canvasListenersAttached = true;
        };

        const scheduleCanvasControls = () => {
            attachCanvasControls();
            if (!canvasListenersAttached && !canvasAttachTimer) {
                canvasAttachTimer = window.setTimeout(() => {
                    canvasAttachTimer = 0;
                    attachCanvasControls();
                }, 500);
            }
        };

        const quadraticBezier = (start, middle, end, progress) => new THREE.Vector3(
            (1 - progress) * (1 - progress) * start.x + 2 * (1 - progress) * progress * middle.x + progress * progress * end.x,
            (1 - progress) * (1 - progress) * start.y + 2 * (1 - progress) * progress * middle.y + progress * progress * end.y,
            (1 - progress) * (1 - progress) * start.z + 2 * (1 - progress) * progress * middle.z + progress * progress * end.z
        );

        const easeInOutCubic = (progress) => progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const getWorldPosition = (element) => {
            const position = new THREE.Vector3();
            element.object3D.getWorldPosition(position);
            return position;
        };

        const hideWhale = () => {
            if (fish) {
                fish.setAttribute("visible", false);
            }
        };

        const resetWhalePosition = () => {
            if (!fish || !fish.object3D) {
                return;
            }

            if (visibleMarkers.has("markerA")) {
                fish.object3D.position.copy(getWorldPosition(startPoint));
            } else if (visibleMarkers.has("markerB")) {
                fish.object3D.position.copy(getWorldPosition(endPoint));
            } else {
                fish.object3D.position.set(0, 0, 0);
            }
        };

        const cancelWhaleJump = (reason) => {
            if (whaleFrame) {
                window.cancelAnimationFrame(whaleFrame);
                whaleFrame = 0;
            }

            whaleJumping = false;
            hideWhale();
            resetWhalePosition();

            if (reason) {
                console.info(`[Living Pages] Whale movement cancelled: ${reason}.`);
            }
        };

        const startWhaleJump = () => {
            if (whaleJumping || !visibleMarkers.has("markerA") || !visibleMarkers.has("markerB") || !fish || typeof THREE === "undefined") {
                return;
            }

            const start = getWorldPosition(startPoint);
            const end = getWorldPosition(endPoint);
            const middle = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            middle.y += 4;
            const startTime = performance.now();
            let previousPosition = start.clone();

            whaleJumping = true;
            fish.setAttribute("visible", true);
            fish.object3D.position.copy(start);

            const animateWhale = (time) => {
                if (!whaleJumping) {
                    return;
                }

                if (!visibleMarkers.has("markerA") || !visibleMarkers.has("markerB")) {
                    cancelWhaleJump("a whale marker was lost");
                    return;
                }

                const rawProgress = clamp((time - startTime) / whaleDuration, 0, 1);
                const progress = easeInOutCubic(rawProgress);
                const position = quadraticBezier(start, middle, end, progress);
                const direction = position.clone().sub(previousPosition);

                fish.object3D.position.copy(position);
                if (direction.lengthSq() > 0.000001) {
                    const angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
                    fish.setAttribute("rotation", `0 ${angle} 0`);
                }
                previousPosition = position;

                if (rawProgress >= 1) {
                    whaleJumping = false;
                    whaleFrame = 0;
                    fish.object3D.position.copy(end);
                    hideWhale();
                    whaleCooldownTimer = window.setTimeout(() => {
                        whaleCooldownTimer = 0;
                        startWhaleJump();
                    }, whaleCooldown);
                    return;
                }

                whaleFrame = window.requestAnimationFrame(animateWhale);
            };

            whaleFrame = window.requestAnimationFrame(animateWhale);
        };

        const onMarkerFound = (markerId) => {
            const config = markerConfig[markerId];
            if (!config) {
                return;
            }

            visibleMarkers.add(markerId);
            markerWasDetected = true;

            if (markerId === "drone-marker") {
                setDroneControlsVisible(true);
            }

            updateMarkerStatus();

            if (markerId === "hero-marker") {
                if (soundEnabled && !soundMuted) {
                    playHeroSound();
                } else {
                    setText(ui.marker, "Hero marker found. Sound is currently muted.");
                    announce("Hero marker found. Sound is currently muted.");
                }
            }

            if (markerId === "markerA" || markerId === "markerB") {
                if (visibleMarkers.has("markerA") && visibleMarkers.has("markerB")) {
                    updateMarkerStatus();
                    startWhaleJump();
                }
            }
        };

        const onMarkerLost = (markerId) => {
            if (!markerConfig[markerId]) {
                return;
            }

            visibleMarkers.delete(markerId);
            markerWasDetected = true;

            if (markerId === "drone-marker") {
                setDroneControlsVisible(false);
            }

            if (markerId === "hero-marker") {
                stopHeroSound();
            }

            if (markerId === "markerA" || markerId === "markerB") {
                if (!visibleMarkers.has("markerA") || !visibleMarkers.has("markerB")) {
                    if (whaleCooldownTimer) {
                        window.clearTimeout(whaleCooldownTimer);
                        whaleCooldownTimer = 0;
                    }
                    cancelWhaleJump("a whale marker was lost");
                }
            }

            updateMarkerStatus();
        };

        Object.entries(markerConfig).forEach(([markerId, config]) => {
            if (!config.element) {
                return;
            }

            const foundHandler = () => onMarkerFound(markerId);
            const lostHandler = () => onMarkerLost(markerId);
            config.element.addEventListener("markerFound", foundHandler);
            config.element.addEventListener("markerLost", lostHandler);
            markerListeners.push(
                { element: config.element, type: "markerFound", handler: foundHandler },
                { element: config.element, type: "markerLost", handler: lostHandler }
            );
        });

        const onCameraInit = () => {
            cameraReady = true;
            setText(ui.camera, "Camera ready. Point it at a marker.");
            updateLoadingStatus();
            announce("Camera ready. Point it at a marker.");
        };

        const onVideoLoaded = () => {
            cameraReady = true;
            setText(ui.camera, "Camera ready. Point it at a marker.");
            updateLoadingStatus();
        };

        const onCameraError = (event) => {
            const detail = event.detail || event;
            const errorName = detail && (detail.name || (detail.error && detail.error.name));
            const message = errorName === "NotAllowedError" || errorName === "PermissionDeniedError"
                ? "Camera permission was denied. Allow camera access for this site, then try again."
                : "The camera could not be started. Check this site's camera permission, then try again.";

            logRuntimeError("Camera initialization failed.", detail);
            setCameraError(message);
        };

        scene.addEventListener("camera-init", onCameraInit);
        scene.addEventListener("arjs-video-loaded", onVideoLoaded);
        scene.addEventListener("camera-error", onCameraError);
        scene.addEventListener("renderstart", scheduleCanvasControls, { once: true });
        sceneListeners.push(
            { element: scene, type: "camera-init", handler: onCameraInit },
            { element: scene, type: "arjs-video-loaded", handler: onVideoLoaded },
            { element: scene, type: "camera-error", handler: onCameraError },
            { element: scene, type: "renderstart", handler: scheduleCanvasControls }
        );

        if (ui.soundToggle) {
            ui.soundToggle.addEventListener("click", () => {
                if (!soundEnabled) {
                    soundEnabled = true;
                    soundMuted = false;
                    announce("Sound enabled.");
                    playHeroSound();
                } else {
                    soundMuted = !soundMuted;
                    if (soundMuted) {
                        stopHeroSound();
                        announce("Sound muted.");
                    } else {
                        announce("Sound enabled.");
                        playHeroSound();
                    }
                }

                updateSoundButton();
            });
        }

        document.querySelectorAll("[data-drone-direction]").forEach((button) => {
            const direction = button.getAttribute("data-drone-direction");
            button.addEventListener("click", () => moveDrone(direction));
        });

        const soundComponentReady = (event) => {
            if (event.detail && event.detail.name === "sound" && soundEnabled && !soundMuted) {
                playHeroSound();
            }
        };

        if (musicEntity) {
            musicEntity.addEventListener("componentinitialized", soundComponentReady);
        }

        const cleanup = () => {
            stopHeroSound();
            cancelWhaleJump("the page is being hidden");

            if (whaleCooldownTimer) {
                window.clearTimeout(whaleCooldownTimer);
                whaleCooldownTimer = 0;
            }

            if (canvasAttachTimer) {
                window.clearTimeout(canvasAttachTimer);
                canvasAttachTimer = 0;
            }

            if (canvas && canvasListenersAttached) {
                canvas.removeEventListener("pointerdown", handlePointerDown);
                canvas.removeEventListener("pointerup", handlePointerUp);
                canvas.removeEventListener("pointercancel", handlePointerCancel);
                canvasListenersAttached = false;
            }

            markerListeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler));
            sceneListeners.forEach(({ element, type, handler }) => element.removeEventListener(type, handler));
            if (musicEntity) {
                musicEntity.removeEventListener("componentinitialized", soundComponentReady);
            }

            const mixer = fish && fish.components && fish.components["embedded-animation-mixer"];
            if (mixer && typeof mixer.remove === "function") {
                mixer.remove();
            }

            const mediaElements = [
                document.querySelector("video"),
                scene.components && scene.components.arjs && scene.components.arjs.arToolkitSource && scene.components.arjs.arToolkitSource.domElement
            ];
            const tracks = new Set();
            mediaElements.forEach((media) => {
                if (media && media.srcObject && typeof media.srcObject.getTracks === "function") {
                    media.srcObject.getTracks().forEach((track) => tracks.add(track));
                }
            });
            tracks.forEach((track) => track.stop());
        };

        window.addEventListener("pagehide", cleanup, { once: true });

        updateSoundButton();
        registerModelListeners();
        setText(ui.camera, "Requesting camera access...");
        announce("Preparing the experience.");
        isCameraContextSupported();
        scheduleCanvasControls();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRuntime, { once: true });
    } else {
        initRuntime();
    }
})();

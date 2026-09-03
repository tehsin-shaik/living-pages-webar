export type Chapter = {
    number: string;
    label: string;
    title: string;
    description: string;
    image: string;
    alt: string;
    width: number;
    height: number;
    layout: "wide" | "default" | "feature";
};

export type Marker = {
    number: string;
    title: string;
    instruction: string;
    images: Array<{
        src: string;
        alt: string;
        label: string;
    }>;
};

export const chapters: Chapter[] = [
    {
        number: "01",
        label: "Mushroom House",
        title: "Enchanted Habitat",
        description: "A storybook house breathes above the marker in a slow, rhythmic pulse.",
        image: "/images/demo-images/mushroom-demo.png",
        alt: "Mushroom House 3D model appearing over a printed magazine marker",
        width: 1548,
        height: 1016,
        layout: "wide"
    },
    {
        number: "02",
        label: "Earth",
        title: "Heat Index",
        description: "A rotating planet carries a climate note into the room.",
        image: "/images/demo-images/earth-demo.png",
        alt: "Rotating Earth model and climate message appearing over a magazine page",
        width: 1562,
        height: 1007,
        layout: "default"
    },
    {
        number: "03",
        label: "Drone",
        title: "Flight Control",
        description: "A survey aircraft turns a flat marker into a flight path.",
        image: "/images/demo-images/drone-demo.png",
        alt: "Drone 3D model appearing above a printed magazine marker",
        width: 1559,
        height: 1009,
        layout: "default"
    },
    {
        number: "04",
        label: "Hero",
        title: "Hero Awakening",
        description: "A green hero wakes beneath a gold shockwave and an atmospheric track.",
        image: "/images/demo-images/hero-demo.png",
        alt: "Hero 3D model and shockwave effect appearing above a magazine marker",
        width: 1513,
        height: 1039,
        layout: "default"
    },
    {
        number: "05",
        label: "Whale",
        title: "Between the Pages",
        description: "A mythic whale arcs across the gap between two markers. Keep A and B in view.",
        image: "/images/demo-images/whale-demo.png",
        alt: "Mythic whale moving between two printed A and B markers",
        width: 1639,
        height: 960,
        layout: "feature"
    }
];

export const markers: Marker[] = [
    {
        number: "01",
        title: "Enchanted Habitat",
        instruction: "Point the camera at the mushroom marker to reveal the house.",
        images: [{
            src: "/mushroom.png",
            alt: "Mushroom House marker: black mushroom emblem inside a square marker",
            label: ""
        }]
    },
    {
        number: "02",
        title: "Heat Index",
        instruction: "Scan the Earth marker to bring the climate chapter into view.",
        images: [{
            src: "/earth.png",
            alt: "Heat Index marker: blue and green Earth emblem inside a square marker",
            label: ""
        }]
    },
    {
        number: "03",
        title: "Flight Control",
        instruction: "Scan the drone marker to reveal the rotating aircraft. Gesture controls are currently being repaired.",
        images: [{
            src: "/drone.png",
            alt: "Flight Control marker: black drone emblem inside a square marker",
            label: ""
        }]
    },
    {
        number: "04",
        title: "Hero Awakening",
        instruction: "Scan the hero marker to reveal the hero and shockwave. Sound support is currently being tested across mobile browsers.",
        images: [{
            src: "/hero.png",
            alt: "Hero Awakening marker: illustrated hero face inside a square marker",
            label: ""
        }]
    },
    {
        number: "05",
        title: "Between the Pages",
        instruction: "Show both A and B markers simultaneously to send the whale across.",
        images: [
            {
                src: "/letterA.png",
                alt: "Between the Pages marker A: large black letter A inside a square marker",
                label: "A"
            },
            {
                src: "/letterB.png",
                alt: "Between the Pages marker B: large black letter B inside a square marker",
                label: "B"
            }
        ]
    }
];

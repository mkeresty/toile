export const TOILE_SCENE = {
  viewBox: "0 0 1672 941",
  layers: [
    { id: "paper-sky", src: "/art/parallax/00-paper-sky.png", scrollSpeed: 0, drawOrder: 0 },
    { id: "water", src: "/art/parallax/01-water.png", contourSrc: "/art/parallax-svg/contours/water.svg", bounds: { left: 0, top: 602, width: 1672, height: 339 }, animationDelay: 1.05, scrollSpeed: -0.008, drawOrder: 1 },
    { id: "left-land-underlay", src: "/art/parallax/02-left-land-underlay.png", contourSrc: "/art/parallax-svg/contours/left-land-underlay.svg", bounds: { left: 0, top: 453, width: 704, height: 488 }, animationDelay: 1.35, scrollSpeed: -0.025, drawOrder: 2 },
    { id: "left-gap-bushes", src: "/art/parallax/02b-left-gap-bushes.png", contourSrc: "/art/parallax-svg/contours/left-gap-bushes.svg", bounds: { left: 0, top: 463, width: 319, height: 219 }, animationDelay: 1.7, scrollSpeed: -0.035, drawOrder: 3 },
    { id: "mountains", src: "/art/parallax/03-distant-mountains.png", contourSrc: "/art/parallax-svg/contours/mountains.svg", bounds: { left: 468, top: 268, width: 1204, height: 353 }, animationDelay: 0, scrollSpeed: -0.018, drawOrder: 4 },
    { id: "background-village", src: "/art/parallax/04-background-village-and-plants.png", contourSrc: "/art/parallax-svg/contours/background-village.svg", bounds: { left: 0, top: 138, width: 1672, height: 599 }, animationDelay: 0.55, scrollSpeed: -0.045, drawOrder: 5 },
    { id: "boat", src: "/art/parallax/05-boat.png", contourSrc: "/art/parallax-svg/experiments/05-boat-skeleton-tracing-multipass.svg", bounds: { left: 1589, top: 591, width: 53, height: 156 }, animationDelay: 1.95, scrollSpeed: -0.075, drawOrder: 6 },
    { id: "main-villa", src: "/art/parallax/06-main-villa-and-attached-plants.png", contourSrc: "/art/parallax-svg/contours/main-villa.svg", bounds: { left: 203, top: 308, width: 839, height: 569 }, animationDelay: 2.15, scrollSpeed: -0.09, drawOrder: 7 },
    { id: "left-wall", src: "/art/parallax/07-left-stone-wall.png", contourSrc: "/art/parallax-svg/contours/left-wall.svg", bounds: { left: 0, top: 568, width: 524, height: 373 }, animationDelay: 2.55, scrollSpeed: -0.135, drawOrder: 8 },
    { id: "foreground-plants", src: "/art/parallax/08-foreground-olive-branches.png", contourSrc: "/art/parallax-svg/contours/foreground-plants.svg", bounds: { left: 0, top: 681, width: 1672, height: 260 }, animationDelay: 2.95, scrollSpeed: -0.19, drawOrder: 9 },
  ],
} as const;

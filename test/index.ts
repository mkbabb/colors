import { smoothAnimate } from "../src/animation";

import { easeInOutCubic } from "../src/math";

const d = document.createElement("div");

const transformFunc = (v, t): any => {
    d.style.opacity = v;
};

smoothAnimate(0, 100, 1000, transformFunc, easeInOutCubic);

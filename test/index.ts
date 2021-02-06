import { Color } from "../src/colors";

const red = new Color("red");

const redHex = red.hex;
red.lightness *= 1.5;

const blue = new Color("rgb(0, 0, 255)");
const blueHSLA = blue.hsla;

const green = new Color("#FF0000");
green.opacity = 0.5;

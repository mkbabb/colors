import { clamp, lerp } from "./math";

function addAlpha(color: number[]): number[] {
    color = color.slice();

    if (color.length == 3) {
        return color.concat(1);
    } else {
        return color;
    }
}

function hexToRGBA(hex: number, alpha = 1): number[] {
    let rgbInt = parseInt(String(hex), 16);
    let r = (rgbInt >> 16) & 255;
    let g = (rgbInt >> 8) & 255;
    let b = rgbInt & 255;
    return [r, g, b, alpha];
}

function RGBAToHex(color: number[]): string {
    const [r, g, b, a] = addAlpha(color);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function HSLAToRGBA(color: number[]) {
    const [h, s, l, a] = addAlpha(color);
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a || 0];
}

function RGBAToHSLA(color: number[]) {
    const [r, g, b, a] = addAlpha(color);

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h;
    let s;
    let l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l, a];
}

function colorToRGBA(color) {
    let canvas = document.createElement("canvas");
    canvas.height = 1;
    canvas.width = 1;

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);

    return Array.from(ctx.getImageData(0, 0, 1, 1).data);
}

function RGBAToString(color: number[]) {
    color = addAlpha(color);
    return ` rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]}) `;
}

function parseColor(color): number[] {
    let pcolor;

    if (typeof color === "string") {
        let isRGB = color.indexOf("rgb") !== -1;
        let isHSL = color.indexOf("hsl") !== -1;
        let isHex = color[0] === "#";

        if (isHex) {
            color = color.slice(1);

            if (color.length == 3) {
                let len = color.length;
                let i = 0;
                do {
                    let c = color[i];
                    color = color.splice(i, 0, c);
                    i += 2;
                } while (++len < 6);
            }
            pcolor = hexToRGBA(color);
        } else if (isRGB || isHSL) {
            let num = color.split("(")[1].split(")")[0];
            let pnum = num.split(",");
            if (pnum.length === undefined || 0) {
                pnum = num.split(" ");
                if (pnum.length === undefined || 0) {
                    throw new Error("Color is of an undefined type.");
                }
            }
            pcolor = pnum.map((value, index) => {
                value = parseInt(value);
                return value;
            });

            if (isHSL) {
                pcolor = HSLAToRGBA(pcolor);
            }
        } else {
            pcolor = colorToRGBA(color);
        }
    } else {
        pcolor = color;
    }

    if (pcolor instanceof Array) {
        let len = pcolor.length;
        let diff = 4 - len;

        if (diff > 0) {
            pcolor = pcolor.concat(new Array(diff).fill(1));
        } else if (diff < 0) {
            pcolor.length = 4;
        }
    } else {
        throw new Error("Color is of an undefined type.");
    }
    return pcolor;
}

function interpColor(colors, steps = 2, endPoints = true, interpFunc = lerp) {
    colors = colors.map(function (color) {
        return parseColor(color);
    });

    const interpColor = function (t: number, color1, color2) {
        return new Array(color1.length).fill(0).map(function (_, index) {
            const value = interpFunc(t, color1[index], color2[index]);

            if (index < 3) {
                return clamp(Math.ceil(value), 0, 255);
            } else {
                return clamp(value, 0, 1);
            }
        });
    };

    let interpSection = function (color1, color2) {
        let section = [];
        for (let t = 0; t <= 1; t += 1 / steps) {
            let [r, g, b, a] = interpColor(t, color1, color2);
            let colorString = `rgba(${r}, ${g}, ${b}, ${a})`;
            let colorObj = new Color(colorString);
            section.push(colorObj.hex);
        }
        return section;
    };

    let sections = colors.map(function (_, index) {
        if (index < colors.length - 1) {
            return interpSection(colors[index], colors[index + 1]);
        } else {
            return [];
        }
    });

    return [].concat.apply([], sections);
}

class Color {
    _colorString: string;
    _rgba: number[];
    _hsla: number[];
    _hex: string;
    _hue: number;
    _saturation: number;
    _lightness: number;
    _opacity: number;

    constructor(colorString) {
        this.colorString = colorString;
    }

    get colorString() {
        return this._colorString;
    }
    set colorString(colorString) {
        this._rgba = parseColor(colorString);
        this._hsla = RGBAToHSLA(this._rgba);
        this._hex = RGBAToHex(this._rgba);
        this._colorString = RGBAToString(this._rgba);

        this._hue = this._hsla[0];
        this._saturation = this._hsla[1];
        this._lightness = this._hsla[2];
        this._opacity = this._hsla[3];
    }

    get hsla() {
        return this._hsla;
    }
    set hsla(hsla) {
        this._rgba = HSLAToRGBA(hsla);
        this._hsla = hsla;
        this._hex = RGBAToHex(this._rgba);
        this._colorString = RGBAToString(this._rgba);
    }

    get rgba() {
        return this._rgba;
    }
    set rgba(rgba) {
        this._rgba = rgba;
        this._hsla = RGBAToHSLA(rgba);
        this._hex = RGBAToHex(this._rgba);
        this._colorString = RGBAToString(this._rgba);
    }

    get hex() {
        return this._hex;
    }
    set hex(hex) {
        this._rgba = hexToRGBA(hex);
        this._hsla = RGBAToHSLA(rgba);
        this._hex = hex;
        this._colorString = RGBAToString(this._rgba);
    }

    get hue() {
        return this._hue;
    }
    set hue(hue) {
        if (clamp(hue) !== hue) {
            throw new Error("value must be betwixt 0 and 1");
        }
        this._hue = hue;
        this._hsla[0] = hue;
        this.hsla = this._hsla;
    }

    get saturation() {
        return this._saturation;
    }
    set saturation(saturation) {
        if (clamp(saturation) !== saturation) {
            throw new Error("value must be betwixt 0 and 1");
        }
        this._saturation = saturation;
        this._hsla[1] = saturation;
        this.hsla = this._hsla;
    }

    get lightness() {
        return this._lightness;
    }
    set lightness(lightness) {
        if (clamp(lightness) !== lightness) {
            throw new Error("value must be betwixt 0 and 1");
        }
        this._lightness = lightness;
        this._hsla[2] = lightness;
        this.hsla = this._hsla;
    }

    get opacity() {
        return this._opacity;
    }
    set opacity(opacity) {
        if (clamp(opacity) !== opacity) {
            throw new Error("value must be betwixt 0 and 1");
        }
        this._opacity = opacity;
        this._hsla[3] = opacity;
        this.hsla = this._hsla;
    }
}

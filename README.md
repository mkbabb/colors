# colors 🎨

A small TypeScript color manipulation library.

## About

The main component is the `Color` object, which allows you to construct a "color" from the following values:

-   `hex` (as string)
-   `rgb[a]` (as an array)
-   `hsl[a]` (as an array)
-   `name` (as string)

From the `Color` object, you can convert to any of the above on the fly using the various `get` methods. To note: the color value attributes are cached each time a `set` method is called.

You can also manipulate basic attributes of the color, such as:

-   `hue`
-   `saturation`
-   `lightness`
-   `brightness`

Finally, there's a set of functions that allow you to create a gradient constructed from color "keyframes", so to speak: each keyframe color will be interpolated using the provided `interpFunc`, whereof takes a time value, `t`, and a set of `to` and `from` values.

## Demo

```ts
const red = new Color("red");

const redHex = red.hex;
red.lightness *= 1.5;

const blue = new Color("rgb(0, 0, 255)");
const blueHSLA = blue.hsla;

const green = new Color("#FF0000");
green.opacity = 0.5;
```

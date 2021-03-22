export function clamp(x, lowerLimit = 0, upperLimit = 1) {
    if (x < lowerLimit) {
        return lowerLimit;
    }
    else if (x > upperLimit) {
        return upperLimit;
    }
    return x;
}
export function lerp(t, from, to) {
    return (1 - t) * from + t * to;
}

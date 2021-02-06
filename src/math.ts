export function clamp(x: number, lowerLimit = 0, upperLimit = 1): number {
    if (x < lowerLimit) {
        return lowerLimit;
    } else if (x > upperLimit) {
        return upperLimit;
    }
    return x;
}

export function lerp(t: number, from: number, to: number) {
    return (1 - t) * from + t * to;
}

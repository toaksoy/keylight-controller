import {
    KELVIN_MIN,
    KELVIN_MAX,
    MIRED_MIN,
    MIRED_MAX,
} from './constants.js';

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function snapToStep(value, step, min, max) {
    const stepped = Math.round(value / step) * step;
    return clamp(stepped, min, max);
}

export function mixRgb(fromRgb, toRgb, t) {
    const ratio = clamp(t, 0, 1);
    return [
        Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * ratio),
        Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * ratio),
        Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * ratio),
    ];
}

export function rgbToCss(rgb) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function miredToKelvin(mired) {
    return Math.round(1000000 / clamp(mired, MIRED_MIN, MIRED_MAX));
}

export function kelvinToMired(kelvin) {
    const normalizedKelvin = clamp(kelvin, KELVIN_MIN, KELVIN_MAX);
    return clamp(Math.round(1000000 / normalizedKelvin), MIRED_MIN, MIRED_MAX);
}

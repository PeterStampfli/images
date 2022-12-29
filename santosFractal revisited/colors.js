/* jshint esversion: 6 */

import {
    Polygon
}
from "./polygon.js";

export const colors = {};

colors.setup = function() {

    // calculate the surface of the polygon and store it in its field
    // and calculate cos of angle between lines going out from center=vertex[0]
    // calculate width=surface/perimeter^2
    Polygon.prototype.setSurface = function() {
        const length = this.cornersX.length;
        // do for all numbers of corners
        const originX = this.cornersX[0];
        const originY = this.cornersY[0];
        let newSideX = this.cornersX[1] - originX;
        let newSideY = this.cornersY[1] - originY;
        let surface = 0;
        for (let i = 2; i < length; i++) {
            let lastSideX = newSideX;
            let lastSideY = newSideY;
            newSideX = this.cornersX[i] - originX;
            newSideY = this.cornersY[i] - originY;
            const area = newSideX * lastSideY - newSideY * lastSideX;
            surface += area;
        }
        this.surface = Math.abs(surface);
        let ax = this.cornersX[1] - this.cornersX[0];
        let ay = this.cornersY[1] - this.cornersY[0];
        let bx = this.cornersX[length - 1] - this.cornersX[0];
        let by = this.cornersY[length - 1] - this.cornersY[0];
        this.cosAngle = Math.abs((ax * bx + ay * by)) / Math.sqrt((ax * ax + ay * ay) * (bx * bx + by * by));
        let perimeter = Math.sqrt(bx * bx + by * by);
        for (let i = 1; i < length; i++) {
            bx = this.cornersX[i] - this.cornersX[i - 1];
            by = this.cornersY[i] - this.cornersY[i - 1];
            perimeter += Math.sqrt(bx * bx + by * by);
        }
        this.width = this.surface / perimeter / perimeter;
    };


    // calculate surfaces and cosAngles
    Polygon.setSurfaces = function() {
        Polygon.collection.forEach(polygon => polygon.setSurface());
    };

    // minimum and maximum surface, and acosAngles, and width
    Polygon.minMaxSurface = function() {
        let minSurface = Polygon.collection[0].surface;
        let maxSurface = minSurface;
        let minCosAngle = Polygon.collection[0].cosAngle;
        let maxCosAngle = minCosAngle;
        let minWidth = Polygon.collection[0].width;
        let maxWidth = minWidth;
        const length = Polygon.collection.length;
        for (let i = 1; i < length; i++) {
            const surface = Polygon.collection[i].surface;
            minSurface = Math.min(minSurface, surface);
            maxSurface = Math.max(maxSurface, surface);
            const cosAngle = Polygon.collection[i].cosAngle;
            minCosAngle = Math.min(minCosAngle, cosAngle);
            maxCosAngle = Math.max(maxCosAngle, cosAngle);
            const width = Polygon.collection[i].width;
            minWidth = Math.min(minWidth, width);
            maxWidth = Math.max(maxWidth, width);
        }
        Polygon.minSurface = minSurface;
        Polygon.maxSurface = maxSurface;
        Polygon.minCosAngle = minCosAngle;
        Polygon.maxCosAngle = maxCosAngle;
        Polygon.minWidth = minWidth;
        Polygon.maxWidth = maxWidth;
    };

    // normalize surfaces between 0 and 0.999
    // if all nearly same surface - make it 0.9999
    // normalize cosAngle to 0...0.999
    // normalize width to 0 ... 0.999
    Polygon.normalizeSurface = function() {
        const diff = Polygon.maxSurface - Polygon.minSurface;
        const length = Polygon.collection.length;
        if (Math.abs(diff / Polygon.maxSurface) < 0.001) {
            for (let i = 0; i < length; i++) {
                Polygon.collection[i].normalizedSurface = 0.5; // all surfaces same value
            }
        } else {
            const iDiff = 0.999 / diff;
            const minSurface = Polygon.minSurface;
            for (let i = 0; i < length; i++) {
                let x = (Polygon.collection[i].surface - minSurface) * iDiff;
                Polygon.collection[i].normalizedSurface = x;
            }
        }
        const aDiff = Polygon.maxCosAngle - Polygon.minCosAngle;
        if (aDiff < 0.001) {
            for (let i = 0; i < length; i++) {
                Polygon.collection[i].cosAngle = 0.5;
            }
        } else {
            const iADiff = 0.999 / aDiff;
            const minCosAngle = Polygon.minCosAngle;
            for (let i = 0; i < length; i++) {
                Polygon.collection[i].cosAngle = (Polygon.collection[i].cosAngle - minCosAngle) * iADiff;
            }
        }
        const wDiff = Polygon.maxWidth - Polygon.minWidth;
        if (wDiff < 0.001) {
            for (let i = 0; i < length; i++) {
                Polygon.collection[i].width = 0.5;
            }
        } else {
            const iWDiff = 0.999 / wDiff;
            const minWidth = Polygon.minWidth;
            for (let i = 0; i < length; i++) {
                Polygon.collection[i].width = (Polygon.collection[i].width - minWidth) * iWDiff;
            }
        }
    };

    // set rgb components of a polygon depending on its hue, brightness and saturation values
    // hue can have any value, cyclic, interval 0 to 1
    // brightness and saturation are clamped to interval 0 to 1
    Polygon.prototype.setRGBFromHBS = function() {
        let red = 0;
        let green = 0;
        let blue = 0;
        let hue = this.hue; // hue cyclic from 0 to 1
        hue = 6 * (hue - Math.floor(hue));
        const c = Math.floor(hue);
        const x = hue - c;
        switch (c) {
            case 0:
                blue = 1;
                red = x;
                break;
            case 1:
                blue = 1 - x;
                red = 1;
                break;
            case 2:
                green = x;
                red = 1;
                break;
            case 3:
                green = 1;
                red = 1 - x;
                break;
            case 4:
                blue = x;
                green = 1;
                break;
            case 5:
                blue = 1;
                green = 1 - x;
                break;
        }
        const saturation = Math.max(0, Math.min(1, this.saturation));
        const brightness = 255.9 * Math.max(0, Math.min(1, this.brightness));
        this.red = Math.floor(brightness * (saturation * red + 1 - saturation));
        this.green = Math.floor(brightness * (saturation * green + 1 - saturation));
        this.blue = Math.floor(brightness * (saturation * blue + 1 - saturation));
    };

    // grey colors black for smallest to white for largest
    Polygon.greySurfaces = function() {
        const length = Polygon.collection.length;
        for (let i = 0; i < length; i++) {
            const polygon = Polygon.collection[i];
            const grey = Math.floor(polygon.normalizedSurface * 255.9);
            polygon.red = grey;
            polygon.green = grey;
            polygon.blue = grey;
        }
    };

    // grey colors black for smallest to white for largest
    Polygon.greyAngles = function() {
        const length = Polygon.collection.length;
        for (let i = 0; i < length; i++) {
            const polygon = Polygon.collection[i];
            const grey = Math.floor(polygon.cosAngle * 255.9);
            polygon.red = grey;
            polygon.green = grey;
            polygon.blue = grey;
        }
    };

    // magenta-green  (cosangle-surface)
    Polygon.magentaGreen = function() {
        const length = Polygon.collection.length;
        for (let i = 0; i < length; i++) {
            const polygon = Polygon.collection[i];
            const green = Math.floor(polygon.normalizedSurface * 255.9);
            const magenta = Math.floor(polygon.cosAngle * 255.9);
            polygon.red = magenta;
            polygon.green = green;
            polygon.blue = magenta;
        }
    };

    // transform hue,value to hue,saturation, brightness
    // hue is not changed
    Polygon.prototype.HBSFromHueValue = function() {
        const value = this.value;
        this.saturation = (1 - value) * Polygon.saturationFrom + value * Polygon.saturationTo;
        this.brightness = (1 - value) * Polygon.brightnessFrom + value * Polygon.brightnessTo;
    };

    // particular colorings
    // polygon.hue and polygon.value normalized between 0 and 1
    Polygon.hueValue = function() {
        const length = Polygon.collection.length;
        const range = Polygon.hueTo - Polygon.hueFrom;
        for (let i = 0; i < length; i++) {
            const polygon = Polygon.collection[i];
            polygon.hue = range * polygon.hue + Polygon.hueFrom;
            polygon.HBSFromHueValue();
            polygon.setRGBFromHBS();
        }
    };
};
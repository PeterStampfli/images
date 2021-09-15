/* jshint esversion: 6 */

import {
    Pixels,
    ColorInput
} from "../libgui/modules.js";

import {
    poincare
} from './modules.js';

export const color = {};

color.front = '#ff0000';
color.center = '#808080';
color.back = '#0000ff';

var redCenter, greenCenter, blueCenter;
var deltaRedFront, deltaGreenFront, deltaBlueFront;
var deltaRedBack, deltaGreenBack, deltaBlueBack;
var colorObject = {};

color.setupInterpolation = function() {
    ColorInput.setObject(colorObject, color.front);
    const redFront = colorObject.red;
    const greenFront = colorObject.green;
    const blueFront = colorObject.blue;
    ColorInput.setObject(colorObject, color.center);
    redCenter = colorObject.red;
    greenCenter = colorObject.green;
    blueCenter = colorObject.blue;
    ColorInput.setObject(colorObject, color.back);
    const redBack = colorObject.red;
    const greenBack = colorObject.green;
    const blueBack = colorObject.blue;
    deltaRedFront = (redFront - redCenter) / poincare.radius;
    deltaGreenFront = (greenFront - greenCenter) / poincare.radius;
    deltaBlueFront = (blueFront - blueCenter) / poincare.radius;
    deltaRedBack = (redBack - redCenter) / poincare.radius;
    deltaGreenBack = (greenBack - greenCenter) / poincare.radius;
    deltaBlueBack = (blueBack - blueCenter) / poincare.radius;
};

color.interpolation = function(z) {
    if (z > 0) {
        z=Math.min(z,poincare.radius);
        colorObject.red = Math.min(255, Math.max(0, Math.round(redCenter + z * deltaRedFront)));
        colorObject.green = Math.min(255, Math.max(0, Math.round(greenCenter + z * deltaGreenFront)));
        colorObject.blue = Math.min(255, Math.max(0, Math.round(blueCenter + z * deltaBlueFront)));
    } else {
        z=Math.max(z,-poincare.radius);
        colorObject.red = Math.min(255, Math.max(0, Math.round(redCenter - z * deltaRedBack)));
        colorObject.green = Math.min(255, Math.max(0, Math.round(greenCenter - z * deltaGreenBack)));
        colorObject.blue = Math.min(255, Math.max(0, Math.round(blueCenter - z * deltaBlueBack)));
    }
    return ColorInput.stringFromObject(colorObject);
};
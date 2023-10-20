/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

import {
    output
} from "../libgui/modules.js";

export const insideOutside = {};
insideOutside.inside = true;
insideOutside.outside = false;
insideOutside.drift = 0.1;

insideOutside.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'boolean',
        params: insideOutside,
        property: 'inside',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: insideOutside,
        property: 'outside',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: insideOutside,
        property: 'drift',
        onChange: julia.drawNewStructure
    });
};

insideOutside.map = function() {
    map.makeDriftArrays();
    const inside = insideOutside.inside;
    const outside = insideOutside.outside;
    const drift = insideOutside.drift;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const driftXArray = map.driftXArray;
    const structureArray = map.structureArray;
    const nPixels=xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const x = xArray[index];
        const y = yArray[index];
        const r2 = x * x + y * y;
        if (r2 <= 1) {
            if (inside) {
                driftXArray[index] = 0;
            } else {
                structureArray[index] = 128;
            }
        } else
        if (outside) {
            const factor = 1 / r2;
            xArray[index] = factor * x;
            yArray[index] = factor * y;
            driftXArray[index] = drift;
        } else {
            structureArray[index] = 128;
        }
    }
};
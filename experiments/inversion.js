/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

export const inversion = {};
inversion.on = false;

inversion.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'boolean',
        params: inversion,
        property: 'factor',
        onChange: julia.drawNewStructure
    });
};

inversion.map = function() {
    if (inversion.on) {
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        for (var index = 0; index < length; index++) {
            const x = xArray[index];
            const y = yArray[index];
            const factor = 1 / (x * x + y * y);
            xArray[index] = factor * x;
            yArray[index] = factor * y;
        }
    }
};
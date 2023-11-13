/* jshint esversion:6 */

import {
    julia,
    map,
    base
} from "./modules.js";

export const normalViewPolar = {};
normalViewPolar.on=true;

normalViewPolar.setup = function() {
    base.gui.add({
        type: 'boolean',
        params: normalViewPolar,
        property: 'on',
        labelText: 'normal view',
        onChange: julia.drawNewStructure
    });
};

normalViewPolar.map = function() {
    if (!normalViewPolar.on) {
        return;
    }
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const length = xArray.length;
    for (let i = 0; i < length; i++) {
        if (structureArray[i] < 128) {
            // view direction  is y-axis
            const x = xArray[i];
            const y = yArray[i];
            // get y-coordinate on unit sphere
            const r2 = x * x + y*y;
            if (r2 > 1) {
                structureArray[i] = 128;
            } else {
                const z = Math.sqrt(1 - r2);
                const factor = 1 / (1 - z);
                xArray[i] = factor * x;
                yArray[i] = factor * y;
            }
        }
    }
};
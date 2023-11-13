/* jshint esversion:6 */

import {
    julia,
    map,
    base
} from "./modules.js";

export const inverseMercator = {};
inverseMercator.on=true;

inverseMercator.setup = function() {
    base.gui.add({
        type: 'boolean',
        params: inverseMercator,
        property: 'on',
        labelText: 'normal view',
        onChange: julia.drawNewStructure
    });
};

inverseMercator.map = function() {
    if (!inverseMercator.on) {
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
            const z = yArray[i];
            // get y-coordinate on unit sphere
            const r2 = x * x + z * z;
            if (r2 > 1) {
                structureArray[i] = 128;
            } else {
                xArray[i] = 2*Math.acos(x/Math.sqrt(1-z*z))/Math.PI;
                yArray[i] = 2*Math.asin(z)/Math.PI;
            }
        }
    }
};
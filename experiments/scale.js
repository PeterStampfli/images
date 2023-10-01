/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

export const scale = {};
scale.factor = 1;

scale.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: scale,
        property: 'factor',
        labelText: 'scale by',
        onChange: julia.drawNewStructure
    });
};

scale.map = function() {
    const factor = scale.factor;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        xArray[index] *= factor;
        yArray[index] *= factor;
    }
};
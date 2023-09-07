/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

export const cayley = {};
cayley.on = true;

cayley.setup = function(gui) {
    base.gui.add({
        type: 'boolean',
        params: cayley,
        property: 'on',
        labelText: 'cayley',
        onChange: julia.drawNewStructure
    });
};

cayley.map = function() {
    if (cayley.on) {
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        for (var index = 0; index < length; index++) {
            let x = xArray[index];
            let y = yArray[index];
            // z=>(z-i)/(z+i)
            const r2 = x * x + y * y;
            const iDen = 1 / (r2 + y + y + 1);
            xArray[index] = (r2 - 1) * iDen;
            yArray[index] = -2 * x * iDen;
        }
    }
};
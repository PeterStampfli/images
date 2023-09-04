/* jshint esversion:6 */

import {
    julia,map,base
} from "./modules.js";

export const square={};
square.on = true;

square.setup = function(gui) {
    base.maps.push(square);
    base.gui.add({
        type: 'boolean',
        params: square,
        property: 'on',
        labelText: 'square on',
        onChange: julia.drawNewStructure
    });
};

square.map = function() {
    if (square.on) {
        const xArray = map.xArray;
        const yArray = map.yArray;
        const length = xArray.length;
        for (let index = 0; index < length; index++) {
            let x = xArray[index];
            let y = yArray[index];
            xArray[index] = x * x - y * y;
            yArray[index] = 2 * x * y;
        }
    }
};

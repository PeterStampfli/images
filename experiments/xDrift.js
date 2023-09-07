/* jshint esversion:6 */

import {
    julia,map,base
} from "./modules.js";

import {
    output
} from "../libgui/modules.js";

// x-dependent drift in x-direction

export const xDrift = {};
xDrift.strength = 0;

xDrift.setup = function(gui) {
    base.gui.add({
        type: 'number',
        params: xDrift,
        property: 'strength',
        labelText:'x-drift',
        onChange: julia.drawNewStructure
    });
}

xDrift.map = function() {
    const strength = xDrift.strength;
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            xArray[index] += strength*x;
            index += 1;
            x += scale;
        }
    }
};
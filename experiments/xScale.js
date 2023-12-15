/* jshint esversion:6 */

import {
    julia,map,base
} from "./modules.js";

import {
    output
} from "../libgui/modules.js";

// x-dependent drift in x-direction

export const xScale = {};
xScale.strength = 0;

xScale.setup = function(gui) {
    base.gui.add({
        type: 'number',
        params: xScale,
        property: 'strength',
        labelText:'x-scale',
        onChange: julia.drawNewStructure
    });
}

xScale.map = function() {
    const strength = xScale.strength;
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            const factor=(1+strength*i/map.width);
            xArray[index] *=factor;
            yArray[index] *=factor;
            index += 1;
            x += scale;
        }
    }
};
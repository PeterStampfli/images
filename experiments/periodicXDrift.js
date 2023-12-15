/* jshint esversion:6 */

// drifting as a rotation around the origin
// depending on coordinates of pixels, which are calculated
// apply to the final image map

import {
    julia,map,base
} from "./modules.js";

import {
    output
} from "../libgui/modules.js";

export const periodicXDrift = {};
periodicXDrift.strength=0;
periodicXDrift.period=2;

periodicXDrift.setup = function(gui) {  
    base.gui.add({
        type:'number',
        params:periodicXDrift,
        property:'strength',
        labelText:'drift',
        onChange:julia.drawNewStructure
    }).add({
        type:'number',
        params:periodicXDrift,
        property:'period',
        onChange:julia.drawNewStructure
    });
};

periodicXDrift.map = function() {
    const strength=periodicXDrift.strength;
    const iPeriod2Pi=Math.PI*2/periodicXDrift.period;
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            const angle=iPeriod2Pi*x;
            xArray[index] -= strength*y;
            yArray[index] += strength*x;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};

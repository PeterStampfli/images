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

export const circularScale = {};
circularScale.strength=0;

circularScale.setup = function(gui) {  
    base.gui.add({
        type:'number',
        params:circularScale,
        property:'strength',
        labelText:'circ-scale',
        onChange:julia.drawNewStructure
    });
};

circularScale.map = function() {
    const strength=circularScale.strength;
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
            const r=Math.hypot(x,y);
            const factor=1+strength*y/r;
        //    xArray[index] -= strength*y/r;
        //    yArray[index] += strength*x/r;
        xArray[index]*=factor;
        yArray[index]*=factor;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};

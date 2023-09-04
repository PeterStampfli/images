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

export const circularDrift = {};
circularDrift.strength=0;

circularDrift.setup = function(gui) {  
    base.maps.push(circularDrift);
    base.gui.add({
        type:'number',
        params:circularDrift,
        property:'strength',
        labelText:'circ-drift',
        onChange:julia.drawNewStructure
    });
};

circularDrift.map = function() {
    const strength=circularDrift.strength;
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
            xArray[index] -= strength*y;
            yArray[index] += strength*x;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};

/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents,
    keyboard
} from "../libgui/modules.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

export const bulatov = {};
bulatov.drift=0;

bulatov.setup = function(gui) {    
    gui.add({
        type:'number',
        params:bulatov,
        property:'drift',
        onChange:julia.drawNewStructure
    });
};

bulatov.drift = function() {
    const drift=bulatov.drift;
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
            xArray[index] -= drift*y;
            yArray[index] += drift*x;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};

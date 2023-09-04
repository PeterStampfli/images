/* jshint esversion:6 */

import {
    map,
    julia, base
} from "./modules.js";

export const cartioid = {};
cartioid.power = 0.5;
cartioid.scale = 2;

cartioid.setup = function(gui) {
    base.maps.push(cartioid);
    base.gui.add({
        type: 'number',
        params: cartioid,
        property: 'power',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: cartioid,
        property: 'scale',
        onChange: julia.drawNewStructure
    });
};

cartioid.map = function() {
    const power = cartioid.power;
    const scale = cartioid.scale;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        /* x is real part, y is imaginary part*/
        /* symmetry with respect to y-axis*/
        let x = - yArray[index];
        let y =  xArray[index];
        /* square root*/
        const phi = power * Math.atan2(y, x);
        const r = Math.pow(y * y + x * x, 0.5 * power);
        xArray[index] = scale *r * Math.sin(phi);
        yArray[index] = scale *r * Math.cos(phi) - 1;
    }
};
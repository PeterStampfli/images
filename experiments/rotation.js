/* jshint esversion: 6 */

import {
    julia,
    map,
    base
} from "./modules.js";

export const rotation = {};
rotation.angle = 0;

rotation.setup = function() {
    base.gui.add({
        type: 'number',
        params: rotation,
        property: 'angle',
        labelText: 'angle/pi',
        onChange: julia.drawNewStructure
    });
};

rotation.map = function() {
    const angle = rotation.angle;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const xArray = map.xArray;
    const yArray = map.yArray;
    const length = yArray.length;
    for (let index = 0; index < length; index++) {
        const x = xArray[index];
        const y = yArray[index];
        xArray[index] = cosAngle * x - sinAngle * y;
        yArray[index] = sinAngle * x + cosAngle * y;
    }
};
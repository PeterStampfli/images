/* jshint esversion:6 */

import {
    julia,map,base
} from "./modules.js";

export const flipXY = {};

flipXY.setup = function() {  
};

flipXY.map = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const length=xArray.length;
    for (let i = 0; i<length;i++) {
        const x = xArray[i];
        xArray[i]=yArray[i];
        yArray[i]=x;
    }
};

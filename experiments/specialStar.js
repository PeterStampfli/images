/* jshint esversion:6 */

// special star z+z.conj^(n-1)/(n-1)

import {
    julia,
    map,
    base,
    kaleidoscope
} from "./modules.js";

export const specialStar = {};

specialStar.n = 5;

specialStar.setup = function() {
    base.gui.addParagraph('<strong>specialStar</strong>');
    base.gui.add({
        type: 'number',
        params: specialStar,
        property: 'n',
        onChange: function() {
            julia.drawNewStructure();
        }
    });
};

specialStar.map = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nm1=specialStar.n-1;
    const nm1half=nm1/2;
    const inm1=1/nm1;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            let y = yArray[index];
            let x = xArray[index];
            const angle=nm1*Math.atan2(y,x);
            const r=inm1*Math.pow(x*x+y*y,nm1half);
            xArray[index] = x+r*Math.cos(angle);
            yArray[index] = y+r*Math.sin(angle);
                   //  xArray[index] = x+x*x-y*y;
           // yArray[index] = y+2*x*y;
        }
    }
};
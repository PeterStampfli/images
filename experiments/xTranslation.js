/* jshint esversion: 6 */

import {
    julia,map,base
} from "./modules.js";

export const xTranslation={};
xTranslation.translation=0;

xTranslation.setup = function() {
    base.maps.push(xTranslation);
    base.gui.add({
        type: 'number',
        params: xTranslation,
        property: 'translation',
        labelText: 'x-translation',
        onChange: julia.drawNewStructure
    });
};

xTranslation.map = function() {
    const amount = xTranslation.translation;
    const xArray = map.xArray;
    const length = xArray.length;
    for (let index = 0; index < length; index++) {
        xArray[index] += amount;
    }
};
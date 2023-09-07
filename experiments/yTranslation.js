/* jshint esversion: 6 */

import {
    julia,
    map,
    base
} from "./modules.js";

export const yTranslation = {};
yTranslation.translation = 0;

yTranslation.setup = function() {
    base.gui.add({
        type: 'number',
        params: yTranslation,
        property: 'translation',
        labelText: 'y-translation',
        onChange: julia.drawNewStructure
    });
};

yTranslation.map = function() {
    const amount = yTranslation.translation;
    const yArray = map.yArray;
    const length = yArray.length;
    for (let index = 0; index < length; index++) {
        yArray[index] += amount;
    }
};
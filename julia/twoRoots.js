/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    map,
    julia
} from "./mapImage.js";

import {
    universalRational
} from "./universalRational.js";

export const twoRoots = {};

const amplitude = {};
amplitude.real = 1;
amplitude.imag = 0;

twoRoots.firstOrder = 5;
twoRoots.secondOrder = 5;
twoRoots.angle = 36;
twoRoots.radius = 0.7;
twoRoots.zPower=1;

twoRoots.setup = function(gui) {
    gui.addParagraph('<strong>two roots</strong>');
    gui.add({
        type: 'number',
        params: twoRoots,
        property: 'firstOrder',
        labelText: '1.order',
        step: 1,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: twoRoots,
        property: 'secondOrder',
        labelText: '2.order',
        step: 1,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: twoRoots,
        property: 'radius',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: twoRoots,
        property: 'angle',
        onChange: julia.drawNewStructure
    });
     gui.add({
        type: 'number',
        params: twoRoots,
        property: 'zPower',
        step: 1,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: amplitude,
        property: 'real',
        labelText: 'amplitude re',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: amplitude,
        property: 'imag',
        labelText: 'im',
        onChange: julia.drawNewStructure
    });

    map.mapping = map.twoRootsUniversalRational;
};

map.twoRootsUniversalRational = function() {
    const rPow = Math.pow(twoRoots.radius, twoRoots.secondOrder);
    const angle = twoRoots.secondOrder*Math.PI * twoRoots.angle / 180;
    const secondReal = -rPow * Math.cos(angle);
    const secondImag = -rPow * Math.sin(angle);
    map.universalRational([twoRoots.zPower, amplitude.real, amplitude.imag, twoRoots.firstOrder, -1, 0, twoRoots.secondOrder, secondReal, secondImag]);
};
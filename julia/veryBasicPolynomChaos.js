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

export const veryBasicPolynomChaos = {};

const amplitude = {};
amplitude.real = 1;
amplitude.imag = 0;

const base = {};
base.real = 1;
base.imag = 0;

veryBasicPolynomChaos.nPhi = 5;
veryBasicPolynomChaos.nRad = 5;

veryBasicPolynomChaos.setup = function(gui) {
    gui.addParagraph('<strong>special rational</strong>');
    gui.add({
        type: 'number',
        params: veryBasicPolynomChaos,
        property: 'nPhi',
        labelText:'order',
        step: 1,
        min: 1,
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
    gui.add({
        type: 'number',
        params: base,
        property: 'real',
        labelText: 'base re',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: base,
        property: 'imag',
        labelText: 'im',
        onChange: julia.drawNewStructure
    });

   map.mapping = map.veryBasicPolynomChaosUniversalRational;
};

map.veryBasicPolynomChaosUniversalRational = function() {
    map.universalRational([1, amplitude.real, amplitude.imag, veryBasicPolynomChaos.nPhi, base.real, base.imag]);
};
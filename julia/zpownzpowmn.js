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

export const zpownzpowmn = {};

const amplitude = {};
amplitude.real = 1;
amplitude.imag = 0;

const base = {};
base.real = 1;
base.imag = 0;

zpownzpowmn.p = 3;
zpownzpowmn.n = 3;

zpownzpowmn.setup = function(gui) {
    gui.addParagraph('<strong>special rational</strong>');
    gui.add({
        type: 'number',
        params: zpownzpowmn,
        property: 'p',
        labelText: 'powers p',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: zpownzpowmn,
        property: 'n',
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

    map.mapping = map.zpownzpowmn;
};

map.zpownzpowmn = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const selectArray = map.selectArray;
    const amplitudeReal = amplitude.real;
    const amplitudeImag = amplitude.imag;
    const baseRealKoeff = base.real;
    const baseImagKoeff = base.imag;
    const p = zpownzpowmn.p;
    const p2 = p / 2;
    const n = zpownzpowmn.n;
    const n2 = n / 2;
    const eps = 0.00001;
    const nPixels = map.xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // safety: check if z is finite or zero
        const abs2 = x * x + y * y;
        if (isFinite(abs2) && (abs2 > eps)) {
            const phi = Math.atan2(y, x);
            const rp = Math.pow(abs2, p2);
            const phip = p * phi;
            const zpReal = rp * Math.cos(phip);
            const zpImag = rp * Math.sin(phip);
            const phin = n * phi;
            const rn = Math.pow(abs2, n2);
            const znReal = rn * Math.cos(phin);
            const znImag = rn * Math.sin(phin);
            const baseFactor = 1 / (znReal * znReal + znImag * znImag);
            const sumReal = zpReal + baseFactor * (baseRealKoeff * znReal + baseImagKoeff * znImag);
            const sumImag = zpImag + baseFactor * (baseImagKoeff * znReal - baseRealKoeff * znImag);
            xArray[index] = amplitudeReal * sumReal - amplitudeImag * sumImag;
            yArray[index] = amplitudeReal * sumImag + amplitudeImag * sumReal;
        } else {
            xArray[index] = Infinity;
            yArray[index] = Infinity;
        }
    }
};

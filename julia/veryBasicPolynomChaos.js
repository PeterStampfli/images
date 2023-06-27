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

export const veryBasicPolynom = {};

const amplitude = {};
amplitude.real = 1;
amplitude.imag = 0;

const base = {};
base.real = 1;
base.imag = 0;

veryBasicPolynom.nPhi = 5;
veryBasicPolynom.nRad = 5;

veryBasicPolynom.setup = function(gui) {
    gui.addParagraph('<strong>special rational</strong>');
    gui.add({
        type: 'number',
        params: veryBasicPolynom,
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

    map.mapping = map.veryBasicPolynom;
   map.mapping = map.veryBasicPolynomUniversalRational;
};

map.veryBasicPolynom = function() {
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const selectArray = map.selectArray;
    const baseReal = base.real;
    const baseImag = base.imag;
    const eps = 0.00001;
    const base2 = baseReal * baseReal + baseImag * baseImag + eps;
    const amplitudeReal = (amplitude.real * baseReal + amplitude.imag * baseImag) / base2;
    const amplitudeImag = (amplitude.imag * baseReal - amplitude.real * baseImag) / base2;
    const nRad2 = veryBasicPolynom.nRad / 2;
    const nPhi = veryBasicPolynom.nPhi;
    const nPixels = map.xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // safety: check if z is finite
        const abs2 = x * x + y * y;
        if (isFinite(abs2)) {
            const phiOrder = nPhi * Math.atan2(y, x);
            const rOrder = Math.pow(abs2, nRad2);
            const zOrderReal = rOrder * Math.cos(phiOrder) + baseReal;
            const zOrderImag = rOrder * Math.sin(phiOrder) + baseImag;
            let zzReal = zOrderReal * x - zOrderImag * y;
            let zzImag = zOrderImag * x + zOrderReal * y;
            //         zzReal=zOrderReal;
            //         zzImag=zOrderImag;
            xArray[index] = amplitudeReal * zzReal - amplitudeImag * zzImag;
            yArray[index] = amplitudeReal * zzImag + amplitudeImag * zzReal;
        } else {
            xArray[index] = Infinity;
            yArray[index] = Infinity;
        }
    }
};

map.veryBasicPolynomUniversalRational = function() {
    map.universalRational([1, amplitude.real, amplitude.imag, veryBasicPolynom.nPhi, base.real, base.imag]);
};
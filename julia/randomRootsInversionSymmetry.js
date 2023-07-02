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

export const randomRootsInversionSymmetry = {};

const amplitude = {};
randomRootsInversionSymmetry.zPower = 1;
randomRootsInversionSymmetry.order = 5;
randomRootsInversionSymmetry.nomTerms = 1;
randomRootsInversionSymmetry.maxPower = 2;
randomRootsInversionSymmetry.scale = 1;

randomRootsInversionSymmetry.setup = function(gui) {
    gui.addParagraph('<strong>random roots</strong>');
    gui.add({
        type: 'number',
        params: randomRootsInversionSymmetry,
        property: 'order',
        step: 1,
        min: 1,
        onChange: function() {
            randomRootsInversionSymmetry.random();
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: randomRootsInversionSymmetry,
        property: 'maxPower',
        labelText: 'max power',
        step: 1,
        min: 1,
        onChange: function() {
            randomRootsInversionSymmetry.random();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: randomRootsInversionSymmetry,
        property: 'terms',
        step: 1,
        min: 1,
        onChange: function() {
            randomRootsInversionSymmetry.random();
            julia.drawNewStructure();
        }
    });
    randomRootsInversionSymmetry.random = randomRootsInversionSymmetry.unitSquare;

    gui.add({
        type: 'number',
        params: randomRootsInversionSymmetry,
        property: 'zPower',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'selection',
        params: randomRootsInversionSymmetry,
        property: 'random',
        options: {
            'unit circle': randomRootsInversionSymmetry.unitCircle,
            'unit circle mirror symmetry': randomRootsInversionSymmetry.unitCircleMirrorSymmetry,
            'unit square': randomRootsInversionSymmetry.unitSquare,
            'unit square mirror symmetry': randomRootsInversionSymmetry.unitSquareMirrorSymmetry,
            'line': randomRootsInversionSymmetry.line
        },
        onChange: function() {
            randomRootsInversionSymmetry.random();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: randomRootsInversionSymmetry,
        property: 'scale',
        labelText: 'scale roots',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'button',
        buttonText: 'randomize',
        onClick: function() {
            randomRootsInversionSymmetry.random();
            julia.drawNewStructure();
        }
    });
    randomRootsInversionSymmetry.random();
    map.mapping = map.randomRootsInversionSymmetryUniversalRational;
};

var args;
var orders = [];
var protoRootsReal = [];
var protoRootsImag = [];

randomRootsInversionSymmetry.unitSquare = function() {
    orders.length = 0;
    protoRootsReal.length = 0;
    protoRootsImag.length = 0;
    for (let i = 0; i < randomRootsInversionSymmetry.terms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        orders.push(order);
        protoRootsReal.push(x);
        protoRootsImag.push(y);
    }
};

randomRootsInversionSymmetry.unitSquareMirrorSymmetry = function() {
    orders.length = 0;
    protoRootsReal.length = 0;
    protoRootsImag.length = 0;
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        orders.push(order);
        protoRootsReal.push(x);
        protoRootsImag.push(y);
        orders.push(order);
        protoRootsReal.push(x);
        protoRootsImag.push(-y);
    }
};

randomRootsInversionSymmetry.unitCircle = function() {
    orders.length = 0;
    protoRootsReal.length = 0;
    protoRootsImag.length = 0;
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        orders.push(order);
        protoRootsReal.push(x);
        protoRootsImag.push(y);
    }
};

randomRootsInversionSymmetry.unitCircleMirrorSymmetry = function() {
    orders.length = 0;
    protoRootsReal.length = 0;
    protoRootsImag.length = 0;
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        orders.push(order);
        protoRootsReal.push(x);
        protoRootsImag.push(y);
        orders.push(order);
        protoRootsReal.push(x);
        protoRootsImag.push(-y);
    }
};

randomRootsInversionSymmetry.line = function() {
    orders.length = 0;
    protoRootsReal.length = 0;
    protoRootsImag.length = 0;
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        orders.push(order);
        protoRootsReal.push(2 * Math.random() - 1);
        protoRootsImag.push(0);
    }
};

// inversion symmetry via (a+z**n)/(a*z**n+1)=(1/a)*(z**n+a)/(z**n+1/a), conjugated div

map.randomRootsInversionSymmetryUniversalRational = function() {
    args = [randomRootsInversionSymmetry.zPower, 0, 0];
    let ampReal = 1;
    let ampImag = 0;
    const length = orders.length;
    for (let i = 0; i < length; i++) {
        const order = orders[i];
        let rootReal = randomRootsInversionSymmetry.scale * protoRootsReal[i];
        let rootImag = randomRootsInversionSymmetry.scale * protoRootsImag[i];
        args.push(order);
        args.push(rootReal);
        args.push(rootImag);
        const denom = rootReal * rootReal + rootImag * rootImag;
        rootReal /= denom;
        rootImag /= denom;
        args.push(-order);
        args.push(rootReal);
        args.push(rootImag);
        const h = ampReal * rootReal - ampImag * rootImag;
        ampImag = ampReal * rootImag + ampImag * rootReal;
        ampReal = h;
    }
    args[1] = ampReal;
    args[2] = ampImag;
    map.universalRational(args);
};
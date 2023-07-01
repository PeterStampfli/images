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
        orders.push(order);
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        protoRootsReal.push(x);
        protoRootsImag.push(y);
    }
};

randomRootsInversionSymmetry.unitSquareMirrorSymmetry = function() {
    args = [randomRootsInversionSymmetry.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        args.push(order);
        args.push(x);
        args.push(y);
        args.push(order);
        args.push(x);
        args.push(-y);
    }
    for (let i = 0; i < randomRootsInversionSymmetry.denomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        args.push(-order);
        args.push(x);
        args.push(y);
        args.push(-order);
        args.push(x);
        args.push(-y);
    }
    console.log(args);
};

randomRootsInversionSymmetry.unitCircle = function() {
    args = [randomRootsInversionSymmetry.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        args.push(order);
        args.push(x);
        args.push(y);
    }
    for (let i = 0; i < randomRootsInversionSymmetry.denomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        args.push(-order);
        args.push(x);
        args.push(y);
    }
    console.log(args);
};

randomRootsInversionSymmetry.unitCircleMirrorSymmetry = function() {
    args = [randomRootsInversionSymmetry.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        args.push(order);
        args.push(x);
        args.push(y);
        args.push(order);
        args.push(x);
        args.push(-y);
    }
    for (let i = 0; i < randomRootsInversionSymmetry.denomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        args.push(-order);
        args.push(x);
        args.push(y);
        args.push(-order);
        args.push(x);
        args.push(-y);
    }
    console.log(args);
};

randomRootsInversionSymmetry.line = function() {
    args = [randomRootsInversionSymmetry.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRootsInversionSymmetry.nomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        args.push(order);
        args.push(2 * Math.random() - 1);
        args.push(0);
    }
    for (let i = 0; i < randomRootsInversionSymmetry.denomTerms; i++) {
        const order = randomRootsInversionSymmetry.order * Math.floor(1 + randomRootsInversionSymmetry.maxPower * Math.random());
        args.push(-order);
        args.push(2 * Math.random() - 1);
        args.push(0);
    }
    console.log(args);
};

map.randomRootsInversionSymmetryUniversalRational = function() {
    // the amplitude may change, but not the roots
    args[1] = amplitude.real;
    args[2] = amplitude.imag;
    map.universalRational(args);
};
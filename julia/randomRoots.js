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

export const randomRoots = {};

const amplitude = {};
amplitude.real = 1;
amplitude.imag = 0;
randomRoots.zPower = 1;
randomRoots.order = 5;
randomRoots.nomTerms = 1;
randomRoots.denomTerms = 0;
randomRoots.maxPower = 2;

randomRoots.setup = function(gui) {
    gui.addParagraph('<strong>random roots</strong>');
    gui.add({
        type: 'number',
        params: randomRoots,
        property: 'order',
        step: 1,
        min: 1,
        onChange: function() {
            randomRoots.random();
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: randomRoots,
        property: 'maxPower',
        labelText: 'max power',
        step: 1,
        min: 1,
        onChange: function() {
            randomRoots.random();
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: randomRoots,
        property: 'nomTerms',
        labelText: 'nominator',
        step: 1,
        min: 0,
        onChange: function() {
            randomRoots.random();
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: randomRoots,
        property: 'denomTerms',
        labelText: 'denom',
        step: 1,
        min: 0,
        onChange: function() {
            randomRoots.random();
            julia.drawNewStructure();
        }
    });
    randomRoots.random = randomRoots.unitSquare;

    gui.add({
        type: 'number',
        params: randomRoots,
        property: 'zPower',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'selection',
        params: randomRoots,
        property: 'random',
        options: {
            'unit circle': randomRoots.unitCircle,
            'unit circle mirror symmetry': randomRoots.unitCircleMirrorSymmetry,
            'unit square': randomRoots.unitSquare,
            'unit square mirror symmetry': randomRoots.unitSquareMirrorSymmetry,
            'line':randomRoots.line
        },
        onChange: function() {
            randomRoots.random();
            julia.drawNewStructure();
        }
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
        type: 'button',
        buttonText: 'randomize',
        onClick: function() {
            randomRoots.random();
            julia.drawNewStructure();
        }
    });
    randomRoots.random();
    map.mapping = map.randomRootsUniversalRational;
};

var args;

randomRoots.unitSquare = function() {
    args = [randomRoots.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRoots.nomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        args.push(order);
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        args.push(x);
        args.push(y);
    }
    for (let i = 0; i < randomRoots.denomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        args.push(-order);
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        args.push(x);
        args.push(y);
    }
    console.log(args);
};

randomRoots.unitSquareMirrorSymmetry = function() {
    args = [randomRoots.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRoots.nomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        const x = 2 * Math.random() - 1;
        const y = 2 * Math.random() - 1;
        args.push(order);
        args.push(x);
        args.push(y);
        args.push(order);
        args.push(x);
        args.push(-y);
    }
    for (let i = 0; i < randomRoots.denomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
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

randomRoots.unitCircle = function() {
    args = [randomRoots.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRoots.nomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        const angle = 2 * Math.PI * Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        args.push(order);
        args.push(x);
        args.push(y);
    }
    for (let i = 0; i < randomRoots.denomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        const angle=2*Math.PI*Math.random();
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        args.push(-order);
        args.push(x);
        args.push(y);
    }
    console.log(args);
};

randomRoots.unitCircleMirrorSymmetry = function() {
    args = [randomRoots.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRoots.nomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
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
    for (let i = 0; i < randomRoots.denomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        const angle=2*Math.PI*Math.random();
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

randomRoots.line = function() {
    args = [randomRoots.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRoots.nomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        args.push(order);
        args.push(2*Math.random()-1);
        args.push(0);
    }
    for (let i = 0; i < randomRoots.denomTerms; i++) {
        const order = randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random());
        args.push(-order);
        args.push(2*Math.random()-1);
        args.push(0);
    }
    console.log(args);
};

map.randomRootsUniversalRational = function() {
    // the amplitude may change, but not the roots
    args[1] = amplitude.real;
    args[2] = amplitude.imag;
    map.universalRational(args);
};
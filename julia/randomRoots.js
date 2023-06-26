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
randomRoots.imaginaries = true;

randomRoots.setup = function(gui) {
    gui.addParagraph('<strong>two roots</strong>');
    gui.add({
        type: 'number',
        params: randomRoots,
        property: 'order',
        step: 1,
        min: 1,
        onChange: function() {
            randomRoots.randomize();
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
            randomRoots.randomize();
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
            randomRoots.randomize();
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
            randomRoots.randomize();
            julia.drawNewStructure();
        }
    });

    gui.add({
        type: 'number',
        params: randomRoots,
        property: 'zPower',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: randomRoots,
        property: 'imaginaries',
        onChange: function() {
            randomRoots.randomize();
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
            randomRoots.randomize();
            julia.drawNewStructure();
        }
    });
    randomRoots.randomize();
    map.mapping = map.randomRootsUniversalRational;
};

var args;

randomRoots.randomize = function() {
    args = [randomRoots.zPower, amplitude.real, amplitude.imag];
    for (let i = 0; i < randomRoots.nomTerms; i++) {
        args.push(randomRoots.order * Math.floor(1 + randomRoots.maxPower * Math.random()));
        args.push(Math.random());
        args.push(randomRoots.imaginaries ? Math.random() : 0);
    }
    for (let i = 0; i < randomRoots.denomTerms; i++) {
        args.push(randomRoots.order * Math.floor(-1 - randomRoots.maxPower * Math.random()));
        args.push(Math.random());
        args.push(randomRoots.imaginaries ? Math.random() : 0);
    }
};

map.randomRootsUniversalRational = function() {
    args[1] = amplitude.real;
    args[2] = amplitude.imag;
    console.log(args);

    map.universalRational(args);
};
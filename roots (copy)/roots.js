/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    map,
    julia
} from "../mappings/mapImage.js";

import {
    universalRational
} from "./universalRational.js";

export const roots = {};

const amplitude = {};
amplitude.radius = 1;
amplitude.angle = 0;
roots.zPower = 1;
roots.order = 5;
roots.rMin = 0.9;
roots.rMax=1.1;
// root position and switch
// angle related to 2PI/order, angle of the cyclic group
roots.nom1Radius = 1;
roots.nom1Angle = 0;
roots.nom1On = true;
roots.nom2Radius = 1;
roots.nom2Angle = 0;
roots.nom2On = false;
roots.nom3Radius = 1;
roots.nom3Angle = 0;
roots.nom3On = false;
roots.denom1Radius = 1;
roots.denom1Angle = 0;
roots.denom1On = false;
roots.denom2Radius = 1;
roots.denom2Angle = 0;
roots.denom2On = false;
roots.denom3Radius = 1;
roots.denom3Angle = 0;
roots.denom3On = false;

var nom1RadiusController, nom2RadiusController, nom3RadiusController;
var denom1RadiusController, denom2RadiusController, denom3RadiusController;

var nom1AngleController, nom2AngleController, nom3AngleController;
var denom1AngleController, denom2AngleController, denom3AngleController;

roots.setup = function(gui) {
    gui.addParagraph('<strong>roots (angle in fractions of 360/n degrees)</strong>');
    gui.add({
        type: 'number',
        params: roots,
        property: 'order',
        step: 1,
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: roots,
        property: 'zPower',
        step: 1,
        onChange: function() {
            julia.drawNewStructure();
        }
    });
    gui.add({
        type: 'number',
        params: amplitude,
        property: 'radius',
        labelText: 'amplitude radius',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: amplitude,
        property: 'angle',
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: roots,
        property: 'rMin',
        labelText: 'roots radius min',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'rMax',
        labelText: 'max',
        onChange: julia.drawNewStructure
    });

    gui.addParagraph('nominator');
    nom1RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'nom1Radius',
        labelText: 'radius 1',
        onChange: julia.drawNewStructure
    });
    nom1AngleController = nom1RadiusController.add({
        type: 'number',
        params: roots,
        property: 'nom1Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    nom1AngleController.add({
        type: 'boolean',
        params: roots,
        property: 'nom1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    nom2RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'nom2Radius',
        labelText: 'radius 2',
        onChange: julia.drawNewStructure
    });
    nom2AngleController = nom2RadiusController.add({
        type: 'number',
        params: roots,
        property: 'nom2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    nom2AngleController.add({
        type: 'boolean',
        params: roots,
        property: 'nom2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    nom3RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'nom3Radius',
        labelText: 'radius 3',
        onChange: julia.drawNewStructure
    });
    nom3AngleController = nom3RadiusController.add({
        type: 'number',
        params: roots,
        property: 'nom3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    nom3AngleController.add({
        type: 'boolean',
        params: roots,
        property: 'nom3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.addParagraph('denominator');
    denom1RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'denom1Radius',
        labelText: 'radius 1',
        onChange: julia.drawNewStructure
    });
    denom1AngleController = denom1RadiusController.add({
        type: 'number',
        params: roots,
        property: 'denom1Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    denom1AngleController.add({
        type: 'boolean',
        params: roots,
        property: 'denom1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    denom2RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'denom2Radius',
        labelText: 'radius 2',
        onChange: julia.drawNewStructure
    });
    denom2AngleController = denom2RadiusController.add({
        type: 'number',
        params: roots,
        property: 'denom2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    denom2AngleController.add({
        type: 'boolean',
        params: roots,
        property: 'denom2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    denom3RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'denom3Radius',
        labelText: 'radius 3',
        onChange: julia.drawNewStructure
    });
    denom3AngleController = denom3RadiusController.add({
        type: 'number',
        params: roots,
        property: 'denom3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    denom3AngleController.add({
        type: 'boolean',
        params: roots,
        property: 'denom3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'button',
        buttonText: 'randomize',
        onClick: randomize
    }).add({
        type: 'button',
        buttonText: 'circle',
        onClick: circle
    }).add({
        type: 'button',
        buttonText: 'line',
        onClick: line
    }).add({
        type: 'button',
        buttonText: 'pairs',
        onClick: pairs
    });
    map.mapping = roots.mapping;
    map.step=roots.step;
};

function randomRadius(){
    return Math.random() * (roots.rMax - roots.rMin) + roots.rMin;
}

function randomize() {
    nom1RadiusController.setValueOnly(randomRadius());
    nom2RadiusController.setValueOnly(randomRadius());
    nom3RadiusController.setValueOnly(randomRadius());
    nom1AngleController.setValueOnly(Math.random());
    nom2AngleController.setValueOnly(Math.random());
    nom3AngleController.setValueOnly(Math.random());
    denom1RadiusController.setValueOnly(randomRadius());
    denom2RadiusController.setValueOnly(randomRadius());
    denom3RadiusController.setValueOnly(randomRadius());
    denom1AngleController.setValueOnly(Math.random());
    denom2AngleController.setValueOnly(Math.random());
    denom3AngleController.setValueOnly(Math.random());
    julia.drawNewStructure();
}

function pairs() {
    let r = randomRadius();
    nom1RadiusController.setValueOnly(r);
    nom2RadiusController.setValueOnly(r);
    nom3RadiusController.setValueOnly(randomRadius());
    let angle = Math.random();
    nom1AngleController.setValueOnly(angle);
    nom2AngleController.setValueOnly(-angle);
    nom3AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    r = randomRadius();
    denom1RadiusController.setValueOnly(r);
    denom2RadiusController.setValueOnly(r);
    denom3RadiusController.setValueOnly(randomRadius());
    angle = Math.random();
    denom1AngleController.setValueOnly(angle);
    denom2AngleController.setValueOnly(-angle);
    denom3AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    julia.drawNewStructure();
}

function line() {
    nom1RadiusController.setValueOnly(randomRadius());
    nom2RadiusController.setValueOnly(randomRadius());
    nom3RadiusController.setValueOnly(randomRadius());
    nom1AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    nom2AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    nom3AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    denom1RadiusController.setValueOnly(randomRadius());
    denom2RadiusController.setValueOnly(randomRadius());
    denom3RadiusController.setValueOnly(randomRadius());
    denom1AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    denom2AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    denom3AngleController.setValueOnly(0.5 * Math.floor(2 * Math.random()));
    julia.drawNewStructure();
}


function circle() {
    nom1RadiusController.setValueOnly(1);
    nom2RadiusController.setValueOnly(1);
    nom3RadiusController.setValueOnly(1);
    nom1AngleController.setValueOnly(Math.random());
    nom2AngleController.setValueOnly(Math.random());
    nom3AngleController.setValueOnly(Math.random());
    denom1RadiusController.setValueOnly(1);
    denom2RadiusController.setValueOnly(1);
    denom3RadiusController.setValueOnly(1);
    denom1AngleController.setValueOnly(Math.random());
    denom2AngleController.setValueOnly(Math.random());
    denom3AngleController.setValueOnly(Math.random());
    julia.drawNewStructure();
}

roots.mapping = function() {
    var x, y, angle, radius;
    let denReal = [];
    let nomReal = [];
    let denImag = [];
    let nomImag = [];
    angle = 2 * Math.PI / roots.order * amplitude.angle;
    const amplitudeReal = amplitude.radius * Math.cos(angle);
    const amplitudeImag = amplitude.radius * Math.sin(angle);
    if (roots.nom1On) {
        radius = Math.pow(roots.nom1Radius, roots.order);
        angle = 2 * Math.PI * roots.nom1Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (roots.nom2On) {
        radius = Math.pow(roots.nom2Radius, roots.order);
        angle = 2 * Math.PI * roots.nom2Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (roots.nom3On) {
        radius = Math.pow(roots.nom3Radius, roots.order);
        angle = 2 * Math.PI * roots.nom3Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (roots.denom1On) {
        radius = Math.pow(roots.denom1Radius, roots.order);
        angle = 2 * Math.PI * roots.denom1Angle;
        denReal.push(radius * Math.cos(angle));
        denImag.push(radius * Math.sin(angle));
    }
    if (roots.denom2On) {
        radius = Math.pow(roots.denom2Radius, roots.order);
        angle = 2 * Math.PI * roots.denom2Angle;
        denReal.push(radius * Math.cos(angle));
        denImag.push(radius * Math.sin(angle));
    }
    if (roots.denom3On) {
        radius = Math.pow(roots.denom3Radius, roots.order);
        angle = 2 * Math.PI * roots.denom3Angle;
        denReal.push(radius * Math.cos(angle));
        denImag.push(radius * Math.sin(angle));
    }
    map.universalRational(roots.zPower, roots.order, amplitudeReal, amplitudeImag, nomReal, nomImag, denReal, denImag);
};
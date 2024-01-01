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

export const singularities = {};

const amplitude = {};
amplitude.radius = 1;
amplitude.angle = 0;
singularities.zPower = 1;
singularities.order = 5;
singularities.rMin = 0.9;
singularities.rMax = 1.1;
// root position and switch
// angle related to 2PI/order, angle of the cyclic group
singularities.nom1Radius = 1;
singularities.nom1Angle = 0;
singularities.nom1On = true;
singularities.nom2Radius = 1;
singularities.nom2Angle = 0;
singularities.nom2On = false;
singularities.nom3Radius = 1;
singularities.nom3Angle = 0;
singularities.nom3On = false;
singularities.denom1Radius = 1;
singularities.denom1Angle = 0;
singularities.denom1On = false;
singularities.denom2Radius = 1;
singularities.denom2Angle = 0;
singularities.denom2On = false;
singularities.denom3Radius = 1;
singularities.denom3Angle = 0;
singularities.denom3On = false;

var nom1RadiusController, nom2RadiusController, nom3RadiusController;
var denom1RadiusController, denom2RadiusController, denom3RadiusController;

var nom1AngleController, nom2AngleController, nom3AngleController;
var denom1AngleController, denom2AngleController, denom3AngleController;

singularities.setup = function(gui) {
    gui.addParagraph('<strong>singularities (angle in fractions of 360/n degrees)</strong>');
    gui.add({
        type: 'number',
        params: singularities,
        property: 'order',
        step: 1,
        min: 1,
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: singularities,
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
        params: singularities,
        property: 'rMin',
        labelText: 'singularities radius min',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: singularities,
        property: 'rMax',
        labelText: 'max',
        onChange: julia.drawNewStructure
    });

    gui.addParagraph('nominator');
    nom1RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'nom1Radius',
        labelText: 'radius 1',
        onChange: function(value) {
            nom2RadiusController.setValueOnly(value);
            julia.drawNewStructure();
        }
    });
    nom1AngleController = nom1RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'nom1Angle',
        labelText: 'angle',
        onChange: function(value) {
            nom2AngleController.setValueOnly(-value);
            julia.drawNewStructure();
        }
    });
    nom1AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'nom1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    nom2RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'nom2Radius',
        labelText: 'radius 2',
        onChange: julia.drawNewStructure
    });
    nom2AngleController = nom2RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'nom2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    nom2AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'nom2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    nom3RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'nom3Radius',
        labelText: 'radius 3',
        onChange: julia.drawNewStructure
    });
    nom3AngleController = nom3RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'nom3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    nom3AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'nom3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.addParagraph('denominator');
    denom1RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'denom1Radius',
        labelText: 'radius 1',
        onChange: function(value) {
            denom2RadiusController.setValueOnly(value);
            julia.drawNewStructure();
        }
    });
    denom1AngleController = denom1RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'denom1Angle',
        labelText: 'angle',
        onChange: function(value) {
            denom2AngleController.setValueOnly(-value);
            julia.drawNewStructure();
        }
    });
    denom1AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'denom1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    denom2RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'denom2Radius',
        labelText: 'radius 2',
        onChange: julia.drawNewStructure
    });
    denom2AngleController = denom2RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'denom2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    denom2AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'denom2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    denom3RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'denom3Radius',
        labelText: 'radius 3',
        onChange: julia.drawNewStructure
    });
    denom3AngleController = denom3RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'denom3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    denom3AngleController.add({
        type: 'boolean',
        params: singularities,
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
    map.mapping = singularities.mapping;
};

function randomRadius() {
    return Math.random() * (singularities.rMax - singularities.rMin) + singularities.rMin;
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

singularities.mapping = function() {
    var x, y, angle, radius;
    let denReal = [];
    let nomReal = [];
    let denImag = [];
    let nomImag = [];
    angle = 2 * Math.PI / singularities.order * amplitude.angle;
    const amplitudeReal = amplitude.radius * Math.cos(angle);
    const amplitudeImag = amplitude.radius * Math.sin(angle);
    if (singularities.nom1On) {
        radius = Math.pow(singularities.nom1Radius, singularities.order);
        angle = 2 * Math.PI * singularities.nom1Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (singularities.nom2On) {
        radius = Math.pow(singularities.nom2Radius, singularities.order);
        angle = 2 * Math.PI * singularities.nom2Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (singularities.nom3On) {
        radius = Math.pow(singularities.nom3Radius, singularities.order);
        angle = 2 * Math.PI * singularities.nom3Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (singularities.denom1On) {
        radius = singularities.denom1Radius;
        angle = 2 * Math.PI * singularities.denom1Angle;
        for (let i = 0; i < singularities.order; i++) {
            denReal.push(radius * Math.cos(angle));
            denImag.push(radius * Math.sin(angle));
            angle += 2 * Math.PI / singularities.order;
        }
    }
    if (singularities.denom2On) {
        radius = singularities.denom2Radius;
        angle = 2 * Math.PI * singularities.denom2Angle;
        for (let i = 0; i < singularities.order; i++) {
            denReal.push(radius * Math.cos(angle));
            denImag.push(radius * Math.sin(angle));
            angle += 2 * Math.PI / singularities.order;
        }
    }
    if (singularities.denom3On) {
        radius = singularities.denom3Radius;
        angle = 2 * Math.PI * singularities.denom3Angle;
        for (let i = 0; i < singularities.order; i++) {
            denReal.push(radius * Math.cos(angle));
            denImag.push(radius * Math.sin(angle));
            angle += 2 * Math.PI / singularities.order;
        }
    }
    console.log("-------------nominator real/imag");
    console.log(nomReal);
    console.log(nomImag);
    console.log("denom real/imag");
    console.log(denReal);
    console.log(denImag);
    map.universalRational(singularities.zPower, singularities.order, amplitudeReal, amplitudeImag, nomReal, nomImag, denReal, denImag);
};
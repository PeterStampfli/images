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
    calculate
} from "./calculate.js";

export const singularities = {};
export const roots = {};

singularities.zPower = 1;
singularities.order = 5;
singularities.amplitude = 1;
singularities.radius = 1;
singularities.zerosConstant = 1;
singularities.singsConstant = 1;
singularities.zerosReal = [];
singularities.zerosImag = [];
singularities.singsReal = [];
singularities.singsImag = [];
// root position and switch
// angle related to 2PI/order, angle of the cyclic group
singularities.zero1Radius = 1;
singularities.zero1Angle = 0;
singularities.zero1On = false;
singularities.zero2Radius = 1;
singularities.zero2Angle = 0;
singularities.zero2On = false;
singularities.zero3Radius = 1;
singularities.zero3Angle = 0;
singularities.zero3On = false;
singularities.sing1Radius = 1;
singularities.sing1Angle = 0;
singularities.sing1On = true;
singularities.sing2Radius = 1;
singularities.sing2Angle = 0;
singularities.sing2On = false;
singularities.sing3Radius = 1;
singularities.sing3Angle = 0;
singularities.sing3On = false;

roots.denReal = [];
roots.denImag = [];
roots.nomReal = [];
roots.nomImag = [];
roots.nom1Radius = 1;
roots.nom1Angle = 0;
roots.nom1On = false;
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

var zero1RadiusController, zero2RadiusController, zero3RadiusController;
var sing1RadiusController, sing2RadiusController, sing3RadiusController;

var zero1AngleController, zero2AngleController, zero3AngleController;
var sing1AngleController, sing2AngleController, sing3AngleController;

var nom1RadiusController, nom2RadiusController, nom3RadiusController;
var denom1RadiusController, denom2RadiusController, denom3RadiusController;

var nom1AngleController, nom2AngleController, nom3AngleController;
var denom1AngleController, denom2AngleController, denom3AngleController;

singularities.setup = function(gui) {
    gui.addParagraph('<strong>big rational</strong>');
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
        params: singularities,
        property: 'amplitude',
        onChange: julia.drawNewStructure
    });


    gui.addParagraph('<strong>zeros</strong>');

    gui.add({
        type: 'number',
        params: singularities,
        property: 'zerosConstant',
        labelText: 'divisions constant',
        onChange: julia.drawNewStructure
    });

    zero1RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'zero1Radius',
        labelText: 'divs rad 1',
        onChange: function(value) {
            zero2RadiusController.setValueOnly(value);
            julia.drawNewStructure();
        }
    });
    zero1AngleController = zero1RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'zero1Angle',
        labelText: 'angle',
        onChange: function(value) {
            zero2AngleController.setValueOnly(-value);
            julia.drawNewStructure();
        }
    });
    zero1AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'zero1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    zero2RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'zero2Radius',
        labelText: 'divs rad 2',
        onChange: julia.drawNewStructure
    });
    zero2AngleController = zero2RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'zero2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    zero2AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'zero2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    zero3RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'zero3Radius',
        labelText: 'divs rad 3',
        onChange: julia.drawNewStructure
    });
    zero3AngleController = zero3RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'zero3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    zero3AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'zero3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    nom1RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'nom1Radius',
        labelText: 'poly rad 1',
        onChange: function(value) {
            nom2RadiusController.setValueOnly(value);
            julia.drawNewStructure();
        }
    });
    nom1AngleController = nom1RadiusController.add({
        type: 'number',
        params: roots,
        property: 'nom1Angle',
        labelText: 'angle',
        onChange: function(value) {
            nom2AngleController.setValueOnly(-value);
            julia.drawNewStructure();
        }
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
        labelText: 'poly rad 2',
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
        labelText: 'poly rad 3',
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

    gui.addParagraph('<strong>poles</strong>');

    gui.add({
        type: 'number',
        params: singularities,
        property: 'singsConstant',
        labelText: 'divisions constant',
        onChange: julia.drawNewStructure
    });

    sing1RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'sing1Radius',
        labelText: 'divs rad 1',
        onChange: function(value) {
            sing2RadiusController.setValueOnly(value);
            julia.drawNewStructure();
        }
    });
    sing1AngleController = sing1RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'sing1Angle',
        labelText: 'angle',
        onChange: function(value) {
            sing2AngleController.setValueOnly(-value);
            julia.drawNewStructure();
        }
    });
    sing1AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'sing1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    sing2RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'sing2Radius',
        labelText: 'divs rad 2',
        onChange: julia.drawNewStructure
    });
    sing2AngleController = sing2RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'sing2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    sing2AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'sing2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    sing3RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'sing3Radius',
        labelText: 'divs rad 3',
        onChange: julia.drawNewStructure
    });
    sing3AngleController = sing3RadiusController.add({
        type: 'number',
        params: singularities,
        property: 'sing3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    });
    sing3AngleController.add({
        type: 'boolean',
        params: singularities,
        property: 'sing3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });

    denom1RadiusController = gui.add({
        type: 'number',
        params: roots,
        property: 'denom1Radius',
        labelText: 'poly rad 1',
        onChange: function(value) {
            denom2RadiusController.setValueOnly(value);
            julia.drawNewStructure();
        }
    });
    denom1AngleController = denom1RadiusController.add({
        type: 'number',
        params: roots,
        property: 'denom1Angle',
        labelText: 'angle',
        onChange: function(value) {
            denom2AngleController.setValueOnly(-value);
            julia.drawNewStructure();
        }
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
        labelText: 'poly rad 2',
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
        labelText: 'poly rad 3',
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

    map.mapping = singularities.mapping;
};

singularities.mapping = function() {
    var invRadius, angle, radius;
    singularities.zerosReal.length = 0;
    singularities.zerosImag.length = 0;
    singularities.singsReal.length = 0;
    singularities.singsImag.length = 0;
    roots.denReal.length = 0;
    roots.denImag.length = 0;
    roots.nomReal.length = 0;
    roots.nomImag.length = 0;
    const denReal = roots.denReal;
    const denImag = roots.denImag;
    const nomReal = roots.denReal;
    const nomImag = roots.nomImag;
    const dAngle = 2 * Math.PI / singularities.order;
    if (singularities.zero1On) {
        angle = dAngle * singularities.zero1Angle;
        invRadius = 1 / singularities.zero1Radius;
        for (let i = 0; i < singularities.order; i++) {
            singularities.zerosReal.push(invRadius * Math.cos(angle));
            singularities.zerosImag.push(invRadius * Math.sin(angle));
            angle += dAngle;
        }
    }
    if (singularities.zero2On) {
        angle = dAngle * singularities.zero2Angle;
        invRadius = 1 / singularities.zero2Radius;
        for (let i = 0; i < singularities.order; i++) {
            singularities.zerosReal.push(invRadius * Math.cos(angle));
            singularities.zerosImag.push(invRadius * Math.sin(angle));
            angle += dAngle;
        }
    }
    if (singularities.zero3On) {
        angle = dAngle * singularities.zero3Angle;
        invRadius = 1 / singularities.zero3Radius;
        for (let i = 0; i < singularities.order; i++) {
            singularities.zerosReal.push(invRadius * Math.cos(angle));
            singularities.zerosImag.push(invRadius * Math.sin(angle));
            angle += dAngle;
        }
    }

    if (singularities.sing1On) {
        angle = dAngle * singularities.sing1Angle;
        invRadius = 1 / singularities.sing1Radius;
        for (let i = 0; i < singularities.order; i++) {
            singularities.singsReal.push(invRadius * Math.cos(angle));
            singularities.singsImag.push(invRadius * Math.sin(angle));
            angle += dAngle;
        }
    }
    if (singularities.sing2On) {
        angle = dAngle * singularities.sing2Angle;
        invRadius = 1 / singularities.sing2Radius;
        for (let i = 0; i < singularities.order; i++) {
            singularities.singsReal.push(invRadius * Math.cos(angle));
            singularities.singsImag.push(invRadius * Math.sin(angle));
            angle += dAngle;
        }
    }
    if (singularities.sing3On) {
        angle = dAngle * singularities.sing3Angle;
        invRadius = 1 / singularities.sing3Radius;
        for (let i = 0; i < singularities.order; i++) {
            singularities.singsReal.push(invRadius * Math.cos(angle));
            singularities.singsImag.push(invRadius * Math.sin(angle));
            angle += dAngle;
        }
    }
    if (roots.nom1On) {
        radius = Math.pow(roots.nom1Radius, singularities.order);
        angle = 2 * Math.PI * roots.nom1Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (roots.nom2On) {
        radius = Math.pow(roots.nom2Radius, singularities.order);
        angle = 2 * Math.PI * roots.nom2Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (roots.nom3On) {
        radius = Math.pow(roots.nom3Radius, singularities.order);
        angle = 2 * Math.PI * roots.nom3Angle;
        nomReal.push(radius * Math.cos(angle));
        nomImag.push(radius * Math.sin(angle));
    }
    if (roots.denom1On) {
        radius = Math.pow(roots.denom1Radius, singularities.order);
        angle = 2 * Math.PI * roots.denom1Angle;
        denReal.push(radius * Math.cos(angle));
        denImag.push(radius * Math.sin(angle));
    }
    if (roots.denom2On) {
        radius = Math.pow(roots.denom2Radius, singularities.order);
        angle = 2 * Math.PI * roots.denom2Angle;
        denReal.push(radius * Math.cos(angle));
        denImag.push(radius * Math.sin(angle));
    }
    if (roots.denom3On) {
        radius = Math.pow(roots.denom3Radius, singularities.order);
        angle = 2 * Math.PI * roots.denom3Angle;
        denReal.push(radius * Math.cos(angle));
        denImag.push(radius * Math.sin(angle));
    }

    console.log(singularities.zerosReal);
    console.log(singularities.zerosImag);
    console.log(singularities.singsReal);
    console.log(singularities.singsImag);
    map.calculate();
};
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
singularities.zero1On = true;
singularities.zero2Radius = 1;
singularities.zero2Angle = 0;
singularities.zero2On = false;
singularities.zero3Radius = 1;
singularities.zero3Angle = 0;
singularities.zero3On = false;
singularities.sing1Radius = 1;
singularities.sing1Angle = 0;
singularities.sing1On = false;
singularities.sing2Radius = 1;
singularities.sing2Angle = 0;
singularities.sing2On = false;
singularities.sing3Radius = 1;
singularities.sing3Angle = 0;
singularities.sing3On = false;

var zero1RadiusController, zero2RadiusController, zero3RadiusController;
var sing1RadiusController, sing2RadiusController, sing3RadiusController;

var zero1AngleController, zero2AngleController, zero3AngleController;
var sing1AngleController, sing2AngleController, sing3AngleController;

singularities.setup = function(gui) {
    gui.addParagraph('<strong>singularities</strong>');
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


    gui.addParagraph('zeros');

    gui.add({
        type: 'number',
        params: singularities,
        property: 'zerosConstant',
        labelText: 'constant',
        onChange: julia.drawNewStructure
    });

    zero1RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'zero1Radius',
        labelText: 'radius 1',
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
        labelText: 'radius 2',
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
        labelText: 'radius 3',
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

    gui.addParagraph('poles');

    gui.add({
        type: 'number',
        params: singularities,
        property: 'singsConstant',
        labelText: 'constant',
        onChange: julia.drawNewStructure
    });

    sing1RadiusController = gui.add({
        type: 'number',
        params: singularities,
        property: 'sing1Radius',
        labelText: 'radius 1',
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
        labelText: 'radius 2',
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
        labelText: 'radius 3',
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



    map.mapping = singularities.mapping;
};

singularities.mapping = function() {
    var invRadius, angle;
    singularities.zerosReal.length = 0;
    singularities.zerosImag.length = 0;
    singularities.singsReal.length = 0;
    singularities.singsImag.length = 0;
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

    console.log(singularities.zerosReal);
    console.log(singularities.zerosImag);
    console.log(singularities.singsReal);
    console.log(singularities.singsImag);
    //   map.calculate();
};
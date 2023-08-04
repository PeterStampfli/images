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

export const roots = {};

const amplitude = {};
amplitude.radius = 1;
amplitude.angle = 0;
roots.zPower = 1;
roots.order = 5;
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

roots.setup = function(gui) {
    gui.addParagraph('<strong>random roots</strong>');
    gui.add({
        type: 'number',
        params: roots,
        property: 'order',
        step: 1,
        min: 1,
        onChange: function() {
            roots.random();
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
    }).add({
        type: 'boolean',
        params: universalRational,
        property: 'exponential',
        labelText:'expo',
        onChange: julia.drawNewStructure
    });
    gui.addParagraph('nominator');
    gui.add({
        type: 'number',
        params: roots,
        property: 'nom1Radius',
        labelText: 'radius 1',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'nom1Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: roots,
        property: 'nom1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: roots,
        property: 'nom2Radius',
        labelText: 'radius 2',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'nom2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: roots,
        property: 'nom2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: roots,
        property: 'nom3Radius',
        labelText: 'radius 3',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'nom3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: roots,
        property: 'nom3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.addParagraph('denominator');
    gui.add({
        type: 'number',
        params: roots,
        property: 'denom1Radius',
        labelText: 'radius 1',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'denom1Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: roots,
        property: 'denom1On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: roots,
        property: 'denom2Radius',
        labelText: 'radius 2',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'denom2Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: roots,
        property: 'denom2On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: roots,
        property: 'denom3Radius',
        labelText: 'radius 3',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: roots,
        property: 'denom3Angle',
        labelText: 'angle',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: roots,
        property: 'denom3On',
        labelText: 'on',
        onChange: julia.drawNewStructure
    });
    map.mapping = roots.mapping;
};

roots.mapping = function() {
    var x, y, angle, radius;
    // setup parameters
    const args = [];
    args.push(roots.zPower);
    angle=2*Math.PI/roots.order*amplitude.angle;
    args.push(amplitude.radius*Math.cos(angle));
    args.push(amplitude.radius*Math.sin(angle));
    console.log(args[1],args[2]);
    if (roots.nom1On) {
        args.push(roots.order);
        radius = roots.nom1Radius;
        angle = 2 * Math.PI * roots.nom1Angle;
        args.push(radius * Math.cos(angle));
        args.push(radius * Math.sin(angle));
    }
    if (roots.nom2On) {
        args.push(roots.order);
        radius = roots.nom2Radius;
        angle = 2 * Math.PI * roots.nom2Angle;
        args.push(radius * Math.cos(angle));
        args.push(radius * Math.sin(angle));
    }
    if (roots.nom3On) {
        args.push(roots.order);
        radius = roots.nom3Radius;
        angle = 2 * Math.PI * roots.nom3Angle;
        args.push(radius * Math.cos(angle));
        args.push(radius * Math.sin(angle));
    }
    if (roots.denom1On) {
        args.push(-roots.order);
        radius = roots.denom1Radius;
        angle = 2 * Math.PI * roots.denom1Angle;
        args.push(radius * Math.cos(angle));
        args.push(radius * Math.sin(angle));
    }
    if (roots.denom2On) {
        args.push(-roots.order);
        radius = roots.denom2Radius;
        angle = 2 * Math.PI * roots.denom2Angle;
        args.push(radius * Math.cos(angle));
        args.push(radius * Math.sin(angle));
    }
    if (roots.denom3On) {
        args.push(-roots.order);
        radius = roots.denom3Radius;
        angle = 2 * Math.PI * roots.denom3Angle;
        args.push(radius * Math.cos(angle));
        args.push(radius * Math.sin(angle));
    }
    map.universalRational(args);
};
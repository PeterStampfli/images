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
singularities.amplitude=1;
singularities.radius=1;
singularities.constant=1;
singularities.realCoeffs=[];
singularities.imagCoeffs=[];
singularities.skip=1;

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
    }).add({
        type: 'number',
        params: singularities,
        property: 'skip',
        step:1,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: singularities,
        property: 'radius',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: singularities,
        property: 'constant',
        onChange: julia.drawNewStructure
    });

    map.mapping = singularities.mapping;
};

singularities.mapping = function() {    
        const invRadius = 1/singularities.radius;
        singularities.realCoeffs.length=0;
        singularities.imagCoeffs.length=0;
        let angle = 0;
        let dAngle=2 * Math.PI / singularities.order;
        for (let i = 0; i < singularities.order; i++) {
            singularities.realCoeffs.push(invRadius * Math.cos(angle));
            singularities.imagCoeffs.push(invRadius * Math.sin(angle));
            let skipAngle=angle+dAngle*singularities.skip;
            singularities.realCoeffs.push(invRadius * Math.cos(skipAngle));
            singularities.imagCoeffs.push(invRadius * Math.sin(skipAngle));
            angle += dAngle;
        }
   console.log(singularities.realCoeffs);
   console.log(singularities.imagCoeffs);

    map.calculate();
};
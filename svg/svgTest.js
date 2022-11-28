/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton,
    guiUtils,
    SVG
}
from "../libgui/modules.js";


const gui = new ParamGui({
    closed: false
});

const svgns = 'http://www.w3.org/2000/svg';
SVG.makeGui(gui);
SVG.init();



function draw() {
    SVG.begin();
        SVG.groupAttributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        stroke:'blue',
        'stroke-width': 10,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };


        SVG.createGroup(SVG.groupAttributes);

    SVG.createEllipse(200,150,200,50,0.75);

    SVG.create('rect', {
        width: 400,
        height: 300,
        fill: 'none',
        stroke: 'green',
        'stroke-width': 3
    });

    

    SVG.terminate();
}


SVG.draw = draw;
draw();
//console.log(SVG.text);
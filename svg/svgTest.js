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
    console.log(SVG.viewShiftX);
    SVG.begin();
        SVG.groupAttributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        stroke:'blue',
        'stroke-width': 20,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };


        SVG.createGroup(SVG.groupAttributes);

    SVG.create('rect', {
        width: 400,
        height: 300,
        fill: 'white',
        stroke: 'green',
        'stroke-width': 3
    });
    SVG.createCircle(-100, -100, 5);

    SVG.createArcFill(-100,-100,50,-1,-0.5*Math.PI,true, {stroke:'none',fill:'red'});

    SVG.terminate();
}


SVG.draw = draw;
draw();
//console.log(SVG.text);
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

function draw(){
    SVG.begin();


SVG.create('rect', {
    width: 400,
    height: 300,
    fill: 'red'
});
SVG.createText({
    x:150,
    y:125,
    fill:'yellow',
    'text-anchor':'middle',
    'font-size':60
},'eintext');
SVG.create('rect', {
    width: 40,
    height: 30,
    fill: 'blue'
});
SVG.terminate();
}

SVG.draw=draw;
draw();
//console.log(SVG.text);
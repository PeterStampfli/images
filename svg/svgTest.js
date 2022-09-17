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

SVG.createGroup({
    stroke:'black'
});
SVG.create('rect', {
    width: 400,
    height: 300,
    fill: 'red',
    stroke:'green',
    'stroke-width':3
});
SVG.createCircle(100,150,50,{stroke:'white'});
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
SVG.createPolygon([10,10,200,20,30,50],{fill:'none'});
SVG.terminate();
}

SVG.setViewShifts(0,0);
SVG.setMinViewWidthHeight(400,300);

SVG.draw=draw;
draw();
//console.log(SVG.text);